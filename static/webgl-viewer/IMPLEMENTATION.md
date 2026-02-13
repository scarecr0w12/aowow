# WebGL Viewer Implementation Details

## Architecture Overview

The WebGL viewer is built as a modular system with clear separation of concerns:

```
WebGLViewer (Main Controller)
├── Scene Management
│   ├── Lighting Setup
│   ├── Ground Plane
│   └── Background
├── Camera System
│   ├── Orbit Controls
│   ├── Zoom
│   └── Pan
├── Model Loading
│   ├── Format Detection
│   ├── Cache Management
│   └── Fallback Handling
├── Animation System
│   ├── Mixer
│   ├── Action Management
│   └── Playback Control
└── UI Layer
    ├── Controls Panel
    ├── Animation Selector
    └── Character Customization
```

## Core Components

### 1. WebGLViewer Class

**Location**: `src/viewer.js`

Main controller that orchestrates all viewer functionality.

**Key Methods**:
- `show(options)` - Display a model
- `hide()` - Close viewer
- `loadModel(options)` - Load specific model
- `setAnimation(name)` - Play animation
- `setRace(id)` - Change character race
- `setSex(id)` - Change character sex
- `dispose()` - Clean up resources

### 2. Scene Setup

**Location**: `src/scene/scene-setup.js`

Initializes Three.js scene with:
- Ambient lighting (0.6 intensity)
- Directional lighting with shadows (0.8 intensity)
- Back lighting for depth (0.3 intensity)
- Ground plane with shadow receiving

### 3. Camera Controller

**Location**: `src/scene/camera.js`

Implements orbit camera with:
- Mouse drag rotation
- Scroll wheel zoom
- Right-click pan
- Auto-fit to object
- Smooth interpolation

### 4. Model Loader

**Location**: `src/loaders/model-loader.js`

Supports multiple formats:
- glTF/GLB (recommended)
- FBX (with animations)
- OBJ (basic geometry)

Features:
- Format auto-detection
- Model caching
- Texture loading
- Material enhancement
- Fallback models

### 5. Animation Controller

**Location**: `src/ui/animations.js`

Manages model animations:
- Animation mixer
- Action playback
- Animation listing
- Playback control

### 6. UI Controller

**Location**: `src/ui/controls.js`

Renders control panel with:
- Character customization (race/sex)
- Animation selector
- Camera controls
- Error messages

## Data Flow

### Model Loading Flow

```
ModelViewer.show(options)
    ↓
WebGLViewer.show()
    ↓
createViewer() - Create DOM structure
    ↓
initializeThreeJS() - Initialize Three.js
    ↓
loadModel(options) - Load model file
    ↓
ModelLoader.loadModel()
    ↓
Determine model type (NPC, Item, Character, etc.)
    ↓
Build model path based on type and displayId
    ↓
Try loading formats: glb → gltf → fbx → obj
    ↓
setupModelMaterials() - Configure materials
    ↓
fitCameraToObject() - Adjust camera
    ↓
Add to scene and render
```

### Animation Flow

```
Animation selected in UI
    ↓
UIController.onChange()
    ↓
ModelViewer.setAnimation(name)
    ↓
AnimationController.playAnimation(name)
    ↓
Find animation clip by name
    ↓
Create mixer action
    ↓
Play action
    ↓
Update mixer each frame
```

## Model Type Mapping

| Type | Name | Path | Example |
|------|------|------|---------|
| 1 | NPC | `/static/models/npc/{displayId}` | `/static/models/npc/1.glb` |
| 2 | Object | `/static/models/object/{displayId}` | `/static/models/object/1.glb` |
| 3 | Item | `/static/models/item/{displayId}` | `/static/models/item/1.glb` |
| 4 | ItemSet | Multiple items | `/static/models/item/{itemId}.glb` |
| 8 | Pet | `/static/models/pet/{displayId}` | `/static/models/pet/1.glb` |
| 16 | Character | `/static/models/character/{race}_{sex}` | `/static/models/character/1_0.glb` |

## File Format Support

### glTF/GLB (Recommended)
- **Pros**: Efficient, supports animations, textures, bones
- **Cons**: Requires conversion from M2
- **Use Case**: Production deployment

### FBX
- **Pros**: Full feature support, animations, materials
- **Cons**: Larger file size, requires loader
- **Use Case**: Complex models with advanced features

### OBJ
- **Pros**: Simple, widely supported
- **Cons**: No animations, separate MTL file needed
- **Use Case**: Quick testing, fallback

## Performance Optimization

### Model Caching
```javascript
modelCache = new Map()
cacheKey = `${type}_${displayId}`
if (modelCache.has(cacheKey)) {
  return modelCache.get(cacheKey).clone()
}
```

### Lazy Loading
- Models loaded only when viewer opens
- Textures loaded on demand
- Animations loaded with model

### LOD (Level of Detail)
- Use simplified models for distant views
- Reduce polygon count for mobile
- Progressive loading of detail

### Texture Optimization
- Use WebP format when available
- Compress textures (max 2048x2048)
- Use mipmaps for filtering

## Browser Compatibility

### WebGL Detection
```javascript
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
const isWebGLSupported = !!gl;
```

### Fallback Strategy
```
If WebGL not supported:
  → Show static thumbnail
  → Disable 3D viewer button
  → Log warning to console
```

## Configuration Options

### Viewer Options
```javascript
{
  type: 1,              // Model type (1-16)
  displayId: 12345,     // Model ID
  slot: 1,              // Equipment slot (type 3)
  race: 1,              // Character race (type 16)
  sex: 0,               // Character sex (type 16)
  humanoid: 1,          // Is humanoid
  noPound: 1,           // Don't update hash
  displayAd: 1,         // Show ad
  fromTag: 1,           // From markup tag
  link: 'url',          // Associated link
  label: 'text'         // Display label
}
```

### Scene Configuration
```javascript
{
  ambientLightIntensity: 0.6,
  directionalLightIntensity: 0.8,
  backLightIntensity: 0.3,
  shadowMapSize: 2048,
  groundColor: 0x2a2a2a
}
```

### Camera Configuration
```javascript
{
  fov: 75,
  near: 0.1,
  far: 10000,
  defaultDistance: 5,
  minZoom: 0.5,
  maxZoom: 50
}
```

## Error Handling

### Model Loading Errors
```javascript
try {
  model = await loadFile(path, format)
} catch (error) {
  console.error('Failed to load:', error)
  return createFallbackModel()
}
```

### WebGL Errors
```javascript
if (!window.THREE) {
  console.error('Three.js not loaded')
  return
}

if (!isWebGLSupported()) {
  console.warn('WebGL not supported')
  showFallback()
}
```

## Memory Management

### Resource Cleanup
```javascript
dispose() {
  cancelAnimationFrame(animationFrameId)
  renderer.dispose()
  modelCache.clear()
  mixer.stopAllAction()
}
```

### Cache Limits
- Maximum 100 models in cache
- LRU eviction policy
- Clear on viewer close

## Testing Strategy

### Unit Tests
- Model loading
- Animation playback
- Camera controls
- Material setup

### Integration Tests
- Full viewer workflow
- Multiple model types
- Character customization
- Animation switching

### Performance Tests
- Load time benchmarks
- Frame rate monitoring
- Memory profiling
- GPU utilization

## Deployment Checklist

- [ ] Three.js library available
- [ ] webgl-viewer.js included
- [ ] Model files in correct paths
- [ ] CORS headers configured
- [ ] Browser compatibility tested
- [ ] Performance benchmarks met
- [ ] Error handling verified
- [ ] Mobile responsiveness checked
- [ ] Accessibility reviewed
- [ ] Documentation updated

## Troubleshooting Guide

### Viewer Won't Open
1. Check Three.js loaded: `console.log(window.THREE)`
2. Check viewer loaded: `console.log(window.ModelViewer)`
3. Check WebGL support: `console.log(!!window.WebGLRenderingContext)`
4. Check browser console for errors

### Model Doesn't Load
1. Verify file exists: Check network tab
2. Check file format: Ensure .glb/.gltf/.fbx/.obj
3. Check path: Should match displayId
4. Check CORS: Verify headers allow access

### Poor Performance
1. Check GPU: Enable hardware acceleration
2. Check model complexity: Reduce polygons
3. Check texture size: Use compressed textures
4. Check cache: Monitor memory usage

### Animation Issues
1. Check model has animations: Inspect in viewer
2. Check animation name: Must match exactly
3. Check format supports animations: glTF/FBX only
4. Check mixer initialized: Should be created with model

## Future Enhancements

### Phase 2
- [ ] Native M2 format support
- [ ] Advanced character customization
- [ ] Equipment preview
- [ ] Color customization

### Phase 3
- [ ] Screenshot capture
- [ ] Model comparison
- [ ] Animation recording
- [ ] Social sharing

### Phase 4
- [ ] VR support
- [ ] AR preview
- [ ] Real-time collaboration
- [ ] Custom model upload

