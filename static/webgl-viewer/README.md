# WebGL Model Viewer for AoWoW

A modern WebGL-based 3D model viewer replacing the legacy Flash ZAMviewer system.

## Features

- **Modern WebGL Rendering**: Uses Three.js for high-performance 3D graphics
- **Multiple Model Types**: Support for NPCs, objects, items, and character models
- **Animation Support**: Play and control model animations
- **Character Customization**: Race and sex selection for character models
- **Intuitive Controls**: Orbit camera, zoom, and pan with mouse
- **Responsive Design**: Works on desktop and mobile devices
- **Fallback Support**: Graceful degradation for unsupported formats

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts a development server at `http://localhost:5173`

## Building

```bash
npm run build
```

Generates optimized production build in `dist/` directory.

## Usage

### Basic Integration

Include the built viewer in your HTML:

```html
<script src="/static/webgl-viewer/dist/viewer.js"></script>
```

### API

The viewer provides a global `ModelViewer` object with the following methods:

#### `ModelViewer.show(options)`

Display a 3D model.

**Options:**
- `type` (number): Model type (1=NPC, 2=Object, 3=Item, 4=ItemSet, 8=Pet, 16=Character)
- `displayId` (number): Model display ID
- `slot` (number, optional): Equipment slot for items
- `race` (number, optional): Character race (for type 16)
- `sex` (number, optional): Character sex (for type 16)
- `humanoid` (boolean, optional): Whether model is humanoid
- `noPound` (boolean, optional): Don't update URL hash
- `displayAd` (boolean, optional): Display advertisement
- `fromTag` (boolean, optional): Called from markup tag
- `link` (string, optional): Associated link
- `label` (string, optional): Display label

**Example:**

```javascript
ModelViewer.show({
  type: 1,
  displayId: 12345,
  humanoid: 1
});
```

#### `ModelViewer.hide()`

Close the viewer.

```javascript
ModelViewer.hide();
```

#### `ModelViewer.setAnimation(animationName)`

Play a specific animation.

```javascript
ModelViewer.setAnimation('Attack');
```

#### `ModelViewer.setRace(raceId)`

Change character race (type 16 only).

```javascript
ModelViewer.setRace(1); // Human
```

#### `ModelViewer.setSex(sexId)`

Change character sex (type 16 only).

```javascript
ModelViewer.setSex(0); // Male
```

## Model Format Support

The viewer supports the following formats:

- **glTF/GLB**: Recommended format for best compatibility
- **FBX**: Full-featured format with animations
- **OBJ**: Basic geometry (no animations)

## Model Data Structure

Models should be organized as follows:

```
/static/models/
├── npc/
│   ├── 1.glb
│   ├── 2.glb
│   └── ...
├── object/
│   ├── 1.glb
│   └── ...
├── item/
│   ├── 1.glb
│   └── ...
├── pet/
│   ├── 1.glb
│   └── ...
└── character/
    ├── 1_0.glb  (race_sex)
    ├── 1_1.glb
    └── ...
```

## Converting WoW Models

To convert WoW M2 models to glTF:

1. Extract M2 files from WoW client data
2. Use a conversion tool (e.g., Noggit, WoW model extractors)
3. Export to glTF/GLB format
4. Place in appropriate `/static/models/` subdirectory

## Performance Optimization

- Models are cached in memory after first load
- Use compressed textures (WebP) for faster loading
- LOD (Level of Detail) models for complex scenes
- Web Workers for model parsing (future enhancement)

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 8+)
- IE: Not supported

## Troubleshooting

### Model not loading

1. Check browser console for errors
2. Verify model file exists at expected path
3. Ensure model format is supported
4. Check CORS headers if loading from different domain

### Poor performance

1. Reduce model complexity
2. Use compressed textures
3. Enable hardware acceleration in browser
4. Check for memory leaks in browser dev tools

### Animation not playing

1. Verify model has animation data
2. Check animation name matches exactly
3. Ensure mixer is initialized

## Architecture

- `viewer.js`: Main viewer class
- `scene/`: Scene setup, camera controls, lighting
- `loaders/`: Model loading and texture management
- `ui/`: User interface controls and animations

## Future Enhancements

- [ ] M2 format native support
- [ ] Advanced character customization (equipment, colors)
- [ ] Screenshot capture
- [ ] Model comparison
- [ ] Performance profiling
- [ ] Mobile touch controls
- [ ] VR support

## License

Same as AoWoW project
