/* ================================================================
   Cinema Hero — frame-sequence playback
   - Preloads 60 JPEG frames
   - On load: plays once with ease-in-out (~3 seconds)
   - On hold: subtle breathing zoom on final sunrise frame
   - Object-fit: cover (centered crop)
   ================================================================ */
(function () {
  'use strict';

  const FRAME_COUNT    = 60;
  const PLAY_DURATION  = 3200; // ms — total reveal time
  const FRAME_PATH     = i => `/assets/hero-frames/frame-${String(i).padStart(3, '0')}.jpg`;
  const reduceMotion   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.getElementById('cinemaCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const images = new Array(FRAME_COUNT);
  let loadedCount = 0;
  const loader = document.querySelector('.cinema-loader');

  // ── Sizing ─────────────────────────────────────────────────────
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = canvas.clientWidth  * dpr;
    canvas.height = canvas.clientHeight * dpr;
  }

  // ── Drawing ────────────────────────────────────────────────────
  function drawFrame(idx, scale = 1) {
    // Find the nearest loaded frame (in case requested isn't ready)
    let probe = idx;
    while (probe >= 0 && (!images[probe] || !images[probe].complete)) probe--;
    if (probe < 0) return;
    const img = images[probe];

    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const cover = Math.max(cw / iw, ch / ih) * scale;
    const dw = iw * cover, dh = ih * cover;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // ── Preload ────────────────────────────────────────────────────
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.onload = () => {
      loadedCount++;
      if (loader) loader.style.setProperty('--p', `${(loadedCount / FRAME_COUNT) * 100}%`);
      // First frame ready → render immediately as poster
      if (i === 0) drawFrame(0);
    };
    img.onerror = () => { loadedCount++; };
    img.src = FRAME_PATH(i + 1);
    images[i] = img;
  }

  // ── Easing ─────────────────────────────────────────────────────
  const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // ── Reveal animation ──────────────────────────────────────────
  let revealStart = null;
  let revealDone  = false;

  function reveal(timestamp) {
    if (!revealStart) revealStart = timestamp;
    const elapsed  = timestamp - revealStart;
    const linear   = Math.min(1, elapsed / PLAY_DURATION);
    const progress = easeInOut(linear);
    const idx      = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
    drawFrame(idx);
    if (linear < 1) {
      requestAnimationFrame(reveal);
    } else {
      revealDone = true;
      if (loader) loader.classList.add('done');
      requestAnimationFrame(hold);
    }
  }

  // ── Hold (subtle breathing zoom on final frame) ──────────────
  function hold(ts) {
    const t = ts / 1000;
    // Slow, gentle breathing: 1.00 → 1.035 over ~12s
    const phase = (Math.sin(t * 0.45) + 1) / 2; // 0 → 1
    const scale = 1.0 + 0.035 * phase;
    drawFrame(FRAME_COUNT - 1, scale);
    requestAnimationFrame(hold);
  }

  // ── Boot ──────────────────────────────────────────────────────
  function boot() {
    resize();

    // Reduce-motion: skip animation, snap to final frame
    if (reduceMotion) {
      const finalReady = () => {
        if (images[FRAME_COUNT - 1] && images[FRAME_COUNT - 1].complete) {
          drawFrame(FRAME_COUNT - 1);
          canvas.classList.add('ready');
          if (loader) loader.classList.add('done');
        } else {
          setTimeout(finalReady, 80);
        }
      };
      finalReady();
      return;
    }

    // Wait until ~25% of frames are loaded, then start reveal
    const start = () => {
      if (loadedCount >= Math.min(15, FRAME_COUNT)) {
        canvas.classList.add('ready');
        // Trigger letterbox slide-in
        const hero = document.querySelector('.cinema-hero');
        if (hero) hero.classList.add('lb-in');
        requestAnimationFrame(reveal);
      } else {
        setTimeout(start, 80);
      }
    };
    start();
  }

  window.addEventListener('resize', () => {
    resize();
    if (revealDone) drawFrame(FRAME_COUNT - 1);
  }, { passive: true });

  // Render-after-orientation-change for mobile reliability
  window.addEventListener('orientationchange', () => setTimeout(() => {
    resize();
    if (revealDone) drawFrame(FRAME_COUNT - 1);
  }, 200));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
