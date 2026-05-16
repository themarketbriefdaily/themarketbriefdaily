/* ================================================================
   London 3D scene — Google Earth style controls.
   Left drag = rotate · Right drag / two-finger = pan · Scroll = zoom
   Starting position: x=-2274  y=80  z=-384
   FOV: 58°  ·  No ground clipping  ·  Tight zoom limits
   Curated colours: Portland stone · Thames teal · London sage
   ================================================================ */
import * as THREE        from '/assets/three/three.module.min.js';
import { OrbitControls } from '/assets/three/OrbitControls.js';
import { GLTFLoader }    from '/assets/three/GLTFLoader.js';

const container   = document.getElementById('londonStage');
const labelsLayer = document.getElementById('londonLabels');
const loaderEl    = document.getElementById('londonLoader');
if (!container) { console.warn('[london] no #londonStage'); }

// ── Renderer ─────────────────────────────────────────────────────
const scene = new THREE.Scene();

// FOV 58° — wider than before (was 45°), gives a stronger sense of depth
const camera = new THREE.PerspectiveCamera(58, 1, 5, 30000);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false;

// Fallback colour — matches sky horizon, prevents any flash
renderer.setClearColor(0x8ab4c8, 1);
renderer.domElement.style.backgroundColor = '#8ab4c8';
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

// ── Lighting — warm golden-hour ───────────────────────────────────
scene.add(new THREE.AmbientLight(0xfff4e0, 1.0));       // warm white fill
const sun = new THREE.DirectionalLight(0xffe8b0, 0.9);  // golden sunlight
sun.position.set(3, 6, 2);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xc8deff, 0.35); // cool sky bounce
fill.position.set(-3, 2, -3);
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

// ── Sky sphere ────────────────────────────────────────────────────
async function createSky() {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load('/assets/sky.jpg',
      (texture) => {
        const skyGeo = new THREE.SphereGeometry(25000, 64, 64);
        const skyMat = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide,
          fog: false
        });
        scene.add(new THREE.Mesh(skyGeo, skyMat));
        resolve();
      }, undefined, reject
    );
  });
}

// ── Curated colour palette ────────────────────────────────────────
//
//  Buildings : Portland stone — warm cream, the real colour of London architecture
//  Water     : Thames deep teal — rich and distinctly river-like
//  Green     : London sage — parks under overcast sky, muted and natural
//  Roads     : warm stone — slightly cream, not cold grey
//  Edges     : warm sand tones — complement the building colour
//  Fog       : horizon haze matching the sky base colour

const matBuilding  = new THREE.MeshLambertMaterial({ color: 0xf0e8d8 }); // Portland stone
const matWater     = new THREE.MeshLambertMaterial({ color: 0x3d6e8a }); // Thames deep teal
const matGreen     = new THREE.MeshLambertMaterial({ color: 0x7a9e6e }); // London park sage
const matRoad      = new THREE.MeshLambertMaterial({ color: 0xd8d0c0 }); // warm stone road
const matEdgeGlow  = new THREE.LineBasicMaterial({ color: 0xc8b89a, transparent: true, opacity: 0.40 });
const matEdgeFaint = new THREE.LineBasicMaterial({ color: 0xd4c8b0, transparent: true, opacity: 0.20 });

const FOG_COLOUR = 0x8ab4c8; // soft blue-grey horizon haze

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
          child.material      = materialForMesh(child.name);
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
        modelCenter.copy(center);

        console.log('[london] center x=' + center.x.toFixed(1) + ' y=' + center.y.toFixed(1) + ' z=' + center.z.toFixed(1));
        console.log('[london] size   x=' + size.x.toFixed(1)   + ' y=' + size.y.toFixed(1)   + ' z=' + size.z.toFixed(1));

        // Fog — starts at 50% of city width, fully opaque at 180%
        // Colour exactly matches the sky horizon for seamless blending
        scene.fog = new THREE.Fog(FOG_COLOUR, size.x * 0.5, size.x * 1.8);
        renderer.setClearColor(FOG_COLOUR, 1);

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

// ── Google Earth Controls ─────────────────────────────────────────
//
//  Left drag         = orbit (rotate around target)
//  Right drag        = pan (slide the ground, target moves)
//  Two-finger drag   = pan on touch
//  Scroll / pinch    = zoom
//  Double-click      = zoom in and re-centre on that point
//
//  maxPolarAngle = 84.6° — camera stays above ground.
//  minDistance   = 150   — can't fly into buildings.
//  maxDistance   = 6000  — world feels large, not infinite.

let controls;
const _ray = new THREE.Raycaster();

function initControls(center) {
  controls = new OrbitControls(camera, renderer.domElement);

  controls.enableDamping      = true;
  controls.dampingFactor      = 0.08;
  controls.rotateSpeed        = 0.65;
  controls.zoomSpeed          = 1.1;
  controls.panSpeed           = 0.7;
  controls.screenSpacePanning = false;  // pan slides along the ground plane

  // ── Zoom limits ─────────────────────────────────────────────────
  controls.minDistance = 150;    // ~2 storeys — can get close to buildings
  controls.maxDistance = 6000;   // tight ceiling — city stays prominent

  // ── Angle limits — NO underground clipping ──────────────────────
  controls.minPolarAngle = 0.04;              // nearly top-down
  controls.maxPolarAngle = Math.PI * 0.47;    // ≈84.6° — nearly flat, never below horizon

  // ── Start position (exact coords) ──────────────────────────────
  camera.position.set(-2274, 80, -384);
  // Target: a point in the city slightly ahead so the view looks inward
  controls.target.set(-1600, 0, -600);
  controls.update();

  // ── Double-click zoom to point ──────────────────────────────────
  renderer.domElement.addEventListener('dblclick', (e) => {
    const r  = container.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width)  *  2 - 1;
    const my = ((e.clientY - r.top)  / r.height) * -2 + 1;
    _ray.setFromCamera(new THREE.Vector2(mx, my), camera);
    const hits = _ray.intersectObjects(scene.children, true);
    if (hits.length) {
      const p      = hits[0].point;
      const dir    = camera.position.clone().sub(p).normalize();
      const newDist = Math.max(controls.minDistance, camera.position.distanceTo(p) * 0.45);
      controls.target.copy(p);
      camera.position.copy(p).addScaledVector(dir, newDist);
      controls.update();
    }
  });
}

// ── Ground clamp — prevents camera going below y=20 ──────────────
// Called every frame after controls.update()
function clampCameraToGround() {
  const MIN_Y = 20;
  if (camera.position.y < MIN_Y) {
    camera.position.y = MIN_Y;
  }
  if (controls && controls.target.y < 0) {
    controls.target.y = 0;
  }
}

// ── Tether lines (landmark → ground) ─────────────────────────────
function buildTethers(landmarks) {
  const mat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6
  });
  for (const lm of landmarks) {
    const pts = [
      lm.world.clone(),
      new THREE.Vector3(lm.world.x, 0, lm.world.z),
    ];
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
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
    world: new THREE.Vector3(-1473, 280, -860),
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
    img:   '/assets/images/houses-of-parliament.jpg',
    world: new THREE.Vector3(-1913, 280, -369),
  },
];

// ── HTML card markers ─────────────────────────────────────────────
const markerEls = [];

function buildMarkers() {
  LANDMARKS.forEach((lm) => {
    const a      = document.createElement('a');
    a.className  = 'london-marker';
    a.href       = lm.href;
    a.innerHTML  = `
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
const _proj         = new THREE.Vector3();
const FAR_FADE_START = 2500;
const FAR_FADE_END   = 5500;

function projectMarkers() {
  const w = container.clientWidth, h = container.clientHeight;
  for (const m of markerEls) {
    _proj.copy(m.world).project(camera);
    if (_proj.z >= 1) {
      m.el.style.opacity       = '0';
      m.el.style.pointerEvents = 'none';
      continue;
    }
    const dist = camera.position.distanceTo(m.world);
    const fade = 1 - Math.max(0, Math.min(1, (dist - FAR_FADE_START) / (FAR_FADE_END - FAR_FADE_START)));
    const sx   = (_proj.x *  0.5 + 0.5) * w;
    const sy   = (_proj.y * -0.5 + 0.5) * h;
    m.el.style.transform     = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-100%)`;
    m.el.style.opacity       = String(fade);
    m.el.style.pointerEvents = fade > 0.2 ? 'auto' : 'none';
  }
}

// ── Right-click: world coordinate logger (dev tool) ───────────────
renderer.domElement.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const r  = container.getBoundingClientRect();
  const mx = ((e.clientX - r.left) / r.width)  *  2 - 1;
  const my = ((e.clientY - r.top)  / r.height) * -2 + 1;
  _ray.setFromCamera(new THREE.Vector2(mx, my), camera);
  const hits = _ray.intersectObjects(scene.children, true);
  if (hits.length) {
    const p = hits[0].point;
    console.log('[click] x=' + p.x.toFixed(0) + '  y=' + p.y.toFixed(0) + '  z=' + p.z.toFixed(0));
  }
});

// ── Render loop ───────────────────────────────────────────────────
function tick() {
  if (controls) {
    controls.update();
    clampCameraToGround();
  }
  projectMarkers();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

// ── Boot ──────────────────────────────────────────────────────────
(async () => {
  try {
    await createSky();
  } catch (e) {
    console.warn('[london] sky texture failed — using fallback colour', e);
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
