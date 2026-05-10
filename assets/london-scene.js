/* ================================================================
   London 3D scene — GLTF model with Gran Turismo dark styling.
   Dark navy fill, blue-glow edge lines on tall buildings,
   slow auto-rotate, HTML landmark markers.
   ================================================================ */
import * as THREE               from '/assets/three/three.module.min.js';
import { OrbitControls }        from '/assets/three/OrbitControls.js';
import { GLTFLoader }           from '/assets/three/GLTFLoader.js';

const container   = document.getElementById('londonStage');
const labelsLayer = document.getElementById('londonLabels');
const loaderEl    = document.getElementById('londonLoader');
if (!container) { console.warn('[london] no #londonStage'); }

// ── Renderer ─────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = null;

// Near=50 far=80000 gives ratio 1600:1 — good depth precision, no flicker
const camera = new THREE.PerspectiveCamera(42, 1, 50, 80000);
camera.position.set(0, 5000, 8000);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false;
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

// ── Controls ─────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping   = true;
controls.dampingFactor   = 0.06;
controls.minDistance     = 500;
controls.maxDistance     = 40000;
controls.maxPolarAngle   = Math.PI * 0.48;
controls.minPolarAngle   = Math.PI * 0.05;
controls.autoRotate      = true;
controls.autoRotateSpeed = 0.25;
controls.enablePan       = false;
controls.update();

// ── Lighting — neutral white for clean solid look ─────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const sun = new THREE.DirectionalLight(0xffffff, 0.65);
sun.position.set(2, 5, 3);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xdde8ff, 0.25);
fill.position.set(-2, 1, -2);
scene.add(fill);

// ── Ground ───────────────────────────────────────────────────────
const groundMat = new THREE.MeshBasicMaterial({ color: 0x0a0c10 });
const groundGeo = new THREE.PlaneGeometry(120000, 120000);
groundGeo.rotateX(-Math.PI / 2);
scene.add(new THREE.Mesh(groundGeo, groundMat));

// ── Resize ───────────────────────────────────────────────────────
function resize() {
  const w = container.clientWidth, h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
resize();
window.addEventListener('resize', resize, { passive: true });

// ── Materials — clean white/grey like Blender Solid view ─────────
const matBuilding = new THREE.MeshLambertMaterial({ color: 0xc8cdd6 });
const matWater    = new THREE.MeshLambertMaterial({ color: 0x7a9ab8 });
const matGreen    = new THREE.MeshLambertMaterial({ color: 0x8aaa7a });
const matRoad     = new THREE.MeshLambertMaterial({ color: 0x888e99 });

// Subtle white edge lines — very faint, just define the geometry
const matEdgeGlow  = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
const matEdgeFaint = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.10 });

// ── Classify mesh by name ─────────────────────────────────────────
function materialForMesh(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('water') || n.includes('river') || n.includes('thame')) return matWater;
  if (n.includes('green') || n.includes('park')  || n.includes('grass') || n.includes('garden')) return matGreen;
  if (n.includes('road')  || n.includes('street') || n.includes('path') || n.includes('highway')) return matRoad;
  return matBuilding;
}

// ── Load GLTF model ───────────────────────────────────────────────
const TALL_THRESHOLD = 80; // metres — add edge glow above this height

async function loadCity() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      '/assets/frontentlondon.glb',
      (gltf) => {
        const model = gltf.scene;

        // Apply dark materials + optional edge glow
        model.traverse((child) => {
          if (!child.isMesh) return;
          child.material = materialForMesh(child.name);
          child.receiveShadow = false;
          child.castShadow    = false;

          // Add edge glow to tall buildings
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

        // ── Auto-fit camera to model bounds ──────────────────────
        const box     = new THREE.Box3().setFromObject(model);
        const center  = box.getCenter(new THREE.Vector3());
        const size    = box.getSize(new THREE.Vector3());
        const maxSpan = Math.max(size.x, size.y, size.z);

        // Log coords for landmark calibration — paste these to Claude
        console.log('[london] min  x=' + box.min.x.toFixed(1) + ' y=' + box.min.y.toFixed(1) + ' z=' + box.min.z.toFixed(1));
        console.log('[london] max  x=' + box.max.x.toFixed(1) + ' y=' + box.max.y.toFixed(1) + ' z=' + box.max.z.toFixed(1));
        console.log('[london] ctr  x=' + center.x.toFixed(1)  + ' y=' + center.y.toFixed(1)  + ' z=' + center.z.toFixed(1));
        console.log('[london] size x=' + size.x.toFixed(1)    + ' y=' + size.y.toFixed(1)    + ' z=' + size.z.toFixed(1));

        // Fog tuned to model scale
        scene.fog = new THREE.Fog(0x06080f, size.x * 0.8, size.x * 2.8);

        // Camera: centred on city, angled 50° down from south
        // target at ground level (Y=0), not mid-building height
        const fovRad  = (42 / 2) * Math.PI / 180;
        const camDist = (size.x / 2) / Math.tan(fovRad) * 1.15; // fit X span

        controls.target.set(center.x, 0, center.z);
        camera.position.set(
          center.x,                           // directly above centre X
          camDist * 0.72,                     // elevation
          center.z + camDist * 0.72           // same distance south
        );
        camera.lookAt(new THREE.Vector3(center.x, 0, center.z));
        controls.minDistance = size.x * 0.05;
        controls.maxDistance = size.x * 2.5;
        controls.update();

        resolve({ center, size, box });
      },
      (xhr) => {
        // progress (optional)
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

// ── Landmark markers ─────────────────────────────────────────────
/* World positions are set after the model loads — we use the console
   output from '[london] model bounds' to calibrate these.
   For now they are positioned relative to the model centre.
   ⚠ Replace markerPositions below once you see the console output. */

const LANDMARKS = [
  { name: 'Canary Wharf',  sub: 'Funds',            href: '/investments.html' },
  { name: 'The Shard',     sub: 'Market briefs',     href: '/posts.html'       },
  { name: 'London Eye',    sub: 'Investment thesis', href: '/methodology.html' },
  { name: 'LSE',           sub: 'Learn — IMC',       href: '/education.html'   },
  { name: 'Tower 42',      sub: 'AI day-trader',     href: '/bot.html'         },
];

/* ── MARKER POSITIONS ───────────────────────────────────────────────
   Edit these X/Y/Z values to move each pin.
   To find the right position: click anywhere on the model in the browser
   and the console will print "[click] x=... y=... z=..."
   Paste those numbers here, add the landmark height to Y.
   Model bounds: X west=-3078  east=6166 | Z north=-2738  south=1648
   ─────────────────────────────────────────────────────────────────── */
const LANDMARK_WORLD = [
  new THREE.Vector3( 4800,  280,  -800),  // 0 Canary Wharf  — far east
  new THREE.Vector3(  800,  355,   300),  // 1 The Shard     — south bank
  new THREE.Vector3( -900,  180,   350),  // 2 London Eye    — south bank, west
  new THREE.Vector3( -700,  105,  -300),  // 3 LSE           — north bank, west
  new THREE.Vector3( 1400,  228,  -400),  // 4 Tower 42      — City, north bank
];

const markerEls = [];

function buildMarkers(center) {
  LANDMARKS.forEach((lm, i) => {
    const world = LANDMARK_WORLD[i];

    const a = document.createElement('a');
    a.className = 'london-marker';
    a.href      = lm.href;
    a.innerHTML = `
      <span class="lm-pin"><span class="lm-dot"></span></span>
      <span class="lm-card">
        <span class="lm-eyebrow">${lm.name}</span>
        <span class="lm-title">${lm.sub}</span>
        <span class="lm-arrow">Open →</span>
      </span>`;
    labelsLayer.appendChild(a);
    markerEls.push({ el: a, world });
  });
}

// ── Project markers every frame ───────────────────────────────────
const _proj = new THREE.Vector3();
function projectMarkers() {
  const w = container.clientWidth, h = container.clientHeight;
  for (const m of markerEls) {
    _proj.copy(m.world).project(camera);
    if (_proj.z >= 1) { m.el.style.opacity = '0'; m.el.style.pointerEvents = 'none'; continue; }
    const dist = camera.position.distanceTo(m.world);
    const span = controls.maxDistance;
    const fade = Math.max(0, Math.min(1, 1 - (dist - span * 0.15) / (span * 0.7)));
    const sx = (_proj.x *  0.5 + 0.5) * w;
    const sy = (_proj.y * -0.5 + 0.5) * h;
    m.el.style.transform     = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-100%)`;
    m.el.style.opacity       = String(fade);
    m.el.style.pointerEvents = fade > 0.35 ? 'auto' : 'none';
  }
}

controls.addEventListener('start', () => { controls.autoRotate = false; });

// ── Click-to-position debug tool ─────────────────────────────────
// Click anywhere on the model → console prints the world coordinates.
// Use those numbers to update LANDMARK_WORLD above.
const _ray   = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
renderer.domElement.addEventListener('click', (e) => {
  const r    = container.getBoundingClientRect();
  _mouse.x   = ((e.clientX - r.left)  / r.width)  *  2 - 1;
  _mouse.y   = ((e.clientY - r.top)   / r.height) * -2 + 1;
  _ray.setFromCamera(_mouse, camera);
  const hits = _ray.intersectObjects(scene.children, true);
  if (hits.length) {
    const p = hits[0].point;
    console.log('[click] x=' + p.x.toFixed(0) + '  y=' + p.y.toFixed(0) + '  z=' + p.z.toFixed(0));
  }
});

// ── Render loop ───────────────────────────────────────────────────
function tick() {
  controls.update();
  projectMarkers();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

// ── Boot ──────────────────────────────────────────────────────────
loadCity()
  .then(({ center }) => {
    buildMarkers(center);
    if (loaderEl) loaderEl.classList.add('done');
    resize();
    requestAnimationFrame(tick);
  })
  .catch(err => {
    console.error('[london]', err);
    const label = loaderEl?.querySelector('.lon-load-label');
    if (label) label.textContent = 'Map unavailable — ' + err.message;
  });
