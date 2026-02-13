# M2 Model Format Analysis & WebGL Integration Strategy

## Current Status

**What we have:**
- ✅ 22,141 M2 model files extracted from MPQ archives
- ✅ MPQExtractor working correctly (extracts files by pattern)
- ✅ WebGL viewer framework complete
- ❌ M2 geometry NOT being parsed/converted to glTF

**What we're doing wrong:**
- Converting M2 files to glTF but NOT extracting actual geometry
- Creating placeholder glTF files with minimal cube/sphere geometry
- Result: All items show procedural shapes instead of actual models

## M2 File Format Overview

### Magic Number & Header
```
Offset  Size  Type      Field
0x00    4     char[4]   Magic = "MD20"
0x04    4     uint32    Version (usually 0x0108 for WoW 3.3.5a)
0x08    4     uint32    Name length
0x0C    4     uint32    Name offset
0x10    4     uint32    Global flags
```

### Key Sections (offsets from header)
- **Vertices**: Position data (x, y, z floats)
- **Indices**: Triangle indices (uint16)
- **Bones**: Skeletal structure
- **Animations**: Animation data
- **Textures**: Texture references
- **Materials**: Material definitions
- **Normals**: Vertex normals

### Example from our file:
```
00000000: 4d44 3230 0801 0000  "MD20" + version 0x0108
00000008: 1e00 0000 3001 0000  Name length=30, Name offset=0x0130
```

## Solutions

### Option 1: Use Existing M2 Parser (Recommended)
**Pros:**
- Fast implementation
- Proven, tested code
- Handles all M2 features

**Cons:**
- Requires external tool/library
- May need compilation

**Tools available:**
- `WoWModelViewer` - C++ tool, can export to OBJ/glTF
- `M2Lib` - Python library for M2 parsing
- `Casclib` - Already used by MPQExtractor

### Option 2: Implement M2 Parser in PHP/JavaScript
**Pros:**
- Full control
- No external dependencies

**Cons:**
- Complex binary format
- Time-consuming to implement correctly
- Need to handle all edge cases

**Effort:** ~2-3 days for basic geometry extraction

### Option 3: Use Community Tools
**Available:**
- Blender M2 addon (exports to glTF)
- Python M2 converters
- Online M2 viewers

**Pros:**
- Already tested
- Can batch convert

**Cons:**
- May require manual setup
- Licensing considerations

## Recommended Path Forward

### Phase 1: Quick Win (Today)
Use existing M2 viewer tools to batch convert models:
```bash
# Option A: Use WoWModelViewer CLI
for m2 in /var/www/aowow/setup/mpqdata/**/*.m2; do
  WoWModelViewer "$m2" --export-gltf "/var/www/aowow/static/models/"
done

# Option B: Use Python M2Lib
python3 convert_m2_batch.py \
  --input /var/www/aowow/setup/mpqdata \
  --output /var/www/aowow/static/models \
  --format gltf
```

### Phase 2: Proper Implementation (Next)
1. Implement M2 header parser in PHP
2. Extract vertex/index data
3. Create proper glTF from extracted geometry
4. Handle bones/animations

### Phase 3: Optimization
1. Cache converted models
2. Compress glTF files
3. Stream large models
4. Add LOD support

## M2 Format Details

### Vertex Structure
```c
struct Vertex {
    float position[3];      // x, y, z
    uint8 bone_weights[4];  // Bone influence weights
    uint8 bone_indices[4];  // Bone indices
    float normal[3];        // Normal vector
    float texcoord[2];      // Texture coordinates
    float unk1[2];          // Unknown
};
```

### Index Data
- Stored as uint16 or uint32
- Triangle indices (3 per face)
- Can be compressed

### Material System
- Multiple materials per model
- Texture references
- Blend modes
- Transparency

## Current Implementation Issues

### Problem 1: Placeholder glTF
```php
// Current: Creates minimal cube
$vertices = [-1, -1, -1, 1, -1, -1, ...];  // Only 8 vertices
$indices = [0, 1, 2, 2, 3, 0, ...];        // Only 12 indices

// Should be: Extract from M2
$vertices = [...1000+ vertices from M2...];
$indices = [...3000+ indices from M2...];
```

### Problem 2: No Geometry Extraction
```php
// Current: Ignores M2 file content
$m2Data = file_get_contents($m2File);
// ... does nothing with $m2Data

// Should be: Parse M2 structure
$header = unpack('C4magic/Iversion/Iname_len/Iname_offset', $m2Data);
$vertices = extractVertices($m2Data, $header);
$indices = extractIndices($m2Data, $header);
```

### Problem 3: No Texture/Material Handling
- M2 files reference textures
- Need to extract texture paths
- Convert to glTF material references

## Next Steps

### Immediate (1-2 hours)
1. Research available M2 conversion tools
2. Test conversion on sample M2 file
3. Verify output glTF quality

### Short Term (1 day)
1. Set up batch conversion pipeline
2. Convert all 22,141 M2 files
3. Test viewer with real models

### Medium Term (2-3 days)
1. Implement basic M2 parser
2. Extract geometry programmatically
3. Handle animations

### Long Term (1 week)
1. Full M2 format support
2. Texture mapping
3. Bone/animation system
4. Performance optimization

## Resources

### M2 Format Specifications
- WoW Model Viewer source code
- Casclib documentation
- Community M2 format docs

### Tools
- `WoWModelViewer` - Full M2 support
- `Blender M2 addon` - Exports to glTF
- `Python M2Lib` - Parsing library

### References
- https://github.com/wowdev/WoW-Model-Viewer
- https://github.com/wowdev/WoWDBDefs
- https://wowdev.wiki/M2

## Conclusion

The current implementation creates **procedural placeholder models** instead of **actual M2 geometry**. To display real models, we need to:

1. **Parse M2 file headers** to locate geometry data
2. **Extract vertex/index data** from M2 binary format
3. **Convert to glTF** with proper geometry
4. **Handle materials/textures** for visual fidelity

**Recommended:** Use existing M2 conversion tools for quick results, then implement proper parser for long-term solution.

