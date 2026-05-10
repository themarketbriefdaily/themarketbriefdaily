/* ================================================================
   TBP-Cinema — scroll-driven 96-frame hero
   - Frame index = scroll progress through the .tbp-cine-hero section
   - Top of section  → frame 1
   - End of section  → frame 96
   - rAF-throttled, scroll-jank-free
   ================================================================ */
(function () {
  'use strict';

  const FRAME_COUNT = 96;
  const FRAME_PATH  = i => `/assets/hero-frames/frame-${String(i).padStart(3, '0')}.jpg`;
  const reduce      = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hero    = document.querySelector('.tbp-cine-hero');
  const stage   = hero && hero.querySelector('.stage');
  const canvas  = document.getElementById('tbpCineCanvas');
  const loader  = document.querySelector('.tbp-cine-loader');
  const progBar = document.querySelector('.tbp-cine-progress .bar');
  const frameEl = document.querySelector('.tbp-cine-progress .frame-num');

  // Diagnostic — visible in DevTools Console, helps if cinema isn't advancing.
  console.log('[tbp-cinema] script loaded; hero:', !!hero, 'stage:', !!stage, 'canvas:', !!canvas);
  if (!hero || !stage || !canvas) {
    console.warn('[tbp-cinema] Required DOM nodes missing — aborting init.');
    return;
  }
  // Surface the sticky state once layout settles, so we can confirm it's working.
  setTimeout(() => {
    const cs = getComputedStyle(stage);
    console.log('[tbp-cinema] stage.position =', cs.position,
                '| hero.height =', getComputedStyle(hero).height,
                '| stage.height =', cs.height);
  }, 1000);

  const ctx = canvas.getContext('2d');
  const images = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let started = false;
  let lastDrawn = -1;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = canvas.clientWidth  * dpr;
    canvas.height = canvas.clientHeight * dpr;
    lastDrawn = -1;
  }

  function drawFrame(idx) {
    let probe = idx;
    while (probe > 0 && (!images[probe] || !images[probe].complete)) probe--;
    if (probe < 0 || !images[probe] || !images[probe].complete) return;
    if (probe === lastDrawn) return;
    lastDrawn = probe;
    const img = images[probe];

    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const cover = Math.max(cw / iw, ch / ih);
    const dw = iw * cover, dh = ih * cover;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;

    ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#faf9f6';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // Preload all frames in parallel
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      loadedCount++;
      if (loader) loader.style.setProperty('--p', `${(loadedCount / FRAME_COUNT) * 100}%`);
      if (i === 0) drawFrame(0);
      if (loadedCount === FRAME_COUNT && loader) loader.classList.add('done');
    };
    img.onerror = () => { loadedCount++; };
    img.src = FRAME_PATH(i + 1);
    images[i] = img;
  }

  function progress() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    const scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / total));
  }

  let targetIdx = 0;       // where scroll says we are (set by scroll handler)
  let displayIdx = 0;      // what the canvas is currently rendering (eased toward target)
  let easingActive = false;
  let lastLoggedIdx = -1;

  function updateProgress() {
    const p = progress();
    targetIdx = Math.min(FRAME_COUNT - 1, Math.floor(p * FRAME_COUNT));
    if (progBar) progBar.style.setProperty('--scrollp', `${(p * 100).toFixed(1)}%`);
    if (p > 0.02) hero.classList.add('scrolled'); else hero.classList.remove('scrolled');
    if (!easingActive) {
      easingActive = true;
      requestAnimationFrame(easeTick);
    }
  }

  function easeTick() {
    const diff = targetIdx - displayIdx;
    if (Math.abs(diff) < 0.05) {
      // Snap to target and stop the loop
      displayIdx = targetIdx;
      const idx = Math.round(displayIdx);
      drawFrame(idx);
      if (frameEl) frameEl.textContent = String(idx + 1).padStart(3, '0') + ' / ' + FRAME_COUNT;
      easingActive = false;
      return;
    }
    // Lerp toward target — 0.18 is the smoothing factor (higher = snappier, lower = smoother)
    displayIdx += diff * 0.18;
    const idx = Math.round(displayIdx);
    drawFrame(idx);
    if (frameEl) frameEl.textContent = String(idx + 1).padStart(3, '0') + ' / ' + FRAME_COUNT;
    if (idx !== lastLoggedIdx && idx % 10 === 0) {
      console.log('[tbp-cinema] frame=', idx + 1, 'target=', targetIdx + 1);
      lastLoggedIdx = idx;
    }
    requestAnimationFrame(easeTick);
  }

  // Public update entrypoint — called on scroll/resize
  function update() { updateProgress(); }

  let rafPending = false;
  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => { rafPending = false; update(); });
  }

  function start() {
    if (started) return;
    if (loadedCount >= Math.min(20, FRAME_COUNT) || reduce) {
      started = true;
      canvas.classList.add('ready');
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', () => { resize(); update(); }, { passive: true });
      resize();
      update();
    } else {
      setTimeout(start, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
