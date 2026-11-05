import * as THREE from 'three';
import './style.css';

const container = document.querySelector('#webgl-container');
const width = 400;
const height = 400;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
camera.position.set(0, 0, 5.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(2, 4, 4);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.bias = -0.0001;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0xf4ece1, 0.8);
fillLight.position.set(-3, -2, 2);
scene.add(fillLight);

const bodyMat = new THREE.MeshStandardMaterial({
  color: 0x111111,
  roughness: 0.85,
  metalness: 0.1
});
const eyeMat = new THREE.MeshStandardMaterial({
  color: 0xf4ece1,
  roughness: 0.3,
  metalness: 0
});
const pupilMat = new THREE.MeshStandardMaterial({
  color: 0x111111,
  roughness: 0.5,
  metalness: 0.1
});

const characterGroup = new THREE.Group();
scene.add(characterGroup);

const bodyMesh = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.65, 0.7, 16, 32),
  bodyMat
);
bodyMesh.castShadow = true;
bodyMesh.receiveShadow = true;
characterGroup.add(bodyMesh);

const eyeGeo = new THREE.SphereGeometry(0.2, 32, 32);
const pupilGeo = new THREE.SphereGeometry(0.09, 32, 32);

function createEye(x) {
  const eyeGroup = new THREE.Group();
  const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
  eyeMesh.scale.set(1, 1, 0.4);
  eyeGroup.add(eyeMesh);

  const pupil = new THREE.Mesh(pupilGeo, pupilMat);
  pupil.position.set(0, 0, 0.16);
  eyeGroup.add(pupil);
  eyeGroup.position.set(x, 0.12, 0.58);
  characterGroup.add(eyeGroup);
  return { eyeGroup, pupil };
}

const leftEye = createEye(-0.3);
const rightEye = createEye(0.3);

const shadowMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1.8, 1.8),
  new THREE.ShadowMaterial({ opacity: 0.12 })
);
shadowMesh.rotation.x = -Math.PI / 2;
shadowMesh.position.y = -1.2;
shadowMesh.receiveShadow = true;
scene.add(shadowMesh);

const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
window.addEventListener('mousemove', (event) => {
  const rect = container.getBoundingClientRect();
  mouse.targetX = ((event.clientX - rect.left) / width) * 2 - 1;
  mouse.targetY = -((event.clientY - rect.top) / height) * 2 + 1;
});

let isBlinking = false;
let blinkProgress = 0;

function triggerBlink() {
  if (!isBlinking) {
    isBlinking = true;
    blinkProgress = 0;
  }
}

setInterval(() => {
  if (Math.random() > 0.3) triggerBlink();
}, 3500);

let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.03;

  mouse.x += (mouse.targetX - mouse.x) * 0.1;
  mouse.y += (mouse.targetY - mouse.y) * 0.1;

  const breath = Math.sin(time * 2) * 0.02;
  bodyMesh.scale.set(1 - breath * 0.5, 1 + breath, 1 - breath * 0.5);

  const pupilX = mouse.x * 0.08;
  const pupilY = mouse.y * 0.08;
  leftEye.pupil.position.x = pupilX;
  leftEye.pupil.position.y = pupilY;
  rightEye.pupil.position.x = pupilX;
  rightEye.pupil.position.y = pupilY;

  if (isBlinking) {
    blinkProgress += 0.18;
    const scaleY = Math.abs(Math.cos(blinkProgress * Math.PI));
    leftEye.eyeGroup.scale.y = scaleY;
    rightEye.eyeGroup.scale.y = scaleY;

    if (blinkProgress >= 1) {
      isBlinking = false;
      leftEye.eyeGroup.scale.y = 1;
      rightEye.eyeGroup.scale.y = 1;
    }
  }

  renderer.render(scene, camera);
}

animate();
