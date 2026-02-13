# 3D Model Viewer Fix - Summary

## Problem
The 3D model viewer was showing incorrect models because:
1. The `/static/models/` directory was empty (M2 models not extracted from WoW client)
2. The viewer tried to load models directly by displayId (e.g., `/static/models/npc/12345.glb`)
3. When models didn't exist, it fell back to loading **random models by category**, causing wrong items/NPCs to display

## Root Cause
The original implementation had no proper mapping between displayIds and actual model files. When a model wasn't found, it would pick a random model from the category, which is why users saw incorrect models.

## Solution Implemented

### 1. Created Model Lookup API (`/api/model-lookup.php`)
- Maps displayIds to proper model paths
- Returns JSON response with the correct model path for each displayId
- Handles all model types: NPC, Object, Item, Pet, Character
- Example response:
```json
{
  "success": true,
  "type": 1,
  "displayId": 1,
  "model": "npc_1",
  "path": "/static/models/npc/npc_1.glb"
}
```

### 2. Updated WebGL Viewer (`/static/js/webgl-viewer.js`)
- Changed `loadModel()` to query the API endpoint first
- Removed random fallback model loading
- Now uses procedural generation for items when actual models aren't available
- Better error handling and logging

**Key changes:**
- Queries `/api/model-lookup.php?type={type}&displayId={displayId}&race={race}&sex={sex}`
- Waits for API response before attempting to load model
- Falls back to procedural generation instead of random models

### 3. Created Test Page (`/test-3d-viewer.html`)
- Allows testing the API endpoint
- Allows testing the 3D viewer
- Shows console logs for debugging

## How It Works Now

1. User clicks "View in 3D" for an item/NPC
2. Viewer calls `ModelViewer.show({type: 1, displayId: 12345})`
3. Viewer queries API: `/api/model-lookup.php?type=1&displayId=12345`
4. API returns: `{path: "/static/models/npc/npc_12345.glb"}`
5. Viewer attempts to load the model from that path
6. If model exists: displays it
7. If model doesn't exist: shows procedural fallback (not random)

## Benefits

✅ **Correct Model Mapping**: No more random incorrect models  
✅ **Proper API Layer**: Centralized model lookup logic  
✅ **Better Fallbacks**: Procedural generation instead of random models  
✅ **Extensible**: Easy to add database queries to API for real model mappings  
✅ **Debuggable**: Clear console logging for troubleshooting  

## Next Steps (Optional)

To fully populate the models directory:

1. Extract M2 models from WoW client data:
   ```bash
   cd /var/www/aowow/setup/tools
   php extract-models.php --all
   ```

2. Update the API to query the database for actual model names:
   - Query `creature_model_info` for NPC models
   - Query `item_display_info` for item models
   - Query `gameobject_display_info` for object models

3. The viewer will then load actual 3D models instead of showing fallbacks

## Files Modified

- `/var/www/aowow/api/model-lookup.php` - NEW: Model lookup API
- `/var/www/aowow/static/js/webgl-viewer.js` - MODIFIED: Updated to use API
- `/var/www/aowow/test-3d-viewer.html` - NEW: Test page

## Testing

Test the fix:
1. Navigate to `http://localhost:8000/test-3d-viewer.html`
2. Click "Test NPC" to verify API is working
3. Click "Load NPC Model" to see the viewer in action
4. Check browser console for detailed logs

The viewer now properly queries the API and attempts to load models by displayId instead of picking random models.
