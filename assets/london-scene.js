/* ================================================================
   London 3D scene — central London + Canary Wharf extruded from
   real OpenStreetMap footprints + heights.
   Gran-Turismo-style: dark scene, white edge lines, blue-glow
   landmarks, slow auto-rotate camera, HTML markers over buildings.
   ================================================================ */
import * as THREE from '/assets/three/three.module.min.js';
import { OrbitControls } from '/assets/three/OrbitControls.js';
import { mergeGeometries } from '/assets/three/BufferGeometryUtils.js';

const container   = document.getElementById('londonStage');
const labelsLayer = document.getElementById('londonLabels');
const loaderEl    = document.getElementById('londonLoader');
if (!container) { console.warn('[london] no #londonStage'); }

// ── Configuration ────────────────────────────────────────────────
const DATA_URL = '/data/london-buildings.json';

/* Landmark pins — lat/lng must match OSM data footprints.
   h = building height in metres (used to float marker above roof) */
const LANDMARKS = [
  { name: 'Canary Wharf',  sub: 'Funds',             href: '/investments.html', lat: 51.5054, lng: -0.0188, h: 235 },
  { name: 'The Shard',     sub: 'Market briefs',      href: '/posts.html',       lat: 51.5045, lng: -0.0865, h: 310 },
  { name: 'London Eye',    sub: 'Investment thesis',  href: '/methodology.html', lat: 51.5033, lng: -0.1196, h: 135 },
  { name: 'LSE',           sub: 'Learn — IMC',        href: '/education.html',   lat: 51.5144, lng: -0.1165, h: 60  },
  { name: 'Tower 42',      sub: 'AI day-trader',      href: '/bot.html',         lat: 51.5152, lng: -0.0826, h: 183 }
];

// Origin — overwritten once JSON loads (should match Python script)
let originLat = 51.505, originLng = -0.0675;
const EARTH_R = 6378137;

function lngLatToWorld(lng, lat) {
  /* Returns Three.js world (x, z) for a given lng/lat.
     Matches the Python lnglat_to_xy() formula exactly so markers
     sit on top of their buildings.
       worldX = east-positive metres from origin
       worldZ = north-positive metres from origin
                (python z is south-positive; we negate it here) */
  const x  = (lng - originLng) * Math.cos(originLat * Math.PI / 180) * (Math.PI / 180) * EARTH_R;
  const pz = -(lat - originLat) * (Math.PI / 180) * EARTH_R; // python: south-positive
  return { x, z: -pz };   // worldZ = north-positive
}

// ── Renderer ─────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = null;

// FOV 42, near 5, far 80 000
const camera = new THREE.PerspectiveCamera(42, 1, 5, 80000);

// Camera starts directly south of city centre, angled down — city
// X-centre ≈ 0, Z-centre ≈ 0 (confirmed from building data bounds).
camera.position.set(0, 6500, 11000);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// ── Controls ─────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping    = true;
controls.dampingFactor    = 0.06;
controls.minDistance      = 1800;
controls.maxDistance      = 22000;
controls.maxPolarAngle    = Math.PI * 0.47;
controls.minPolarAngle    = Math.PI * 0.10;
controls.target.set(0, 0, 0);          // city centre
controls.autoRotate       = true;
controls.autoRotateSpeed  = 0.30;
controls.enablePan        = false;
controls.update();

// ── Lighting + fog ───────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const sun = new THREE.DirectionalLight(0xa8c0ff, 0.55);
sun.position.set(1000, 5000, 2000);
scene.add(sun);

// Fog distances tuned for the new camera (initial distance ≈ 12 900 m)
scene.fog = new THREE.Fog(0x06080f, 12000, 32000);

// ── Ground plane ─────────────────────────────────────────────────
{
  const g = new THREE.PlaneGeometry(60000, 60000);
  g.rotateX(-Math.PI / 2);
  scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x080c18, transparent: true, opacity: 0.6 })));
}

// ── Resize ───────────────────────────────────────────────────────
function resize() {
  const w = container.clientWidth, h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
resize();
window.addEventListener('resize', resize, { passive: true });

// ── Build city from JSON ─────────────────────────────────────────
async function buildCity() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error('Failed to load ' + DATA_URL);
  const data = await res.json();

  if (data.origin) {
    originLat = data.origin.lat;
    originLng = data.origin.lng;
  }

  const buildingGeoms  = [];
  const landmarkGeoms  = [];
  const buildingEdges  = [];
  const landmarkEdges  = [];

  // Track bounds to auto-centre camera after load
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const b of data.buildings) {
    if (!b.p || b.p.length < 3) continue;

    const shape = new THREE.Shape();
    shape.moveTo(b.p[0][0], b.p[0][1]);
    for (let i = 1; i < b.p.length; i++) shape.lineTo(b.p[i][0], b.p[i][1]);

    const height = Math.max(b.h, 4);
    const geom   = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 1 });
    geom.rotateX(-Math.PI / 2);

    /* After rotateX(-π/2):
         worldX = b.p[][0]   (east-positive)
         worldZ = -b.p[][1]  (north-positive, python z is south-positive)  */
    for (const [px, pz] of b.p) {
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      const wz = -pz;
      if (wz < minZ) minZ = wz;
      if (wz > maxZ) maxZ = wz;
    }

    const edges = new THREE.EdgesGeometry(geom, 25);
    if (b.l) {
      landmarkGeoms.push(geom);
      landmarkEdges.push(edges);
    } else {
      buildingGeoms.push(geom);
      buildingEdges.push(edges);
    }
  }

  // ── Materials ────────────────────────────────────────────────
  const mFill  = new THREE.MeshLambertMaterial({ color: 0x0c1322, transparent: true, opacity: 0.9 });
  const mLmark = new THREE.MeshBasicMaterial  ({ color: 0x12224a, transparent: true, opacity: 0.95 });
  const mEdge  = new THREE.LineBasicMaterial  ({ color: 0xc0d4ff, transparent: true, opacity: 0.32 });
  const mGlow  = new THREE.LineBasicMaterial  ({ color: 0x66a3ff, transparent: true, opacity: 0.95 });

  if (buildingGeoms.length) {
    const m = mergeGeometries(buildingGeoms, false);
    if (m) scene.add(new THREE.Mesh(m, mFill));
  }
  if (buildingEdges.length) {
    const m = mergeGeometries(buildingEdges, false);
    if (m) scene.add(new THREE.LineSegments(m, mEdge));
  }
  if (landmarkGeoms.length) {
    const m = mergeGeometries(landmarkGeoms, false);
    if (m) scene.add(new THREE.Mesh(m, mLmark));
  }
  if (landmarkEdges.length) {
    const m = mergeGeometries(landmarkEdges, false);
    if (m) scene.add(new THREE.LineSegments(m, mGlow));
  }

  // ── Auto-centre camera on actual city bounds ──────────────────
  const cx   = (minX + maxX) / 2;   // ≈ -8 ≈ 0
  const cz   = (minZ + maxZ) / 2;   // ≈  5 ≈ 0
  const spanX = maxX - minX;         // ≈ 8852 m
  const spanZ = maxZ - minZ;         // ≈ 3559 m

  // Fit camera so the widest span fills ~80 % of horizontal FOV
  const fovHalf = (42 / 2) * (Math.PI / 180);
  const camDist = (Math.max(spanX, spanZ) / 2) / Math.tan(fovHalf) * 1.25;

  controls.target.set(cx, 0, cz);
  camera.position.set(cx, camDist * 0.55, cz + camDist * 0.90);
  camera.lookAt(cx, 0, cz);
  controls.minDistance = Math.max(spanX, spanZ) * 0.15;
  controls.maxDistance = Math.max(spanX, spanZ) * 2.8;
  controls.update();

  console.log('[london] built:', buildingGeoms.length, 'buildings,', landmarkGeoms.length, 'landmarks');
  console.log('[london] bounds X', minX.toFixed(0), '→', maxX.toFixed(0),
              '| Z', minZ.toFixed(0), '→', maxZ.toFixed(0),
              '| camera', camera.position.toArray().map(v => v.toFixed(0)));
}

// ── HTML marker pins ─────────────────────────────────────────────
const markerEls = [];

function buildMarkers() {
  for (const lm of LANDMARKS) {
    /* Use the same coordinate transform as the building footprints so
       the marker world position sits directly above the building roof. */
    const { x, z } = lngLatToWorld(lm.lng, lm.lat);
    const worldX = x;
    const worldY = lm.h + 45;    // 45 m above roof
    const worldZ = z;

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
    markerEls.push({ el: a, world: new THREE.Vector3(worldX, worldY, worldZ) });
  }
}

// ── Project markers to screen every frame ────────────────────────
const _proj = new THREE.Vector3();
function projectMarkers() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  for (const m of markerEls) {
    _proj.copy(m.world).project(camera);

    // Behind camera or outside far clip → hide
    if (_proj.z >= 1) {
      m.el.style.opacity = '0';
      m.el.style.pointerEvents = 'none';
      continue;
    }

    // Distance-based fade
    const dist = camera.position.distanceTo(m.world);
    const fade = Math.max(0, Math.min(1, 1 - (dist - 4000) / 16000));

    const sx = (_proj.x *  0.5 + 0.5) * w;
    const sy = (_proj.y * -0.5 + 0.5) * h;
    m.el.style.transform      = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-100%)`;
    m.el.style.opacity        = String(fade);
    m.el.style.pointerEvents  = fade > 0.35 ? 'auto' : 'none';
  }
}

// Pause auto-rotate on user interaction
controls.addEventListener('start', () => { controls.autoRotate = false; });

// ── Render loop ──────────────────────────────────────────────────
function tick() {
  controls.update();
  projectMarkers();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

// ── Boot ─────────────────────────────────────────────────────────
buildCity()
  .then(() => {
    buildMarkers();
    if (loaderEl) loaderEl.classList.add('done');
    resize();
    requestAnimationFrame(tick);
  })
  .catch(err => {
    console.error('[london]', err);
    if (loaderEl) {
      loaderEl.querySelector('video')?.pause();
      loaderEl.querySelector('.lon-load-label').textContent = 'Map unavailable — ' + err.message;
    }
  });
