/**
 * WebGL Model Viewer for AoWoW
 * Replaces Flash-based ZAMviewer with modern Three.js implementation
 * 
 * Usage: ModelViewer.show({ type: 1, displayId: 12345 })
 */

(function(window) {
  'use strict';

  const THREE = window.THREE;
  if (!THREE) {
    console.error('Three.js is required for WebGL Viewer');
    return;
  }

  // GLTFLoader implementation for loading glTF/GLB files
  class GLTFLoader {
    constructor() {
      this.manager = new THREE.LoadingManager();
    }

    load(url, onLoad, onProgress, onError) {
      const loader = new THREE.FileLoader(this.manager);
      loader.setResponseType('arraybuffer');
      console.log(`[GLTFLoader] Loading: ${url}`);
      loader.load(url, (arrayBuffer) => {
        try {
          console.log(`[GLTFLoader] Received ${arrayBuffer.byteLength} bytes`);
          const gltf = this.parseGLB(arrayBuffer);
          console.log(`[GLTFLoader] Parse successful, calling onLoad`);
          onLoad(gltf);
        } catch (e) {
          console.error('GLB parsing error:', e, e.stack);
          onError(e);
        }
      }, onProgress, (error) => {
        console.error(`[GLTFLoader] Load error for ${url}:`, error);
        onError(error);
      });
    }

    parseGLB(arrayBuffer) {
      const view = new DataView(arrayBuffer);
      const magic = view.getUint32(0, true);
      
      if (magic !== 0x46546C67) { // "glTF"
        throw new Error('Invalid GLB file');
      }

      const version = view.getUint32(4, true);
      const length = view.getUint32(8, true);

      if (version !== 2) {
        throw new Error('Unsupported glTF version');
      }

      // Parse JSON chunk
      const jsonChunkLength = view.getUint32(12, true);
      const jsonChunkType = view.getUint32(16, true);

      const jsonData = new TextDecoder().decode(
        new Uint8Array(arrayBuffer, 20, jsonChunkLength)
      );
      const json = JSON.parse(jsonData);

      // Parse binary chunk
      const binChunkStart = 20 + jsonChunkLength + 8;
      const binChunkLength = view.getUint32(20 + jsonChunkLength, true);
      const binData = new Uint8Array(arrayBuffer, binChunkStart, binChunkLength);

      // Create Three.js geometry from glTF data
      const scene = new THREE.Group();
      
      if (json.meshes && json.meshes.length > 0) {
        const mesh = json.meshes[0];
        if (mesh.primitives && mesh.primitives.length > 0) {
          const primitive = mesh.primitives[0];
          
          // Get position accessor
          const posAccessorIdx = primitive.attributes.POSITION;
          const posAccessor = json.accessors[posAccessorIdx];
          const posBufferView = json.bufferViews[posAccessor.bufferView];
          
          // Get index accessor
          const idxAccessor = json.accessors[primitive.indices];
          const idxBufferView = json.bufferViews[idxAccessor.bufferView];
          
          // Calculate offsets within the binary chunk
          const posOffset = (posBufferView.byteOffset || 0) + (posAccessor.byteOffset || 0);
          const idxOffset = (idxBufferView.byteOffset || 0) + (idxAccessor.byteOffset || 0);
          
          // Extract vertex positions (Float32)
          const posCount = posAccessor.count;
          console.log(`[GLTFLoader] Position count: ${posCount}, offset: ${posOffset}`);
          
          // Create a copy of position data to avoid alignment issues
          const positionData = new Float32Array(binData.buffer, binData.byteOffset + posOffset, posCount * 3);
          const positions = new Float32Array(posCount * 3);
          for (let i = 0; i < positionData.length; i++) {
            positions[i] = positionData[i];
          }
          
          // Extract indices
          const idxCount = idxAccessor.count;
          console.log(`[GLTFLoader] Index count: ${idxCount}, offset: ${idxOffset}, componentType: ${idxAccessor.componentType}`);
          
          let indices = new Uint32Array(idxCount);
          
          if (idxAccessor.componentType === 5125) { // UNSIGNED_INT
            const indexData = new Uint32Array(binData.buffer, binData.byteOffset + idxOffset, idxCount);
            for (let i = 0; i < idxCount; i++) {
              indices[i] = indexData[i];
            }
          } else { // UNSIGNED_SHORT (5123)
            const indexData = new Uint16Array(binData.buffer, binData.byteOffset + idxOffset, idxCount);
            for (let i = 0; i < idxCount; i++) {
              indices[i] = indexData[i];
            }
          }
          
          console.log(`[GLTFLoader] Positions: [${positions[0]}, ${positions[1]}, ${positions[2]}]`);
          console.log(`[GLTFLoader] Indices: [${indices[0]}, ${indices[1]}, ${indices[2]}]`);
          
          // Create Three.js geometry
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          geometry.setIndex(new THREE.BufferAttribute(indices, 1));
          geometry.computeVertexNormals();
          geometry.center();
          
          // Create material
          const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.3,
            roughness: 0.7,
            side: THREE.DoubleSide
          });
          
          const meshObj = new THREE.Mesh(geometry, material);
          meshObj.castShadow = true;
          meshObj.receiveShadow = true;
          scene.add(meshObj);
          
          console.log(`[GLTFLoader] Loaded mesh: ${posCount} vertices, ${idxCount} indices`);
        }
      }
      
      if (scene.children.length === 0) {
        // Fallback if parsing failed
        const geometry = new THREE.BoxGeometry(1, 2, 0.5);
        const material = new THREE.MeshStandardMaterial({
          color: 0x888888,
          metalness: 0.3,
          roughness: 0.7
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
      }

      return { scene: scene, scenes: [scene], animations: [] };
    }
  }

  class WebGLViewer {
    static instance = null;

    static getInstance() {
      if (!WebGLViewer.instance) {
        WebGLViewer.instance = new WebGLViewer();
      }
      return WebGLViewer.instance;
    }

    constructor() {
      this.container = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.cameraController = null;
      this.currentModel = null;
      this.isVisible = false;
      this.options = {};
      this.animationFrameId = null;
      this.mixer = null;
      this.clock = new THREE.Clock();
      this.modelCache = new Map();
      this.gltfLoader = new GLTFLoader();
    }

    show(options) {
      this.options = options || {};
      
      if (!this.isVisible) {
        this.createViewer();
      }

      this.loadModel(options);
    }

    hide() {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this.isVisible = false;
      this.dispose();
    }

    createViewer() {
      const container = document.createElement('div');
      container.id = 'webgl-viewer-container';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        flex-direction: column;
        font-family: Arial, sans-serif;
      `;

      const header = document.createElement('div');
      header.style.cssText = `
        background: #1a1a1a;
        padding: 15px 20px;
        border-bottom: 1px solid #333;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #fff;
      `;

      const title = document.createElement('h2');
      title.textContent = '3D Model Viewer';
      title.style.cssText = 'margin: 0; font-size: 18px;';
      header.appendChild(title);

      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      closeBtn.style.cssText = `
        background: #333;
        border: 1px solid #555;
        color: #fff;
        width: 30px;
        height: 30px;
        cursor: pointer;
        font-size: 18px;
        border-radius: 3px;
        transition: background 0.2s;
      `;
      closeBtn.onmouseover = () => closeBtn.style.background = '#444';
      closeBtn.onmouseout = () => closeBtn.style.background = '#333';
      closeBtn.onclick = () => this.hide();
      header.appendChild(closeBtn);

      const mainContent = document.createElement('div');
      mainContent.style.cssText = `
        display: flex;
        flex: 1;
        overflow: hidden;
      `;

      const viewportContainer = document.createElement('div');
      viewportContainer.id = 'webgl-viewport';
      viewportContainer.style.cssText = `
        flex: 1;
        position: relative;
        background: #181818;
      `;

      const controlsPanel = document.createElement('div');
      controlsPanel.id = 'webgl-controls';
      controlsPanel.style.cssText = `
        width: 250px;
        background: #222;
        border-left: 1px solid #333;
        overflow-y: auto;
        padding: 15px;
        color: #fff;
      `;

      mainContent.appendChild(viewportContainer);
      mainContent.appendChild(controlsPanel);

      container.appendChild(header);
      container.appendChild(mainContent);
      document.body.appendChild(container);

      this.container = container;
      this.viewportContainer = viewportContainer;
      this.controlsPanel = controlsPanel;
      this.isVisible = true;

      this.initializeThreeJS();
      this.setupUI();
    }

    initializeThreeJS() {
      const width = this.viewportContainer.clientWidth;
      const height = this.viewportContainer.clientHeight;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x181818);

      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
      this.camera.position.set(0, 1.5, 3);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;

      this.viewportContainer.appendChild(this.renderer.domElement);

      this.setupLighting();
      this.setupCameraControls();

      window.addEventListener('resize', () => this.onWindowResize());
      this.animate();
    }

    setupLighting() {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 7);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.left = -10;
      directionalLight.shadow.camera.right = 10;
      directionalLight.shadow.camera.top = 10;
      directionalLight.shadow.camera.bottom = -10;
      this.scene.add(directionalLight);

      const backLight = new THREE.DirectionalLight(0x8888ff, 0.3);
      backLight.position.set(-5, 5, -5);
      this.scene.add(backLight);

      const groundGeometry = new THREE.PlaneGeometry(20, 20);
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2;
      ground.receiveShadow = true;
      this.scene.add(ground);
    }

    setupCameraControls() {
      this.cameraController = {
        targetPosition: new THREE.Vector3(),
        targetLookAt: new THREE.Vector3(0, 1, 0),
        distance: 5,
        theta: 0,
        phi: Math.PI / 4,
        isRotating: false,
        isDragging: false,
        previousMousePosition: { x: 0, y: 0 }
      };

      const ctrl = this.cameraController;
      const domElement = this.renderer.domElement;

      domElement.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
          ctrl.isDragging = true;
          ctrl.isRotating = true;
        } else if (e.button === 2) {
          ctrl.isDragging = true;
        }
        ctrl.previousMousePosition = { x: e.clientX, y: e.clientY };
      });

      domElement.addEventListener('mousemove', (e) => {
        if (!ctrl.isDragging) return;

        const deltaX = e.clientX - ctrl.previousMousePosition.x;
        const deltaY = e.clientY - ctrl.previousMousePosition.y;

        if (ctrl.isRotating) {
          ctrl.theta += deltaX * 0.01;
          ctrl.phi -= deltaY * 0.01;
          ctrl.phi = Math.max(0.1, Math.min(Math.PI - 0.1, ctrl.phi));
        }

        ctrl.previousMousePosition = { x: e.clientX, y: e.clientY };
        this.updateCameraPosition();
      });

      domElement.addEventListener('mouseup', () => {
        ctrl.isDragging = false;
        ctrl.isRotating = false;
      });

      domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.1;
        ctrl.distance += e.deltaY > 0 ? zoomSpeed : -zoomSpeed;
        ctrl.distance = Math.max(0.5, Math.min(50, ctrl.distance));
        this.updateCameraPosition();
      });

      domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    updateCameraPosition() {
      const ctrl = this.cameraController;
      const x = ctrl.distance * Math.sin(ctrl.phi) * Math.cos(ctrl.theta);
      const y = ctrl.distance * Math.cos(ctrl.phi);
      const z = ctrl.distance * Math.sin(ctrl.phi) * Math.sin(ctrl.theta);

      this.camera.position.set(x, y, z);
      this.camera.lookAt(ctrl.targetLookAt);
    }

    fitCameraToObject(object) {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = this.camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

      const center = box.getCenter(new THREE.Vector3());
      this.cameraController.targetLookAt.copy(center);
      this.cameraController.distance = cameraZ * 1.5;
      this.updateCameraPosition();
    }

    setupUI() {
      this.controlsPanel.innerHTML = '';

      const section = (title) => {
        const div = document.createElement('div');
        div.style.cssText = `
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #444;
        `;

        const h3 = document.createElement('h3');
        h3.textContent = title;
        h3.style.cssText = `
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 1px;
        `;
        div.appendChild(h3);

        return div;
      };

      const button = (text, onClick) => {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `
          width: 100%;
          padding: 8px;
          background: #0066cc;
          color: #fff;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          margin-bottom: 8px;
          transition: background 0.2s;
        `;
        btn.onmouseover = () => (btn.style.background = '#0052a3');
        btn.onmouseout = () => (btn.style.background = '#0066cc');
        btn.onclick = onClick;
        return btn;
      };

      const viewSection = section('View');
      viewSection.appendChild(
        button('Reset Camera', () => {
          const ctrl = this.cameraController;
          ctrl.theta = 0;
          ctrl.phi = Math.PI / 4;
          ctrl.distance = 5;
          this.updateCameraPosition();
        })
      );

      viewSection.appendChild(
        button('Fullscreen', () => {
          const elem = this.viewportContainer;
          if (elem.requestFullscreen) {
            elem.requestFullscreen();
          }
        })
      );

      this.controlsPanel.appendChild(viewSection);
    }

    loadModel(options) {
      const type = options.type || 1;
      const displayId = options.displayId;
      const slot = options.slot;
      const race = options.race;
      const sex = options.sex;

      if (!displayId && type !== 16) {
        console.warn('No displayId provided');
        return;
      }

      // Query the API to get the correct model for this displayId
      const apiUrl = `/api/model-lookup.php?type=${type}&displayId=${displayId || 0}&slot=${slot || 0}&race=${race || 0}&sex=${sex || 0}`;
      console.log(`[WebGL Viewer] Querying model API: ${apiUrl}`);

      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.path) {
            console.log(`[WebGL Viewer] API returned model path: ${data.path}`);
            this.loadModelFromPath(data.path);
          } else {
            console.warn(`[WebGL Viewer] API error: ${data.error}`);
            this.loadFallbackModel(type, displayId, slot);
          }
        })
        .catch(error => {
          console.error(`[WebGL Viewer] API fetch error: ${error.message}`);
          this.loadFallbackModel(type, displayId, slot);
        });
    }

    loadModelFromPath(modelPath) {
      console.log(`[WebGL Viewer] Loading model from path: ${modelPath}`);

      this.gltfLoader.load(
        modelPath,
        (gltf) => {
          console.log(`[WebGL Viewer] Model loaded successfully: ${modelPath}`);
          this.displayLoadedModel(gltf.scene);
        },
        (progress) => {
          console.log(`[WebGL Viewer] Loading: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
        },
        (error) => {
          console.warn(`[WebGL Viewer] Failed to load model from path: ${error.message}`);
          this.createFallbackModel();
        }
      );
    }

    loadFallbackModel(type, displayId, slot) {
      const typeMap = {1: 'npc', 2: 'object', 3: 'item', 4: 'item', 8: 'npc', 16: 'character'};
      const modelType = typeMap[type] || 'npc';
      
      console.log(`[WebGL Viewer] Loading fallback model for type ${type}, displayId ${displayId}`);
      
      // Try procedural generation for items
      if (type === 3 || type === 4) {
        this.createProceduralItemModel(displayId);
        return;
      }
      
      // For other types, create a generic fallback
      this.createFallbackModel();
    }

    loadModelBySlot(modelType, slot, seed) {
      // Map WoW item slots to model categories
      const slotMap = {
        1: ['head', 'helm'],      // Head
        2: ['neck'],              // Neck
        3: ['shoulder', 'lshoulder', 'rshoulder'],  // Shoulder
        4: ['chest', 'robe'],     // Chest
        5: ['waist', 'belt'],     // Waist
        6: ['leg', 'legs'],       // Leg
        7: ['feet', 'boot', 'shoes'],      // Feet
        8: ['wrist', 'bracer'],   // Wrist
        9: ['hand', 'glove'],     // Hand
        10: ['finger', 'ring'],   // Finger
        11: ['trinket'],          // Trinket
        12: ['cloak', 'cape'],    // Cloak
        13: ['weapon', 'sword', 'axe', 'mace', 'dagger'],   // Weapon (MainHand)
        14: ['shield'],           // Shield
        15: ['ranged', 'bow', 'gun'],   // Ranged
        16: ['back'],             // Back
        17: ['twohand', 'staff', 'polearm'],  // TwoHand
        18: ['bag'],              // Bag
        19: ['tabard'],           // Tabard
        20: ['robe'],             // Robe
        21: ['weapon', 'sword', 'axe', 'mace', 'dagger'],   // MainHand
        22: ['weapon', 'sword', 'axe', 'mace', 'dagger'],   // OffHand
        23: ['holdable'],         // Holdable
        24: ['ammo', 'arrow'],    // Ammo
        25: ['thrown']            // Thrown
      };

      const categories = slotMap[slot] || ['other'];
      console.log(`[WebGL Viewer] Loading model by slot: ${slot} -> ${categories.join(', ')}`);
      
      this.loadModelByCategory(modelType, categories, seed);
    }

    loadModelByCategory(modelType, categories, seed) {
      // Get models for this category
      const allModels = this.getModelNamesForType(modelType);
      let categoryModels = [];
      let matchedCategory = null;
      
      // Try each category in order
      for (const category of categories) {
        categoryModels = allModels.filter(name => name.toLowerCase().includes(category.toLowerCase()));
        if (categoryModels.length > 0) {
          matchedCategory = category;
          console.log(`[WebGL Viewer] Found ${categoryModels.length} models for category: ${category}`);
          break;
        }
      }
      
      if (categoryModels.length > 0) {
        const modelIndex = seed % categoryModels.length;
        const modelName = categoryModels[modelIndex];
        const modelPath = `/static/models/${modelType}/${modelName}`;
        
        console.log(`[WebGL Viewer] Loading ${matchedCategory} model: ${modelPath}`);
        
        this.gltfLoader.load(
          modelPath,
          (gltf) => {
            console.log(`[WebGL Viewer] Category model loaded: ${modelPath}`);
            this.displayLoadedModel(gltf.scene);
          },
          undefined,
          (error) => {
            console.warn(`[WebGL Viewer] Failed to load category model, using procedural`);
            this.createProceduralItemModel(seed);
          }
        );
      } else {
        // No models in category, fall back to procedural
        console.warn(`[WebGL Viewer] No models found for categories: ${categories.join(', ')}`);
        this.createProceduralItemModel(seed);
      }
    }

    loadRandomModel(modelType, seed) {
      // For items, try to load actual converted models first
      // Fall back to procedural if not available
      if (modelType === 'item') {
        const modelNames = this.getModelNamesForType(modelType);
        
        if (modelNames.length > 0) {
          const modelIndex = seed % modelNames.length;
          const modelName = modelNames[modelIndex];
          const modelPath = `/static/models/${modelType}/${modelName}`;

          console.log(`[WebGL Viewer] Loading item model: ${modelPath}`);

          this.gltfLoader.load(
            modelPath,
            (gltf) => {
              console.log(`[WebGL Viewer] Item model loaded: ${modelPath}`);
              this.displayLoadedModel(gltf.scene);
            },
            undefined,
            (error) => {
              console.warn(`[WebGL Viewer] Failed to load item model, using procedural: ${error.message}`);
              this.createProceduralItemModel(seed);
            }
          );
          return;
        }
        
        // No models available, use procedural
        console.log(`[WebGL Viewer] Generating procedural item model for displayId: ${seed}`);
        this.createProceduralItemModel(seed);
        return;
      }

      // For other types, try to load actual converted models
      const modelNames = this.getModelNamesForType(modelType);
      
      if (modelNames.length === 0) {
        console.warn(`[WebGL Viewer] No models found for type: ${modelType}`);
        this.createFallbackModel(seed);
        return;
      }

      // Use seed to pick a consistent model
      const modelIndex = seed % modelNames.length;
      const modelName = modelNames[modelIndex];
      const modelPath = `/static/models/${modelType}/${modelName}`;

      console.log(`[WebGL Viewer] Loading random model: ${modelPath}`);

      this.gltfLoader.load(
        modelPath,
        (gltf) => {
          console.log(`[WebGL Viewer] Random model loaded: ${modelPath}`);
          this.displayLoadedModel(gltf.scene);
        },
        undefined,
        (error) => {
          console.error(`[WebGL Viewer] Failed to load random model: ${error.message}`);
          this.createFallbackModel(seed);
        }
      );
    }

    createProceduralItemModel(displayId) {
      // Generate unique item models based on displayId
      const itemType = displayId % 8;
      let mesh;

      switch (itemType) {
        case 0: mesh = this.createSword(displayId); break;
        case 1: mesh = this.createAxe(displayId); break;
        case 2: mesh = this.createStaff(displayId); break;
        case 3: mesh = this.createBow(displayId); break;
        case 4: mesh = this.createShield(displayId); break;
        case 5: mesh = this.createHelm(displayId); break;
        case 6: mesh = this.createArmor(displayId); break;
        case 7: mesh = this.createGem(displayId); break;
        default: mesh = this.createBox(displayId);
      }

      if (this.currentModel) {
        this.scene.remove(this.currentModel);
      }

      this.currentModel = mesh;
      this.scene.add(mesh);
      this.fitCameraToObject(mesh);
    }

    createSword(seed) {
      const group = new THREE.Group();
      const color = this.getColorFromSeed(seed);
      
      // Blade
      const bladeGeom = new THREE.BoxGeometry(0.3, 2, 0.1);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.8, roughness: 0.2 });
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.y = 0.5;
      group.add(blade);

      // Hilt
      const hiltGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8);
      const hiltMat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.3, roughness: 0.7 });
      const hilt = new THREE.Mesh(hiltGeom, hiltMat);
      hilt.position.y = -0.5;
      group.add(hilt);

      // Guard
      const guardGeom = new THREE.BoxGeometry(0.8, 0.1, 0.2);
      const guard = new THREE.Mesh(guardGeom, hiltMat);
      guard.position.y = -0.2;
      group.add(guard);

      group.castShadow = true;
      group.receiveShadow = true;
      return group;
    }

    createAxe(seed) {
      const group = new THREE.Group();
      const color = this.getColorFromSeed(seed);

      // Handle
      const handleGeom = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, metalness: 0.1, roughness: 0.8 });
      const handle = new THREE.Mesh(handleGeom, handleMat);
      group.add(handle);

      // Blade
      const bladeGeom = new THREE.BoxGeometry(0.6, 0.8, 0.15);
      const bladeMat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.7, roughness: 0.3 });
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.y = 0.8;
      group.add(blade);

      group.castShadow = true;
      group.receiveShadow = true;
      return group;
    }

    createStaff(seed) {
      const group = new THREE.Group();
      const color = this.getColorFromSeed(seed);

      // Shaft
      const shaftGeom = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, metalness: 0.2, roughness: 0.7 });
      const shaft = new THREE.Mesh(shaftGeom, shaftMat);
      group.add(shaft);

      // Top orb
      const orbGeom = new THREE.SphereGeometry(0.3, 16, 16);
      const orbMat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.6, roughness: 0.4 });
      const orb = new THREE.Mesh(orbGeom, orbMat);
      orb.position.y = 1.2;
      group.add(orb);

      group.castShadow = true;
      group.receiveShadow = true;
      return group;
    }

    createBow(seed) {
      const group = new THREE.Group();
      const color = this.getColorFromSeed(seed);

      // Bow curve
      const bowGeom = new THREE.TorusGeometry(0.8, 0.1, 8, 32, Math.PI);
      const bowMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, metalness: 0.3, roughness: 0.6 });
      const bow = new THREE.Mesh(bowGeom, bowMat);
      bow.rotation.z = Math.PI / 2;
      group.add(bow);

      // String
      const stringGeom = new THREE.CylinderGeometry(0.02, 0.02, 1.6, 4);
      const stringMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.1, roughness: 0.9 });
      const string = new THREE.Mesh(stringGeom, stringMat);
      group.add(string);

      group.castShadow = true;
      group.receiveShadow = true;
      return group;
    }

    createShield(seed) {
      const group = new THREE.Group();
      const color = this.getColorFromSeed(seed);

      // Shield body
      const shieldGeom = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16);
      const shieldMat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.4, roughness: 0.6 });
      const shield = new THREE.Mesh(shieldGeom, shieldMat);
      group.add(shield);

      // Center boss
      const bossGeom = new THREE.SphereGeometry(0.3, 16, 16);
      const bossMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 });
      const boss = new THREE.Mesh(bossGeom, bossMat);
      boss.position.z = 0.15;
      group.add(boss);

      group.castShadow = true;
      group.receiveShadow = true;
      return group;
    }

    createHelm(seed) {
      const group = new THREE.Group();
      const color = this.getColorFromSeed(seed);

      // Dome
      const domeGeom = new THREE.SphereGeometry(0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const helmMat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.6, roughness: 0.4 });
      const dome = new THREE.Mesh(domeGeom, helmMat);
      dome.position.y = 0.3;
      group.add(dome);

      // Face guard
      const guardGeom = new THREE.BoxGeometry(0.5, 0.4, 0.15);
      const guard = new THREE.Mesh(guardGeom, helmMat);
      guard.position.y = -0.1;
      group.add(guard);

      // Visor
      const visorGeom = new THREE.BoxGeometry(0.6, 0.15, 0.1);
      const visorMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.1 });
      const visor = new THREE.Mesh(visorGeom, visorMat);
      visor.position.y = 0.05;
      visor.position.z = 0.1;
      group.add(visor);

      group.castShadow = true;
      group.receiveShadow = true;
      return group;
    }

    createArmor(seed) {
      const group = new THREE.Group();
      const color = this.getColorFromSeed(seed);

      // Chest plate
      const chestGeom = new THREE.BoxGeometry(0.8, 1, 0.3);
      const armorMat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.7, roughness: 0.3 });
      const chest = new THREE.Mesh(chestGeom, armorMat);
      group.add(chest);

      // Shoulder pauldrons
      const shoulderGeom = new THREE.SphereGeometry(0.35, 16, 16);
      const leftShoulder = new THREE.Mesh(shoulderGeom, armorMat);
      leftShoulder.position.x = -0.6;
      leftShoulder.position.y = 0.3;
      group.add(leftShoulder);

      const rightShoulder = new THREE.Mesh(shoulderGeom, armorMat);
      rightShoulder.position.x = 0.6;
      rightShoulder.position.y = 0.3;
      group.add(rightShoulder);

      group.castShadow = true;
      group.receiveShadow = true;
      return group;
    }

    createGem(seed) {
      const group = new THREE.Group();
      const color = this.getColorFromSeed(seed);

      // Gem
      const gemGeom = new THREE.OctahedronGeometry(0.5, 2);
      const gemMat = new THREE.MeshStandardMaterial({ 
        color: color, 
        metalness: 0.1, 
        roughness: 0.1,
        emissive: color,
        emissiveIntensity: 0.3
      });
      const gem = new THREE.Mesh(gemGeom, gemMat);
      group.add(gem);

      // Setting
      const settingGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 8);
      const settingMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 });
      const setting = new THREE.Mesh(settingGeom, settingMat);
      setting.position.y = -0.4;
      group.add(setting);

      group.castShadow = true;
      group.receiveShadow = true;
      return group;
    }

    getModelNamesForType(modelType) {
      // Large pre-computed lists of available models for each type
      // These are populated from the actual converted glTF files
      const modelLists = {
        npc: ['ancientofarcane.glb', 'airelemental.glb', 'airelementaltote.glb', 'akama.glb', 'alexstrasza.glb', 'algalontheobserver.glb', 'alliancebomb.glb', 'alliancebrasscanon.glb', 'ancientofwar.glb', 'anubisath.glb', 'archimonde.glb', 'armoredridingundeaddrake.glb', 'basilisk.glb', 'basilisk_outland.glb', 'bearcub.glb', 'beastragecaster.glb', 'bonespider.glb', 'boneworm.glb', 'chimeraoutland.glb', 'chimera.glb', 'chinesedragon.glb', 'clockworkgnome.glb', 'clockworkgnome_a.glb', 'clockworkgnome_b.glb', 'clockworkgnome_c.glb', 'clockworkgnome_d.glb', 'clefthoove.glb', 'cockatriceelite.glb', 'cockatricemount.glb', 'crawlerelite.glb', 'creature_burningash.glb', 'creature_burninglegioncannon.glb', 'creature_demoncrystal_02.glb', 'creature_etherealstorm.glb', 'creature_iceblock.glb', 'creature_iceblock_sindragosa.glb', 'creature_nagadistiller.glb', 'creature_powercrystal.glb', 'creature_sc_crystal.glb', 'creature_scourgecrystal.glb', 'creature_scourgecrystal02.glb', 'creature_scourgecrystaldamaged.glb', 'creature_spellportal_blue.glb', 'creature_spellportal_clickable.glb', 'creature_spellportal_green.glb', 'creature_spellportal_largeshadow.glb', 'creature_spellportal_purple.glb', 'creature_spellportal_white.glb', 'creature_spellportallarge_blue.glb', 'creature_spellportallarge_green.glb', 'creature_spellportallarge_lightred.glb', 'creature_spellportallarge_purple.glb', 'creature_spellportallarge_red.glb', 'creature_spellportallarge_yellow.glb', 'creature_scourgerunecirclecrystal.glb', 'creature_scourgerunecirclecrystal_no_coll.glb', 'darkhound.glb', 'darkmoonvengeance_impact_head.glb', 'deathknightmount.glb', 'diablofunsized.glb', 'dragonazurgoz.glb', 'dragon.glb', 'dragonhawk.glb', 'dragonhawkmount.glb', 'dragonkite.glb', 'dragonspawnarmoreddarkshade.glb', 'dragonspawnarmorednexus.glb', 'dragonspawnoverlorddarkshade.glb', 'dragonnefarian.glb', 'dragononyxia.glb', 'draeneifemalekid.glb', 'druidbear.glb', 'druidbear_legacy.glb', 'druidbeartauren.glb', 'druidbeartauren_legacy.glb', 'druidcat.glb', 'druidcat_legacy.glb', 'dryad.glb', 'epicdruidflighthorde.glb', 'eredar.glb', 'eredarfemale.glb', 'etherialrobe.glb', 'facelessgeneral.glb', 'felorcdire.glb', 'felboar.glb', 'felelfwarriormale.glb', 'felgolem.glb', 'felorcwarlord.glb', 'felorcwarrioraxe.glb', 'felbeastshadowmoon.glb', 'fleshtitan.glb', 'flyingmachinecreature_vehicle.glb', 'flyingnerubian.glb', 'flyingreindeer.glb', 'foresttroll.glb', 'frenzy.glb', 'frostnymph.glb', 'frostwyrmpet.glb', 'fungalgiant.glb', 'gargoyle.glb', 'giantslime.glb', 'ghost.glb', 'gnoll.glb', 'gnollmelee.glb', 'gnome.glb', 'gnomerocketcar.glb', 'goo_flow_statered.glb', 'gorilla.glb', 'gorillapet.glb', 'gronn.glb', 'gryphonpet.glb', 'gyrocopter_01.glb', 'gyrocopter_02.glb', 'halfbodyofkathune.glb', 'hammerhead.glb', 'horse.glb', 'humsguardbig.glb', 'humanfemalemerchantthin.glb', 'humanfemalekid.glb', 'humanmalemarshal.glb', 'humanmalewizard.glb', 'humanmalepiratecaptain.glb', 'humanmalepiratecaptain_ghost.glb', 'humnguardbig.glb', 'hydraoutland.glb', 'iceberg.glb', 'illidandark.glb', 'illidan.glb', 'impoutland.glb', 'invisibleman.glb', 'ironvrykulmale.glb', 'jormungar.glb', 'jormungarlarva.glb', 'kaelthas.glb', 'kaelthasbroken.glb', 'kalecgos.glb', 'kingvarianwrynn.glb', 'larvaoutland.glb', 'lethon.glb', 'lich.glb', 'lobstrokoutland.glb', 'lynxgod.glb', 'madscientist.glb', 'madscientistnobackpack.glb', 'magtheridon.glb', 'mammoth.glb', 'mammothmount2.glb', 'mammothmount5.glb', 'mammothmount_1seat.glb', 'mammothmount_3seat.glb', 'manafiendgreen.glb', 'marinebabymurloc.glb', 'minespider.glb', 'minespiderboss.glb', 'moarg1.glb', 'moarg2.glb', 'moarg3.glb', 'moarg4.glb', 'moarg5.glb', 'moarg6.glb', 'mobat.glb', 'murloc.glb', 'murmur.glb', 'muru.glb', 'necromancer.glb', 'netherdrake.glb', 'netherdrakeelite.glb', 'netherdrakeoutland.glb', 'northrendbearmount.glb', 'northrendbearmountarmored.glb', 'northrendbearmountarmored2seat.glb', 'northrendbearmountarmored_large.glb', 'northrendbearmountblizzcon.glb', 'northrenddragon.glb', 'northrendfleshgiant.glb', 'northrendnetherdrake.glb', 'northrendpenguin.glb', 'onyxiamount.glb', 'orca.glb', 'orcmalekidbrown.glb', 'orcmalemerchantlight.glb', 'paperairplane_gyro.glb', 'paperairplane_zeppelin.glb', 'pitlord.glb', 'plate_creature.glb', 'portalofkathune.glb', 'portalofkathunethick.glb', 'powersparkcreature.glb', 'pumpkinsoldier.glb', 'pvpridingram.glb', 'quillboar.glb', 'quillboarcaster.glb', 'quillboarwarrior.glb', 'ram.glb', 'rat.glb', 'redcrystaldragon.glb', 'redcrystaldragonhologram.glb', 'rexxar.glb', 'ridingram.glb', 'ridingundeaddrake.glb', 'ridingturtle.glb', 'rocketmount.glb', 'salamandermale.glb', 'sandworm.glb', 'scourgemalenpc.glb', 'scorpion.glb', 'scryingorb.glb', 'seavrykul.glb', 'shark.glb', 'silithidtank.glb', 'skeleton.glb', 'slime.glb', 'slimelesser.glb', 'slith.glb', 'snowflakecreature_var1.glb', 'snowflakecreature_var1_missile.glb', 'snowflakecreature_var2.glb', 'steamtonk.glb', 'superzombie.glb', 'taerar.glb', 'taerar_q.glb', 'tauren_mountedcanoe.glb', 'tharazun.glb', 'thunderaan.glb', 'thunderlizard.glb', 'titanmale.glb', 'titanmale_ghost.glb', 'troll.glb', 'trollforestboss.glb', 'trollforestcaster.glb', 'trolljungleboss.glb', 'trolljunglecaster.glb', 'trollmelee.glb', 'trollwhelp.glb', 'tripod.glb', 'tuskarrmalefisherman.glb', 'tyraelpet.glb', 'undeadnerubianbeast.glb', 'undeadicetroll.glb', 'valkier.glb', 'vapor.glb', 'velen.glb', 'voidgod.glb', 'voidterror.glb', 'voidwraith.glb', 'vr_harpoon_01.glb', 'warpstalker.glb', 'waterelemental.glb', 'waterelemental_purple.glb', 'wolvar.glb', 'worm.glb', 'wrathguard.glb', 'zippelin.glb', 'zombie.glb', 'zombiearm.glb', 'zombiesword.glb'],
        item: ['1htrollspear01.glb', 'arrowacidflight_01.glb', 'arrowfireflight_01.glb', 'arrowflight_01.glb', 'arrowiceflight_01.glb', 'arrowmagicflight_01.glb', 'ashbringer02.glb', 'axe_1h_ahnqiraj_d_01.glb', 'axe_1h_ahnqiraj_d_02.glb', 'axe_1h_alliancecovenant_d_01.glb', 'axe_1h_alliancecovenant_d_02.glb', 'axe_1h_blacksmithing_d_01.glb', 'axe_1h_blacksmithing_d_02.glb', 'axe_1h_blacksmithing_d_03.glb', 'axe_1h_blackwing_a_01.glb', 'axe_1h_blackwing_a_02.glb', 'axe_1h_blood_a_01.glb', 'axe_1h_blood_a_02.glb', 'axe_1h_blood_a_03.glb', 'axe_1h_dalaran_d_01.glb', 'axe_1h_draenei_a_01.glb', 'axe_1h_draenei_b_01.glb', 'axe_1h_draenei_c_01.glb', 'axe_1h_draenei_d_01.glb', 'axe_1h_draktharon_d_01.glb', 'axe_1h_flint_a_01.glb', 'axe_1h_hatchet_a_01.glb', 'axe_1h_hatchet_a_02.glb', 'axe_1h_hatchet_a_03.glb', 'axe_1h_hatchet_b_01.glb', 'axe_1h_hatchet_b_02.glb', 'axe_1h_hatchet_b_03.glb', 'axe_1h_hatchet_b_04holy.glb', 'axe_1h_hatchet_c_01.glb', 'axe_1h_hatchet_c_02.glb', 'axe_1h_hatchet_c_03.glb', 'axe_1h_hatchet_d_01.glb', 'axe_1h_horde_a_01.glb', 'axe_1h_horde_a_02.glb', 'axe_1h_horde_a_03.glb', 'axe_1h_horde_a_04.glb', 'axe_1h_horde_b_01.glb', 'axe_1h_horde_b_02.glb', 'axe_1h_horde_b_03.glb', 'axe_1h_horde_c_01.glb', 'axe_1h_horde_c_01alt.glb', 'axe_1h_horde_c_02.glb', 'axe_1h_horde_c_03.glb', 'axe_1h_horde_d_01.glb', 'axe_1h_horde_d_02.glb', 'axe_1h_horde_d_03.glb', 'axe_1h_icecrownraid_d_01.glb', 'axe_1h_outlandraid_d_01.glb', 'axe_1h_outlandraid_d_02.glb', 'axe_1h_outlandraid_d_03.glb', 'axe_1h_outlandraid_d_04.glb', 'axe_1h_outlandraid_d_05.glb', 'axe_1h_outlandraid_d_06.glb', 'axe_1h_pvealliance_d_01.glb', 'axe_1h_troll_b_01.glb', 'axe_1h_utgarde_d_01.glb', 'axe_2h_ahnqiraj_d_01.glb', 'axe_2h_alliance_c_02.glb', 'axe_2h_battle_a_01.glb', 'axe_2h_blacksmithing_d_03.glb', 'axe_2h_blood_a_02.glb', 'axe_2h_blood_c_03.glb', 'axe_2h_horde_a_01.glb', 'axe_2h_horde_b_03.glb', 'axe_2h_horde_c_01.glb', 'axe_2h_horde_c_02.glb', 'axe_2h_horde_d_01.glb', 'axe_2h_icecrownraid_d_02.glb', 'axe_2h_northrend_c_03.glb', 'axe_2h_outlandraid_d_04.glb', 'axe_2h_outlandraid_d_06.glb', 'axe_2h_pvp330_d_01.glb', 'axe_2h_utgarde_d_01.glb', 'axe_2h_war_b_01.glb', 'axe_2h_zulaman_d_01.glb', 'bow_1h_auchindoun_d_01.glb', 'bow_1h_blood_d_01.glb', 'bow_1h_horde_a_01.glb', 'bow_1h_northrend_b_03.glb', 'bow_1h_northrend_c_01.glb', 'bow_1h_northrend_c_03.glb', 'bow_1h_outlandraid_d_02.glb', 'bow_1h_outlandraid_d_05.glb', 'bow_1h_outlandraid_d_06_blue.glb', 'bow_1h_pvp_c_01.glb', 'bow_1h_standard_a_01.glb', 'bow_1h_standard_a_02.glb', 'bow_1h_sunwell_d_01.glb', 'bow_1h_sunwell_d_02.glb', 'bow_2h_crossbow_ausgarde_d_01.glb', 'bow_2h_crossbow_blacktemple_d_01.glb', 'bow_2h_crossbow_blackwing_a_01.glb', 'bow_2h_crossbow_northrend_b_01.glb', 'bow_2h_crossbow_northrend_d_01.glb', 'bow_2h_crossbow_outlandraid_d_04.glb', 'bow_2h_crossbow_pvp330_d_01.glb', 'conjureitem.glb', 'conjureitemcast.glb', 'firearm_2h_rifle_01_spellobject.glb', 'firearm_2h_rifle_a_01.glb', 'firearm_2h_rifle_a_02.glb', 'firearm_2h_rifle_a_05.glb', 'firearm_2h_rifle_hellfire_c_01.glb', 'firearm_2h_rifle_outlandraid_d_05.glb', 'firearm_2h_rifle_pvpalliance_a_01.glb', 'firearm_2h_shotgun_b_01.glb', 'forcedbackpackitem.glb', 'ForcedBackpackItem.glb', 'glave_1h_short_a_02.glb', 'glave_1h_short_c_02.glb', 'hammer_1h_healer_pvp_c_01.glb', 'hammer_1h_maul_a_02.glb', 'hammer_2h_crystal_c_02.glb', 'hammer_2h_pvphorde_a_01.glb', 'hammer_2h_standard_e_01.glb', 'hand_1h_blackwing_a_02left.glb', 'hand_1h_outlandraid_d_03left.glb', 'hand_1h_pvealliance_d_01right.glb', 'hand_1h_pvp_c_01right.glb', 'hand_1h_raid_d_03left.glb', 'hand_1h_utgarde_d_01right.glb', 'hand_lh_pvphorde_a_01.glb', 'invnoart.glb', 'inventoryartgeometry.glb', 'inventoryartgeometryold.glb', 'INVNOART.glb', 'InventoryArtGeometry.glb', 'InventoryArtGeometryOld.glb', 'item_bread.glb', 'knife_1h_ahnqiraj_d_01.glb', 'knife_1h_auchindoun_d_01.glb', 'knife_1h_cleaver_a_01.glb', 'knife_1h_dagger_b_01.glb', 'knife_1h_dagger_b_02.glb', 'knife_1h_horde_a_01.glb', 'knife_1h_icecrownraid_d_01.glb', 'knife_1h_icecrownraid_d_04.glb', 'knife_1h_katana_b_01.glb', 'knife_1h_northrend_d_02.glb', 'knife_1h_outlandraid_d_01.glb', 'knife_1h_pvealliance_d_02.glb', 'knife_1h_standard_a_01.glb', 'knife_1h_utgarde_d_02.glb', 'knife_1h_zulaman_d_03.glb', 'mace_1h_blacktemple_d_02.glb', 'mace_1h_blackwing_a_01.glb', 'mace_1h_dalaran_d_01.glb', 'mace_1h_doomhammer_d_01.glb', 'mace_1h_draenei_a_01.glb', 'mace_1h_flanged_a_03.glb', 'mace_1h_microphone_c_01.glb', 'mace_1h_misc_d_01.glb', 'mace_1h_nexus_d_01.glb', 'mace_1h_northrend_b_02.glb', 'mace_1h_outlandraid_d_05.glb', 'mace_1h_pvp330_d_01.glb', 'mace_1h_pvp330_d_02.glb', 'mace_1h_standard_a_02.glb', 'mace_1h_standard_b_01.glb', 'mace_1h_sunwell_c_01.glb', 'mace_1h_zulgurub_d_01.glb', 'mace_2h_ahnqiraj_d_01.glb', 'mace_2h_aspects_d_01.glb', 'mace_2h_horde_a_01.glb', 'mace_2h_northrend_b_01.glb', 'mace_2h_northrend_b_03.glb', 'mace_2h_northrend_c_02.glb', 'mace_2h_northrend_d_01.glb', 'mace_2h_outlandraid_d_07.glb', 'mace_2h_pvp320_c_01.glb', 'mace_2h_spiked_a_01.glb', 'misc_1h_flower_c_01.glb', 'misc_1h_mutton_b_01.glb', 'misc_1h_orb_a_02.glb', 'misc_1h_potion_b_01.glb', 'misc_1h_sparkler_a_01blue.glb', 'misc_1h_sparkler_a_01red.glb', 'misc_2h_brewfest_a_01.glb', 'misc_2h_harpoon_b_01.glb', 'offhand_outlandraid_d_01.glb', 'offhand_stratholme_a_01.glb', 'offhand_sunwell_d_02.glb', 'polearm_2h_blood_elf_d_01.glb', 'polearm_2h_epic_d_07.glb', 'polearm_2h_pvp320_c_01.glb', 'stave_2h_alliancecovenant_d_01.glb', 'stave_2h_ahnqiraj_d_04.glb', 'stave_2h_flaming_d_01.glb', 'stave_2h_icecrownraid_d_02.glb', 'stave_2h_icecrownraid_d_03.glb', 'stave_2h_icecrownraid_d_04.glb', 'stave_2h_long_epicpriest01.glb', 'stave_2h_medivh_d_01.glb', 'stave_2h_nexus_d_01.glb', 'stave_2h_northrend_c_01.glb', 'stave_2h_outlandraid_d_06.glb', 'stave_2h_pvehorde_d_01.glb', 'stave_2h_pvp320_c_01.glb', 'stave_2h_ulduarraid_d_03.glb', 'stave_2h_zulgurub_d_02.glb', 'stave_2h_zulaman_d_02.glb', 'sword_1h_auchindoun_d_01.glb', 'sword_1h_crystal_c_02.glb', 'sword_1h_horde_c_02.glb', 'sword_1h_icecrownraid_d_01.glb', 'sword_1h_katana_b_02.glb', 'sword_1h_long_a_01.glb', 'sword_1h_long_d_01.glb', 'sword_1h_long_d_02.glb', 'sword_1h_northrend_d_01.glb', 'sword_1h_outlandraid_d_01.glb', 'sword_1h_pvp320_c_01.glb', 'sword_1h_raid_d_04.glb', 'sword_1h_short_b_02.glb', 'sword_1h_short_b_03.glb', 'sword_1h_ulduar_d_03.glb', 'sword_1h_zulaman_d_01.glb', 'sword_2h_blood_c_03.glb', 'sword_2h_broadsword_a_02.glb', 'sword_2h_claymore_b_01.glb', 'sword_2h_claymore_c_01.glb', 'sword_2h_horde_a_02.glb', 'sword_2h_horde_b_03.glb', 'sword_2h_hordecovenant_d_01.glb', 'sword_2h_katana_a_01.glb', 'sword_2h_nexus_d_01.glb', 'sword_2h_raid_d_05.glb', 'sword_2h_sunwell_d_01.glb', 'sword_2h_ulduarraid_d_01.glb', 'thrown_1h_giant_weaponboulder.glb', 'thrown_1h_harpoon_d_01.glb', 'thrown_1h_shuriken_a_01.glb', 'totem_2h_carved_d_01.glb', 'wand_1h_blood_a_01.glb', 'wand_1h_jeweled_b_02.glb', 'wand_1h_outlandraid_d_01.glb', 'wand_1h_outlandraid_d_03.glb', 'wand_1h_pvehorde_d_01.glb', 'wand_1h_pvp_c_01.glb', 'wand_1h_stratholme_d_01.glb', 'wand_1h_zulaman_d_01.glb'],
        spell: ['abolishmagic_base.glb', 'abyssal_ball.glb', 'abyssal_impact_base.glb', 'achievement_onroot.glb', 'acid_ground_cloud.glb', 'acidburn_purple.glb', 'alliancectfflag_spell.glb', 'antimagic_state_blue.glb', 'arcaneforceshield_blue.glb', 'arcaneforceshield_dark.glb', 'arcanegolem.glb', 'arcanegolembroken.glb', 'arcaneshot_area.glb', 'arcaneshot_missile2.glb', 'archimonde_fire.glb', 'baseflagcapred_impact_base.glb', 'beastragecaster.glb', 'beastwithin_state_base.glb', 'bearfrenzy.glb', 'beartrap.glb', 'beastwithincreature.glb', 'blessingofprotection_chest.glb', 'blessingofspellprotection_base.glb', 'blessingofwisdom_base.glb', 'blueradiationfog.glb', 'blood_rain.glb', 'bloodboil_impact_chest.glb', 'bloodyexplosion.glb', 'bonearmor_recursive.glb', 'bonearmor_recursive_blue.glb', 'bonearmor_recursive_green.glb', 'bonearmor_recursive_red.glb', 'bonearmor_recursive_yellow.glb'],
        object: ['creature_burningash.glb', 'creature_burninglegioncannon.glb', 'creature_demoncrystal_02.glb', 'creature_etherealstorm.glb', 'creature_iceblock.glb', 'creature_iceblock_sindragosa.glb', 'creature_nagadistiller.glb', 'creature_powercrystal.glb', 'creature_sc_crystal.glb', 'creature_scourgecrystal.glb', 'creature_scourgecrystal02.glb', 'creature_scourgecrystaldamaged.glb', 'creature_spellportal_blue.glb', 'creature_spellportal_clickable.glb', 'creature_spellportal_green.glb', 'creature_spellportal_largeshadow.glb', 'creature_spellportal_purple.glb', 'creature_spellportal_white.glb', 'creature_spellportallarge_blue.glb', 'creature_spellportallarge_green.glb', 'creature_spellportallarge_lightred.glb', 'creature_spellportallarge_purple.glb', 'creature_spellportallarge_red.glb', 'creature_spellportallarge_yellow.glb', 'creature_scourgerunecirclecrystal.glb', 'creature_scourgerunecirclecrystal_no_coll.glb', 'snowflakecreature_var1.glb', 'snowflakecreature_var1_missile.glb', 'snowflakecreature_var2.glb'],
        character: ['bloodelffemale.glb', 'bloodelfmale.glb', 'brokenfemale.glb', 'brokenmale.glb', 'draeneifemale.glb', 'draeneimale.glb', 'dwarffemale.glb', 'dwarfmale.glb', 'felorcfemale.glb', 'felorcmale.glb', 'felorcmaleaxe.glb', 'felorcmalesword.glb', 'foresttrollmale.glb', 'goblinfemale.glb', 'goblinmale.glb', 'gnomefemale.glb', 'gnomemale.glb', 'highelffemale_hunter.glb', 'highelffemale_mage.glb', 'highelffemale_priest.glb', 'highelffemale_warrior.glb', 'highelfmale_hunter.glb', 'highelfmale_mage.glb', 'highelfmale_priest.glb', 'highelfmale_warrior.glb', 'humanfemale.glb', 'humanmale.glb', 'icetrollmale.glb', 'naga_female.glb', 'naga_male.glb', 'nightelffemale.glb', 'nightelfmale.glb', 'orcfemale.glb', 'orcmale.glb', 'scourgefemale.glb', 'scourgemale.glb', 'skeletonfemale.glb', 'skeletonmale.glb', 'taunkamale.glb', 'taurenfemale.glb', 'taurenmale.glb', 'trollfemale.glb', 'trollmale.glb', 'tuskarrmale.glb', 'ui_characterselect.glb', 'vrykulmale.glb']
      };

      return modelLists[modelType] || [];
    }

    displayLoadedModel(model) {
      if (this.currentModel) {
        this.scene.remove(this.currentModel);
      }

      this.currentModel = model;
      this.scene.add(model);

      // Setup materials and shadows
      model.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
            node.material.side = THREE.DoubleSide;
          }
        }
      });

      this.fitCameraToObject(model);
    }

    createFallbackModel(seed = 0) {
      if (this.currentModel) {
        this.scene.remove(this.currentModel);
      }

      // Generate procedural model based on seed (displayId)
      const shapes = [
        this.createSphere.bind(this),
        this.createCylinder.bind(this),
        this.createPyramid.bind(this),
        this.createTorus.bind(this),
        this.createBox.bind(this)
      ];

      const shapeIndex = seed % shapes.length;
      const mesh = shapes[shapeIndex](seed);
      
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.currentModel = mesh;
      this.scene.add(mesh);
      this.fitCameraToObject(mesh);
    }

    createSphere(seed) {
      const geometry = new THREE.IcosahedronGeometry(1, 4);
      const color = this.getColorFromSeed(seed);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.7
      });
      return new THREE.Mesh(geometry, material);
    }

    createCylinder(seed) {
      const geometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 16);
      const color = this.getColorFromSeed(seed);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.4,
        roughness: 0.6
      });
      return new THREE.Mesh(geometry, material);
    }

    createPyramid(seed) {
      const geometry = new THREE.TetrahedronGeometry(1, 0);
      const color = this.getColorFromSeed(seed);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.2,
        roughness: 0.8
      });
      return new THREE.Mesh(geometry, material);
    }

    createTorus(seed) {
      const geometry = new THREE.TorusGeometry(1, 0.4, 16, 16);
      const color = this.getColorFromSeed(seed);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.5,
        roughness: 0.5
      });
      return new THREE.Mesh(geometry, material);
    }

    createBox(seed) {
      const geometry = new THREE.BoxGeometry(1, 2, 0.5);
      const color = this.getColorFromSeed(seed);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.7
      });
      return new THREE.Mesh(geometry, material);
    }

    getColorFromSeed(seed) {
      const colors = [
        0xFF6B6B, // Red
        0x4ECDC4, // Teal
        0x45B7D1, // Blue
        0xFFA07A, // Light Salmon
        0x98D8C8, // Mint
        0xF7DC6F, // Yellow
        0xBB8FCE, // Purple
        0x85C1E2, // Light Blue
        0xF8B88B, // Peach
        0xAED6F1  // Sky Blue
      ];
      return colors[seed % colors.length];
    }

    setAnimation(animationName) {
      console.log('Animation requested:', animationName);
    }

    setRace(raceId) {
      this.options.race = raceId;
      if (this.options.type === 16) {
        this.loadModel(this.options);
      }
    }

    setSex(sexId) {
      this.options.sex = sexId;
      if (this.options.type === 16) {
        this.loadModel(this.options);
      }
    }

    animate() {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
      this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
      if (!this.viewportContainer) return;

      const width = this.viewportContainer.clientWidth;
      const height = this.viewportContainer.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }

    dispose() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      if (this.renderer) {
        this.renderer.dispose();
      }

      this.scene = null;
      this.camera = null;
      this.renderer = null;
    }
  }

  window.ModelViewer = window.ModelViewer || {};
  window.ModelViewer.show = function(options) {
    const viewer = WebGLViewer.getInstance();
    viewer.show(options);
  };

  window.ModelViewer.hide = function() {
    const viewer = WebGLViewer.getInstance();
    viewer.hide();
  };

  window.ModelViewer.setAnimation = function(animationName) {
    const viewer = WebGLViewer.getInstance();
    viewer.setAnimation(animationName);
  };

  window.ModelViewer.setRace = function(raceId) {
    const viewer = WebGLViewer.getInstance();
    viewer.setRace(raceId);
  };

  window.ModelViewer.setSex = function(sexId) {
    const viewer = WebGLViewer.getInstance();
    viewer.setSex(sexId);
  };

})(window);
