/* ================================================================
   London 3D scene — floating white city on a blue sky sphere.
   First‑person WASD + mouse‑look controls.
   Custom card markers with billboard sprites and ground lines.
   ================================================================ */
import * as THREE               from '/assets/three/three.module.min.js';
import { GLTFLoader }           from '/assets/three/GLTFLoader.js';

const container   = document.getElementById('londonStage');
const labelsLayer = document.getElementById('londonLabels');
const loaderEl    = document.getElementById('londonLoader');
if (!container) { console.warn('[london] no #londonStage'); }

// ── Renderer ─────────────────────────────────────────────────────
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 80000);
camera.position.set(-1998, 100, -500);   // initial position

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xd0dce6, 1);
renderer.domElement.style.backgroundColor = '#d0dce6';
container.appendChild(renderer.domElement);

// ── Lighting ─────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const sun = new THREE.DirectionalLight(0xffffff, 0.7);
sun.position.set(2, 5, 3);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xdde8ff, 0.3);
fill.position.set(-2, 1, -2);
scene.add(fill);

// ── Sky sphere ───────────────────────────────────────────────────
async function createSky() {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load('/assets/sky.jpg',
      (texture) => {
        const skyGeo = new THREE.SphereGeometry(40000, 64, 32);
        const skyMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, fog: false });
        scene.add(new THREE.Mesh(skyGeo, skyMat));
        resolve();
      },
      undefined,
      reject
    );
  });
}

// ── Materials for the city model ─────────────────────────────────
const matBuilding = new THREE.MeshLambertMaterial({ color: 0xffffff });
const matWater    = new THREE.MeshLambertMaterial({ color: 0xaaccdd });
const matGreen    = new THREE.MeshLambertMaterial({ color: 0x9ab87a });
const matRoad     = new THREE.MeshLambertMaterial({ color: 0xdddddd });
const matEdgeGlow  = new THREE.LineBasicMaterial({ color: 0xbbbbbb, transparent: true, opacity: 0.35 });
const matEdgeFaint = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.18 });

function materialForMesh(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('water') || n.includes('river') || n.includes('thame')) return matWater;
  if (n.includes('green') || n.includes('park')  || n.includes('grass') || n.includes('garden')) return matGreen;
  if (n.includes('road')  || n.includes('street') || n.includes('path') || n.includes('highway')) return matRoad;
  return matBuilding;
}

const TALL_THRESHOLD = 80;

async function loadCity() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load('/assets/frontentlondon.glb',
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (!child.isMesh) return;
          child.material = materialForMesh(child.name);
          child.receiveShadow = false;
          child.castShadow = false;
          const box = new THREE.Box3().setFromObject(child);
          const height = box.max.y - box.min.y;
          if (height > TALL_THRESHOLD) {
            const edges = new THREE.EdgesGeometry(child.geometry, 20);
            child.parent.add(new THREE.LineSegments(edges, matEdgeGlow));
          } else if (child.name.toLowerCase().includes('building')) {
            const edges = new THREE.EdgesGeometry(child.geometry, 30);
            child.parent.add(new THREE.LineSegments(edges, matEdgeFaint));
          }
        });
        scene.add(model);
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        console.log('[london] model loaded, center:', center);
        resolve(center);
      },
      (xhr) => {
        if (xhr.total) {
          const pct = (xhr.loaded / xhr.total * 100).toFixed(0);
          const label = loaderEl?.querySelector('.lon-load-label');
          if (label) label.textContent = `Loading London… ${pct}%`;
        }
      },
      reject
    );
  });
}

// ── Marker definitions (landmarks) ──────────────────────────────
// Each entry: name, description, href (webpage), position (x,y,z), image filename
const LANDMARKS = [
  {
    name: 'Canary Wharf',
    desc: 'Four illustrative model portfolios — macro, microstructure, supply, factor.',
    href: '/investments.html',
    pos: new THREE.Vector3(5303, 153, -761),
    image: 'canary-wharf.jpg'
  },
  {
    name: 'The Shard',
    desc: 'Daily briefings on physical supply, macro transmission, and microstructure.',
    href: '/posts.html',
    pos: new THREE.Vector3(758, 303, -929),
    image: 'the-shard.jpg'
  },
  {
    name: 'London Eye',
    desc: 'How the model portfolios are built — three analytical frames.',
    href: '/methodology.html',
    pos: new THREE.Vector3(-1474, 70, -859),
    image: 'london-eye.jpg'
  },
  {
    name: 'Tower Bridge',
    desc: 'Plain‑English notes on markets, asset classes, and UK personal finance.',
    href: '/education.html',
    pos: new THREE.Vector3(1526, 42, -1046),
    image: 'london-bridge.jpg'
  },
  {
    name: 'Houses of Parliament',
    desc: 'An AI day‑trader bot – live paper account, public trade log.',
    href: '/bot.html',
    pos: new THREE.Vector3(-1913, 36, -369),
    image: 'houses-of-parliament.jpg'
  }
];

// ── Helper: Create a card (CSS2DRenderer would be easier, but we use CSS2D for HTML content)
// We'll use CSS2DRenderer to have HTML cards that always face the camera.
import { CSS2DRenderer, CSS2DObject } from '/assets/three/CSS2DRenderer.js';

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(container.clientWidth, container.clientHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.pointerEvents = 'auto';
labelRenderer.domElement.style.zIndex = '5';
container.appendChild(labelRenderer.domElement);

// Also keep a group for the lines (3D)
const lineGroup = new THREE.Group();
scene.add(lineGroup);

function createCardMarker(lm) {
  // Create HTML div for the card
  const div = document.createElement('div');
  div.className = 'london-card';
  div.style.backgroundColor = 'white';
  div.style.borderRadius = '12px';
  div.style.padding = '12px';
  div.style.width = '220px';
  div.style.fontFamily = "'Inter Tight', sans-serif";
  div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  div.style.border = '1px solid #e0e0e0';
  div.style.cursor = 'pointer';
  div.style.transition = 'transform 0.2s';
  div.innerHTML = `
    <div style="display: flex; gap: 10px;">
      <img src="/assets/images/${lm.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" onerror="this.src='/assets/images/london-skyline.jpg'">
      <div style="flex:1;">
        <div style="font-weight: 800; font-size: 1rem; color: #111;">${lm.name}</div>
        <div style="font-size: 0.7rem; color: #444; margin-top: 4px;">${lm.desc.substring(0, 70)}${lm.desc.length > 70 ? '…' : ''}</div>
        <div style="margin-top: 6px; font-size: 0.7rem; font-weight: 600; color: #0066ff;">Open →</div>
      </div>
    </div>
  `;
  div.addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.href = lm.href;
  });
  div.addEventListener('mouseenter', () => { div.style.transform = 'scale(1.02)'; });
  div.addEventListener('mouseleave', () => { div.style.transform = 'scale(1)'; });

  const cardObj = new CSS2DObject(div);
  // Position card floating above the landmark (add 40 units to y)
  cardObj.position.copy(lm.pos);
  cardObj.position.y += 40;
  scene.add(cardObj);

  // Draw a line from the card position down to ground (y = 0)
  const points = [];
  points.push(new THREE.Vector3(lm.pos.x, lm.pos.y + 40, lm.pos.z));
  points.push(new THREE.Vector3(lm.pos.x, 0, lm.pos.z));
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x888888 });
  const line = new THREE.Line(lineGeo, lineMat);
  lineGroup.add(line);

  return cardObj;
}

// ── First‑person WASD + mouse controls ─────────────────────────
const keyState = {
  KeyW: false, KeyA: false, KeyS: false, KeyD: false, ShiftLeft: false
};
let moveSpeed = 150;
const baseSpeed = 150;
const sprintMultiplier = 2.5;
let pitch = 0;
let yaw = 0;
let mouseLookEnabled = false;

// Lock pointer on click
renderer.domElement.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', lockChange);
document.addEventListener('mozpointerlockchange', lockChange);

function lockChange() {
  if (document.pointerLockElement === renderer.domElement) {
    mouseLookEnabled = true;
    document.addEventListener('mousemove', onMouseMove);
  } else {
    mouseLookEnabled = false;
    document.removeEventListener('mousemove', onMouseMove);
  }
}

function onMouseMove(e) {
  if (!mouseLookEnabled) return;
  const sensitivity = 0.002;
  yaw -= e.movementX * sensitivity;
  pitch -= e.movementY * sensitivity;
  // Clamp pitch to avoid flipping
  pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch));
  // Apply rotation to camera
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

document.addEventListener('keydown', (e) => {
  if (keyState.hasOwnProperty(e.code)) keyState[e.code] = true;
  if (e.code === 'ShiftLeft') moveSpeed = baseSpeed * sprintMultiplier;
});
document.addEventListener('keyup', (e) => {
  if (keyState.hasOwnProperty(e.code)) keyState[e.code] = false;
  if (e.code === 'ShiftLeft') moveSpeed = baseSpeed;
});

function updateMovement(deltaTime) {
  if (!mouseLookEnabled) return;
  const actualSpeed = moveSpeed * deltaTime;
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  right.crossVectors(new THREE.Vector3(0, 1, 0), forward);
  right.normalize();

  let move = new THREE.Vector3(0, 0, 0);
  if (keyState.KeyW) move.add(forward);
  if (keyState.KeyS) move.sub(forward);
  if (keyState.KeyD) move.add(right);
  if (keyState.KeyA) move.sub(right);
  move.multiplyScalar(actualSpeed);
  camera.position.add(move);
}

// ── Resize handling for both renderers ─────────────────────────
function resize() {
  const w = container.clientWidth, h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
}
window.addEventListener('resize', resize, { passive: true });

// ── Animation loop ─────────────────────────────────────────────
let lastTime = performance.now();
function animate() {
  const now = performance.now();
  let delta = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  updateMovement(delta);
  // Update CSS2D objects to face camera (CSS2DRenderer does this automatically)
  labelRenderer.render(scene, camera);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// ── Boot ───────────────────────────────────────────────────────
(async () => {
  try {
    await createSky();
  } catch (e) {
    console.warn('[london] sky texture missing, using clear color');
  }
  try {
    await loadCity();
    // Create card markers
    LANDMARKS.forEach(lm => createCardMarker(lm));
    if (loaderEl) loaderEl.classList.add('done');
    resize();
    // Set initial camera orientation (look towards city center, roughly origin)
    const center = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3().subVectors(center, camera.position).normalize();
    yaw = Math.atan2(direction.x, direction.z);
    pitch = -Math.asin(direction.y);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
    // Start animation
    animate();
  } catch (err) {
    console.error('[london]', err);
    const label = loaderEl?.querySelector('.lon-load-label');
    if (label) label.textContent = 'Map unavailable — ' + err.message;
  }
})();
