import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { vertexShader, fragmentShader } from './shaders.js';

const params = new URLSearchParams(location.search);
const index = parseInt(params.get('i') || '0', 10);

const channel = new BroadcastChannel('mw3d');
const canvas = document.getElementById('c');

let renderer, scene, camera, mesh;
let layout = { total: { w: window.innerWidth, h: window.innerHeight }, tile: { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight } };
let uniforms = {
  uResolution: { value: new THREE.Vector2(layout.total.w, layout.total.h) },
  uOffset:     { value: new THREE.Vector2(layout.tile.x, layout.tile.y) },
  uTime:       { value: 0 },
  uMouse:      { value: new THREE.Vector2(-1, -1) },
  uDPR:        { value: Math.min(2, window.devicePixelRatio || 1) }
};

init();
function init() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(uniforms.uDPR.value);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geo = new THREE.PlaneGeometry(2, 2);
  const mat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: false });
  mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  window.addEventListener('resize', onResize);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', () => uniforms.uMouse.value.set(-1, -1));

  render();
}

function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
}

function onPointerMove(e) {
  const rect = canvas.getBoundingClientRect();
  const local = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  const globalPx = { x: layout.tile.x + local.x * uniforms.uDPR.value, y: layout.tile.y + local.y * uniforms.uDPR.value };
  const nx = globalPx.x / layout.total.w;
  const ny = globalPx.y / layout.total.h;
  channel.postMessage({ type: 'pointer', x: nx, y: ny });
}

channel.addEventListener('message', (ev) => {
  const msg = ev.data || {};
  if (msg.type === 'layout') {
    const tile = msg.tiles.find(t => t.i === index) || msg.tiles[0];
    layout = { total: msg.total, tile };
    uniforms.uResolution.value.set(msg.total.w, msg.total.h);
    uniforms.uOffset.value.set(tile.x, tile.y);
    onResize();
  } else if (msg.type === 'time') {
    uniforms.uTime.value = msg.t;
  } else if (msg.type === 'pointer') {
    uniforms.uMouse.value.set(msg.x, msg.y);
  }
});

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
