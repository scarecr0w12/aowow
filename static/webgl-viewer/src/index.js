import { WebGLViewer } from './viewer.js';

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

export { WebGLViewer };
