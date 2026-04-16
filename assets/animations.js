(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function pageTransition() {
    document.body.classList.add('ds-page-enter');
  }

  function setupNavDropdowns() {
    const dropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));
    if (!dropdowns.length) return;

    function closeAll(except) {
      dropdowns.forEach((dd) => {
        if (dd === except) return;
        dd.classList.remove('open');
        const toggle = dd.querySelector('.nav-drop-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }

    dropdowns.forEach((dd) => {
      const toggle = dd.querySelector('.nav-drop-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = dd.classList.contains('open');
        if (isOpen) {
          window.location.assign('/education-library.html');
          return;
        }
        closeAll(dd);
        dd.classList.toggle('open', !isOpen);
        toggle.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-dropdown')) closeAll();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
    });
  }

  function setupReveal() {
    const revealNodes = Array.from(document.querySelectorAll('[data-reveal], .reveal, .section-head, .topic-card, .fund-card, .news-card, .thesis-card, .term-card'));
    if (!revealNodes.length) return;

    revealNodes.forEach((node, i) => {
      if (!node.hasAttribute('data-reveal') && !node.classList.contains('reveal')) node.setAttribute('data-reveal', 'up');
      node.style.transitionDelay = `${Math.min((i % 8) * 0.045, 0.3)}s`;
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealNodes.forEach((n) => n.classList.add('is-visible', 'visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible', 'visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

    revealNodes.forEach((n) => observer.observe(n));
  }

  function setupCounters() {
    const counters = Array.from(document.querySelectorAll('[data-counter]'));
    if (!counters.length) return;

    const animate = (el) => {
      const raw = el.getAttribute('data-counter') || el.textContent || '0';
      const target = parseFloat(String(raw).replace(/[^\d.-]/g, '')) || 0;
      const decimals = (String(raw).split('.')[1] || '').length;
      const prefix = el.getAttribute('data-prefix') || (String(raw).match(/^[^\d-]+/) || [''])[0];
      const suffix = el.getAttribute('data-suffix') || (String(raw).match(/[^\d.]+$/) || [''])[0];
      const duration = Number(el.getAttribute('data-duration') || 1200);
      const start = performance.now();

      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
        if (t < 1) requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach((el) => io.observe(el));
  }

  function setupConstellation() {
    if (reduceMotion) return;
    const containers = Array.from(document.querySelectorAll('[data-constellation]'));
    containers.forEach((container) => {
      if (container.querySelector('canvas.ds-constellation')) return;
      const canvas = document.createElement('canvas');
      canvas.className = 'ds-constellation';
      container.prepend(canvas);
      const ctx = canvas.getContext('2d');
      let width = 0;
      let height = 0;
      let dpr = Math.min(window.devicePixelRatio || 1, 2);
      let raf = null;
      const particles = [];

      function resize() {
        const rect = container.getBoundingClientRect();
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.max(26, Math.min(70, Math.round((width * height) / 26000)));
        particles.length = 0;
        for (let i = 0; i < count; i += 1) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.32,
            vy: (Math.random() - 0.5) * 0.32,
            r: Math.random() * 1.6 + 0.7
          });
        }
      }

      function draw() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i += 1) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          for (let j = i + 1; j < particles.length; j += 1) {
            const q = particles[j];
            const dx = p.x - q.x;
            const dy = p.y - q.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 120) {
              ctx.strokeStyle = `rgba(0,102,255,${(1 - dist / 120) * 0.15})`;
              ctx.lineWidth = 0.9;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.stroke();
            }
          }

          ctx.fillStyle = 'rgba(0,102,255,.24)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        raf = requestAnimationFrame(draw);
      }

      resize();
      draw();
      window.addEventListener('resize', resize);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && raf) {
          cancelAnimationFrame(raf);
          raf = null;
        } else if (!document.hidden && !raf) {
          draw();
        }
      });
    });
  }

  function setupTooltips() {
    const targets = Array.from(document.querySelectorAll('[data-tooltip]'));
    if (!targets.length) return;
    const tip = document.createElement('div');
    tip.className = 'ds-tooltip';
    document.body.appendChild(tip);

    let active = null;

    const place = (x, y) => {
      const pad = 12;
      const width = tip.offsetWidth;
      const height = tip.offsetHeight;
      const left = Math.min(window.innerWidth - width - pad, Math.max(pad, x - width / 2));
      const top = Math.max(pad, y - height - 16);
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
    };

    function hide() {
      tip.classList.remove('visible');
      active = null;
    }

    targets.forEach((el) => {
      const show = (event) => {
        active = el;
        tip.textContent = el.getAttribute('data-tooltip') || '';
        tip.classList.add('visible');
        const e = event.touches ? event.touches[0] : event;
        place(e.clientX, e.clientY);
      };

      el.addEventListener('mouseenter', show);
      el.addEventListener('mousemove', (e) => active === el && place(e.clientX, e.clientY));
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focus', (e) => {
        const rect = el.getBoundingClientRect();
        show({ clientX: rect.left + rect.width / 2, clientY: rect.top });
      });
      el.addEventListener('blur', hide);
    });

    document.addEventListener('scroll', () => active && hide(), true);
  }

  function setupModalTriggers() {
    const openers = Array.from(document.querySelectorAll('[data-modal-open]'));
    const closers = Array.from(document.querySelectorAll('[data-modal-close]'));

    function openModal(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    openers.forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.getAttribute('data-modal-open')));
    });

    closers.forEach((btn) => {
      btn.addEventListener('click', () => closeModal(btn.closest('.ds-modal')));
    });

    document.querySelectorAll('.ds-modal').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.ds-modal.is-open').forEach((m) => closeModal(m));
    });

    window.MBDUI = window.MBDUI || {};
    window.MBDUI.openModal = openModal;
    window.MBDUI.closeModal = (id) => closeModal(document.getElementById(id));
  }

  function setupToasts() {
    let stack = document.querySelector('.ds-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'ds-toast-stack';
      document.body.appendChild(stack);
    }

    function toast(message, type = 'info', ttl = 3200) {
      const node = document.createElement('div');
      node.className = `ds-toast ${type}`;
      node.textContent = message;
      stack.appendChild(node);
      requestAnimationFrame(() => node.classList.add('is-visible'));
      window.setTimeout(() => {
        node.classList.remove('is-visible');
        window.setTimeout(() => node.remove(), 220);
      }, ttl);
    }

    window.MBDUI = window.MBDUI || {};
    window.MBDUI.toast = toast;

    document.querySelectorAll('[data-toast]').forEach((el) => {
      el.addEventListener('click', () => {
        toast(el.getAttribute('data-toast') || 'Action completed', el.getAttribute('data-toast-type') || 'info');
      });
    });
  }

  function wireForms() {
    document.querySelectorAll('form.signup-form').forEach((form) => {
      form.addEventListener('submit', () => {
        if (window.MBDUI && typeof window.MBDUI.toast === 'function') {
          window.MBDUI.toast('Submitting your request…', 'info', 1800);
        }
      });
    });
  }

  function init() {
    pageTransition();
    setupNavDropdowns();
    setupReveal();
    setupCounters();
    setupConstellation();
    setupTooltips();
    setupModalTriggers();
    setupToasts();
    wireForms();
  }

  onReady(init);
})();
