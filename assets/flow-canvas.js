/* FlowFX v2 — dense deep-field neural-net view of the investigation flow.
   Core layers: 4 sources × 10 = 40 → Evidence 10 → Analysts 4 → Bull 10 →
   Bear 10 → Trader 10 → Risk 4 → Manager 1 (89 main nodes), plus ~260 minor
   satellite / bridge / deep-field nodes on ~650 shimmering curved links.
   Between every pair of connected nodes a light dwells and pulses for about
   a minute before moving into the next node — resident link pulses traverse
   each link in ~50-70s, and multi-hop information packets take ~a minute per
   hop, pulsing the whole way. On top of that, fast directional light beams
   (~1s per link) stream continuously from left to right along the spine and
   bridge filaments — a rolling crowd of staggered streaks always crossing
   the web toward the manager. Stage changes emit an expanding shockwave that
   lights up links and nodes as it passes.
   Mounts into [data-flow-net] produced by components.js; purely decorative. */
(() => {
'use strict';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
let explicitMotion = false;
const reducedMotion = () => !explicitMotion && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* seeded RNG so the network shape is stable across renders */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* layer x-fractions — must match the stage-button positions in components.js */
const LAYER_FX = [0.045, 0.20, 0.345, 0.485, 0.615, 0.745, 0.865, 0.965];
const LAYERS = [
  { key: 'sources', n: 40 },
  { key: 'evidence', n: 10 },
  { key: 'analysts', n: 4 },
  { key: 'bull', n: 10 },
  { key: 'bear', n: 10 },
  { key: 'trader', n: 10 },
  { key: 'risk', n: 4 },
  { key: 'manager', n: 1 }
];
const SRC_TINTS = [[91, 201, 255], [125, 167, 255], [180, 140, 255], [255, 199, 138]];
const LAYER_TINTS = [
  null, [159, 220, 255], [130, 200, 255], [53, 212, 146], [255, 125, 146],
  [183, 143, 255], [255, 171, 94], [255, 217, 138]
];
const NODE_R = [2.1, 2.6, 4.2, 2.6, 2.6, 2.6, 4.2, 5.6];

/* ---------- pre-rendered sprites ---------- */
function makeGlow(r, g, b) {
  const s = 64, c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d'), gr = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.16, `rgba(${r},${g},${b},0.92)`);
  gr.addColorStop(0.42, `rgba(${r},${g},${b},0.32)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr;
  x.fillRect(0, 0, s, s);
  return c;
}
function makeBlob(r, g, b) {
  const s = 256, c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d'), gr = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, `rgba(${r},${g},${b},0.55)`);
  gr.addColorStop(0.55, `rgba(${r},${g},${b},0.16)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr;
  x.fillRect(0, 0, s, s);
  return c;
}
const SPRITES = LAYER_TINTS.map(t => (t ? makeGlow(t[0], t[1], t[2]) : null));
const SRC_SPRITES = SRC_TINTS.map(t => makeGlow(t[0], t[1], t[2]));
const FOG = [makeBlob(64, 150, 255), makeBlob(150, 110, 255), makeBlob(255, 170, 110)];
const rgba = (tint, a) => `rgba(${tint[0]},${tint[1]},${tint[2]},${a})`;

/* ---------- engines ---------- */
const engines = new Set();

function createEngine(container) {
  const canvas = container.querySelector('canvas.ai-flow-net-canvas');
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');

  /* deterministic build */
  const R = mulberry32(20261018);
  const srnd = (a, b) => a + R() * (b - a);

  const nodes = [];
  const links = [];
  const next = [];
  const layerStart = [];
  const addNode = o => { o.idx = nodes.length; nodes.push(o); next.push([]); return o.idx; };

  /* ----- 89 main nodes ----- */
  LAYERS.forEach((L, li) => {
    layerStart.push(nodes.length);
    for (let i = 0; i < L.n; i++) {
      if (li === 0) { /* 4 source groups, 2×5 clusters */
        const g = Math.floor(i / 10), k = i % 10;
        const col = k % 2, row = Math.floor(k / 2);
        const fx = LAYER_FX[0] + (col === 0 ? -0.013 : 0.013);
        const fy = 0.08 + g * 0.198 + row * 0.032 + srnd(-0.005, 0.005);
        addNode({ layer: 0, group: g, fx, fy, r: NODE_R[0], tint: SRC_TINTS[g], sp: SRC_SPRITES[g], ph: R() * 6.28, main: true, pulse: 0 });
        continue;
      }
      const spread = L.n === 1 ? [0.44] : Array.from({ length: L.n }, (_, i2) => 0.07 + (i2 / (L.n - 1)) * 0.73);
      addNode({
        layer: li, group: -1, fx: LAYER_FX[li],
        fy: spread[i] + (L.n === 1 ? 0 : srnd(-0.012, 0.012)),
        r: NODE_R[li], tint: LAYER_TINTS[li], sp: SPRITES[li], ph: R() * 6.28, main: true, pulse: 0
      });
    }
  });
  const layerEnd = layerStart.map((s, li) => s + LAYERS[li].n);
  const mainEnd = layerEnd[7];

  /* ----- link factory ----- */
  function addLink(a, b, kind) { /* kind: 0 hier, 1 lateral, 2 minor */
    const B = nodes[b];
    const strength = kind === 0 ? srnd(0.72, 1) : kind === 1 ? srnd(0.42, 0.68) : srnd(0.3, 0.55);
    const flowRoll = R();
    const ph = R() * 6.28;
    const lk = {
      a, b, col: B.tint || nodes[a].tint, strength,
      bend: srnd(-13, 13), jx: srnd(-8, 8), jy: srnd(-10, 10),
      ph,
      flow: kind === 0 || (kind === 1 ? flowRoll < 0.62 : flowRoll < 0.5),
      flowDur: srnd(46, 74), flowPh: R(), flowRoll,
      /* beam fields derived from existing random values (no extra RNG draws,
         so the network shape stays byte-identical to the previous build) */
      beamPh: (ph * 0.15915) % 1, beamCycle: 5.4 + strength * 3.2,
      beam: false, len: 0,
      hier: kind === 0, cx: 0, cy: 0
    };
    links.push(lk);
    if (kind === 0) next[a].push({ b, lk });
    return lk;
  }
  const nearestMains = (s, e, fy, k) =>
    Array.from({ length: e - s }, (_, i) => s + i).sort((p, q) => Math.abs(nodes[p].fy - fy) - Math.abs(nodes[q].fy - fy)).slice(0, k);

  /* ----- minor nodes: satellites around every main ----- */
  for (let li = 0; li < LAYERS.length; li++) {
    const satN = LAYERS[li].n === 1 ? 4 : 2;
    for (let i = layerStart[li]; i < layerEnd[li]; i++) {
      const m = nodes[i];
      for (let s2 = 0; s2 < satN; s2++) {
        const ang = R() * 6.2832, rad = li === 0 ? srnd(0.010, 0.021) : srnd(0.008, 0.016);
        const idx = addNode({
          layer: li, group: m.group,
          fx: clamp(m.fx + Math.cos(ang) * rad * 0.62, 0.012, 0.988),
          fy: clamp(m.fy + Math.sin(ang) * rad * 1.65, 0.03, 0.88),
          r: srnd(0.9, 1.5), tint: m.tint, sp: m.sp, ph: R() * 6.28, main: false, pulse: 0
        });
        addLink(i, idx, 2);
      }
    }
  }

  /* ----- bridge minors weaving between adjacent layers ----- */
  for (let li = 0; li < LAYERS.length - 1; li++) {
    for (let b2 = 0; b2 < 7; b2++) {
      const fx = LAYER_FX[li] + (LAYER_FX[li + 1] - LAYER_FX[li]) * srnd(0.32, 0.68) + srnd(-0.007, 0.007);
      const fy = srnd(0.08, 0.84);
      const idx = addNode({
        layer: li + 1, group: -1, fx, fy, r: srnd(0.85, 1.35),
        tint: LAYER_TINTS[li + 1], sp: SPRITES[li + 1], ph: R() * 6.28, main: false, pulse: 0
      });
      for (const a of nearestMains(layerStart[li], layerEnd[li], fy, R() < 0.4 ? 2 : 1)) addLink(a, idx, 2);
      for (const b of nearestMains(layerStart[li + 1], layerEnd[li + 1], fy, 1)) addLink(idx, b, 2);
    }
  }

  /* ----- deep-field ambient minors ----- */
  for (let a2 = 0; a2 < 30; a2++) {
    const fx = srnd(0.02, 0.985), fy = srnd(0.05, 0.86);
    const li = (R() * 7) | 0;
    const tint = li === 0 ? SRC_TINTS[(R() * 4) | 0] : LAYER_TINTS[li];
    const idx = addNode({
      layer: li, group: -1, fx, fy, r: srnd(0.7, 1.2),
      tint, sp: SPRITES[li] || SRC_SPRITES[0], ph: R() * 6.28, main: false, pulse: 0
    });
    /* link to the nearest main node */
    let best = mainEnd > 0 ? 0 : -1, bd = 9;
    for (let i = 0; i < mainEnd; i++) {
      const d = Math.abs(nodes[i].fy - fy) + Math.abs(nodes[i].fx - fx) * 0.6;
      if (d < bd) { bd = d; best = i; }
    }
    if (best >= 0) addLink(best, idx, 2);
  }

  /* ----- minor ↔ minor filaments ----- */
  for (let i = mainEnd; i < nodes.length; i++) {
    if (R() > 0.5) continue;
    let best = -1, bd = 0.075;
    for (let j = mainEnd; j < nodes.length; j++) {
      if (j === i) continue;
      const d = Math.hypot(nodes[i].fx - nodes[j].fx, nodes[i].fy - nodes[j].fy);
      if (d < bd) { bd = d; best = j; }
    }
    if (best >= 0) addLink(i, best, 2);
  }

  /* ----- lateral rings inside each layer (guide-style ring connections) ----- */
  for (let li = 0; li < LAYERS.length; li++) {
    if (LAYERS[li].n < 2) continue;
    const idxs = Array.from({ length: layerEnd[li] - layerStart[li] }, (_, i) => layerStart[li] + i)
      .sort((p, q) => nodes[p].fy - nodes[q].fy);
    for (let k = 0; k < idxs.length - 1; k++) {
      addLink(idxs[k], idxs[k + 1], 1);
      if (R() < 0.12 && k + 2 < idxs.length) addLink(idxs[k], idxs[k + 2], 1);
    }
  }

  /* ----- hierarchical main links (the information spine) -----
     Full bipartite mesh: every node in each layer connects to EVERY node in
     the next layer (e.g. all 10 evidence nodes feed all 4 analysts, all 10
     bull nodes feed all 10 bear nodes), so each hand-off segment is a
     complete neural cross-bar with no missing pathways. */
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const a0 = layerStart[li], aN = LAYERS[li].n;
    const b0 = layerStart[li + 1], bN = LAYERS[li + 1].n;
    for (let i = 0; i < aN; i++) {
      for (let j = 0; j < bN; j++) addLink(a0 + i, b0 + j, 0);
    }
  }

  /* per-segment pulse budget (see drawScene): huge segments sample their
     dwelling light, everything else stays at full coverage */
  for (const lk of links) {
    if (!lk.hier) { lk.pg = 0.85; continue; }
    const bl = nodes[lk.b].layer;
    lk.pg = LAYERS[bl - 1].n * LAYERS[bl].n > 150 ? 0.55 : 1;
  }

  /* ----- directional light beams: eligibility -----
     Beams ride only links that physically travel left→right (the bipartite
     spine + cross-layer bridge filaments + qualifying deep-field links);
     lateral rings and tight satellite twinkle links stay beam-free. */
  let beamElig = 0;
  for (const lk of links) {
    lk.beam = lk.hier || nodes[lk.b].fx - nodes[lk.a].fx > 0.03;
    if (lk.beam) beamElig++;
  }
  /* concurrent-beam target at density 1 (~90-120 visible streaks) */
  const beamVisBase = 120 / beamElig;

  /* ----- starfield + nebula fog ----- */
  const stars = Array.from({ length: 150 }, () => ({ fx: R(), fy: R(), ph: R() * 6.28, hz: R() * 1.4 + 0.4, s: R() * 0.9 + 0.5 }));
  const fog = Array.from({ length: 7 }, (_, i) => ({
    fx: R(), fy: R() * 0.8 + 0.1, sp: FOG[i % 3], s: srnd(150, 320), ph: R() * 6.28, dx: srnd(9, 22), a: srnd(0.045, 0.085)
  }));

  const S = { w: 0, h: 0, visible: true, stage: 0, paused: false, static: false, density: 1, t: 4.2, bt: 4.2, dirty: true };
  const packets = [];
  const waves = [];
  const flashes = [];
  const rings = [];
  let spawnCd = 0, lastNow = 0, lastDT = 1 / 60, raf = 0;
  const t0 = performance.now();

  function layout() {
    const rect = container.getBoundingClientRect();
    if (!rect.width) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    /* the scene is entirely soft glow (gradient sprites, translucent hairlines),
       so rendering at 0.8x resolution and letting CSS upscale is invisible —
       and it cuts the full-mesh raster cost by ~36% */
    const q = 0.8 * dpr;
    S.w = rect.width; S.h = rect.height;
    S.density = clamp((S.w * S.h) / 520000, 0.5, 1);
    canvas.width = Math.max(1, Math.round(S.w * q));
    canvas.height = Math.max(1, Math.round(S.h * q));
    ctx.setTransform(q, 0, 0, q, 0, 0);
    for (const n of nodes) { n.x = n.fx * S.w; n.y = n.fy * S.h; }
    for (const lk of links) {
      const A = nodes[lk.a], B = nodes[lk.b];
      const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
      const ba = lk.bend * clamp(len / 280, 0.45, 1.5);
      lk.cx = (A.x + B.x) / 2 - (dy / len) * ba + lk.jx * 0.4;
      lk.cy = (A.y + B.y) / 2 + (dx / len) * ba + lk.jy * 0.4;
      lk.len = len;
    }
    S.dirty = true;
  }

  const activeLayer = () => S.stage + 1;

  function buildPath(startLayer) {
    let idx = layerStart[startLayer] + ((R() * LAYERS[startLayer].n) | 0);
    const path = [idx];
    for (let L = startLayer; L < LAYERS.length - 1; L++) {
      const outs = next[idx];
      if (!outs.length) break;
      idx = outs[(R() * outs.length) | 0].b;
      path.push(idx);
    }
    return path;
  }

  function spawnPacket(warm) {
    const al = activeLayer();
    const startLayer = al > 0 && Math.random() < 0.45 ? al - 1 : 0;
    const path = buildPath(startLayer);
    if (path.length < 2) return;
    packets.push({
      path,
      seg: warm ? (R() * (path.length - 1)) | 0 : 0,
      t: warm ? R() : 0,
      dur: srnd(52, 68),            /* ~a minute of pulsing light per hop */
      sp: nodes[path[0]].sp,
      col: nodes[path[0]].tint,
      ph: R() * 6.28, hz: srnd(1.5, 2.8)
    });
  }

  /* pre-warm the web so light is already flowing everywhere on first paint */
  function prewarm() {
    const cap = Math.round(64 * S.density);
    for (let i = 0; i < cap; i++) spawnPacket(true);
  }

  const qb = (A, B, lk, u) => {
    const m = 1 - u;
    return [m * m * A.x + 2 * m * u * lk.cx + u * u * B.x,
            m * m * A.y + 2 * m * u * lk.cy + u * u * B.y];
  };

  function drawScene(t, dt, dtJ) {
    ctx.clearRect(0, 0, S.w, S.h);
    const al = activeLayer(), dens = S.density;
    S.bt += dtJ; /* beam clock: freezes on pause / static repaints */
    ctx.globalCompositeOperation = 'lighter';

    /* nebula fog */
    for (const f of fog) {
      const x = f.fx * S.w + Math.sin(t * 0.03 + f.ph) * f.dx, y = f.fy * S.h + Math.cos(t * 0.024 + f.ph) * f.dx * 0.6;
      ctx.globalAlpha = f.a;
      ctx.drawImage(f.sp, x - f.s / 2, y - f.s / 2, f.s, f.s);
    }

    /* starfield */
    for (const st of stars) {
      ctx.globalAlpha = 0.14 + 0.22 * (0.5 + 0.5 * Math.sin(t * st.hz + st.ph));
      ctx.fillStyle = '#cfe2ff';
      ctx.fillRect(st.fx * S.w, st.fy * S.h, st.s, st.s);
    }
    ctx.globalAlpha = 1;

    /* links — curved, shimmering, brightening into the active layer.
       Full-mesh spine: strokeStyle is switched only when the tint group
       changes (links are layer-ordered, so this is a handful of switches
       per frame); per-link alpha rides on globalAlpha. */
    ctx.lineCap = 'round';
    let curTint = null;
    const hotGlow = LAYERS[al - 1].n * LAYERS[al].n <= 150; /* skip the extra glow pass on very large segments (40→10 fan) */
    for (const lk of links) {
      const A = nodes[lk.a], B = nodes[lk.b];
      const hot = lk.hier && B.layer === al;
      let a = lk.strength * (0.145 + 0.055 * Math.sin(t * 0.6 + lk.ph));
      if (hot) a = 0.38 + 0.1 * Math.sin(t * 1.1 + lk.ph);
      else if (lk.flowRoll > dens + 0.2) a *= 0.55;
      if (curTint !== lk.col) { curTint = lk.col; ctx.strokeStyle = `rgb(${lk.col[0]},${lk.col[1]},${lk.col[2]})`; }
      ctx.globalAlpha = a;
      ctx.lineWidth = hot ? 1.05 : lk.hier ? 0.6 : 0.45;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.quadraticCurveTo(lk.cx, lk.cy, B.x, B.y);
      ctx.stroke();
      if (hot && hotGlow) { /* soft glow pass on active-layer inflow */
        ctx.globalAlpha = 0.09;
        ctx.lineWidth = 3.4;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    /* resident slow pulses — light dwelling between each pair of nodes (~1 min).
       lk.pg is a per-segment budget: the 400-link 40→10 source fan carries a
       deterministic 55% subset so the frame budget holds; every smaller
       segment keeps full dwelling coverage. */
    for (const lk of links) {
      if (!lk.flow || lk.flowRoll > dens * lk.pg) continue;
      const u = ((t / lk.flowDur) + lk.flowPh) % 1;
      const pl = 0.5 + 0.5 * Math.sin(t * 1.9 + lk.flowPh * 17);
      const [x, y] = qb(nodes[lk.a], nodes[lk.b], lk, u);
      const s = (lk.hier ? 2.6 : 2.0) * (0.7 + 0.55 * pl);
      ctx.globalAlpha = clamp((0.26 + 0.46 * pl) * (lk.hier ? 1.15 : 0.85), 0, 1);
      ctx.drawImage(nodes[lk.b].sp, x - s * 2, y - s * 2, s * 4, s * 4);
    }
    ctx.globalAlpha = 1;

    /* directional light beams — fast luminous streaks streaming left→right
       along the information spine. Each eligible link fires a ~1s beam every
       beamCycle seconds; phases are staggered per link, so at any moment a
       rolling crowd of streaks is crossing the web toward the manager.
       vis fraction is density-scaled and gated by lk.pg (the 40→10 fan
       carries fewer beams so the frame budget holds). */
    const beamVis = beamVisBase * dens;
    let bTint = null;
    for (const lk of links) {
      if (!lk.beam) continue;
      const c = ((S.bt / lk.beamCycle) + lk.beamPh) % 1;
      const vis = beamVis * lk.pg;
      if (c >= vis) continue;
      const u = c / vis;
      const A = nodes[lk.a], B = nodes[lk.b];
      const hot = lk.hier && B.layer === al;
      const big = lk.pg < 1; /* the dense 40→10 fan: slightly thinner/dimmer */
      const fade = Math.sin(u * Math.PI);
      const [hx, hy] = qb(A, B, lk, u);
      const tailU = u > 0.03 ? Math.max(0, u - clamp(26 / lk.len, 0.1, 0.42)) : u * 0.5;
      const [tx, ty] = qb(A, B, lk, tailU);
      const [mx, my] = qb(A, B, lk, (u + tailU) * 0.5);
      const a = (hot ? 0.9 : 0.62) * fade * (big ? 0.85 : 1);
      if (bTint !== lk.col) { bTint = lk.col; ctx.strokeStyle = `rgb(${lk.col[0]},${lk.col[1]},${lk.col[2]})`; }
      ctx.globalAlpha = a;
      ctx.lineWidth = (hot ? 1.5 : 1.05) * (big ? 0.85 : 1);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(mx, my);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.globalAlpha = a * 0.3; /* soft glow underlay — same path, wider pen */
      ctx.lineWidth = (hot ? 4.6 : 3.2) * (big ? 0.85 : 1);
      ctx.stroke();
      const s = hot ? 3.1 : 2.3; /* bright bead at the head */
      ctx.globalAlpha = Math.min(1, a + 0.15);
      ctx.drawImage(B.sp, hx - s * 2, hy - s * 2, s * 4, s * 4);
    }
    ctx.globalAlpha = 1;

    /* stage-change shockwave — lights up links + nodes as it passes */
    for (let i = waves.length - 1; i >= 0; i--) {
      const wv = waves[i], p = (t - wv.born) / 2.6;
      if (p >= 1) { waves.splice(i, 1); continue; }
      const r = p * Math.max(S.w, S.h) * 0.62;
      const band = 26;
      for (const lk of links) {
        if (!lk.hier) continue;
        const A = nodes[lk.a], B = nodes[lk.b];
        const dm = Math.hypot((A.x + B.x) / 2 - wv.x, (A.y + B.y) / 2 - wv.y);
        if (Math.abs(dm - r) < band) {
          ctx.strokeStyle = rgba(wv.col, (1 - p) * 0.2);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(A.x, A.y);
          ctx.quadraticCurveTo(lk.cx, lk.cy, B.x, B.y);
          ctx.stroke();
        }
      }
      for (const n of nodes) {
        if (!n.main) continue;
        const dn = Math.hypot(n.x - wv.x, n.y - wv.y);
        if (Math.abs(dn - r) < band) n.pulse = Math.max(n.pulse, (1 - p) * 0.85);
      }
      ctx.strokeStyle = rgba(wv.col, (1 - p) * 0.2);
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(wv.x, wv.y, r, 0, 6.2832);
      ctx.stroke();
      ctx.strokeStyle = rgba(wv.col, (1 - p) * 0.07);
      ctx.lineWidth = 9;
      ctx.stroke();
    }

    /* manager supernova flashes */
    for (let i = flashes.length - 1; i >= 0; i--) {
      const fl = flashes[i], p = (t - fl.born) / 1.1;
      if (p >= 1) { flashes.splice(i, 1); continue; }
      const s = 90 * (0.4 + p);
      ctx.globalAlpha = (1 - p) * 0.55;
      ctx.drawImage(nodes[layerStart[7]].sp, fl.x - s, fl.y - s, s * 2, s * 2);
      ctx.globalAlpha = 1;
    }

    /* information packets — each hop pulses for ~a minute before moving on.
       dtJ freezes on pause: the light stops flowing but keeps shimmering. */
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += dtJ / p.dur;
      if (p.t >= 1) {
        p.t -= 1;
        p.seg++;
        const arrived = nodes[p.path[p.seg]];
        if (arrived) {
          arrived.pulse = 1;
          if (arrived.layer === al) rings.push({ x: arrived.x, y: arrived.y, born: t, col: p.col, big: false });
        }
        if (p.seg >= p.path.length - 1) {
          packets.splice(i, 1);
          const mgr = nodes[p.path[p.path.length - 1]];
          if (mgr) { rings.push({ x: mgr.x, y: mgr.y, born: t, col: [255, 217, 138], big: true }); flashes.push({ x: mgr.x, y: mgr.y, born: t }); }
          continue;
        }
        p.dur = srnd(52, 68);
      }
      const A = nodes[p.path[p.seg]], B = nodes[p.path[p.seg + 1]];
      if (!A || !B) { packets.splice(i, 1); continue; }
      const lk = next[p.path[p.seg]].find(o => o.b === p.path[p.seg + 1])?.lk;
      if (!lk) { packets.splice(i, 1); continue; }
      const u = clamp(p.t + 0.012 * Math.sin(t * 0.35 + p.ph * 9), 0, 1);
      /* comet trail */
      const tailT = Math.max(0, u - 0.055);
      let px2 = qb(A, B, lk, tailT)[0], py2 = qb(A, B, lk, tailT)[1];
      for (let s2 = 1; s2 <= 4; s2++) {
        const uu = tailT + (u - tailT) * (s2 / 4);
        const [x, y] = qb(A, B, lk, uu);
        const fade = s2 / 4;
        ctx.strokeStyle = rgba(p.col, fade * fade * 0.6);
        ctx.lineWidth = 0.6 + fade * 1.5;
        ctx.beginPath();
        ctx.moveTo(px2, py2);
        ctx.lineTo(x, y);
        ctx.stroke();
        px2 = x; py2 = y;
      }
      /* pulsing bead at the head */
      const [hx, hy] = qb(A, B, lk, u);
      const pulse = 0.6 + 0.4 * Math.sin(t * p.hz + p.ph);
      const s = 3.4 + 1.4 * pulse;
      ctx.globalAlpha = 0.55 + 0.4 * pulse;
      ctx.drawImage(p.sp, hx - s * 2.1, hy - s * 2.1, s * 4.2, s * 4.2);
      ctx.globalAlpha = 1;
    }

    /* nodes */
    for (const n of nodes) {
      n.pulse = Math.max(0, n.pulse - dt * 1.6);
      const breath = n.main ? 1 + 0.09 * Math.sin(t * (0.9 + n.ph * 0.13) + n.ph) : 1;
      const active = n.main && n.layer === al;
      const size = n.r * (1 + n.pulse * 0.8) * (active ? 1.16 : 1) * breath;
      const gs = size * (n.main ? 4.1 : 2.9);
      const base = n.main ? (active ? 0.95 : 0.68) : 0.34 * dens;
      ctx.globalAlpha = clamp(base + n.pulse * 0.4, 0, 1);
      ctx.drawImage(n.sp, n.x - gs, n.y - gs, gs * 2, gs * 2);
      if (n.main) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = rgba(n.tint, active || n.pulse > 0.35 ? 1 : 0.82);
        ctx.beginPath();
        ctx.arc(n.x, n.y, size, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, size * 0.38, 0, 6.2832);
        ctx.fill();
        if (active) {
          ctx.strokeStyle = rgba(n.tint, 0.5 + 0.28 * Math.sin(t * 2.1 + n.ph));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, size + 4.5 + Math.sin(t * 2.1 + n.ph) * 1.6, 0, 6.2832);
          ctx.stroke();
        }
        if (n.layer === 7) { /* manager — slow rotating dashed crown */
          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.rotate(t * 0.35);
          ctx.strokeStyle = rgba(n.tint, 0.55);
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          ctx.beginPath();
          ctx.arc(0, 0, size + 10, 0, 6.2832);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    ctx.globalAlpha = 1;

    /* arrival rings */
    for (let i = rings.length - 1; i >= 0; i--) {
      const g = rings[i], p = (t - g.born) / (g.big ? 1.3 : 0.8);
      if (p >= 1) { rings.splice(i, 1); continue; }
      ctx.strokeStyle = rgba(g.col, (1 - p) * (g.big ? 0.85 : 0.55));
      ctx.lineWidth = g.big ? 1.8 : 1.1;
      ctx.beginPath();
      ctx.arc(g.x, g.y, (g.big ? 6 : 3) + p * (g.big ? 38 : 16), 0, 6.2832);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    /* static mode (reduced motion): repaint only when something changed, but
       ALWAYS self-heal regardless of hidden/visible state, so a canvas that
       booted before the webview laid out still receives its frame. */
    if (S.paused || reducedMotion()) {
      S.static = reducedMotion();
      if (!S.w) layout();
      if (S.dirty && S.w) { S.dirty = false; drawScene(6.5, 0, 0); }
      return;
    }
    if (document.hidden || !S.visible) return;
    if (!S.w) { layout(); if (!S.w) return; }
    const now = performance.now();
    lastDT = clamp((now - (lastNow || now)) / 1000, 1 / 240, 0.05);
    lastNow = now;
    if (!S.paused) {
      S.jt += lastDT;
      spawnCd -= lastDT;
      const cap = Math.round(64 * S.density);
      if (packets.length < cap && spawnCd <= 0) { spawnPacket(false); spawnCd = 0.5 + Math.random() * 1.2; }
    }
    S.t += lastDT;
    drawScene(S.t, lastDT, S.paused ? 0 : lastDT);
  }

  const ro = new ResizeObserver(() => { layout(); });
  ro.observe(container);
  /* visibility: IO last entry + periodic rect poll (guards against stale batches) */
  const syncVisible = () => {
    const r = container.getBoundingClientRect();
    S.visible = r.bottom > -80 && r.top < (window.innerHeight || 900) + 80 && r.width > 0;
  };
  const io = new IntersectionObserver(es => { S.visible = (es[es.length - 1] ?? es[0])?.isIntersecting ?? true; }, { threshold: 0.02 });
  io.observe(container);
  const visPoll = setInterval(syncVisible, 700);
  syncVisible();

  layout();
  prewarm();
  if (reducedMotion()) {
    S.static = true;
    if (S.dirty && S.w) { S.dirty = false; drawScene(6.5, 0, 0); }
  }
  /* the loop always runs: in static mode it only repaints on dirty; in
     animated mode it drives the scene — and it guarantees recovery whenever
     the container gains its real size after mount (webview/iframe timing). */
  raf = requestAnimationFrame(frame);
  /* late-layout nudges: fonts, deferred CSS, late webview sizing */
  [120, 450, 1000].forEach(ms => setTimeout(layout, ms));
  /* rAF-independent watchdog: retries layout while unsized and repaints the
     static frame even if requestAnimationFrame is starved */
  const wd = setInterval(() => {
    if (!S.w) { layout(); return; }
    if (S.static && S.dirty) { S.dirty = false; drawScene(6.5, 0, 0); }
  }, 500);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      clearInterval(visPoll);
      clearInterval(wd);
    },
    setStage(i) {
      const ns = clamp(i | 0, 0, 6);
      if (ns === S.stage) return;
      S.stage = ns;
      const al = activeLayer();
      waves.push({ x: LAYER_FX[al] * S.w, y: S.h * 0.44, born: S.t + 0.001, col: LAYER_TINTS[al] || SRC_TINTS[0] });
      if (waves.length > 3) waves.shift();
      if (S.static) S.dirty = true;
    },
    setPaused(v) { S.paused = !!v; S.static = reducedMotion(); S.dirty = true; lastNow = 0; }
  };
}

function mount(host) {
  for (const e of engines) e.destroy();
  engines.clear();
  if (!host) return;
  host.querySelectorAll('[data-flow-net]').forEach(container => {
    const engine = createEngine(container);
    if (engine) engines.add(engine);
  });
}

window.FlowFX = {
  mount,
  setStage(i) { for (const e of engines) e.setStage(i); },
  setPaused(v) { explicitMotion = !v; for (const e of engines) e.setPaused(v); }
};
})();
