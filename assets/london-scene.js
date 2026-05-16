/* ================================================================
   London 3D scene — Google Earth style controls.
   Left drag = rotate · Right drag = pan · Scroll = zoom.
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

const camera = new THREE.PerspectiveCamera(45, 1, 10, 80000);

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
        const skyGeo = new THREE.SphereGeometry(5000, 64, 32);
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
let modelCenter = new THREE.Vector3();

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
        modelCenter = center;
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

// ── Google Earth style controls (OrbitControls) ───────────────────
let controls;

function initControls(center) {
  controls = new OrbitControls(camera, renderer.domElement);
  // Google Earth standard behaviour
  controls.enableDamping = true;          // smooth inertia
  controls.dampingFactor = 0.05;
  controls.rotateSpeed   = 0.8;
  controls.zoomSpeed     = 1.2;
  controls.panSpeed      = 0.8;
  controls.screenSpacePanning = true;     // pan stays flat, doesn't tilt
  controls.maxPolarAngle = Math.PI / 2.2;  // prevent going under ground
  controls.minDistance    = 200;
  controls.maxDistance    = 15000;
  controls.target.copy(center);

  // Start position: elevated view looking at centre
  camera.position.set(center.x + 4000, 2000, center.z + 4000);
  controls.update();
}

// ── Tether lines (from markers to ground) ────────────────────────
function buildTethers(landmarks) {
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  for (const lm of landmarks) {
    const points = [
      lm.world.clone(),
      new THREE.Vector3(lm.world.x, 0, lm.world.z),
    ];
    const geo  = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo, mat);
    scene.add(line);
  }
}

// ── Landmark definitions (UPDATED London Eye coordinates) ─────────
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
    world: new THREE.Vector3(-1473, 280, -860),   // ← updated coordinates
  },
  {
    name:  'London Bridge',
    sub:   'Education',
    desc:  'Learn markets, investing & financial concepts.',
    href:  '/education.html',
    img:   '/assets/images/london-skyline.jpg',
    world: new THREE.Vector3( 1526, 280, -1046),
  },
  {
    name:  'Houses of Parliament',
    sub:   'AI Day-Trader',
    desc:  'Autonomous algorithmic trading — live signals.',
    href:  '/bot.html',
    img:   '/assets/images/the-shard.jpg',
    world: new THREE.Vector3(-1913, 280, -369),
  },
];

// ── HTML card markers ─────────────────────────────────────────────
const markerEls = [];

function buildMarkers() {
  LANDMARKS.forEach((lm) => {
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
    if (_proj.z >= 1) {
      m.el.style.opacity = '0';
      m.el.style.pointerEvents = 'none';
      continue;
    }
    const dist = camera.position.distanceTo(m.world);
    const fade = 1 - Math.max(0, Math.min(1, (dist - FAR_FADE_START) / (FAR_FADE_END - FAR_FADE_START)));
    const sx = (_proj.x *  0.5 + 0.5) * w;
    const sy = (_proj.y * -0.5 + 0.5) * h;
    m.el.style.transform     = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-100%)`;
    m.el.style.opacity       = String(fade);
    m.el.style.pointerEvents = fade > 0.2 ? 'auto' : 'none';
  }
}

// ── Right‑click debug tool (prints world coordinates) ────────────
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
function tick() {
  if (controls) controls.update();
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
    const { center } = await loadCity();
    initControls(center);
    buildTethers(LANDMARKS);
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
