import * as THREE from 'three';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.targetPosition = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3(0, 1, 0);
    this.distance = 5;
    this.theta = 0;
    this.phi = Math.PI / 4;
    this.isRotating = false;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.domElement.addEventListener('wheel', (e) => this.onMouseWheel(e));
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  onMouseDown(e) {
    if (e.button === 0) {
      this.isDragging = true;
      this.isRotating = true;
    } else if (e.button === 2) {
      this.isDragging = true;
    }
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  onMouseMove(e) {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.previousMousePosition.x;
    const deltaY = e.clientY - this.previousMousePosition.y;

    if (this.isRotating) {
      this.theta += deltaX * 0.01;
      this.phi -= deltaY * 0.01;
      this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi));
    } else {
      const moveSpeed = 0.01;
      const right = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);
      right.crossVectors(this.camera.getWorldDirection(new THREE.Vector3()), up).normalize();

      this.targetLookAt.addScaledVector(right, -deltaX * moveSpeed);
      this.targetLookAt.addScaledVector(up, deltaY * moveSpeed);
    }

    this.previousMousePosition = { x: e.clientX, y: e.clientY };
    this.updateCameraPosition();
  }

  onMouseUp(e) {
    this.isDragging = false;
    this.isRotating = false;
  }

  onMouseWheel(e) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    this.distance += e.deltaY > 0 ? zoomSpeed : -zoomSpeed;
    this.distance = Math.max(0.5, Math.min(50, this.distance));
    this.updateCameraPosition();
  }

  updateCameraPosition() {
    const x = this.distance * Math.sin(this.phi) * Math.cos(this.theta);
    const y = this.distance * Math.cos(this.phi);
    const z = this.distance * Math.sin(this.phi) * Math.sin(this.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.targetLookAt);
  }

  fitCameraToObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    const center = box.getCenter(new THREE.Vector3());
    this.targetLookAt.copy(center);
    this.distance = cameraZ * 1.5;
    this.updateCameraPosition();
  }

  reset() {
    this.theta = 0;
    this.phi = Math.PI / 4;
    this.distance = 5;
    this.targetLookAt.set(0, 1, 0);
    this.updateCameraPosition();
  }
}
