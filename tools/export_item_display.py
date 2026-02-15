#!/usr/bin/env python3
"""Parse ItemDisplayInfo.dbc properly and export to JSON."""
import struct
import json
import os
import sys
import mpyq

def extract_dbc():
    """Extract ItemDisplayInfo.dbc from MPQ archives."""
    data_path = '/var/www/clientdata/Data/enUS'
    mpq_files = ['patch-enUS-3.MPQ', 'patch-enUS-2.MPQ', 'patch-enUS.MPQ', 'locale-enUS.MPQ']
    
    for mpq_name in mpq_files:
        path = os.path.join(data_path, mpq_name)
        if not os.path.exists(path):
            continue
        try:
            archive = mpyq.MPQArchive(path)
            for f in archive.files:
                name = f.decode('utf-8', 'ignore') if isinstance(f, bytes) else f
                if 'itemdisplayinfo.dbc' in name.lower():
                    data = archive.read_file(name)
                    if data:
                        print(f"Found in {mpq_name}: {name} ({len(data)} bytes)", file=sys.stderr)
                        return data
        except Exception as e:
            print(f"Error with {mpq_name}: {e}", file=sys.stderr)
    
    return None

def parse_dbc(data):
    """Parse DBC file format."""
    # Header: magic(4), record_count(4), field_count(4), record_size(4), string_block_size(4)
    magic = data[:4]
    if magic != b'WDBC':
        print(f"ERROR: Not a WDBC file (magic: {magic})", file=sys.stderr)
        return None
    
    record_count, field_count, record_size, string_block_size = struct.unpack('<4I', data[4:20])
    print(f"DBC: {record_count} records, {field_count} fields, {record_size} bytes/record, {string_block_size} string block", file=sys.stderr)
    
    header_size = 20
    records_start = header_size
    string_block_start = records_start + (record_count * record_size)
    string_block = data[string_block_start:]
    
    def get_string(offset):
        """Get null-terminated string from string block."""
        if offset == 0:
            return ''
        if offset >= len(string_block):
            return ''
        end = string_block.index(b'\x00', offset) if b'\x00' in string_block[offset:] else len(string_block)
        return string_block[offset:end].decode('utf-8', 'ignore')
    
    # Parse all records - read raw uint32 values first
    records = []
    for i in range(record_count):
        offset = records_start + (i * record_size)
        fields = struct.unpack(f'<{field_count}I', data[offset:offset + record_size])
        records.append(fields)
    
    return records, get_string, field_count, record_count

def main():
    data = extract_dbc()
    if not data:
        print("ERROR: Could not find ItemDisplayInfo.dbc", file=sys.stderr)
        sys.exit(1)
    
    result = parse_dbc(data)
    if not result:
        sys.exit(1)
    
    records, get_string, field_count, record_count = result
    
    # Show first few records to verify field layout
    # According to dbc definition:
    #   0: ID
    #   1-2: ModelName[2] (string)
    #   3-4: ModelTexture[2] (string)
    #   5-6: InventoryIcon[2] (string)
    #   7-8: GeosetGroup[2] (uint32)
    #   9: Flags (uint32)
    #   10: SpellVisualID (uint32)
    #   11: GroupSoundIndex (uint32)
    #   12-13: HelmetGeosetVisID[2] (uint32)
    #   14-21: Texture[8] (string)
    #   22: ItemVisual (uint32)
    #   23: ParticleColorID (uint32)
    #   24+: unknown
    
    # First, let's verify by looking at known records
    # Show record with ID close to 233
    print(f"\nField count: {field_count}", file=sys.stderr)
    print(f"\n--- Examining sample records ---", file=sys.stderr)
    
    for rec in records:
        if rec[0] in [233, 687, 976, 977, 1511, 220]:
            did = rec[0]
            print(f"\n=== DisplayId {did} ===", file=sys.stderr)
            for i in range(field_count):
                val = rec[i]
                # Try to interpret as string
                s = get_string(val) if val > 0 and val < 1000000 else ''
                if s and len(s) > 2:
                    print(f"  Field {i:2d}: {val:8d} -> '{s}'", file=sys.stderr)
                else:
                    print(f"  Field {i:2d}: {val:8d}", file=sys.stderr)
    
    # Now build the JSON with CORRECT field mapping
    # After examining sample records, we'll determine the right mapping
    # For now, let's output a diagnostic
    
    # Body region names for Texture[0..7] fields
    # CORRECTED: Textures are at fields 15-22 (not 14-21)
    # Field 14 is an extra unknown field (always seems to be 0)
    # The 8 texture positions correspond to body regions:
    #   Field 15 = Texture[0] → ArmUpper  (suffix _AU)
    #   Field 16 = Texture[1] → ArmLower  (suffix _AL)
    #   Field 17 = Texture[2] → Hand      (suffix _HA)
    #   Field 18 = Texture[3] → TorsoUpper (suffix _TU)
    #   Field 19 = Texture[4] → TorsoLower (suffix _TL)
    #   Field 20 = Texture[5] → LegUpper  (suffix _LU)
    #   Field 21 = Texture[6] → LegLower  (suffix _LL)
    #   Field 22 = Texture[7] → Foot      (suffix _FO)
    # After textures: Field 23 = ItemVisual, Field 24 = ParticleColorID
    region_names = ['armUpper', 'armLower', 'hand', 'torsoUpper', 'torsoLower', 'legUpper', 'legLower', 'foot']
    TEXTURE_START = 15  # First texture field index
    
    output = {}
    for rec in records:
        did = rec[0]
        if did == 0:
            continue
        
        entry = {}
        
        # Model names (fields 1-2)
        model_l = get_string(rec[1]) if rec[1] > 0 else ''
        model_r = get_string(rec[2]) if rec[2] > 0 else ''
        
        # Model textures (fields 3-4)
        tex_l = get_string(rec[3]) if rec[3] > 0 else ''
        tex_r = get_string(rec[4]) if rec[4] > 0 else ''
        
        # Inventory icons (fields 5-6)
        icon_l = get_string(rec[5]) if rec[5] > 0 else ''
        icon_r = get_string(rec[6]) if rec[6] > 0 else ''
        
        # Geoset groups (fields 7-8)
        geo1, geo2 = rec[7], rec[8]
        
        # Flags (field 9)
        flags = rec[9]
        
        # Helmet geoset vis (fields 12-13)
        helm1, helm2 = rec[12], rec[13]
        
        # Body textures (fields 15-22, 8 regions)
        textures = {}
        for i in range(8):
            field_idx = TEXTURE_START + i
            if field_idx < field_count:
                tex = get_string(rec[field_idx]) if rec[field_idx] > 0 else ''
                if tex:
                    textures[region_names[i]] = tex
        
        # Only include entries with useful data
        if textures:
            entry['tex'] = textures
        if model_l:
            entry['modelL'] = model_l
        if model_r:
            entry['modelR'] = model_r
        if tex_l:
            entry['texL'] = tex_l
        if tex_r:
            entry['texR'] = tex_r
        if geo1:
            entry['geo1'] = geo1
        if geo2:
            entry['geo2'] = geo2
        if helm1:
            entry['helmGeo1'] = helm1
        if helm2:
            entry['helmGeo2'] = helm2
        if flags:
            entry['flags'] = flags
        
        if entry:
            output[str(did)] = entry
    
    # Write output
    output_path = '/var/www/aowow/static/data/item-display-info.json'
    with open(output_path, 'w') as f:
        json.dump(output, f, separators=(',', ':'))
    
    print(f"\nExported {len(output)} entries to {output_path}", file=sys.stderr)
    print(f"File size: {os.path.getsize(output_path)} bytes", file=sys.stderr)
    
    # Stats
    with_tex = sum(1 for v in output.values() if 'tex' in v)
    with_model = sum(1 for v in output.values() if 'modelL' in v)
    print(f"With body textures: {with_tex}", file=sys.stderr)
    print(f"With models: {with_model}", file=sys.stderr)

if __name__ == '__main__':
    main()
