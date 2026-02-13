import * as THREE from 'three';

export class AnimationController {
  constructor() {
    this.mixer = null;
    this.actions = [];
    this.currentAction = null;
    this.model = null;
    this.clock = new THREE.Clock();
  }

  setModel(model) {
    this.model = model;
    
    if (this.mixer) {
      this.mixer.stopAllAction();
    }

    if (model.animations && model.animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(model);
      this.actions = model.animations.map((clip) => {
        return this.mixer.clipAction(clip);
      });
    } else {
      this.mixer = null;
      this.actions = [];
    }

    this.currentAction = null;
  }

  getAnimations() {
    if (!this.model || !this.model.animations) {
      return [];
    }

    return this.model.animations.map((clip) => ({
      name: clip.name,
      duration: clip.duration
    }));
  }

  playAnimation(animationName) {
    if (!this.mixer || !this.model) {
      return;
    }

    const clip = THREE.AnimationClip.findByName(this.model.animations, animationName);
    if (!clip) {
      console.warn(`Animation not found: ${animationName}`);
      return;
    }

    if (this.currentAction) {
      this.currentAction.stop();
    }

    const action = this.mixer.clipAction(clip);
    action.play();
    this.currentAction = action;
  }

  stopAnimation() {
    if (this.currentAction) {
      this.currentAction.stop();
      this.currentAction = null;
    }
  }

  update() {
    if (this.mixer) {
      this.mixer.update(this.clock.getDelta());
    }
  }

  dispose() {
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    this.actions = [];
    this.currentAction = null;
  }
}
