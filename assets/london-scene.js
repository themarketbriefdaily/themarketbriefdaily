/* ================================================================
   London 3D scene — floating white city on a blue sky sphere.
   WASD + mouse look first-person controls.
   Pokemon-style card markers with tether lines to ground.
   ================================================================ */
import * as THREE               from '/assets/three/three.module.min.js';
import { GLTFLoader }           from '/assets/three/GLTFLoader.js';

const container   = document.getElementById('londonStage');
const labelsLayer = document.getElementById('londonLabels');
const loaderEl    = document.getElementById('londonLoader');
if (!container) { console.warn('[london] no #londonStage'); }

// ── Renderer ─────────────────────────────────────────────────────
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, 1, 10, 80000);
camera.position.set(-1998, 100, -500);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false;
renderer.setClearColor(0xd0dce6, 1);
renderer.domElement.style.backgroundColor = '#d0dce6';
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

// ── Lighting ─────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const sun = new THREE.DirectionalLight(0xffffff, 0.7);
sun.position.set(2, 5, 3);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xdde8ff, 0.3);
fill.position.set(-2, 1, -2);
scene.add(fill);

// ── Resize ───────────────────────────────────────────────────────
function resize() {
  const w = container.clientWidth, h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  renderer.domElement.style.width  = '100%';
  renderer.domElement.style.height = '100%';
}
resize();
window.addEventListener('resize', resize, { passive: true });

// ── Sky sphere ───────────────────────────────────────────────────
async function createSky() {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load('/assets/sky.jpg',
      (texture) => {
        const skyGeo = new THREE.SphereGeometry(40000, 64, 32);
        const skyMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, fog: false });
        scene.add(new THREE.Mesh(skyGeo, skyMat));
        resolve();
      }, undefined, reject
    );
  });
}

// ── Materials ─────────────────────────────────────────────────────
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

// ── Load GLTF ─────────────────────────────────────────────────────
const TALL_THRESHOLD = 80;

async function loadCity() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      '/assets/frontentlondon.glb',
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (!child.isMesh) return;
          child.material = materialForMesh(child.name);
          child.receiveShadow = false;
          child.castShadow    = false;
          const box    = new THREE.Box3().setFromObject(child);
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

        const box    = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());

        console.log('[london] center x=' + center.x.toFixed(1) + ' y=' + center.y.toFixed(1) + ' z=' + center.z.toFixed(1));
        console.log('[london] size   x=' + size.x.toFixed(1)   + ' y=' + size.y.toFixed(1)   + ' z=' + size.z.toFixed(1));

        scene.fog = new THREE.Fog(0xd0dce6, size.x * 0.8, size.x * 2.8);
        resolve({ center, size, box });
      },
      (xhr) => {
        if (xhr.total) {
          const pct   = (xhr.loaded / xhr.total * 100).toFixed(0);
          const label = loaderEl?.querySelector('.lon-load-label');
          if (label) label.textContent = `Loading London… ${pct}%`;
        }
      },
      reject
    );
  });
}

// ── WASD First-Person Controls ────────────────────────────────────
const keys   = {};
const euler  = new THREE.Euler(0, 0, 0, 'YXZ');
const moveDir = new THREE.Vector3();
let isPointerLocked = false;
let yaw   = Math.PI; // face inward by default
let pitch = -0.1;

// Apply initial orientation
euler.set(pitch, yaw, 0, 'YXZ');
camera.quaternion.setFromEuler(euler);

// Pointer lock for mouse look
renderer.domElement.addEventListener('click', () => {
  if (!isPointerLocked) renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
  const hint = document.querySelector('.london-hud-hint');
  if (hint) hint.textContent = isPointerLocked ? 'WASD · Mouse look · Shift to sprint · ESC to release' : 'Click to enter · WASD + Mouse look';
});

document.addEventListener('mousemove', (e) => {
  if (!isPointerLocked) return;
  const sens = 0.0018;
  yaw   -= e.movementX * sens;
  pitch -= e.movementY * sens;
  pitch  = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, pitch));
  euler.set(pitch, yaw, 0, 'YXZ');
  camera.quaternion.setFromEuler(euler);
});

document.addEventListener('keydown', (e) => { keys[e.code] = true;  });
document.addEventListener('keyup',   (e) => { keys[e.code] = false; });

const _forward  = new THREE.Vector3();
const _right    = new THREE.Vector3();
const _worldUp  = new THREE.Vector3(0, 1, 0);

function updateMovement(dt) {
  const speed   = keys['ShiftLeft'] || keys['ShiftRight'] ? 1800 : 500;
  const dist     = speed * dt;
  const moved    = keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'];
  if (!moved) return;

  // forward = where camera faces projected onto XZ (no flying)
  camera.getWorldDirection(_forward);
  _forward.y = 0;
  _forward.normalize();

  _right.crossVectors(_forward, _worldUp).negate().normalize();

  moveDir.set(0, 0, 0);
  if (keys['KeyW']) moveDir.add(_forward);
  if (keys['KeyS']) moveDir.sub(_forward);
  if (keys['KeyA']) moveDir.add(_right);
  if (keys['KeyD']) moveDir.sub(_right);
  moveDir.normalize().multiplyScalar(dist);

  camera.position.add(moveDir);
  // clamp Y so user stays near ground level
  camera.position.y = Math.max(60, Math.min(800, camera.position.y));
}

// ── Landmark definitions ──────────────────────────────────────────
const LANDMARKS = [
  {
    name:  'Canary Wharf',
    sub:   'Funds',
    desc:  'Model portfolios & live fund performance.',
    href:  '/investments.html',
    img:   '/assets/images/canary-wharf.jpg',
    world: new THREE.Vector3( 4800, 280,  -800),
  },
  {
    name:  'The Shard',
    sub:   'Market Briefs',
    desc:  'Independent macro & market structure research.',
    href:  '/posts.html',
    img:   '/assets/images/the-shard.jpg',
    world: new THREE.Vector3(  800, 355,   300),
  },
  {
    name:  'London Eye',
    sub:   'Methodology',
    desc:  'Our investment thesis and analytical framework.',
    href:  '/methodology.html',
    img:   '/assets/images/london-eye.jpg',
    world: new THREE.Vector3( -900, 180,   350),
  },
  {
    name:  'London Bridge',         // ← replaced LSE
    sub:   'Education',
    desc:  'Learn markets, investing & financial concepts.',
    href:  '/education.html',
    img:   '/assets/images/london-skyline.jpg',
    world: new THREE.Vector3( 1526, 62, -1046),   // Tower Bridge coords (+20 Y)
  },
  {
    name:  'Houses of Parliament',  // ← replaced Tower 42
    sub:   'AI Day-Trader',
    desc:  'Autonomous algorithmic trading — live signals.',
    href:  '/bot.html',
    img:   '/assets/images/the-shard.jpg',
    world: new THREE.Vector3(-1913, 56, -369),    // +20 Y from given 36
  },
];

// ── Tether lines (3D lines from landmark down to y=0) ─────────────
const tetherLines = [];

function buildTethers() {
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  for (const lm of LANDMARKS) {
    const points = [
      lm.world.clone(),
      new THREE.Vector3(lm.world.x, 0, lm.world.z),
    ];
    const geo  = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    tetherLines.push(line);
  }
}

// ── Pokemon-style card markers (HTML overlay) ─────────────────────
const markerEls = [];

function buildMarkers() {
  LANDMARKS.forEach((lm, i) => {
    const a = document.createElement('a');
    a.className = 'london-marker';
    a.href      = lm.href;
    a.innerHTML = `
      <div class="lm-card">
        <div class="lm-card-img" style="background-image:url('${lm.img}')"></div>
        <div class="lm-card-body">
          <div class="lm-card-name">${lm.name}</div>
          <div class="lm-card-section">${lm.sub}</div>
          <div class="lm-card-desc">${lm.desc}</div>
          <div class="lm-card-cta">Open →</div>
        </div>
      </div>`;
    labelsLayer.appendChild(a);
    markerEls.push({ el: a, world: lm.world });
  });
}

// ── Project markers to screen ─────────────────────────────────────
const _proj = new THREE.Vector3();
const FAR_FADE_START = 3000;
const FAR_FADE_END   = 8000;

function projectMarkers() {
  const w = container.clientWidth, h = container.clientHeight;
  for (const m of markerEls) {
    _proj.copy(m.world).project(camera);

    // behind camera
    if (_proj.z >= 1) {
      m.el.style.opacity = '0';
      m.el.style.pointerEvents = 'none';
      continue;
    }

    const dist = camera.position.distanceTo(m.world);
    const fade = 1 - Math.max(0, Math.min(1, (dist - FAR_FADE_START) / (FAR_FADE_END - FAR_FADE_START)));

    const sx = (_proj.x *  0.5 + 0.5) * w;
    const sy = (_proj.y * -0.5 + 0.5) * h;

    // card floats above projected point
    m.el.style.transform     = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-100%)`;
    m.el.style.opacity       = String(fade);
    m.el.style.pointerEvents = fade > 0.2 ? 'auto' : 'none';
  }
}

// ── Click-to-position debug (console only) ────────────────────────
const _ray   = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
renderer.domElement.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const r   = container.getBoundingClientRect();
  _mouse.x  = ((e.clientX - r.left)  / r.width)  *  2 - 1;
  _mouse.y  = ((e.clientY - r.top)   / r.height) * -2 + 1;
  _ray.setFromCamera(_mouse, camera);
  const hits = _ray.intersectObjects(scene.children, true);
  if (hits.length) {
    const p = hits[0].point;
    console.log('[click] x=' + p.x.toFixed(0) + '  y=' + p.y.toFixed(0) + '  z=' + p.z.toFixed(0));
  }
});

// ── Render loop ───────────────────────────────────────────────────
let lastTime = performance.now();

function tick() {
  const now = performance.now();
  const dt  = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms
  lastTime  = now;

  if (isPointerLocked) updateMovement(dt);
  projectMarkers();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

// ── Boot ──────────────────────────────────────────────────────────
(async () => {
  try {
    await createSky();
  } catch (e) {
    console.warn('[london] sky texture failed', e);
  }
  try {
    await loadCity();
    buildTethers();
    buildMarkers();
    if (loaderEl) loaderEl.classList.add('done');
    resize();
    requestAnimationFrame(tick);
  } catch (err) {
    console.error('[london]', err);
    const label = loaderEl?.querySelector('.lon-load-label');
    if (label) label.textContent = 'Map unavailable — ' + err.message;
  }
})();
