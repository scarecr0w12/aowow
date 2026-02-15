#!/usr/bin/env python3
"""
M2 to GLB Converter for AzerothCore/WoW Model Viewer
Converts WoW M2 model files + BLP textures from MPQ archives into textured GLB files.

Supports:
- M2 format version 264 (WotLK/3.3.5a)
- .skin files (LOD 0) for mesh data
- BLP2 textures (palette-based and DXT compressed)
- Generates GLB with POSITION, NORMAL, TEXCOORD_0, and embedded PNG textures

Usage:
    python3 m2_to_glb.py                        # Convert all character models
    python3 m2_to_glb.py --type items            # Convert item models
    python3 m2_to_glb.py --single "Character\\Human\\Male\\HumanMale"  # Single model
"""

import struct
import json
import os
import sys
import io
import math
import traceback
from pathlib import Path

# Third-party
import mpyq
from PIL import Image
import texture2ddecoder

# ============================================================================
# Configuration
# ============================================================================

CLIENT_DATA = '/var/www/clientdata/Data'
OUTPUT_BASE = '/var/www/aowow/static/models'

# MPQ files in priority order (later = higher priority for overrides)
MPQ_FILES = [
    'common.MPQ',
    'common-2.MPQ',
    'expansion.MPQ',
    'lichking.MPQ',
    'patch.MPQ',
    'patch-2.MPQ',
    'patch-3.MPQ',
]

# Character race/gender mappings
CHARACTER_MODELS = {
    'bloodelffemale': 'Character\\BloodElf\\Female\\BloodElfFemale',
    'bloodelfmale': 'Character\\BloodElf\\Male\\BloodElfMale',
    'draeneifemale': 'Character\\Draenei\\Female\\DraeneiFemale',
    'draeneimale': 'Character\\Draenei\\Male\\DraeneiMale',
    'dwarffemale': 'Character\\Dwarf\\Female\\DwarfFemale',
    'dwarfmale': 'Character\\Dwarf\\Male\\DwarfMale',
    'gnomefemale': 'Character\\Gnome\\Female\\GnomeFemale',
    'gnomemale': 'Character\\Gnome\\Male\\GnomeMale',
    'humanfemale': 'Character\\Human\\Female\\HumanFemale',
    'humanmale': 'Character\\Human\\Male\\HumanMale',
    'nightelffemale': 'Character\\NightElf\\Female\\NightElfFemale',
    'nightelfmale': 'Character\\NightElf\\Male\\NightElfMale',
    'orcfemale': 'Character\\Orc\\Female\\OrcFemale',
    'orcmale': 'Character\\Orc\\Male\\OrcMale',
    'scourgefemale': 'Character\\Scourge\\Female\\ScourgeFemale',
    'scourgemale': 'Character\\Scourge\\Male\\ScourgeMale',
    'taurenfemale': 'Character\\Tauren\\Female\\TaurenFemale',
    'taurenmale': 'Character\\Tauren\\Male\\TaurenMale',
    'trollfemale': 'Character\\Troll\\Female\\TrollFemale',
    'trollmale': 'Character\\Troll\\Male\\TrollMale',
}


# ============================================================================
# MPQ Archive Manager
# ============================================================================

class MPQManager:
    """Manages multiple MPQ archives with proper priority/overlay."""

    def __init__(self, data_path):
        self.data_path = data_path
        self.archives = []
        self.file_index = {}  # lowercase path -> (archive_idx, original_path)

        for mpq_name in MPQ_FILES:
            mpq_path = os.path.join(data_path, mpq_name)
            if os.path.exists(mpq_path):
                try:
                    archive = mpyq.MPQArchive(mpq_path)
                    idx = len(self.archives)
                    self.archives.append((mpq_name, archive))

                    # Index all files (later archives override earlier ones)
                    if hasattr(archive, 'files') and archive.files:
                        for f in archive.files:
                            if isinstance(f, bytes):
                                f_str = f.decode('utf-8', 'ignore')
                            else:
                                f_str = f
                            self.file_index[f_str.lower().replace('/', '\\')] = (idx, f_str)
                    print(f"  Loaded {mpq_name}")
                except Exception as e:
                    print(f"  Warning: Could not load {mpq_name}: {e}")

    def read_file(self, path):
        """Read a file from MPQ archives (highest priority wins)."""
        key = path.lower().replace('/', '\\')
        if key in self.file_index:
            idx, orig_path = self.file_index[key]
            mpq_name, archive = self.archives[idx]
            data = archive.read_file(orig_path)
            return data
        return None

    def find_files(self, pattern_lower):
        """Find files matching a lowercase substring pattern."""
        results = []
        for key, (idx, orig_path) in self.file_index.items():
            if pattern_lower in key:
                results.append(orig_path)
        return results


# ============================================================================
# BLP Texture Decoder
# ============================================================================

def decode_blp(blp_data):
    """Decode a BLP2 texture file to a PIL Image."""
    if not blp_data or len(blp_data) < 148:
        return None

    magic = blp_data[:4]
    if magic != b'BLP2':
        print(f"    Warning: Not a BLP2 file (magic={magic})")
        return None

    encoding = blp_data[8]
    alpha_depth = blp_data[9]
    alpha_encoding = blp_data[10]
    width, height = struct.unpack_from('<II', blp_data, 12)

    if width == 0 or height == 0 or width > 4096 or height > 4096:
        print(f"    Warning: Invalid BLP dimensions {width}x{height}")
        return None

    mip_offsets = struct.unpack_from('<16I', blp_data, 20)
    mip_sizes = struct.unpack_from('<16I', blp_data, 84)

    if mip_offsets[0] == 0 or mip_sizes[0] == 0:
        return None

    mip0_data = blp_data[mip_offsets[0]:mip_offsets[0] + mip_sizes[0]]

    if encoding == 2:
        # DXT compressed
        try:
            if alpha_encoding == 0:
                decoded = texture2ddecoder.decode_bc1(mip0_data, width, height)
            elif alpha_encoding == 1:
                decoded = texture2ddecoder.decode_bc2(mip0_data, width, height)
            elif alpha_encoding == 7:
                decoded = texture2ddecoder.decode_bc3(mip0_data, width, height)
            else:
                # Try DXT1 as fallback
                decoded = texture2ddecoder.decode_bc1(mip0_data, width, height)

            img = Image.frombytes('RGBA', (width, height), decoded, 'raw', 'BGRA')
            return img
        except Exception as e:
            print(f"    Warning: DXT decode failed: {e}")
            return None

    elif encoding == 1:
        # Palette-based (uncompressed)
        try:
            palette = struct.unpack_from('<256I', blp_data, 148)
            pixels = bytearray(width * height * 4)
            pixel_count = width * height

            for i in range(pixel_count):
                if i < len(mip0_data):
                    idx = mip0_data[i]
                    color = palette[idx]
                    b = (color >> 0) & 0xFF
                    g = (color >> 8) & 0xFF
                    r = (color >> 16) & 0xFF

                    if alpha_depth == 0:
                        a = 255
                    elif alpha_depth == 1:
                        alpha_offset = pixel_count + (i // 8)
                        if alpha_offset < len(mip0_data):
                            a = 255 if (mip0_data[alpha_offset] >> (i % 8)) & 1 else 0
                        else:
                            a = 255
                    elif alpha_depth == 4:
                        alpha_offset = pixel_count + (i // 2)
                        if alpha_offset < len(mip0_data):
                            if i % 2 == 0:
                                a = (mip0_data[alpha_offset] & 0x0F) * 17
                            else:
                                a = ((mip0_data[alpha_offset] >> 4) & 0x0F) * 17
                        else:
                            a = 255
                    elif alpha_depth == 8:
                        alpha_offset = pixel_count + i
                        if alpha_offset < len(mip0_data):
                            a = mip0_data[alpha_offset]
                        else:
                            a = 255
                    else:
                        a = 255

                    pixels[i * 4:i * 4 + 4] = bytes([r, g, b, a])

            img = Image.frombytes('RGBA', (width, height), bytes(pixels))
            return img
        except Exception as e:
            print(f"    Warning: Palette decode failed: {e}")
            return None

    elif encoding == 3:
        # Uncompressed ARGB
        try:
            img = Image.frombytes('RGBA', (width, height), mip0_data)
            return img
        except Exception as e:
            print(f"    Warning: ARGB decode failed: {e}")
            return None

    return None


# ============================================================================
# M2 Parser
# ============================================================================

class M2Model:
    """Parser for WotLK M2 model files."""

    def __init__(self, m2_data, skin_data):
        self.m2_data = m2_data
        self.skin_data = skin_data
        self.vertices = []
        self.indices = []
        self.submeshes = []
        self.textures = []  # M2 texture definitions
        self.texture_lookups = []
        self.tex_units = []

        self._parse_m2()
        self._parse_skin()

    def _parse_m2(self):
        data = self.m2_data
        magic = data[:4]
        version = struct.unpack_from('<I', data, 4)[0]

        if magic != b'MD20':
            raise ValueError(f"Not an M2 file (magic={magic})")
        if version != 264:
            print(f"    Warning: M2 version {version} (expected 264)")

        # Vertices: offset 60
        n_vertices, ofs_vertices = struct.unpack_from('<II', data, 60)

        # Each vertex is 48 bytes:
        # pos(12) + boneWeights(4) + boneIndices(4) + normal(12) + uv1(8) + uv2(8)
        for i in range(n_vertices):
            off = ofs_vertices + i * 48
            px, py, pz = struct.unpack_from('<3f', data, off)
            # Skip bone weights (4 bytes) and bone indices (4 bytes)
            nx, ny, nz = struct.unpack_from('<3f', data, off + 20)
            u1, v1 = struct.unpack_from('<2f', data, off + 32)
            u2, v2 = struct.unpack_from('<2f', data, off + 40)

            self.vertices.append({
                'pos': (px, py, pz),
                'normal': (nx, ny, nz),
                'uv': (u1, v1),
                'uv2': (u2, v2),
            })

        # Textures: offset 80
        n_textures, ofs_textures = struct.unpack_from('<II', data, 80)
        for i in range(n_textures):
            off = ofs_textures + i * 16
            tex_type, tex_flags, name_len, name_ofs = struct.unpack_from('<IIII', data, off)
            name = ''
            if name_len > 0 and name_ofs > 0 and name_ofs < len(data):
                name = data[name_ofs:name_ofs + name_len].split(b'\0')[0].decode('utf-8', 'ignore')
            self.textures.append({
                'type': tex_type,
                'flags': tex_flags,
                'filename': name,
            })

        # Texture lookups: offset 88
        n_tex_lookup, ofs_tex_lookup = struct.unpack_from('<II', data, 88)
        self.texture_lookups = list(struct.unpack_from(f'<{n_tex_lookup}H', data, ofs_tex_lookup))

    def _parse_skin(self):
        data = self.skin_data
        magic = data[:4]
        if magic != b'SKIN':
            raise ValueError(f"Not a .skin file (magic={magic})")

        # Header
        n_indices, ofs_indices = struct.unpack_from('<II', data, 4)
        n_triangles, ofs_triangles = struct.unpack_from('<II', data, 12)
        n_properties, ofs_properties = struct.unpack_from('<II', data, 20)
        n_submeshes, ofs_submeshes = struct.unpack_from('<II', data, 28)
        n_tex_units, ofs_tex_units = struct.unpack_from('<II', data, 36)
        bones = struct.unpack_from('<I', data, 44)[0]

        # Vertex index remap table (16-bit, maps skin vertex index to M2 vertex index)
        vertex_remap = list(struct.unpack_from(f'<{n_indices}H', data, ofs_indices))

        # Triangle indices (16-bit, refers to skin vertex indices)
        triangles = list(struct.unpack_from(f'<{n_triangles}H', data, ofs_triangles))

        # Store the global index list using M2 vertex indices
        # triangles[i] is an index into vertex_remap, which gives the M2 vertex index
        self.indices = [vertex_remap[t] for t in triangles]

        # Submeshes (48 bytes each)
        for i in range(n_submeshes):
            off = ofs_submeshes + i * 48
            vals = struct.unpack_from('<HH HH HH HH HH 3f 3f', data, off)
            self.submeshes.append({
                'meshPartId': vals[0],
                'padding': vals[1],
                'vertStart': vals[2],
                'vertCount': vals[3],
                'triStart': vals[4],
                'triCount': vals[5],
                'boneCount': vals[6],
                'boneStart': vals[7],
                'boneInfluences': vals[8],
                'rootBone': vals[9],
            })

        # Texture units (24 bytes each)
        for i in range(n_tex_units):
            off = ofs_tex_units + i * 24
            vals = struct.unpack_from('<12H', data, off)
            self.tex_units.append({
                'flags': vals[0],
                'shading': vals[1],
                'submeshIndex': vals[2],
                'submeshIndex2': vals[3],
                'colorIndex': vals[4],
                'renderFlagsIndex': vals[5],
                'texUnitNumber': vals[6],
                'mode': vals[7],
                'textureId': vals[8],  # index into texLookup
                'texUnitNumber2': vals[9],
                'transparencyIndex': vals[10],
                'textureAnimIndex': vals[11],
            })

    def get_texture_index_for_submesh(self, submesh_idx):
        """Get the M2 texture index for a given submesh."""
        for tu in self.tex_units:
            if tu['submeshIndex'] == submesh_idx:
                lookup_idx = tu['textureId']
                if lookup_idx < len(self.texture_lookups):
                    return self.texture_lookups[lookup_idx]
                # If lookup table is too small, use textureId directly
                if lookup_idx < len(self.textures):
                    return lookup_idx
                return 0
        return 0  # Default to first texture


# ============================================================================
# GLB Generator
# ============================================================================

def generate_glb(model, texture_image=None, z_up_to_y_up=True):
    """Generate a GLB (binary glTF) file from parsed M2 model data."""

    # Collect all unique vertex indices we actually use
    used_vertices = set(model.indices)
    if not used_vertices:
        print("    Warning: No indices found!")
        return None

    # Create compact vertex arrays
    # We remap M2 vertex indices to sequential 0..N
    index_remap = {}
    positions = []
    normals = []
    uvs = []

    for m2_idx in sorted(used_vertices):
        if m2_idx >= len(model.vertices):
            continue
        v = model.vertices[m2_idx]
        index_remap[m2_idx] = len(positions)

        px, py, pz = v['pos']
        nx, ny, nz = v['normal']
        u, vtex = v['uv']

        if z_up_to_y_up:
            # WoW uses Z-up, rotate to Y-up: (x, y, z) -> (x, z, -y)
            px, py, pz = px, pz, -py
            nx, ny, nz = nx, nz, -ny

        positions.append((px, py, pz))
        normals.append((nx, ny, nz))
        uvs.append((u, vtex))

    # Remap triangle indices
    remapped_indices = []
    for idx in model.indices:
        if idx in index_remap:
            remapped_indices.append(index_remap[idx])
        else:
            remapped_indices.append(0)  # fallback

    n_vertices = len(positions)
    n_indices = len(remapped_indices)

    if n_vertices == 0 or n_indices == 0:
        print("    Warning: Empty mesh!")
        return None

    # Calculate bounding box
    min_pos = [min(p[i] for p in positions) for i in range(3)]
    max_pos = [max(p[i] for p in positions) for i in range(3)]

    # ---- Binary buffer construction ----
    buffer_parts = []

    # Part 0: Indices (unsigned short = 2 bytes each)
    indices_data = struct.pack(f'<{n_indices}H', *remapped_indices)
    # Pad to 4-byte alignment
    while len(indices_data) % 4 != 0:
        indices_data += b'\x00'
    indices_offset = 0
    indices_length = n_indices * 2
    buffer_parts.append(indices_data)

    # Part 1: Positions (3 floats = 12 bytes each)
    pos_data = b''
    for p in positions:
        pos_data += struct.pack('<3f', *p)
    pos_offset = len(b''.join(buffer_parts))
    pos_length = len(pos_data)
    buffer_parts.append(pos_data)

    # Part 2: Normals (3 floats = 12 bytes each)
    normal_data = b''
    for n in normals:
        normal_data += struct.pack('<3f', *n)
    normal_offset = len(b''.join(buffer_parts))
    normal_length = len(normal_data)
    buffer_parts.append(normal_data)

    # Part 3: UVs (2 floats = 8 bytes each)
    uv_data = b''
    for uv in uvs:
        uv_data += struct.pack('<2f', *uv)
    uv_offset = len(b''.join(buffer_parts))
    uv_length = len(uv_data)
    buffer_parts.append(uv_data)

    # Combine all buffer data
    binary_buffer = b''.join(buffer_parts)
    buffer_byte_length = len(binary_buffer)

    # ---- Build glTF JSON ----
    gltf = {
        "asset": {"version": "2.0", "generator": "AoWoW M2 Converter"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": "model"}],
        "buffers": [{"byteLength": buffer_byte_length}],
        "bufferViews": [
            # 0: Indices
            {
                "buffer": 0,
                "byteOffset": indices_offset,
                "byteLength": indices_length,
                "target": 34963,  # ELEMENT_ARRAY_BUFFER
            },
            # 1: Positions
            {
                "buffer": 0,
                "byteOffset": pos_offset,
                "byteLength": pos_length,
                "target": 34962,  # ARRAY_BUFFER
                "byteStride": 12,
            },
            # 2: Normals
            {
                "buffer": 0,
                "byteOffset": normal_offset,
                "byteLength": normal_length,
                "target": 34962,
                "byteStride": 12,
            },
            # 3: UVs
            {
                "buffer": 0,
                "byteOffset": uv_offset,
                "byteLength": uv_length,
                "target": 34962,
                "byteStride": 8,
            },
        ],
        "accessors": [
            # 0: Indices
            {
                "bufferView": 0,
                "byteOffset": 0,
                "componentType": 5123,  # UNSIGNED_SHORT
                "count": n_indices,
                "type": "SCALAR",
                "max": [max(remapped_indices)],
                "min": [min(remapped_indices)],
            },
            # 1: Positions
            {
                "bufferView": 1,
                "byteOffset": 0,
                "componentType": 5126,  # FLOAT
                "count": n_vertices,
                "type": "VEC3",
                "max": max_pos,
                "min": min_pos,
            },
            # 2: Normals
            {
                "bufferView": 2,
                "byteOffset": 0,
                "componentType": 5126,
                "count": n_vertices,
                "type": "VEC3",
            },
            # 3: UVs
            {
                "bufferView": 3,
                "byteOffset": 0,
                "componentType": 5126,
                "count": n_vertices,
                "type": "VEC2",
            },
        ],
        "meshes": [{
            "primitives": [{
                "attributes": {
                    "POSITION": 1,
                    "NORMAL": 2,
                    "TEXCOORD_0": 3,
                },
                "indices": 0,
                "material": 0,
            }],
        }],
    }

    # ---- Handle texture ----
    if texture_image is not None:
        # Encode texture to PNG in memory
        png_buffer = io.BytesIO()
        # Resize large textures for web delivery
        max_tex_size = 512
        if texture_image.width > max_tex_size or texture_image.height > max_tex_size:
            texture_image = texture_image.resize(
                (min(texture_image.width, max_tex_size),
                 min(texture_image.height, max_tex_size)),
                Image.LANCZOS
            )
        texture_image.save(png_buffer, format='PNG', optimize=True)
        png_data = png_buffer.getvalue()

        # Pad PNG data to 4-byte alignment
        padded_png = png_data
        while len(padded_png) % 4 != 0:
            padded_png += b'\x00'

        # Add PNG data to binary buffer
        texture_offset = buffer_byte_length
        texture_length = len(png_data)
        binary_buffer += padded_png
        buffer_byte_length = len(binary_buffer)

        # Update buffer length
        gltf["buffers"][0]["byteLength"] = buffer_byte_length

        # Add bufferView for texture
        tex_bv_idx = len(gltf["bufferViews"])
        gltf["bufferViews"].append({
            "buffer": 0,
            "byteOffset": texture_offset,
            "byteLength": texture_length,
        })

        # Add image, sampler, texture, material
        gltf["images"] = [{
            "bufferView": tex_bv_idx,
            "mimeType": "image/png",
        }]
        gltf["samplers"] = [{
            "magFilter": 9729,  # LINEAR
            "minFilter": 9987,  # LINEAR_MIPMAP_LINEAR
            "wrapS": 10497,     # REPEAT
            "wrapT": 10497,
        }]
        gltf["textures"] = [{
            "sampler": 0,
            "source": 0,
        }]
        gltf["materials"] = [{
            "pbrMetallicRoughness": {
                "baseColorTexture": {"index": 0},
                "metallicFactor": 0.0,
                "roughnessFactor": 0.8,
            },
            "doubleSided": True,
        }]
    else:
        # No texture - use a default material
        gltf["materials"] = [{
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.8, 0.7, 0.6, 1.0],
                "metallicFactor": 0.0,
                "roughnessFactor": 0.7,
            },
            "doubleSided": True,
        }]

    # ---- Encode to GLB ----
    json_str = json.dumps(gltf, separators=(',', ':'))
    json_bytes = json_str.encode('utf-8')
    # Pad JSON to 4-byte alignment with spaces
    while len(json_bytes) % 4 != 0:
        json_bytes += b' '

    # GLB header: magic(4) + version(4) + length(4)
    # JSON chunk: length(4) + type(4) + data
    # BIN chunk: length(4) + type(4) + data
    json_chunk_length = len(json_bytes)
    bin_chunk_length = len(binary_buffer)
    total_length = 12 + 8 + json_chunk_length + 8 + bin_chunk_length

    glb = bytearray()
    # GLB header
    glb += struct.pack('<III', 0x46546C67, 2, total_length)  # glTF magic, version 2
    # JSON chunk
    glb += struct.pack('<II', json_chunk_length, 0x4E4F534A)  # JSON type
    glb += json_bytes
    # BIN chunk
    glb += struct.pack('<II', bin_chunk_length, 0x004E4942)  # BIN type
    glb += binary_buffer

    return bytes(glb)


# ============================================================================
# Character Model Converter
# ============================================================================

def find_skin_texture(mpq_mgr, model_path, skin_color=0):
    """Find the skin texture BLP path for a character model.

    Character models use dynamic textures (type=1) that are resolved at runtime.
    The pattern is: <ModelPath>Skin<SkinColor>_<ExtraSuffix>.blp

    For example: Character\\Human\\Male\\HumanMaleSkin00_00.blp
    """
    # Extract the model base name from path
    # e.g., "Character\\Human\\Male\\HumanMale" -> "HumanMale"
    parts = model_path.replace('/', '\\').split('\\')
    model_name = parts[-1]  # e.g., "HumanMale"
    model_dir = '\\'.join(parts[:-1])  # e.g., "Character\\Human\\Male"

    # Try various skin texture patterns
    # Pattern 1: {ModelName}Skin{00}_{colorIdx:02d}.blp (most common)
    patterns = [
        f"{model_dir}\\{model_name}Skin00_{skin_color:02d}.blp",
        f"{model_dir}\\{model_name}Skin{skin_color:02d}_00.blp",
        f"{model_dir}\\{model_name}_skin.blp",
        f"{model_dir}\\{model_name}.blp",
    ]

    for pattern in patterns:
        blp_data = mpq_mgr.read_file(pattern)
        if blp_data:
            return blp_data, pattern

    # Search for any matching skin texture
    search_term = (model_dir + '\\' + model_name + 'skin').lower().replace('/', '\\')
    matches = mpq_mgr.find_files(search_term)
    if matches:
        # Pick the first reasonable match
        for m in sorted(matches):
            if m.lower().endswith('.blp'):
                blp_data = mpq_mgr.read_file(m)
                if blp_data:
                    return blp_data, m

    return None, None


def find_creature_texture(mpq_mgr, model_path):
    """Find textures for creature/NPC models."""
    parts = model_path.replace('/', '\\').split('\\')
    model_name = parts[-1]
    model_dir = '\\'.join(parts[:-1])

    # Creature textures often have the same name or _skin suffix
    patterns = [
        f"{model_dir}\\{model_name}.blp",
        f"{model_dir}\\{model_name}_skin.blp",
        f"{model_dir}\\{model_name}Skin.blp",
        f"{model_dir}\\{model_name}00.blp",
        f"{model_dir}\\{model_name}_00.blp",
    ]

    for pattern in patterns:
        blp_data = mpq_mgr.read_file(pattern)
        if blp_data:
            return blp_data, pattern

    # Search for any texture in the model directory
    search_term = (model_dir + '\\' + model_name).lower().replace('/', '\\')
    matches = mpq_mgr.find_files(search_term)
    blp_matches = [m for m in matches if m.lower().endswith('.blp')]
    if blp_matches:
        for m in sorted(blp_matches):
            blp_data = mpq_mgr.read_file(m)
            if blp_data:
                return blp_data, m

    return None, None


def get_item_texture(mpq_mgr, m2_model):
    """Get texture for an item model. Items often have hardcoded texture paths (type=0)."""
    for tex_def in m2_model.textures:
        if tex_def['type'] == 0 and tex_def['filename']:
            blp_path = tex_def['filename']
            blp_data = mpq_mgr.read_file(blp_path)
            if blp_data:
                return blp_data, blp_path

    return None, None


def convert_model(mpq_mgr, model_path, output_path, model_type='character', skin_color=0):
    """Convert a single M2 model to GLB.

    Args:
        mpq_mgr: MPQManager instance
        model_path: M2 path within MPQ (without .M2 extension)
        output_path: Output GLB file path
        model_type: 'character', 'creature', 'item', 'object'
        skin_color: Skin color index for character models
    """
    m2_path = model_path + '.M2'
    skin_path = model_path + '00.skin'

    print(f"  Loading M2: {m2_path}")
    m2_data = mpq_mgr.read_file(m2_path)
    if not m2_data:
        # Try lowercase
        m2_path_lower = m2_path.lower()
        m2_data = mpq_mgr.read_file(m2_path_lower)
        if not m2_data:
            print(f"    ERROR: M2 file not found: {m2_path}")
            return False

    print(f"  Loading skin: {skin_path}")
    skin_data = mpq_mgr.read_file(skin_path)
    if not skin_data:
        skin_path_lower = skin_path.lower()
        skin_data = mpq_mgr.read_file(skin_path_lower)
        if not skin_data:
            print(f"    ERROR: Skin file not found: {skin_path}")
            return False

    try:
        model = M2Model(m2_data, skin_data)
        print(f"    Vertices: {len(model.vertices)}, Indices: {len(model.indices)}, Submeshes: {len(model.submeshes)}")
    except Exception as e:
        print(f"    ERROR: Failed to parse M2: {e}")
        traceback.print_exc()
        return False

    # Find texture
    texture_img = None
    if model_type == 'character':
        blp_data, blp_path = find_skin_texture(mpq_mgr, model_path, skin_color)
    elif model_type == 'item':
        blp_data, blp_path = get_item_texture(mpq_mgr, model)
        if not blp_data:
            blp_data, blp_path = find_creature_texture(mpq_mgr, model_path)
    else:
        # Try hardcoded texture first, then creature pattern
        blp_data, blp_path = get_item_texture(mpq_mgr, model)
        if not blp_data:
            blp_data, blp_path = find_creature_texture(mpq_mgr, model_path)

    if blp_data:
        print(f"    Texture: {blp_path} ({len(blp_data)} bytes)")
        texture_img = decode_blp(blp_data)
        if texture_img:
            print(f"    Decoded: {texture_img.size[0]}x{texture_img.size[1]}")
        else:
            print(f"    Warning: Failed to decode BLP texture")
    else:
        print(f"    Warning: No texture found")

    # Generate GLB
    glb_data = generate_glb(model, texture_img, z_up_to_y_up=True)
    if not glb_data:
        print(f"    ERROR: Failed to generate GLB")
        return False

    # Write output
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(glb_data)

    size_kb = len(glb_data) / 1024
    print(f"    Output: {output_path} ({size_kb:.1f} KB)")
    return True


# ============================================================================
# Batch Conversion
# ============================================================================

def convert_all_characters(mpq_mgr):
    """Convert all playable character race models."""
    print("\n=== Converting Character Models ===\n")
    output_dir = os.path.join(OUTPUT_BASE, 'character')
    os.makedirs(output_dir, exist_ok=True)

    success = 0
    failed = 0

    for name, m2_path in sorted(CHARACTER_MODELS.items()):
        output_path = os.path.join(output_dir, f"{name}.glb")
        print(f"\nConverting: {name}")
        if convert_model(mpq_mgr, m2_path, output_path, model_type='character'):
            success += 1
        else:
            failed += 1

    print(f"\n=== Characters: {success} success, {failed} failed ===\n")
    return success, failed


def find_all_item_models(mpq_mgr):
    """Find all item/weapon/armor M2 models in MPQs."""
    item_paths = set()

    # Items are typically in Item\\ObjectComponents\\ or similar
    search_terms = ['item\\', 'world\\']
    for term in search_terms:
        matches = mpq_mgr.find_files(term)
        for m in matches:
            if m.lower().endswith('.m2'):
                # Strip .m2 extension
                item_paths.add(m[:-3])

    return sorted(item_paths)


def convert_existing_items(mpq_mgr):
    """Convert item models that we already have GLBs for (update with textures)."""
    print("\n=== Converting Existing Item Models ===\n")

    item_dir = os.path.join(OUTPUT_BASE, 'item')
    if not os.path.isdir(item_dir):
        print("No item directory found")
        return 0, 0

    existing_glbs = [f for f in os.listdir(item_dir) if f.endswith('.glb')]
    print(f"Found {len(existing_glbs)} existing item GLBs")

    # We need to map GLB filenames back to M2 paths
    # The existing GLBs use numeric IDs from the database
    # We'll need to look up the M2 path from the item display info

    # For now, let's look at the item-models.json which maps display IDs to model paths
    json_path = os.path.join(OUTPUT_BASE, 'item-models.json')
    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            item_models = json.load(f)
        print(f"Loaded {len(item_models)} item model mappings")

        success = 0
        failed = 0
        skipped = 0

        for display_id, info in sorted(item_models.items()):
            glb_name = f"{display_id}.glb"
            output_path = os.path.join(item_dir, glb_name)

            if not os.path.exists(output_path):
                continue

            if isinstance(info, dict):
                m2_path = info.get('modelPath', info.get('model', ''))
            elif isinstance(info, str):
                m2_path = info
            else:
                continue

            if not m2_path:
                skipped += 1
                continue

            # Strip .m2/.M2 extension if present
            if m2_path.lower().endswith('.m2'):
                m2_path = m2_path[:-3]

            # Convert backslashes
            m2_path = m2_path.replace('/', '\\')

            print(f"\nConverting item {display_id}: {m2_path}")
            if convert_model(mpq_mgr, m2_path, output_path, model_type='item'):
                success += 1
            else:
                failed += 1

            # Progress update every 100 items
            total_done = success + failed
            if total_done % 100 == 0:
                print(f"  ... Progress: {total_done} processed ({success} ok, {failed} fail)")

        print(f"\n=== Items: {success} success, {failed} failed, {skipped} skipped ===\n")
        return success, failed

    else:
        print("No item-models.json found - cannot map display IDs to M2 paths")
        return 0, 0


# ============================================================================
# Main
# ============================================================================

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Convert WoW M2 models to GLB')
    parser.add_argument('--type', choices=['characters', 'items', 'all'], default='characters',
                        help='What to convert')
    parser.add_argument('--single', type=str, help='Convert a single M2 path (without .M2 extension)')
    parser.add_argument('--output', type=str, help='Output GLB path (for --single)')
    parser.add_argument('--skin-color', type=int, default=0, help='Skin color index for characters')
    args = parser.parse_args()

    print("Loading MPQ archives...")
    mpq_mgr = MPQManager(CLIENT_DATA)
    print(f"Indexed {len(mpq_mgr.file_index)} files across {len(mpq_mgr.archives)} archives\n")

    if args.single:
        output = args.output or '/tmp/test_model.glb'
        convert_model(mpq_mgr, args.single, output, skin_color=args.skin_color)
    elif args.type == 'characters' or args.type == 'all':
        convert_all_characters(mpq_mgr)
        if args.type == 'all':
            convert_existing_items(mpq_mgr)
    elif args.type == 'items':
        convert_existing_items(mpq_mgr)


if __name__ == '__main__':
    main()
