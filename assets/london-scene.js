/* ================================================================
   London 3D scene — every building in central London + Canary Wharf,
   extruded from real OpenStreetMap footprints + heights.
   Gran-Turismo-style: dark scene, white edge lines, blue-glow landmarks,
   slow auto-rotate camera, HTML markers projected to 3D positions.
   ================================================================ */
import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'https://unpkg.com/three@0.165.0/examples/jsm/utils/BufferGeometryUtils.js';

const container   = document.getElementById('londonStage');
const labelsLayer = document.getElementById('londonLabels');
const loaderEl    = document.getElementById('londonLoader');
if (!container) { console.warn('[london] no #londonStage'); }

// ── Configuration ────────────────────────────────────────────────
const DATA_URL = '/data/london-buildings.json';
const LANDMARKS = [
  { name: 'Canary Wharf',  sub: 'Funds',                href: '/investments.html', lat: 51.5054, lng: -0.0188, h: 235 },
  { name: 'The Shard',     sub: 'Market briefs',        href: '/posts.html',       lat: 51.5045, lng: -0.0865, h: 310 },
  { name: 'London Eye',    sub: 'Investment thesis',    href: '/methodology.html', lat: 51.5033, lng: -0.1196, h: 135 },
  { name: 'LSE',           sub: 'Learn — IMC',          href: '/education.html',   lat: 51.5144, lng: -0.1165, h: 60  },
  { name: 'Tower 42',      sub: 'AI day-trader',        href: '/bot.html',         lat: 51.5152, lng: -0.0826, h: 183 }
];

let originLat = 51.505, originLng = -0.0675;     // overwritten when JSON loads
const EARTH_R = 6378137;
function lngLatToXZ(lng, lat) {
  const x = (lng - originLng) * Math.cos(originLat * Math.PI / 180) * Math.PI / 180 * EARTH_R;
  const z = -(lat - originLat) * Math.PI / 180 * EARTH_R; // shape coord (south positive)
  return { x, z };
}

// ── Renderer + scene ─────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = null; // transparent — body bg shows through

const camera = new THREE.PerspectiveCamera(40, 1, 5, 60000);
camera.position.set(2200, 4200, 5500);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance   = 1500;
controls.maxDistance   = 12000;
controls.maxPolarAngle = Math.PI * 0.46;       // don't let users go below horizon
controls.minPolarAngle = Math.PI * 0.18;
controls.target.set(0, 0, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.35;               // very slow
controls.enablePan = false;

// Subtle lighting for GT look — most "lighting" is in the edge lines themselves
scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const sun = new THREE.DirectionalLight(0xa8c0ff, 0.55);
sun.position.set(1000, 5000, 2000);
scene.add(sun);

// Distance fog — fades far buildings into the dark background, adds depth
scene.fog = new THREE.Fog(0x06080f, 6000, 22000);

// ── Ground plane (subtle dark, just to ground the scene) ────────
{
  const g = new THREE.PlaneGeometry(40000, 40000);
  g.rotateX(-Math.PI / 2);
  const m = new THREE.MeshBasicMaterial({ color: 0x080c18, transparent: true, opacity: 0.6 });
  scene.add(new THREE.Mesh(g, m));
}

// ── Resize handling ─────────────────────────────────────────────
function resize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
resize();
window.addEventListener('resize', resize, { passive: true });

// ── Load building data + build merged meshes ───────────────────
async function buildCity() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error('Failed to load ' + DATA_URL);
  const data = await res.json();
  if (data.origin) {
    originLat = data.origin.lat;
    originLng = data.origin.lng;
  }

  const buildingGeoms = [];
  const landmarkGeoms = [];
  const buildingEdgesGeoms = [];
  const landmarkEdgesGeoms = [];

  for (const b of data.buildings) {
    if (!b.p || b.p.length < 3) continue;
    const shape = new THREE.Shape();
    shape.moveTo(b.p[0][0], b.p[0][1]);
    for (let i = 1; i < b.p.length; i++) shape.lineTo(b.p[i][0], b.p[i][1]);

    const height = Math.max(b.h, 4);
    const geom = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 1 });
    geom.rotateX(-Math.PI / 2);

    const edges = new THREE.EdgesGeometry(geom, 25);

    if (b.l) {
      landmarkGeoms.push(geom);
      landmarkEdgesGeoms.push(edges);
    } else {
      buildingGeoms.push(geom);
      buildingEdgesGeoms.push(edges);
    }
  }

  // Merge for performance — 4 draw calls instead of ~17,000
  const fillMatNormal   = new THREE.MeshLambertMaterial({ color: 0x0c1322, transparent: true, opacity: 0.9 });
  const fillMatLandmark = new THREE.MeshBasicMaterial   ({ color: 0x12224a, transparent: true, opacity: 0.95 });
  const edgeMatNormal   = new THREE.LineBasicMaterial   ({ color: 0xc0d4ff, transparent: true, opacity: 0.32 });
  const edgeMatLandmark = new THREE.LineBasicMaterial   ({ color: 0x66a3ff, transparent: true, opacity: 0.95 });

  if (buildingGeoms.length) {
    const merged = mergeGeometries(buildingGeoms, false);
    if (merged) scene.add(new THREE.Mesh(merged, fillMatNormal));
  }
  if (buildingEdgesGeoms.length) {
    const merged = mergeGeometries(buildingEdgesGeoms, false);
    if (merged) scene.add(new THREE.LineSegments(merged, edgeMatNormal));
  }
  if (landmarkGeoms.length) {
    const merged = mergeGeometries(landmarkGeoms, false);
    if (merged) scene.add(new THREE.Mesh(merged, fillMatLandmark));
  }
  if (landmarkEdgesGeoms.length) {
    const merged = mergeGeometries(landmarkEdgesGeoms, false);
    if (merged) scene.add(new THREE.LineSegments(merged, edgeMatLandmark));
  }

  console.log('[london] built city:',
              buildingGeoms.length, 'buildings,',
              landmarkGeoms.length, 'landmarks');
}

// ── HTML markers projected to 3D positions every frame ─────────
const markerEls = [];
function buildMarkers() {
  for (const lm of LANDMARKS) {
    const { x, z } = lngLatToXZ(lm.lng, lm.lat);
    // Three.js world coord: world Z = -shape Y
    const worldX = x;
    const worldY = lm.h + 40;          // float above building
    const worldZ = -z;                 // flip to world

    const a = document.createElement('a');
    a.className = 'london-marker';
    a.href = lm.href;
    a.innerHTML = `
      <span class="lm-pin">
        <span class="lm-dot"></span>
      </span>
      <span class="lm-card">
        <span class="lm-eyebrow">${lm.name}</span>
        <span class="lm-title">${lm.sub}</span>
        <span class="lm-arrow">Open →</span>
      </span>
    `;
    labelsLayer.appendChild(a);
    markerEls.push({ el: a, world: new THREE.Vector3(worldX, worldY, worldZ) });
  }
}

const proj = new THREE.Vector3();
function projectMarkers() {
  const w = container.clientWidth, h = container.clientHeight;
  const camPos = camera.position;
  for (const m of markerEls) {
    proj.copy(m.world);
    // Distance scaling — far markers get a bit smaller / fade
    const dist = camPos.distanceTo(m.world);
    const fade = Math.max(0, Math.min(1, 1 - (dist - 4000) / 12000));
    proj.project(camera);
    if (proj.z > 1) {
      m.el.style.opacity = '0';
      m.el.style.pointerEvents = 'none';
      continue;
    }
    const x = (proj.x * 0.5 + 0.5) * w;
    const y = (-proj.y * 0.5 + 0.5) * h;
    m.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
    m.el.style.opacity = String(fade);
    m.el.style.pointerEvents = fade > 0.4 ? 'auto' : 'none';
  }
}

// Pause auto-rotate when user interacts
controls.addEventListener('start', () => { controls.autoRotate = false; });
// Don't re-enable — once the user drives, they're driving

// ── Render loop ─────────────────────────────────────────────────
function tick() {
  controls.update();
  projectMarkers();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

// ── Boot ────────────────────────────────────────────────────────
buildCity()
  .then(() => {
    buildMarkers();
    if (loaderEl) loaderEl.classList.add('done');
    resize();
    requestAnimationFrame(tick);
  })
  .catch(err => {
    console.error('[london]', err);
    if (loaderEl) loaderEl.textContent = 'Map unavailable. ' + err.message;
  });
