/* ================================================================
   TBP-style behaviors — single self-contained script
   ================================================================ */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('tbp');

  // ── 1. Sticky-header tone-on-scroll ─────────────────────────
  const header = document.querySelector('.tbp-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── 2. Mobile menu toggle ───────────────────────────────────
  const burger = document.querySelector('.tbp-burger');
  const mobile = document.querySelector('.tbp-mobile-menu');
  if (burger && mobile) {
    burger.addEventListener('click', () => mobile.classList.toggle('open'));
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobile.classList.remove('open')));
  }

  // ── 3. Hero carousel ────────────────────────────────────────
  const carousel = document.querySelector('.tbp-hero-carousel');
  if (carousel) {
    const frames = carousel.querySelectorAll('.frame');
    const pips = carousel.querySelectorAll('.pip');
    if (frames.length > 1 && !reduce) {
      let idx = 0;
      const advance = () => {
        frames[idx].classList.remove('active');
        if (pips[idx]) pips[idx].classList.remove('active');
        idx = (idx + 1) % frames.length;
        frames[idx].classList.add('active');
        if (pips[idx]) pips[idx].classList.add('active');
      };
      setInterval(advance, 3600);
    }
  }

  // ── 4. Service rotator ──────────────────────────────────────
  const rotator = document.querySelector('[data-tbp-rotator]');
  if (rotator) {
    const slides = rotator.querySelectorAll('.tbp-rotator-slide');
    const counter = rotator.querySelector('.counter-current');
    const total = rotator.querySelector('.counter-total');
    const prevBtn = rotator.querySelector('[data-rotator-prev]');
    const nextBtn = rotator.querySelector('[data-rotator-next]');
    let i = 0;
    if (total) total.textContent = '/ ' + String(slides.length).padStart(2, '0');
    const show = (n) => {
      slides.forEach(s => s.classList.remove('active'));
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('active');
      if (counter) counter.textContent = String(i + 1).padStart(2, '0');
    };
    show(0);
    if (prevBtn) prevBtn.addEventListener('click', () => show(i - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => show(i + 1));
    // Auto-advance, but pause when hovered or focused
    let auto = setInterval(() => show(i + 1), 5200);
    rotator.addEventListener('pointerenter', () => clearInterval(auto));
    rotator.addEventListener('pointerleave', () => { auto = setInterval(() => show(i + 1), 5200); });
  }

  // ── 5. Marquee (clone children to make seamless loop) ───────
  document.querySelectorAll('.tbp-marquee-track').forEach(track => {
    const clone = track.innerHTML;
    track.innerHTML = clone + clone;     // double the content for seamless wrap
  });

  // ── 6. In-view reveal ───────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-tbp-reveal]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-tbp-reveal]').forEach(el => el.classList.add('in-view'));
  }

  // (Custom cursor removed — system cursor is more accessible and reliable.)
})();
