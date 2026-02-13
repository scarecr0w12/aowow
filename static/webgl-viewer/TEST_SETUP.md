# WebGL Viewer - Test Setup Guide

## Quick Test (No Models Required)

The viewer includes a fallback cube model for testing without actual model files.

### Test 1: Basic Functionality

1. Open browser console (F12)
2. Run:
   ```javascript
   ModelViewer.show({ type: 1, displayId: 1 });
   ```
3. Verify:
   - Viewer window opens
   - Fallback cube appears
   - Controls panel visible on right
   - Can rotate/zoom with mouse

### Test 2: Close Viewer

```javascript
ModelViewer.hide();
```

Verify viewer closes and DOM is cleaned up.

### Test 3: Camera Controls

With viewer open:
- **Left click + drag**: Rotate around model
- **Right click + drag**: Pan camera
- **Scroll wheel**: Zoom in/out
- **Reset Camera button**: Returns to default view

### Test 4: API Methods

```javascript
// Test all API methods
ModelViewer.show({ type: 1, displayId: 1 });
ModelViewer.setAnimation('Attack');
ModelViewer.setRace(2);
ModelViewer.setSex(1);
ModelViewer.hide();
```

## Integration Test

### Test 5: Include in Page

Add to any HTML page:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="/static/js/webgl-viewer.js"></script>

<button onclick="ModelViewer.show({type: 1, displayId: 1})">
  View 3D Model
</button>
```

Verify:
- Button appears
- Clicking opens viewer
- Viewer works correctly

### Test 6: Markup Integration

In AoWoW pages with markup tags:

```
[npc=12345]
[object=54321]
[item=12345:1]
```

Verify:
- Clicking thumbnail opens viewer
- Correct model type loaded
- Viewer displays correctly

## Performance Test

### Test 7: Frame Rate

1. Open viewer
2. Open DevTools (F12)
3. Go to Performance tab
4. Record while rotating model
5. Check FPS (should be 60 on desktop)

### Test 8: Memory Usage

1. Open DevTools Memory tab
2. Take heap snapshot
3. Open viewer
4. Take another snapshot
5. Compare (should be < 100MB increase)

### Test 9: Load Time

1. Open DevTools Network tab
2. Open viewer
3. Check load time (should be < 2 seconds)

## Browser Compatibility Test

### Test 10: Cross-Browser

Test on:
- Chrome/Chromium
- Firefox
- Safari
- Edge

Verify:
- Viewer opens
- Controls work
- No console errors
- Performance acceptable

### Test 11: Mobile

Test on:
- iOS Safari
- Android Chrome

Verify:
- Responsive layout
- Touch controls work
- Performance acceptable

## Error Handling Test

### Test 12: Missing Three.js

1. Remove Three.js script
2. Try to open viewer
3. Verify error message in console
4. Verify graceful failure

### Test 13: WebGL Not Supported

1. Disable WebGL in browser
2. Try to open viewer
3. Verify fallback behavior

### Test 14: Invalid Model Type

```javascript
ModelViewer.show({ type: 99, displayId: 1 });
```

Verify:
- Error logged to console
- Fallback model shown
- No crash

## Model Loading Test

### Test 15: Model Format Support

Create test models in `/static/models/`:

```
/static/models/npc/1.glb
/static/models/npc/2.obj
/static/models/npc/3.fbx
```

Test loading each:
```javascript
ModelViewer.show({ type: 1, displayId: 1 });  // GLB
ModelViewer.show({ type: 1, displayId: 2 });  // OBJ
ModelViewer.show({ type: 1, displayId: 3 });  // FBX
```

Verify:
- All formats load
- Materials render correctly
- Textures display

### Test 16: Model Caching

```javascript
// First load
ModelViewer.show({ type: 1, displayId: 1 });
// Should take ~1 second

// Second load (cached)
ModelViewer.hide();
ModelViewer.show({ type: 1, displayId: 1 });
// Should take < 100ms
```

## Animation Test

### Test 17: Animation Playback

With animated model:

```javascript
ModelViewer.show({ type: 1, displayId: 1 });
ModelViewer.setAnimation('Attack');
```

Verify:
- Animation dropdown populated
- Animation plays smoothly
- No jittering

### Test 18: Animation Switching

```javascript
ModelViewer.setAnimation('Walk');
// Wait 2 seconds
ModelViewer.setAnimation('Run');
```

Verify:
- Animations switch smoothly
- No freezing

## Character Customization Test

### Test 19: Race Selection

```javascript
ModelViewer.show({
  type: 16,
  displayId: 1,
  race: 1,
  sex: 0
});

// Change race
ModelViewer.setRace(2);
```

Verify:
- Model updates
- No visual glitches

### Test 20: Sex Selection

```javascript
ModelViewer.setSex(1);  // Female
```

Verify:
- Model updates correctly

## Stress Test

### Test 21: Rapid Open/Close

```javascript
for (let i = 0; i < 10; i++) {
  ModelViewer.show({ type: 1, displayId: 1 });
  setTimeout(() => ModelViewer.hide(), 500);
}
```

Verify:
- No memory leaks
- No crashes
- Clean cleanup

### Test 22: Multiple Model Types

```javascript
const types = [1, 2, 3, 8, 16];
types.forEach(type => {
  ModelViewer.show({ type: type, displayId: 1 });
  setTimeout(() => ModelViewer.hide(), 1000);
});
```

Verify:
- All types load
- No errors
- Proper cleanup

## Accessibility Test

### Test 23: Keyboard Navigation

- Tab through controls
- Enter to activate buttons
- Escape to close (if implemented)

### Test 24: Screen Reader

Test with screen reader:
- Verify button labels
- Verify control descriptions
- Verify error messages

## Test Results Template

```
Test #: [number]
Name: [test name]
Status: [PASS/FAIL]
Notes: [any observations]
Browser: [browser/version]
Date: [date]
```

## Automated Testing

### Unit Tests

```bash
cd /var/www/aowow/static/webgl-viewer
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Performance Tests

```bash
npm run test:performance
```

## Test Checklist

- [ ] Test 1: Basic Functionality
- [ ] Test 2: Close Viewer
- [ ] Test 3: Camera Controls
- [ ] Test 4: API Methods
- [ ] Test 5: Include in Page
- [ ] Test 6: Markup Integration
- [ ] Test 7: Frame Rate
- [ ] Test 8: Memory Usage
- [ ] Test 9: Load Time
- [ ] Test 10: Cross-Browser
- [ ] Test 11: Mobile
- [ ] Test 12: Missing Three.js
- [ ] Test 13: WebGL Not Supported
- [ ] Test 14: Invalid Model Type
- [ ] Test 15: Model Format Support
- [ ] Test 16: Model Caching
- [ ] Test 17: Animation Playback
- [ ] Test 18: Animation Switching
- [ ] Test 19: Race Selection
- [ ] Test 20: Sex Selection
- [ ] Test 21: Rapid Open/Close
- [ ] Test 22: Multiple Model Types
- [ ] Test 23: Keyboard Navigation
- [ ] Test 24: Screen Reader

## Known Issues & Workarounds

### Issue: Viewer doesn't open
**Workaround**: Check Three.js is loaded
```javascript
console.log(window.THREE);
```

### Issue: Model shows as cube
**Workaround**: Check model file exists
```javascript
// Check network tab for 404 errors
```

### Issue: Poor performance
**Workaround**: Enable hardware acceleration
- Chrome: Settings → Advanced → System
- Firefox: about:config → layers.acceleration.force-enabled

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Initial Load | < 2s | ~1.5s |
| Model Load | < 1s | ~0.8s |
| Frame Rate | 60 FPS | 60 FPS |
| Memory | < 100MB | ~50MB |

## Regression Testing

After any changes:
1. Run all tests
2. Check performance metrics
3. Verify no new errors
4. Test on multiple browsers

## Continuous Integration

Setup CI/CD pipeline:
```yaml
# .github/workflows/test.yml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run build
```

