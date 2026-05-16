/* ================================================================
   London 3D scene — floating white city on a blue sky sphere.
   No ground plane.  Pan enabled.  Closer starting view.
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

const camera = new THREE.PerspectiveCamera(42, 1, 50, 80000);
camera.position.set(0, 5000, 8000);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,                         // no transparency – never shows page background
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false;

// Prevent any black/white flashing
renderer.setClearColor(0xd0dce6, 1);    // gentle sky‑like light blue (fallback, won’t be seen once sphere loads)
renderer.domElement.style.backgroundColor = '#d0dce6';
renderer.domElement.style.display = 'block';

container.appendChild(renderer.domElement);

// ── Controls (pan enabled, closer start) ─────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping   = true;
controls.dampingFactor   = 0.06;
controls.minDistance     = 500;
controls.maxDistance     = 40000;
controls.maxPolarAngle   = Math.PI * 0.48;
controls.minPolarAngle   = Math.PI * 0.05;
controls.autoRotate      = true;
controls.autoRotateSpeed = 0.25;
controls.enablePan       = true;
controls.panSpeed        = 0.8;
controls.update();

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
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
}
resize();
window.addEventListener('resize', resize, { passive: true });

// ── Sky sphere (blue sky with clouds, no ground) ─────────────────
async function createSky() {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load('/assets/sky.jpg',
      (texture) => {
        const skyGeo = new THREE.SphereGeometry(40000, 64, 32);
        const skyMat = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide,
          fog: false
        });
        const sky = new THREE.Mesh(skyGeo, skyMat);
        sky.name = 'sky';
        scene.add(sky);
        resolve();
      },
      undefined,
      reject
    );
  });
}

// ── Materials – crisp white city ─────────────────────────────────
const matBuilding = new THREE.MeshLambertMaterial({ color: 0xffffff });  // pure white
const matWater    = new THREE.MeshLambertMaterial({ color: 0xaaccdd });  // pale steel blue
const matGreen    = new THREE.MeshLambertMaterial({ color: 0x9ab87a });  // muted green
const matRoad     = new THREE.MeshLambertMaterial({ color: 0xdddddd });  // off‑white for roads

const matEdgeGlow  = new THREE.LineBasicMaterial({ color: 0xbbbbbb, transparent: true, opacity: 0.35 });
const matEdgeFaint = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.18 });

function materialForMesh(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('water') || n.includes('river') || n.includes('thame')) return matWater;
  if (n.includes('green') || n.includes('park')  || n.includes('grass') || n.includes('garden')) return matGreen;
  if (n.includes('road')  || n.includes('street') || n.includes('path') || n.includes('highway')) return matRoad;
  return matBuilding;
}

// ── Load GLTF model ───────────────────────────────────────────────
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

        const box     = new THREE.Box3().setFromObject(model);
        const center  = box.getCenter(new THREE.Vector3());
        const size    = box.getSize(new THREE.Vector3());

        console.log('[london] min  x=' + box.min.x.toFixed(1) + ' y=' + box.min.y.toFixed(1) + ' z=' + box.min.z.toFixed(1));
        console.log('[london] max  x=' + box.max.x.toFixed(1) + ' y=' + box.max.y.toFixed(1) + ' z=' + box.max.z.toFixed(1));
        console.log('[london] ctr  x=' + center.x.toFixed(1)  + ' y=' + center.y.toFixed(1)  + ' z=' + center.z.toFixed(1));
        console.log('[london] size x=' + size.x.toFixed(1)    + ' y=' + size.y.toFixed(1)    + ' z=' + size.z.toFixed(1));

        // Light fog – blends to sky colour
        scene.fog = new THREE.Fog(0xd0dce6, size.x * 0.8, size.x * 2.8);

        // Closer start
        const fovRad  = (42 / 2) * Math.PI / 180;
        const camDist = (size.x / 2) / Math.tan(fovRad) * 0.65;
        controls.target.set(center.x, 0, center.z);
        camera.position.set(
          center.x,
          camDist * 0.45,
          center.z + camDist * 0.7
        );
        camera.lookAt(new THREE.Vector3(center.x, 0, center.z));
        controls.minDistance = size.x * 0.02;
        controls.maxDistance = size.x * 2.5;
        controls.update();

        resolve({ center, size, box });
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

// ── Markers ──────────────────────────────────────────────────────
const LANDMARKS = [
  { name: 'Canary Wharf',      sub: 'View our Different Funds',            href: '/investments.html' },
  { name: 'The Shard',         sub: 'Latest Market News',    href: '/posts.html'       },
  { name: 'London Eye',        sub: 'How we Invest', href: '/methodology.html' },
  { name: 'London Bridge',     sub: 'Learning Portal',      href: '/education.html'   },
  { name: 'Houses of Parliament', sub: 'AI trading Bot', href: '/bot.html'         },
];

const LANDMARK_WORLD = [
  new THREE.Vector3( 5303,  173,  -761 ),   // Canary Wharf (+20)
  new THREE.Vector3(  758,  323,  -929 ),   // The Shard (+20)
  new THREE.Vector3(-1474,   90,  -859 ),   // London Eye (+20)
  new THREE.Vector3(  600,   80, -1000 ),   // London Bridge — PLACEHOLDER — adjust using click debugger!
  new THREE.Vector3(-1913,   56,  -369 ),   // Houses of Parliament (+20)
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

// ── Click‑to‑position debug tool ─────────────────────────────────
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
(async () => {
  try {
    await createSky();                // sky sphere loads first – no ground needed
  } catch (e) {
    console.warn('[london] sky texture not found – using fallback colour', e);
  }
  try {
    const { center } = await loadCity();
    buildMarkers(center);
    if (loaderEl) loaderEl.classList.add('done');
    resize();
    requestAnimationFrame(tick);
  } catch (err) {
    console.error('[london]', err);
    const label = loaderEl?.querySelector('.lon-load-label');
    if (label) label.textContent = 'Map unavailable — ' + err.message;
  }
})();
