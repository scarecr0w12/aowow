#!/usr/bin/env python3
"""
Character Texture Compositor for AoWoW WebGL Viewer

Composites a base character skin texture with armor texture components
from equipped items. Uses BLP textures from WoW MPQ archives.

WoW Character Texture Atlas Layout (512x512, 2x standard):
  Region          | X   | Y   | W   | H
  ================|=====|=====|=====|====
  Arm Upper       | 0   | 0   | 256 | 128
  Arm Lower       | 0   | 128 | 256 | 128
  Hand            | 0   | 256 | 256 | 64
  Torso Upper     | 0   | 320 | 256 | 128
  Torso Lower     | 0   | 448 | 256 | 64
  Leg Upper       | 256 | 0   | 256 | 128
  Leg Lower       | 256 | 128 | 256 | 128
  Foot            | 256 | 256 | 256 | 64
  (Face/Scalp)    | 256 | 320 | 256 | 192

Usage:
  python3 composite_texture.py --race bloodelf --sex female --skin 0 --items 220,229 --output /path/to/output.png
"""

import argparse
import json
import os
import struct
import sys
from io import BytesIO

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow not installed", file=sys.stderr)
    sys.exit(1)

try:
    import mpyq
except ImportError:
    print("ERROR: mpyq not installed", file=sys.stderr)
    sys.exit(1)

try:
    import texture2ddecoder
except ImportError:
    texture2ddecoder = None

# ============================================================================
# Configuration
# ============================================================================

MPQ_DATA_PATH = '/var/www/clientdata/Data'
DISPLAY_INFO_PATH = '/var/www/aowow/static/data/item-display-info.json'

# Atlas size (we work at 512x512 for quality, matching character GLB textures)
ATLAS_W = 512
ATLAS_H = 512

# Body region positions in the 512x512 texture atlas (2x the standard 256x256 layout)
# Format: (x, y, width, height)
REGION_LAYOUT = {
    'armUpper':    (0,   0,   256, 128),
    'armLower':    (0,   128, 256, 128),
    'hand':        (0,   256, 256, 64),
    'torsoUpper':  (0,   320, 256, 128),
    'torsoLower':  (0,   448, 256, 64),
    'legUpper':    (256, 0,   256, 128),
    'legLower':    (256, 128, 256, 128),
    'foot':        (256, 256, 256, 64),
}

# Texture component directories in MPQ
REGION_DIRS = {
    'armUpper':    'ITEM\\TEXTURECOMPONENTS\\ArmUpperTexture',
    'armLower':    'ITEM\\TEXTURECOMPONENTS\\ArmLowerTexture',
    'hand':        'ITEM\\TEXTURECOMPONENTS\\HandTexture',
    'torsoUpper':  'ITEM\\TEXTURECOMPONENTS\\TorsoUpperTexture',
    'torsoLower':  'ITEM\\TEXTURECOMPONENTS\\TorsoLowerTexture',
    'legUpper':    'ITEM\\TEXTURECOMPONENTS\\LegUpperTexture',
    'legLower':    'ITEM\\TEXTURECOMPONENTS\\LegLowerTexture',
    'foot':        'ITEM\\TEXTURECOMPONENTS\\FootTexture',
}

# Race name mapping to character directory names
RACE_DIRS = {
    'human':       'Human',
    'orc':         'Orc',
    'dwarf':       'Dwarf',
    'nightelf':    'NightElf',
    'undead':      'Scourge',
    'scourge':     'Scourge',
    'tauren':      'Tauren',
    'gnome':       'Gnome',
    'troll':       'Troll',
    'bloodelf':    'BloodElf',
    'draenei':     'Draenei',
}

SEX_DIRS = {
    'male': 'Male',
    'female': 'Female',
}

# ============================================================================
# MPQ Manager (simplified for this tool)
# ============================================================================

class MPQTextureReader:
    """Read BLP textures from WoW MPQ archives."""

    def __init__(self, data_path):
        self.data_path = data_path
        self.mpqs = []
        self._file_index = {}

        # Load MPQs in priority order (patches override base)
        mpq_order = [
            'patch-3.MPQ', 'patch-2.MPQ', 'patch.MPQ',
            'lichking.MPQ', 'expansion.MPQ',
            'common-2.MPQ', 'common.MPQ',
        ]

        for mpq_name in mpq_order:
            path = os.path.join(data_path, mpq_name)
            if os.path.exists(path):
                try:
                    archive = mpyq.MPQArchive(path)
                    self.mpqs.append((mpq_name, archive))
                    # Index files
                    for f in archive.files:
                        name = f.decode('utf-8', 'ignore') if isinstance(f, bytes) else f
                        key = name.lower().replace('/', '\\')
                        if key not in self._file_index:
                            self._file_index[key] = (mpq_name, archive, name)
                except Exception as e:
                    print(f"  Warning: Could not load {mpq_name}: {e}", file=sys.stderr)

        print(f"  Indexed {len(self._file_index)} files from {len(self.mpqs)} MPQs", file=sys.stderr)

    def read_file(self, path):
        """Read a file from the MPQ archives."""
        key = path.lower().replace('/', '\\')
        if key in self._file_index:
            _, archive, original_name = self._file_index[key]
            try:
                return archive.read_file(original_name)
            except:
                pass
        return None

    def find_files(self, pattern):
        """Find files matching a pattern (case-insensitive substring match)."""
        pattern_lower = pattern.lower().replace('/', '\\')
        matches = []
        for key, (_, _, original_name) in self._file_index.items():
            if pattern_lower in key:
                matches.append(original_name)
        return matches


# ============================================================================
# BLP Texture Decoder
# ============================================================================

def decode_blp(data):
    """Decode a BLP2 texture file to a PIL Image."""
    if not data or len(data) < 20:
        return None

    magic = data[:4]
    if magic != b'BLP2':
        return None

    encoding = struct.unpack('<I', data[4:8])[0]
    alpha_depth = data[8]
    alpha_encoding = data[9]
    has_mips = data[10]
    width, height = struct.unpack('<II', data[12:20])

    # Mipmap offsets and sizes (up to 16 levels)
    mip_offsets = struct.unpack('<16I', data[20:84])
    mip_sizes = struct.unpack('<16I', data[84:148])

    mip_offset = mip_offsets[0]
    mip_size = mip_sizes[0]

    if mip_size == 0 or mip_offset == 0:
        return None

    mip_data = data[mip_offset:mip_offset + mip_size]

    if encoding == 1:
        # Palette-based (uncompressed)
        palette_data = data[148:148 + 256 * 4]
        palette = []
        for i in range(256):
            b_val = palette_data[i * 4]
            g_val = palette_data[i * 4 + 1]
            r_val = palette_data[i * 4 + 2]
            a_val = palette_data[i * 4 + 3]
            palette.append((r_val, g_val, b_val, a_val))

        img = Image.new('RGBA', (width, height))
        pixels = []
        for i in range(width * height):
            if i < len(mip_data):
                idx = mip_data[i]
                pixels.append(palette[idx])
            else:
                pixels.append((0, 0, 0, 255))

        # Handle alpha channel
        if alpha_depth > 0:
            alpha_start = width * height
            alpha_data = mip_data[alpha_start:]
            for i in range(width * height):
                r, g, b, _ = pixels[i]
                if alpha_depth == 8 and i < len(alpha_data):
                    a = alpha_data[i]
                elif alpha_depth == 4 and i // 2 < len(alpha_data):
                    byte = alpha_data[i // 2]
                    a = ((byte >> ((i % 2) * 4)) & 0xF) * 17
                elif alpha_depth == 1 and i // 8 < len(alpha_data):
                    byte = alpha_data[i // 8]
                    a = 255 if (byte >> (i % 8)) & 1 else 0
                else:
                    a = 255
                pixels[i] = (r, g, b, a)

        img.putdata(pixels)
        return img

    elif encoding == 2:
        # DXT compressed
        if texture2ddecoder is None:
            return None

        try:
            if alpha_encoding == 0:
                # DXT1
                decoded = texture2ddecoder.decode_bc1(mip_data, width, height)
            elif alpha_encoding == 1:
                # DXT3 (BC2)
                decoded = texture2ddecoder.decode_bc2(mip_data, width, height)
            elif alpha_encoding == 7:
                # DXT5 (BC3)
                decoded = texture2ddecoder.decode_bc3(mip_data, width, height)
            else:
                decoded = texture2ddecoder.decode_bc1(mip_data, width, height)

            # texture2ddecoder outputs BGRA
            img = Image.frombytes('RGBA', (width, height), decoded)
            r, g, b, a = img.split()
            img = Image.merge('RGBA', (b, g, r, a))  # BGRA -> RGBA
            return img
        except Exception as e:
            print(f"    DXT decode error: {e}", file=sys.stderr)
            return None

    return None


# ============================================================================
# Character Skin Texture Builder
# ============================================================================

def build_base_skin(mpq_reader, race, sex, skin_color=0):
    """Build the base character skin texture atlas from the full skin BLP.
    
    Character skin textures are stored as single BLP files, e.g.:
      Character\\Human\\Male\\HumanMaleSkin00_00.blp
    The first number is the face/extra, the second is the skin color index.
    """
    race_dir = RACE_DIRS.get(race.lower(), 'Human')
    sex_dir = SEX_DIRS.get(sex.lower(), 'Male')
    
    model_name = f"{race_dir}{sex_dir}"
    model_dir = f"Character\\{race_dir}\\{sex_dir}"
    
    # Try various skin texture patterns (matching m2_to_glb.py logic)
    patterns = [
        f"{model_dir}\\{model_name}Skin00_{skin_color:02d}.blp",
        f"{model_dir}\\{model_name}Skin{skin_color:02d}_00.blp",
        f"{model_dir}\\{model_name}_skin.blp",
        f"{model_dir}\\{model_name}.blp",
    ]
    
    skin_img = None
    for pattern in patterns:
        blp_data = mpq_reader.read_file(pattern)
        if blp_data:
            skin_img = decode_blp(blp_data)
            if skin_img:
                print(f"  Base skin: {pattern} ({skin_img.size[0]}x{skin_img.size[1]})", file=sys.stderr)
                break
    
    if not skin_img:
        # Search for any matching skin texture
        search_term = (model_dir + '\\' + model_name + 'skin').lower()
        matches = mpq_reader.find_files(search_term)
        blp_matches = [m for m in matches if m.lower().endswith('.blp')]
        if blp_matches:
            blp_data = mpq_reader.read_file(sorted(blp_matches)[0])
            if blp_data:
                skin_img = decode_blp(blp_data)
                if skin_img:
                    print(f"  Base skin (search): {sorted(blp_matches)[0]}", file=sys.stderr)
    
    if skin_img:
        # Resize to atlas dimensions (256×256 is standard for WoW character textures)
        atlas = skin_img.resize((ATLAS_W, ATLAS_H), Image.LANCZOS)
        if atlas.mode != 'RGBA':
            atlas = atlas.convert('RGBA')
        return atlas
    
    # Fallback: solid skin-toned atlas
    print(f"  Warning: No skin texture found, using solid color", file=sys.stderr)
    skin_tones = {
        'human':    (200, 160, 130),
        'orc':      (90, 120, 60),
        'dwarf':    (180, 140, 110),
        'nightelf': (140, 100, 160),
        'undead':   (130, 130, 110),
        'tauren':   (120, 90, 60),
        'gnome':    (200, 170, 140),
        'troll':    (80, 120, 140),
        'bloodelf': (200, 170, 140),
        'draenei':  (140, 130, 180),
    }
    base_color = skin_tones.get(race.lower(), (180, 150, 120))
    return Image.new('RGBA', (ATLAS_W, ATLAS_H), base_color + (255,))


def _suffix_to_region_dir(tex_name):
    """Determine body region and directory from texture name suffix.
    
    WoW armor texture filenames encode the body region:
      _Sleeve_AU / _AU  -> ArmUpperTexture
      _Sleeve_AL / _AL  -> ArmLowerTexture
      _Glove_HA / _HA   -> HandTexture
      _Chest_TU / _TU   -> TorsoUpperTexture
      _Chest_TL / _TL   -> TorsoLowerTexture
      _Pant_LU / _Belt_LU / _LU -> LegUpperTexture
      _Pant_LL / _Boot_LL / _LL -> LegLowerTexture
      _Boot_FO / _FO    -> FootTexture
    """
    upper = tex_name.upper()
    
    # Check suffixes in order of specificity
    suffix_map = [
        ('_AU', 'armUpper',   'ITEM\\TEXTURECOMPONENTS\\ArmUpperTexture'),
        ('_AL', 'armLower',   'ITEM\\TEXTURECOMPONENTS\\ArmLowerTexture'),
        ('_HA', 'hand',       'ITEM\\TEXTURECOMPONENTS\\HandTexture'),
        ('_TU', 'torsoUpper', 'ITEM\\TEXTURECOMPONENTS\\TorsoUpperTexture'),
        ('_TL', 'torsoLower', 'ITEM\\TEXTURECOMPONENTS\\TorsoLowerTexture'),
        ('_LU', 'legUpper',   'ITEM\\TEXTURECOMPONENTS\\LegUpperTexture'),
        ('_LL', 'legLower',   'ITEM\\TEXTURECOMPONENTS\\LegLowerTexture'),
        ('_FO', 'foot',       'ITEM\\TEXTURECOMPONENTS\\FootTexture'),
    ]
    
    for suffix, region, tex_dir in suffix_map:
        if upper.endswith(suffix):
            return region, tex_dir
    
    return None, None


def overlay_armor_textures(atlas, mpq_reader, display_ids, sex):
    """Overlay armor texture components onto the character skin atlas."""
    sex_suffix = '_F' if sex.lower() == 'female' else '_M'
    
    # Load item display info
    if not os.path.exists(DISPLAY_INFO_PATH):
        print(f"  Warning: {DISPLAY_INFO_PATH} not found", file=sys.stderr)
        return atlas
    
    with open(DISPLAY_INFO_PATH, 'r') as f:
        display_info = json.load(f)
    
    for display_id in display_ids:
        did_str = str(display_id)
        if did_str not in display_info:
            continue
        
        info = display_info[did_str]
        tex = info.get('tex', {})
        
        if not tex:
            continue
        
        for _region_key, tex_name in tex.items():
            # Determine the actual body region and directory from the texture name suffix
            region_name, tex_dir = _suffix_to_region_dir(tex_name)
            
            if not region_name or region_name not in REGION_LAYOUT:
                # Fallback: try using the region key from JSON
                region_name = _region_key
                tex_dir = REGION_DIRS.get(region_name)
                if not tex_dir or region_name not in REGION_LAYOUT:
                    print(f"    Warning: Unknown region for texture {tex_name}", file=sys.stderr)
                    continue
            
            x, y, w, h = REGION_LAYOUT[region_name]
            
            # Try sex-specific texture first, then universal, then no suffix
            suffixes = [sex_suffix, '_U', '']
            
            blp_found = False
            for suffix in suffixes:
                blp_path = f"{tex_dir}\\{tex_name}{suffix}.blp"
                blp_data = mpq_reader.read_file(blp_path)
                if blp_data:
                    img = decode_blp(blp_data)
                    if img:
                        # Resize to fit the atlas region
                        img_resized = img.resize((w, h), Image.LANCZOS)
                        # Alpha composite on top
                        region_img = atlas.crop((x, y, x + w, y + h))
                        if img_resized.mode == 'RGBA':
                            region_img = Image.alpha_composite(region_img, img_resized)
                        else:
                            region_img = img_resized.convert('RGBA')
                        atlas.paste(region_img, (x, y))
                        blp_found = True
                        print(f"    Applied: {tex_name} -> {region_name} ({suffix or 'bare'})", file=sys.stderr)
                        break
            
            if not blp_found:
                print(f"    Warning: Texture not found: {tex_name} (tried {tex_dir})", file=sys.stderr)
    
    return atlas


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description='Character Texture Compositor')
    parser.add_argument('--race', default='human', help='Race name')
    parser.add_argument('--sex', default='male', help='male or female')
    parser.add_argument('--skin', type=int, default=0, help='Skin color index')
    parser.add_argument('--items', default='', help='Comma-separated display IDs')
    parser.add_argument('--output', required=True, help='Output PNG path')
    
    args = parser.parse_args()
    
    # Parse display IDs
    display_ids = []
    if args.items:
        for part in args.items.split(','):
            part = part.strip()
            if part and part.isdigit():
                display_ids.append(int(part))
    
    print(f"  Compositing: race={args.race}, sex={args.sex}, skin={args.skin}, items={display_ids}", file=sys.stderr)
    
    # Initialize MPQ reader
    mpq_reader = MPQTextureReader(MPQ_DATA_PATH)
    
    # Build base skin texture
    atlas = build_base_skin(mpq_reader, args.race, args.sex, args.skin)
    
    # Overlay armor textures
    if display_ids:
        atlas = overlay_armor_textures(atlas, mpq_reader, display_ids, args.sex)
    
    # Save (already at 512x512)
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    atlas.save(args.output, format='PNG', optimize=True)
    print(f"  Saved composite texture: {args.output} ({os.path.getsize(args.output)} bytes)", file=sys.stderr)


if __name__ == '__main__':
    main()
