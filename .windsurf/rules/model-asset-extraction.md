---
description: 3D model and asset extraction, storage, and loading for AoWoW
activation_mode: model_decision
---

# Model and Asset Extraction

<asset_types>
- M2 files - 3D character and creature models
- WMO files - World map objects and buildings
- BLP files - Textures and images
- ADT files - Terrain data
- Extracted from MPQ archives during setup
</asset_types>

<m2_model_extraction>
- M2 format - Binary 3D model format used by WoW
- Contains geometry, animations, textures
- Extracted from MPQ files
- Converted to web-compatible formats (glTF, OBJ, etc.)
- Stored with metadata for display
- Used for character, creature, and item 3D previews
</m2_model_extraction>

<model_storage>
- Store M2 files in extracted data directory
- Convert to web formats for browser display
- Store model metadata in database
- Link models to game objects (creatures, items, etc.)
- Cache converted models
- Maintain model versions and updates
</model_storage>

<model_database_tables>
- `creature_model_info` - Creature model references
- `character_display_info` - Character model data
- `item_display_info` - Item model references
- `model_cache` - Cached model conversions
- `model_metadata` - Model properties and scaling
</model_database_tables>

<model_loading>
- Load M2 model by ID from database
- Fetch model file path
- Get model metadata (scale, animations)
- Load texture references
- Cache model data for performance
- Handle missing models gracefully
- Support model variations
</model_loading>

<model_display>
- Render 3D models in browser using WebGL
- Support model rotation and zoom
- Display model animations
- Show texture details
- Support multiple viewing angles
- Provide model information overlay
- Cache rendered models
</model_display>

<texture_management>
- Extract BLP textures from MPQ
- Convert BLP to PNG/WebP for web
- Store texture files with model data
- Link textures to models
- Support texture variations
- Cache texture data
- Optimize texture file sizes
</texture_management>

<animation_support>
- Extract animation data from M2 files
- Store animation definitions
- Support animation playback
- Link animations to models
- Cache animation data
- Support animation blending
</animation_support>

<model_conversion>
- Convert M2 to glTF for web display
- Convert M2 to OBJ for compatibility
- Maintain model quality during conversion
- Preserve material information
- Handle model scaling
- Support batch conversion
- Cache converted models
</model_conversion>

<performance_optimization>
- Use LOD (Level of Detail) models for distant viewing
- Implement model streaming for large files
- Cache frequently accessed models
- Use texture atlasing to reduce draw calls
- Implement model preloading
- Monitor model loading times
- Optimize model file sizes
</performance_optimization>

<error_handling>
- Handle missing M2 files
- Handle corrupted model data
- Provide fallback models
- Log model loading errors
- Validate model data integrity
- Graceful degradation for unsupported browsers
</error_handling>

<wmo_and_terrain>
- Extract WMO files for world objects
- Extract ADT files for terrain
- Store world map data
- Link objects to zones
- Support world map visualization
- Cache terrain data
</wmo_and_terrain>

<model_metadata>
- Store model scale information
- Store model bounding boxes
- Store animation list
- Store texture references
- Store model variants
- Store model properties
</model_metadata>
