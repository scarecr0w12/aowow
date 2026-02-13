import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class ModelLoader {
  constructor(scene) {
    this.scene = scene;
    this.gltfLoader = new GLTFLoader();
    this.objLoader = new OBJLoader();
    this.fbxLoader = new FBXLoader();
    this.modelCache = new Map();
    this.textureLoader = new THREE.TextureLoader();
  }

  async loadModel(type, displayId, options = {}) {
    const cacheKey = `${type}_${displayId}`;

    if (this.modelCache.has(cacheKey)) {
      return this.modelCache.get(cacheKey).clone();
    }

    let model = null;

    try {
      switch (type) {
        case 1:
          model = await this.loadNPCModel(displayId, options);
          break;
        case 2:
          model = await this.loadObjectModel(displayId, options);
          break;
        case 3:
          model = await this.loadItemModel(displayId, options);
          break;
        case 4:
          model = await this.loadItemSetModel(options.equipList, options);
          break;
        case 8:
          model = await this.loadPetModel(displayId, options);
          break;
        case 16:
          model = await this.loadCharacterModel(displayId, options);
          break;
        default:
          throw new Error(`Unknown model type: ${type}`);
      }

      if (model) {
        this.modelCache.set(cacheKey, model.clone());
        this.setupModelMaterials(model);
        return model;
      }
    } catch (error) {
      console.error(`Failed to load model type ${type} with displayId ${displayId}:`, error);
      return this.createFallbackModel();
    }
  }

  async loadNPCModel(displayId, options) {
    const modelPath = `/static/models/npc/${displayId}`;
    return this.loadModelFromPath(modelPath, options);
  }

  async loadObjectModel(displayId, options) {
    const modelPath = `/static/models/object/${displayId}`;
    return this.loadModelFromPath(modelPath, options);
  }

  async loadItemModel(displayId, options) {
    const modelPath = `/static/models/item/${displayId}`;
    return this.loadModelFromPath(modelPath, options);
  }

  async loadItemSetModel(equipList, options) {
    const group = new THREE.Group();

    if (!Array.isArray(equipList)) {
      equipList = [equipList];
    }

    for (const itemId of equipList) {
      try {
        const itemModel = await this.loadItemModel(itemId, options);
        if (itemModel) {
          group.add(itemModel);
        }
      } catch (error) {
        console.warn(`Failed to load item ${itemId}:`, error);
      }
    }

    return group.children.length > 0 ? group : this.createFallbackModel();
  }

  async loadPetModel(displayId, options) {
    const modelPath = `/static/models/pet/${displayId}`;
    return this.loadModelFromPath(modelPath, options);
  }

  async loadCharacterModel(displayId, options) {
    const race = options.race || 1;
    const sex = options.sex || 0;
    const modelPath = `/static/models/character/${race}_${sex}`;
    return this.loadModelFromPath(modelPath, options);
  }

  async loadModelFromPath(basePath, options) {
    const formats = ['glb', 'gltf', 'fbx', 'obj'];

    for (const format of formats) {
      try {
        const path = `${basePath}.${format}`;
        return await this.loadFile(path, format);
      } catch (error) {
        continue;
      }
    }

    throw new Error(`No model found at ${basePath}`);
  }

  async loadFile(path, format) {
    return new Promise((resolve, reject) => {
      switch (format) {
        case 'glb':
        case 'gltf':
          this.gltfLoader.load(
            path,
            (gltf) => {
              const model = gltf.scene;
              if (gltf.animations && gltf.animations.length > 0) {
                model.animations = gltf.animations;
              }
              resolve(model);
            },
            undefined,
            reject
          );
          break;

        case 'fbx':
          this.fbxLoader.load(
            path,
            (model) => {
              resolve(model);
            },
            undefined,
            reject
          );
          break;

        case 'obj':
          this.objLoader.load(
            path,
            (model) => {
              resolve(model);
            },
            undefined,
            reject
          );
          break;

        default:
          reject(new Error(`Unsupported format: ${format}`));
      }
    });
  }

  setupModelMaterials(model) {
    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;

        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach((mat) => {
              this.enhanceMaterial(mat);
            });
          } else {
            this.enhanceMaterial(node.material);
          }
        }
      }
    });
  }

  enhanceMaterial(material) {
    if (material.map) {
      material.map.encoding = THREE.sRGBEncoding;
    }
    material.side = THREE.DoubleSide;
  }

  createFallbackModel() {
    const geometry = new THREE.BoxGeometry(1, 2, 0.5);
    const material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.3,
      roughness: 0.7
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  dispose() {
    this.modelCache.clear();
  }
}
