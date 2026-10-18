/* AgentFlowFX — deep-field neural-map engine for the agent neural webs
   (TradingAgents "Independent challenge" + AURORA "The investment committee").
   Same technique as FlowFX v2 (the investigation flow): dark cosmic window,
   layered left→right pipeline of agent main nodes (geometry lives on the SVG
   hit-areas via data-layer / data-tint), wrapped in a dense web of satellite,
   bridge and deep-field minor nodes on hundreds of shimmering curved links.
   Between every pair of connected nodes a light dwells and pulses for about
   a minute before moving into the next node — resident link pulses traverse
   each link in ~50-70s, and multi-hop packets take ~a minute per hop, firing
   the arrival agent (which pops its working keyword). The final agent wears
   a rotating dashed crown and greets each completed journey with a gold
   supernova flash + shockwave that lights links up as it passes.
   Mounts into [data-ai-brain] containers produced by components.js.
   Purely decorative: animates the saved reviews; makes no network calls. */
(() => {
'use strict';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reducedMotion = () => forcedPause === null && matchMedia('(prefers-reduced-motion: reduce)').matches;
const jr = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];

/* seeded RNG so each map's web shape is stable across renders */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- palette + pre-rendered sprites ---------- */
const TINTS = [
  [91, 201, 255],   /* 0 cyan      */
  [125, 167, 255],  /* 1 azure     */
  [180, 140, 255],  /* 2 violet    */
  [255, 199, 138],  /* 3 warm      */
  [53, 212, 146],   /* 4 green     */
  [255, 125, 146],  /* 5 rose      */
  [255, 171, 94],   /* 6 orange    */
  [255, 217, 138]   /* 7 gold      */
];
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
const SPRITES = TINTS.map(t => makeGlow(t[0], t[1], t[2]));
const FOG = [makeBlob(64, 150, 255), makeBlob(150, 110, 255), makeBlob(255, 170, 110)];
const rgba = (tint, a) => `rgba(${tint[0]},${tint[1]},${tint[2]},${a})`;

/* ---------- keyword vocabulary (same pools as the research terminal) ---------- */
/* ---------- engines ---------- */
const engines = new Set();
let forcedPause = null;

function createEngine(container, team, opts) {
  const canvas = container.querySelector('canvas.ai-brain-canvas');
  const svg = container.querySelector('svg.ai-brain-nodes');
  if (!canvas || !svg || !team?.length) return null;
  const ctx = canvas.getContext('2d');
  const caseSymbol = String(opts.caseSymbol || '').toUpperCase();
  const key = container.getAttribute('data-ai-brain');
  const R = mulberry32(key === 'aurora' ? 20261019 : 20261020);
  const srnd = (a, b) => a + R() * (b - a);
  const layerNames = String(container.getAttribute('data-layer-names') || '').split('|').filter(Boolean);

  /* ----- agent main nodes (invisible SVG hit-areas carry the geometry) ----- */
  const mains = [...svg.querySelectorAll('.ai-neuron')].map(g => {
    const c = g.querySelector('circle');
    const ti = clamp(+(g.getAttribute('data-tint') || 0), 0, TINTS.length - 1);
    return {
      el: g, vx: +c.getAttribute('cx'), vy: +c.getAttribute('cy'), x: 0, y: 0,
      layer: clamp(+(g.getAttribute('data-layer') || 0), 0, 7),
      tint: TINTS[ti], sp: SPRITES[ti],
      r: srnd(2.9, 3.5), ph: R() * 6.28, pulse: 0, lastPop: 0, main: true
    };
  });
  const LC = mains.reduce((m, n) => Math.max(m, n.layer + 1), 1);
  const layerIdx = Array.from({ length: LC }, () => []);
  mains.forEach((n, i) => layerIdx[n.layer].push(i));
  layerIdx.forEach(a => a.sort((p, q) => mains[p].vy - mains[q].vy));
  const terminal = layerIdx[LC - 1] || [];
  const singleTerminal = terminal.length === 1;
  const termNode = () => mains[terminal[0] ?? 0];
  for (const i of layerIdx[0] || []) mains[i].r *= 1.16;
  for (const i of terminal) mains[i].r *= 1.22;

  /* ----- deterministic dense web build ----- */
  const nodes = [];
  const links = [];
  const next = [];
  const addNode = o => { o.idx = nodes.length; nodes.push(o); next.push([]); return o.idx; };
  mains.forEach(n => addNode(n));
  const mainEnd = nodes.length;
  const layerFX = layerIdx.map(A => A.length ? A.reduce((s, i) => s + mains[i].vx, 0) / A.length / 540 : 0.5);
  const fyOf = n => n.vy / 300; /* viewBox is 540×300 */

  function addLink(a, b, kind) { /* 0 hier, 1 lateral, 2 minor */
    const B = nodes[b];
    const strength = kind === 0 ? srnd(0.72, 1) : kind === 1 ? srnd(0.42, 0.68) : srnd(0.3, 0.55);
    const flowRoll = kind === 0 ? 0 : R();
    const lk = {
      a, b, col: B.tint || nodes[a].tint, strength,
      bend: srnd(-12, 12), jx: srnd(-7, 7), jy: srnd(-9, 9),
      ph: R() * 6.28,
      flow: kind === 0 || (kind === 1 ? flowRoll < 0.55 : flowRoll < 0.45),
      flowDur: srnd(46, 74), flowPh: R(), flowRoll,
      hier: kind === 0, cx: 0, cy: 0
    };
    links.push(lk);
    if (kind === 0) next[a].push({ b, lk });
    return lk;
  }
  function nearestMains(li, fy, k) {
    return [...layerIdx[li]].sort((p, q) =>
      Math.abs(fyOf(mains[p]) - fy) - Math.abs(fyOf(mains[q]) - fy)).slice(0, k);
  }

  /* hierarchical spine: every main feeds 1-3 nearest mains in the next layer;
     every downstream main keeps at least one inflow; occasional skip links */
  for (let li = 0; li < LC - 1; li++) {
    const A = layerIdx[li], B = layerIdx[li + 1];
    const has = new Set();
    for (const a of A) {
      const count = Math.max(1, Math.min(B.length, 1 + (R() < 0.55 ? 1 : 0) + (R() < 0.18 ? 1 : 0)));
      const near = [...B].sort((p, q) =>
        Math.abs(fyOf(mains[p]) - fyOf(mains[a])) - Math.abs(fyOf(mains[q]) - fyOf(mains[a])));
      for (let k = 0; k < count; k++) addLink(a, near[k % near.length], 0);
      for (let k = 0; k < Math.min(count, near.length); k++) has.add(near[k]);
    }
    for (const t of B) {
      if (has.has(t)) continue;
      addLink(nearestMains(li, fyOf(mains[t]), 1)[0], t, 0);
    }
    if (li < LC - 2) for (const a of A) if (R() < 0.22) {
      const t = nearestMains(li + 2, fyOf(mains[a]), 1)[0];
      if (t !== undefined) addLink(a, t, 0);
    }
  }

  /* lateral rings inside each layer (chain neighbours, occasional skips) */
  for (let li = 0; li < LC; li++) {
    const A = layerIdx[li];
    for (let k = 0; k < A.length - 1; k++) {
      addLink(A[k], A[k + 1], 1);
      if (R() < 0.15 && k + 2 < A.length) addLink(A[k], A[k + 2], 1);
    }
  }

  /* satellites orbiting every main (anchored, follow their main on resize) */
  for (let i = 0; i < mainEnd; i++) {
    const m = nodes[i];
    for (let s = 0; s < 3; s++) {
      const ang = R() * 6.2832;
      addNode({
        layer: m.layer, anchor: i,
        dx: Math.cos(ang) * srnd(10, 26) * (Math.random() < 0.5 ? 1 : -1),
        dy: Math.sin(ang) * srnd(8, 20) * (Math.random() < 0.5 ? 1 : -1),
        r: srnd(0.8, 1.4), tint: m.tint, sp: m.sp, ph: R() * 6.28, main: false, pulse: 0, x: 0, y: 0
      }).idx;
      addLink(i, nodes[nodes.length - 1].idx, 2);
    }
  }

  /* bridge minors weaving between adjacent layers */
  for (let li = 0; li < LC - 1; li++) {
    for (let b = 0; b < 8; b++) {
      const fx = layerFX[li] + (layerFX[li + 1] - layerFX[li]) * srnd(0.3, 0.7) + srnd(-0.008, 0.008);
      const fy = srnd(0.07, 0.88);
      const host = nearestMains(li + 1, fy, 1)[0];
      const M = mains[host];
      addNode({
        layer: li + 1, anchor: -1, fx, fy, r: srnd(0.8, 1.3),
        tint: M.tint, sp: M.sp, ph: R() * 6.28, main: false, pulse: 0, x: 0, y: 0
      });
      for (const a of nearestMains(li, fy, R() < 0.4 ? 2 : 1)) addLink(a, nodes[nodes.length - 1].idx, 2);
      addLink(nodes[nodes.length - 1].idx, host, 2);
    }
  }

  /* deep-field ambient minors, each tethered to its nearest main */
  const fracXY = n => n.anchor >= 0
    ? [mains[n.anchor].vx / 540 + n.dx / 540, mains[n.anchor].vy / 300 + n.dy / 300]
    : [n.fx, n.fy];
  for (let a = 0; a < 30; a++) {
    const fx = srnd(0.015, 0.985), fy = srnd(0.05, 0.9);
    const li = (R() * LC) | 0;
    const anchor = nearestMains(li, fy, 1)[0];
    const M = mains[anchor];
    addNode({
      layer: li, anchor: -1, fx, fy, r: srnd(0.6, 1.1),
      tint: M.tint, sp: M.sp, ph: R() * 6.28, main: false, pulse: 0, x: 0, y: 0
    });
    addLink(anchor, nodes[nodes.length - 1].idx, 2);
  }

  /* minor ↔ minor filaments */
  for (let i = mainEnd; i < nodes.length; i++) {
    if (R() > 0.5) continue;
    let best = -1, bd = 0.075;
    for (let j = mainEnd; j < nodes.length; j++) {
      if (j === i) continue;
      const p = fracXY(nodes[i]), q = fracXY(nodes[j]);
      const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
      if (d < bd) { bd = d; best = j; }
    }
    if (best >= 0) addLink(i, best, 2);
  }

  /* ----- starfield + nebula fog ----- */
  const stars = Array.from({ length: 110 }, () => ({ fx: R(), fy: R(), ph: R() * 6.28, hz: R() * 1.4 + 0.4, s: R() * 0.9 + 0.5 }));
  const fog = Array.from({ length: 6 }, (_, i) => ({
    fx: R(), fy: R() * 0.8 + 0.1, sp: FOG[i % 3], s: srnd(130, 280), ph: R() * 6.28, dx: jr(8, 18), a: srnd(0.05, 0.09)
  }));

  const S = { w: 0, h: 0, visible: true, static: false, density: 1, t: 4.2, dirty: true, labelX: [] };
  const packets = [];
  const waves = [];
  const flashes = [];
  const rings = [];
  let hoverIdx = -1, focusIdx = -1;
  let spawnCd = 0, nextWave = 9, nextAmbient = 3, lastNow = 0, lastDT = 1 / 60, raf = 0;

  /* hover / focus highlight via the SVG hit-areas */
  const onOver = e => { const g = e.target.closest?.('.ai-neuron'); hoverIdx = g ? +g.dataset.aiNode : -1; };
  const onOut = () => { hoverIdx = -1; };
  const onFocus = e => { const g = e.target.closest?.('.ai-neuron'); focusIdx = g ? +g.dataset.aiNode : -1; };
  const onBlur = () => { focusIdx = -1; };
  svg.addEventListener('pointerover', onOver);
  svg.addEventListener('pointerout', onOut);
  svg.addEventListener('focusin', onFocus);
  svg.addEventListener('focusout', onBlur);

  function layout() {
    const crect = container.getBoundingClientRect();
    if (!crect.width) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    S.w = crect.width; S.h = crect.height;
    S.density = clamp((S.w * S.h) / 300000, 0.45, 1);
    canvas.width = Math.round(S.w * dpr);
    canvas.height = Math.round(S.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const srect = svg.getBoundingClientRect();
    const sc = Math.min(srect.width / 540, srect.height / 300);
    const ox = srect.left - crect.left + (srect.width - 540 * sc) / 2;
    const oy = srect.top - crect.top + (srect.height - 300 * sc) / 2;
    for (const n of mains) { n.x = ox + n.vx * sc; n.y = oy + n.vy * sc; }
    S.labelX = layerIdx.map(A => A.length ? A.reduce((s, i) => s + mains[i].x, 0) / A.length : null);
    for (const n of nodes) {
      if (n.main) continue;
      if (n.anchor >= 0) { const m = mains[n.anchor]; n.x = m.x + n.dx * sc; n.y = m.y + n.dy * sc; }
      else { n.x = n.fx * S.w; n.y = n.fy * S.h; }
    }
    for (const lk of links) {
      const A = nodes[lk.a], B = nodes[lk.b];
      const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
      const ba = lk.bend * clamp(len / 240, 0.4, 1.4);
      lk.cx = (A.x + B.x) / 2 - (dy / len) * ba + lk.jx * 0.4;
      lk.cy = (A.y + B.y) / 2 + (dx / len) * ba + lk.jy * 0.4;
    }
    S.dirty = true;
  }

  /* keyword chip (DOM, crisp text) — agents "working" as light reaches them */
  function popKeyword(n, forceVerb) {
    if (!n || !S.w || container.querySelectorAll('.ai-keyword-pop').length > 10) return;
    const now = performance.now() / 1000;
    if (!forceVerb && now - (n.lastPop || 0) < 4) return;
    n.lastPop = now;
    const saved = team[Number(n.el.dataset.aiNode)] || {};
    const useVerb = forceVerb;
    const summary = String(saved.summary || saved.title || 'Review unavailable').replace(/\s+/g, ' ').trim();
    const el = document.createElement('span');
    el.className = 'ai-keyword-pop' + (useVerb ? ' is-verb' : '');
    el.textContent = useVerb ? 'Saved review · ' + (saved.title || 'Research') : 'Saved · ' + summary.slice(0, 84) + (summary.length > 84 ? '…' : '');
    el.setAttribute('aria-hidden', 'true');
    container.appendChild(el);
    const hw = el.offsetWidth / 2 + 6;
    el.style.left = `${clamp(n.x + jr(-16, 16), hw, Math.max(hw, S.w - hw))}px`;
    /* the pop animation drifts up to ~2 chip-heights — keep the whole arc inside */
    el.style.top = `${Math.max(el.offsetHeight * 2 + 6, n.y - 9)}px`;
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  /* ----- information packets: ~a minute of pulsing light per hop ----- */
  function buildPath(startLayer) {
    let idx = layerIdx[startLayer][(R() * layerIdx[startLayer].length) | 0];
    const path = [idx];
    for (let L = startLayer; L < LC - 1; L++) {
      const outs = next[idx];
      if (!outs.length) break;
      idx = outs[(R() * outs.length) | 0].b;
      path.push(idx);
    }
    return path;
  }
  const packetCap = () => Math.round(44 * S.density) + (mains.length > 20 ? 8 : 0);
  function spawnPacket(warm) {
    const SL = Math.min(LC - 2, R() < 0.72 ? 0 : R() < 0.55 ? 1 : 2);
    if (!layerIdx[SL]?.length) return;
    const path = buildPath(SL);
    if (path.length < 2) return;
    packets.push({
      path,
      seg: warm ? (R() * (path.length - 1)) | 0 : 0,
      t: warm ? R() : 0,
      dur: srnd(52, 68),
      sp: mains[path[0]].sp,
      col: mains[path[0]].tint,
      ph: R() * 6.28, hz: jr(1.5, 2.8)
    });
  }
  function prewarm() {
    const cap = packetCap();
    for (let i = 0; i < cap; i++) spawnPacket(true);
  }

  const qb = (A, B, lk, u) => {
    const m = 1 - u;
    return [m * m * A.x + 2 * m * u * lk.cx + u * u * B.x,
            m * m * A.y + 2 * m * u * lk.cy + u * u * B.y];
  };

  function drawScene(t, dt) {
    ctx.clearRect(0, 0, S.w, S.h);
    const dens = S.density;
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

    /* faint layer captions (measured + clamped so edge labels stay inside) */
    if (layerNames.length >= LC && S.w > 430) {
      ctx.font = '650 8.5px Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.textAlign = 'center';
      for (let li = 0; li < LC; li++) {
        const lx = S.labelX[li];
        if (lx == null) continue;
        const txt = layerNames[li].toUpperCase();
        const half = ctx.measureText(txt).width / 2 + 5;
        const x = clamp(lx, half, Math.max(half, S.w - half));
        ctx.fillStyle = `rgba(159,195,247,${0.2 + 0.08 * Math.sin(t * 0.7 + li * 1.3)})`;
        ctx.fillText(txt, x, 13);
      }
    }

    /* links — curved, shimmering */
    ctx.lineCap = 'round';
    for (const lk of links) {
      const A = nodes[lk.a], B = nodes[lk.b];
      let a = lk.strength * (0.15 + 0.055 * Math.sin(t * 0.6 + lk.ph));
      if (lk.hier) a += 0.05;
      else if (lk.flowRoll > dens + 0.2) a *= 0.55;
      ctx.strokeStyle = rgba(lk.col, a);
      ctx.lineWidth = lk.hier ? 0.75 : 0.5;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.quadraticCurveTo(lk.cx, lk.cy, B.x, B.y);
      ctx.stroke();
    }

    /* resident slow pulses — light dwelling between each pair of nodes (~1 min) */
    for (const lk of links) {
      if (!lk.flow || lk.flowRoll > dens) continue;
      const u = ((t / lk.flowDur) + lk.flowPh) % 1;
      const pl = 0.5 + 0.5 * Math.sin(t * 1.9 + lk.flowPh * 17);
      const [x, y] = qb(nodes[lk.a], nodes[lk.b], lk, u);
      const s = (lk.hier ? 3.0 : 2.1) * (0.7 + 0.55 * pl);
      ctx.globalAlpha = clamp((0.26 + 0.46 * pl) * (lk.hier ? 1.15 : 0.85), 0, 1);
      ctx.drawImage(nodes[lk.b].sp, x - s * 2, y - s * 2, s * 4, s * 4);
    }
    ctx.globalAlpha = 1;

    /* ambient shockwaves from the terminal agent — re-lights links as they pass */
    for (let i = waves.length - 1; i >= 0; i--) {
      const wv = waves[i], p = (t - wv.born) / 2.6;
      if (p >= 1) { waves.splice(i, 1); continue; }
      if (p < 0) continue;
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
      for (const n of mains) {
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

    /* completion flashes at the terminal agent */
    for (let i = flashes.length - 1; i >= 0; i--) {
      const fl = flashes[i], p = (t - fl.born) / 1.1;
      if (p >= 1) { flashes.splice(i, 1); continue; }
      const s = 74 * (0.4 + p);
      ctx.globalAlpha = (1 - p) * 0.5;
      ctx.drawImage(termNode().sp, fl.x - s, fl.y - s, s * 2, s * 2);
      ctx.globalAlpha = 1;
    }

    /* information packets — each hop pulses for ~a minute before moving on */
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += dt / p.dur;
      if (p.t >= 1) {
        p.t -= 1;
        p.seg++;
        const arrived = nodes[p.path[p.seg]];
        if (arrived) {
          arrived.pulse = 1;
          popKeyword(arrived);
          if (arrived.layer === LC - 1) {
            rings.push({ x: arrived.x, y: arrived.y, born: t, col: [255, 217, 138], big: true });
            flashes.push({ x: arrived.x, y: arrived.y, born: t });
          } else if (Math.random() < 0.3) {
            rings.push({ x: arrived.x, y: arrived.y, born: t, col: p.col, big: false });
          }
        }
        if (p.seg >= p.path.length - 1) { packets.splice(i, 1); continue; }
        p.dur = srnd(52, 68);
      }
      const A = nodes[p.path[p.seg]], B = nodes[p.path[p.seg + 1]];
      if (!A || !B) { packets.splice(i, 1); continue; }
      const lk = next[p.path[p.seg]].find(o => o.b === p.path[p.seg + 1])?.lk;
      if (!lk) { packets.splice(i, 1); continue; }
      const u = clamp(p.t + 0.012 * Math.sin(t * 0.35 + p.ph * 9), 0, 1);
      /* comet trail */
      const tailT = Math.max(0, u - 0.05);
      let px2 = qb(A, B, lk, tailT)[0], py2 = qb(A, B, lk, tailT)[1];
      for (let s2 = 1; s2 <= 6; s2++) {
        const uu = tailT + (u - tailT) * (s2 / 6);
        const [x, y] = qb(A, B, lk, uu);
        const fade = s2 / 6;
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

    /* nodes — white-hot agent cores with layered glow; minors are faint dust */
    for (const n of nodes) {
      n.pulse = Math.max(0, n.pulse - dt * 1.5);
      if (!n.main) {
        const gs = n.r * 2.9;
        ctx.globalAlpha = 0.34 * dens;
        ctx.drawImage(n.sp, n.x - gs, n.y - gs, gs * 2, gs * 2);
        continue;
      }
      const hot = n.idx === hoverIdx || n.idx === focusIdx;
      const breath = 1 + 0.08 * Math.sin(t * (0.85 + (n.ph % 1) * 0.4) + n.ph);
      const size = n.r * (1 + n.pulse * 0.75) * (hot ? 1.28 : 1) * breath;
      const gs = size * 4.3;
      ctx.globalAlpha = clamp(0.62 + n.pulse * 0.3 + (hot ? 0.2 : 0), 0, 1);
      ctx.drawImage(n.sp, n.x - gs, n.y - gs, gs * 2, gs * 2);
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = rgba(n.tint, 0.92);
      ctx.beginPath();
      ctx.arc(n.x, n.y, size, 0, 6.2832);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.93)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, size * 0.38, 0, 6.2832);
      ctx.fill();
      if (hot || n.pulse > 0.22) {
        ctx.strokeStyle = rgba(n.tint, hot ? 0.55 : 0.3 + 0.25 * n.pulse);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size + 4.5 + Math.sin(t * 2.1 + n.ph) * 1.5, 0, 6.2832);
        ctx.stroke();
      }
      if (singleTerminal && n.layer === LC - 1) { /* terminal agent crown */
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(t * 0.35);
        ctx.strokeStyle = rgba(n.tint, 0.5);
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, size + 9, 0, 6.2832);
        ctx.stroke();
        ctx.restore();
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
      ctx.arc(g.x, g.y, (g.big ? 6 : 3) + p * (g.big ? 36 : 15), 0, 6.2832);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- loop ---------- */
  function frame() {
    raf = requestAnimationFrame(frame);
    const wantStatic = S.static || (forcedPause ?? false) || reducedMotion()
      || container.classList.contains('ai-motion-paused');
    /* static mode: repaint only when something changed, but ALWAYS self-heal
       regardless of hidden/visible state, so a canvas that booted before the
       webview laid out still receives its frame. */
    if (wantStatic) {
      S.static = true;
      if (!S.w) layout();
      if (S.dirty && S.w) { S.dirty = false; drawScene(6.5, 0); }
      return;
    }
    if (document.hidden || !S.visible) return;
    if (!S.w) { layout(); if (!S.w) return; }
    const now = performance.now();
    lastDT = clamp((now - (lastNow || now)) / 1000, 1 / 240, 0.05);
    lastNow = now;
    S.t += lastDT;
    const t = S.t;
    spawnCd -= lastDT;
    if (packets.length < packetCap() && spawnCd <= 0) { spawnPacket(false); spawnCd = jr(0.5, 1.4); }
    if (t > nextWave && terminal.length) {
      waves.push({ x: termNode().x, y: termNode().y, born: t + 0.001, col: TINTS[7] });
      if (waves.length > 3) waves.shift();
      nextWave = t + jr(13, 21);
    }
    if (t > nextAmbient) {
      popKeyword(mains[(Math.random() * mains.length) | 0], Math.random() < 0.5);
      nextAmbient = t + jr(2.2, 4.4);
    }
    drawScene(t, lastDT);
  }

  /* observers */
  const ro = new ResizeObserver(() => { layout(); });
  ro.observe(container);
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
  if (S.static || reducedMotion()) {
    S.static = true;
    if (S.dirty && S.w) { S.dirty = false; drawScene(6.5, 0); }
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
    if (S.static && S.dirty) { S.dirty = false; drawScene(6.5, 0); }
  }, 500);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      clearInterval(visPoll);
      clearInterval(wd);
      svg.removeEventListener('pointerover', onOver);
      svg.removeEventListener('pointerout', onOut);
      svg.removeEventListener('focusin', onFocus);
      svg.removeEventListener('focusout', onBlur);
      container.querySelectorAll('.ai-keyword-pop').forEach(el => el.remove());
    },
    setPaused(v) {
      const st = !!v;
      if (st === S.static) return;
      S.static = st;
      if (st) { layout(); if (S.w) { S.dirty = false; drawScene(6.5, 0); } }
      else { S.dirty = true; lastNow = 0; }
    }
  };
}

function mount(host, data, opts = {}) {
  forcedPause = !!opts.paused;
  for (const e of engines) e.destroy();
  engines.clear();
  if (!host) return;
  host.querySelectorAll('[data-ai-brain]').forEach(container => {
    const key = container.getAttribute('data-ai-brain');
    const team = key === 'aurora' ? data?.aurora?.team : data?.tradingagents?.steps;
    const engine = createEngine(container, team || [], opts);
    if (engine) engines.add(engine);
  });
}

window.AgentFlowFX = {
  mount,
  setPaused(v) {
    forcedPause = !!v;
    for (const e of engines) e.setPaused(!!v);
  }
};
})();
