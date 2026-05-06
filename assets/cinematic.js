/* ================================================================
   Cinematic Layer — JS
   - Scroll parallax driven by data-depth + data-speed
   - Pointer parallax on hero scene
   - Ken Burns + scene reveals via IntersectionObserver
   - Subtle 3D tilt on .cine-tilt cards
   ================================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('cine');
  document.body.classList.add('cine');

  // ── 1. Scroll parallax ────────────────────────────────────────
  // Layers declare data-speed (positive = moves slower than scroll,
  // negative = moves opposite direction). Foreground gets large speed.
  const scrollLayers = Array.from(document.querySelectorAll('[data-cine-parallax]'));
  let scrollY = window.scrollY;
  let parallaxRAF = null;

  function applyParallax() {
    parallaxRAF = null;
    for (const el of scrollLayers) {
      const speed = parseFloat(el.dataset.speed || '0.15');
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2) - window.innerHeight / 2;
      const ty = -offset * speed;
      el.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0) scale(${el.dataset.scale || 1})`;
    }
  }
  function onScroll() {
    scrollY = window.scrollY;
    if (!parallaxRAF) parallaxRAF = requestAnimationFrame(applyParallax);
  }
  if (!reduceMotion && scrollLayers.length) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    applyParallax();
  }

  // ── 2. Pointer parallax on hero scene ─────────────────────────
  const stage = document.querySelector('[data-cine-stage]');
  if (stage && !reduceMotion) {
    const layers = stage.querySelectorAll('.cine-layer');
    let targetX = 0, targetY = 0, currX = 0, currY = 0;
    let pointerRAF = null;

    function loop() {
      currX += (targetX - currX) * 0.06;
      currY += (targetY - currY) * 0.06;
      layers.forEach(layer => {
        const depth = parseFloat(layer.dataset.pointer || '0');
        if (!depth) return;
        const tx = currX * depth;
        const ty = currY * depth;
        const base = layer.dataset.baseTransform || '';
        layer.style.transform = `${base} translate3d(${tx}px, ${ty}px, 0)`;
      });
      pointerRAF = requestAnimationFrame(loop);
    }
    stage.addEventListener('pointermove', (e) => {
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX = (e.clientX - cx) / rect.width  * 40;
      targetY = (e.clientY - cy) / rect.height * 30;
    });
    stage.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
    loop();
  }

  // ── 3. IntersectionObserver: in-view reveals + Ken Burns ──────
  const inViewTargets = document.querySelectorAll('.cine-kb, .cine-reveal, [data-cine-reveal]');
  if ('IntersectionObserver' in window && inViewTargets.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    inViewTargets.forEach(el => io.observe(el));
  } else {
    inViewTargets.forEach(el => el.classList.add('in-view'));
  }

  // ── 4. 3D tilt on cards ──────────────────────────────────────
  const tiltEls = document.querySelectorAll('.cine-tilt');
  if (!reduceMotion) {
    tiltEls.forEach(el => {
      const max = parseFloat(el.dataset.tilt || '8');
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top)  / rect.height;
        const rx = (0.5 - py) * max;
        const ry = (px - 0.5) * max;
        el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
        el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
      });
    });
  }

  // ── 5. Title rise (per-word stagger) ──────────────────────────
  document.querySelectorAll('.cine-title[data-split]').forEach(title => {
    if (title.dataset.split === 'done') return;
    const html = title.innerHTML.trim();
    const lines = html.split(/<br\s*\/?>/i);
    title.innerHTML = lines.map(line => {
      const words = line.split(/\s+/).filter(Boolean).map((w, i) => {
        const delay = (i * 0.08).toFixed(2);
        return `<span class="cine-word" style="animation-delay:${delay}s">${w}</span>`;
      }).join(' ');
      return `<span class="cine-line">${words}</span>`;
    }).join('');
    title.dataset.split = 'done';
  });

  // ── 6. Smooth header tone-on-scroll ──────────────────────────
  const header = document.querySelector('header');
  if (header) {
    const onScrollHeader = () => {
      if (window.scrollY > 32) header.classList.add('cine-stuck');
      else header.classList.remove('cine-stuck');
    };
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });
  }
})();
