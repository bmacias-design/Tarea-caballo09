import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mapRange } from './utils.js';

const container = document.querySelector('#webgl-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4ece1);

const baseCameraPos = new THREE.Vector3(0, 0, 3.6);
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.copy(baseCameraPos);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
mainLight.position.set(4, 6, 4);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 1024;
mainLight.shadow.mapSize.height = 1024;
mainLight.shadow.bias = -0.0001;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xf4ece1, 0.6);
fillLight.position.set(-4, -2, 2);
scene.add(fillLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.ShadowMaterial({ opacity: 0.12 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.9;
floor.receiveShadow = true;
scene.add(floor);

const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
const modelGroup = new THREE.Group();
scene.add(modelGroup);

window.addEventListener('mousemove', (event) => {
  mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Carga con el nombre exacto de tu archivo: cabaio.glb
new GLTFLoader().load(
  '/modelos/cabaio.glb',
  (gltf) => {
    console.log('Modelo cargado exitosamente', gltf);
    const model = gltf.scene;

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 2 / maxDim : 1;

    model.scale.setScalar(scale);
    model.position.x = -center.x * scale;
    model.position.y = -box.min.y * scale - 0.9;
    model.position.z = -center.z * scale;
    modelGroup.add(model);
  },
  undefined,
  (error) => console.error('Error al cargar el modelo:', error)
);

function animate() {
  requestAnimationFrame(animate);

  mouse.x += (mouse.targetX - mouse.x) * 0.07;
  mouse.y += (mouse.targetY - mouse.y) * 0.07;

  modelGroup.rotation.y = mapRange(mouse.x, -1, 1, -Math.PI * 0.25, Math.PI * 0.25);
  modelGroup.rotation.x = mapRange(mouse.y, -1, 1, Math.PI * 0.08, -Math.PI * 0.08);
  modelGroup.position.x = mapRange(mouse.x, -1, 1, -0.15, 0.15);
  modelGroup.position.y = mapRange(mouse.y, -1, 1, -0.08, 0.08);
  camera.position.x = baseCameraPos.x + mouse.x * 0.25;
  camera.position.y = baseCameraPos.y + mouse.y * 0.15;
  camera.lookAt(modelGroup.position.x * 0.3, 0, 0);

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();