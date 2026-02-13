import * as THREE from 'three';
import { SceneSetup } from './scene/scene-setup.js';
import { CameraController } from './scene/camera.js';
import { ModelLoader } from './loaders/model-loader.js';
import { UIController } from './ui/controls.js';
import { AnimationController } from './ui/animations.js';

export class WebGLViewer {
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
    this.modelLoader = null;
    this.animationController = null;
    this.uiController = null;
    this.currentModel = null;
    this.isVisible = false;
    this.options = {};
    this.animationFrameId = null;
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
      background: rgba(0, 0, 0, 0.9);
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
    `;
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
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;

    this.viewportContainer.appendChild(this.renderer.domElement);

    SceneSetup.setupLighting(this.scene);
    this.cameraController = new CameraController(this.camera, this.renderer.domElement);
    this.modelLoader = new ModelLoader(this.scene);
    this.animationController = new AnimationController();

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  setupUI() {
    this.uiController = new UIController(this.controlsPanel, this);
    this.uiController.render(this.options);
  }

  loadModel(options) {
    const type = options.type || 1;
    const displayId = options.displayId;

    if (!displayId) {
      console.warn('No displayId provided');
      return;
    }

    this.modelLoader.loadModel(type, displayId, options).then((model) => {
      if (this.currentModel) {
        this.scene.remove(this.currentModel);
      }

      this.currentModel = model;
      this.scene.add(model);

      this.cameraController.fitCameraToObject(model);
      this.animationController.setModel(model);
      this.uiController.updateAnimations(this.animationController.getAnimations());
    }).catch((error) => {
      console.error('Failed to load model:', error);
      this.uiController.showError('Failed to load model');
    });
  }

  setAnimation(animationName) {
    if (this.animationController) {
      this.animationController.playAnimation(animationName);
    }
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

    if (this.animationController) {
      this.animationController.update();
    }

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

    if (this.modelLoader) {
      this.modelLoader.dispose();
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
}
