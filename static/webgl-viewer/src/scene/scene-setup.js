import * as THREE from 'three';

export class SceneSetup {
  static setupLighting(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.8,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  static createGrid(size = 10, divisions = 10, color1 = 0x444444, color2 = 0x888888) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i <= divisions; i++) {
      const pos = (i / divisions - 0.5) * size;

      vertices.push(-size / 2, 0, pos);
      vertices.push(size / 2, 0, pos);

      vertices.push(pos, 0, -size / 2);
      vertices.push(pos, 0, size / 2);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

    const material = new THREE.LineBasicMaterial({ color: color1 });
    return new THREE.LineSegments(geometry, material);
  }
}
