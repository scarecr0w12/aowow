# WebGL Model Viewer System - Analysis & Implementation Plan

## Current System Overview

### Flash-Based Architecture
- **Technology**: Adobe Flash (ZAMviewer SWF files)
- **Files**: 
  - `ZAMviewerfp11.swf` (76KB) - Main viewer
  - `ModelView.swf` (101KB) - Alternative viewer
  - `expressInstall.swf` (773B) - Flash installer fallback
- **Integration**: SWFObject library for embedding
- **Location**: `/static/modelviewer/`

### Current Implementation Details

**Model Types Supported**:
1. Type 1: NPC/Character models (displayId)
2. Type 2: Game objects (displayId)
3. Type 3: Items (displayId + slot)
4. Type 4: Item sets (equipList)
5. Type 8: Pet models
6. Type 16: Character models with race/sex

**Data Flow**:
- `ModelViewer.show()` - Main entry point in `global.js:20702`
- Flash variables passed: `model`, `modelType`, `contentPath`
- Model data served from `/modelviewer/` directory
- Character customization: race, sex, equipment slots
- Animation support via Flash API

**Integration Points**:
- `Markup.js` - Tag rendering for `[npc]`, `[object]`, `[item]`, `[itemset]` tags
- `Profiler.js` - Character profiler integration
- `TalentCalc.js` - Talent calculator viewer
- `global.js` - Main ModelViewer object (3000+ lines)
- Template: `redButtons.tpl.php` - "View 3D" button

**Content Delivery**:
- Model files: `/modelviewer/` directory
- Thumbnails: `/modelviewer/thumbs/npc/`, `/modelviewer/thumbs/obj/`, `/modelviewer/thumbs/item/`
- Content path passed as Flash variable

---

## WebGL Replacement Strategy

### Framework Options

**1. Three.js (Recommended)**
- ✅ Mature, well-documented
- ✅ Excellent model loading (glTF, OBJ, FBX)
- ✅ Strong animation support
- ✅ Large community
- ✅ Active maintenance
- Cons: Larger bundle size (~600KB)

**2. Babylon.js**
- ✅ Feature-rich, powerful
- ✅ Great physics engine
- ✅ Excellent documentation
- Cons: Larger bundle, steeper learning curve

**3. Cesium.js**
- Better for geospatial, less ideal for character models

**4. PlayCanvas**
- Cloud-based, less control

### Recommended Approach: Three.js + Vite

**Why**:
- Three.js handles 3D rendering
- Vite for fast development and optimized builds
- Can create a standalone module that replaces Flash viewer
- Modern ES6 modules
- Tree-shaking for smaller bundle

---

## Implementation Architecture

### File Structure
```
/static/webgl-viewer/
├── src/
│   ├── index.js              # Entry point
│   ├── viewer.js             # Main viewer class
│   ├── loaders/
│   │   ├── m2-loader.js      # WoW M2 format loader
│   │   ├── obj-loader.js     # OBJ fallback
│   │   └── texture-loader.js # Texture management
│   ├── scene/
│   │   ├── scene-setup.js    # Scene initialization
│   │   ├── lighting.js       # Lighting configuration
│   │   └── camera.js         # Camera controls
│   ├── ui/
│   │   ├── controls.js       # UI controls
│   │   ├── animations.js     # Animation selector
│   │   └── customization.js  # Character customization
│   └── utils/
│       ├── math.js           # Utility functions
│       └── config.js         # Configuration
├── vite.config.js
├── package.json
└── dist/                     # Built output
```

### Key Components

**1. WebGL Viewer Class**
```javascript
class WebGLViewer {
  constructor(containerId, options)
  loadModel(type, displayId, options)
  setAnimation(animationName)
  setRace(raceId)
  setSex(sexId)
  equipItem(slot, itemId)
  render()
  dispose()
}
```

**2. Model Type Support**
- Type 1: NPC (M2 format)
- Type 2: Object (M2 format)
- Type 3: Item (M2 format)
- Type 4: Item set (multiple M2s)
- Type 8: Pet (M2 format)
- Type 16: Character (race/sex variants)

**3. Data Requirements**
- M2 model files (binary format)
- Texture files (BLP → PNG/WebP)
- Animation data
- Skeleton/bone data

---

## Migration Path

### Phase 1: Foundation
- [ ] Set up Vite + Three.js project
- [ ] Create basic viewer component
- [ ] Implement OBJ/glTF loading as fallback
- [ ] Create standalone HTML test page

### Phase 2: WoW Format Support
- [ ] Implement M2 format loader
- [ ] Add texture loading (BLP support)
- [ ] Implement animation system
- [ ] Add bone/skeleton support

### Phase 3: Integration
- [ ] Create JavaScript API compatible with current `ModelViewer.show()`
- [ ] Update Markup.js to use new viewer
- [ ] Update Profiler.js integration
- [ ] Update TalentCalc.js integration

### Phase 4: UI/UX
- [ ] Character customization (race/sex)
- [ ] Animation selector
- [ ] Equipment slot management
- [ ] Camera controls (orbit, zoom, pan)
- [ ] Fullscreen support

### Phase 5: Optimization & Polish
- [ ] Performance optimization
- [ ] Fallback handling
- [ ] Mobile responsiveness
- [ ] Accessibility improvements

---

## Data Format Considerations

### M2 Format (WoW Model Format)
- Binary format used by World of Warcraft
- Contains: geometry, bones, animations, textures
- Requires custom parser or conversion to standard format

### Conversion Options
1. **Extract to glTF**: Use existing tools (Noggit, WoW model extractors)
2. **Extract to OBJ**: Simpler but loses animation data
3. **Implement M2 parser**: Full control, complex

### Recommended**: Hybrid Approach
- Use existing M2 extraction tools to convert to glTF
- Store glTF + textures in `/static/webgl-viewer/models/`
- Fallback to OBJ for unsupported models
- Lazy-load models on demand

---

## API Compatibility

### Current Flash API
```javascript
ModelViewer.show({
  type: 1,
  displayId: 12345,
  slot: 1,
  race: 1,
  sex: 0,
  humanoid: 1,
  noPound: 1,
  displayAd: 1,
  fromTag: 1,
  link: 'url',
  label: 'text'
});
```

### New WebGL API (Drop-in Replacement)
```javascript
ModelViewer.show({
  type: 1,
  displayId: 12345,
  slot: 1,
  race: 1,
  sex: 0,
  humanoid: 1,
  noPound: 1,
  displayAd: 1,
  fromTag: 1,
  link: 'url',
  label: 'text'
});
```

Same interface, different backend!

---

## Performance Considerations

### Optimization Strategies
1. **Model Caching**: Cache loaded models in memory
2. **Lazy Loading**: Load models only when viewer opens
3. **LOD (Level of Detail)**: Use simplified models for distant views
4. **Texture Compression**: Use WebP/ASTC for smaller downloads
5. **Worker Threads**: Offload model parsing to Web Workers
6. **Instancing**: Reuse geometries for similar models

### Target Metrics
- Initial load: < 2s
- Model load: < 1s
- 60 FPS on modern hardware
- Mobile support: 30+ FPS

---

## Browser Compatibility

### WebGL Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 8+)
- IE: ❌ Not supported (already unsupported for Flash)

### Fallback Strategy
- Detect WebGL support
- Show static thumbnail if WebGL unavailable
- Graceful degradation

---

## Next Steps

1. **Assess Model Data Availability**
   - Check if M2 files available in `/var/www/clientdata`
   - Determine conversion pipeline
   - Plan texture extraction

2. **Set Up Development Environment**
   - Initialize Vite project
   - Install Three.js and dependencies
   - Create build pipeline

3. **Prototype Basic Viewer**
   - Load test model
   - Implement basic camera controls
   - Test animation playback

4. **Implement M2 Loader or Conversion Pipeline**
   - Decide on format (glTF vs M2 parser)
   - Implement or integrate loader
   - Test with various model types

5. **Create Integration Layer**
   - Wrap viewer in `ModelViewer` object
   - Maintain API compatibility
   - Update all integration points

---

## Resources & References

- Three.js Documentation: https://threejs.org/docs/
- glTF Format: https://www.khronos.org/gltf/
- WoW Model Formats: Community documentation
- Vite Documentation: https://vitejs.dev/
- WebGL Best Practices: MDN Web Docs

