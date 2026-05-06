/* ================================================================
   Cinema Hero — scroll-driven frame sequence
   - Preloads 60 JPEG frames
   - Frame index = scroll progress through the .cinema-hero section
   - At top of hero  → frame 1 (rainy night)
   - At end of hero  → frame 60 (sunrise rooftop)
   - rAF-throttled, smooth, no scroll-jank
   ================================================================ */
(function () {
  'use strict';

  const FRAME_COUNT  = 60;
  const FRAME_PATH   = i => `/assets/hero-frames/frame-${String(i).padStart(3, '0')}.jpg`;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hero    = document.querySelector('.cinema-hero');
  const stage   = document.querySelector('.cinema-stage');
  const canvas  = document.getElementById('cinemaCanvas');
  const loader  = document.querySelector('.cinema-loader');
  const progEl  = document.querySelector('.cinema-progress');
  if (!hero || !stage || !canvas) return;

  const ctx = canvas.getContext('2d');
  const images = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let firstFrameReady = false;
  let started = false;
  let lastDrawnIdx = -1;

  // ── Sizing ─────────────────────────────────────────────────────
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = canvas.clientWidth  * dpr;
    canvas.height = canvas.clientHeight * dpr;
    lastDrawnIdx = -1;  // force redraw
  }

  // ── Drawing ────────────────────────────────────────────────────
  function drawFrame(idx) {
    // Find nearest already-loaded frame in case requested isn't ready
    let probe = idx;
    while (probe > 0 && (!images[probe] || !images[probe].complete)) probe--;
    if (probe < 0 || !images[probe] || !images[probe].complete) return;
    if (probe === lastDrawnIdx) return;
    lastDrawnIdx = probe;
    const img = images[probe];

    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const cover = Math.max(cw / iw, ch / ih);
    const dw = iw * cover, dh = ih * cover;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // ── Preload (parallel) ────────────────────────────────────────
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      loadedCount++;
      if (loader) loader.style.setProperty('--p', `${(loadedCount / FRAME_COUNT) * 100}%`);
      if (i === 0) {
        firstFrameReady = true;
        drawFrame(0);
      }
      if (loadedCount === FRAME_COUNT && loader) loader.classList.add('done');
    };
    img.onerror = () => { loadedCount++; };
    img.src = FRAME_PATH(i + 1);
    images[i] = img;
  }

  // ── Scroll-driven frame index ─────────────────────────────────
  function progressFromScroll() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    const scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / total));
  }

  function update() {
    const p = progressFromScroll();
    const idx = Math.min(FRAME_COUNT - 1, Math.floor(p * FRAME_COUNT));
    drawFrame(idx);

    if (progEl) progEl.style.setProperty('--scrollp', `${(p * 100).toFixed(1)}%`);
    if (p > 0.02) stage.classList.add('scrolled');
    else stage.classList.remove('scrolled');
  }

  // ── Boot ─────────────────────────────────────────────────────
  let rafPending = false;
  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => { rafPending = false; update(); });
  }

  function startWhenReady() {
    // Wait until ~25% of frames are loaded so initial scrolls aren't bare
    if (started) return;
    if (loadedCount >= Math.min(15, FRAME_COUNT) || reduceMotion) {
      started = true;
      canvas.classList.add('ready');
      stage.classList.add('lb-in');
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', () => { resize(); update(); }, { passive: true });
      resize();
      update();
    } else {
      setTimeout(startWhenReady, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startWhenReady);
  } else {
    startWhenReady();
  }
})();
