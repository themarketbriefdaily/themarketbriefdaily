(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rafIds = [];

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function initPageReady() {
    requestAnimationFrame(() => document.body.classList.add('page-ready'));
  }

  function initNav() {
    const header = document.querySelector('.site-header');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (!header) return;

    const setScrolled = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 60);
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });

    const currentPath = location.pathname.replace(/\/$/, '') || '/';
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const path = new URL(href, location.origin).pathname.replace(/\/$/, '') || '/';
      if (path === currentPath) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });

    const closeMenu = () => {
      document.body.classList.remove('menu-open');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    };

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = document.body.classList.toggle('menu-open');
        menuToggle.setAttribute('aria-expanded', String(open));
      });

      mobileMenu.addEventListener('click', (event) => {
        if (event.target === mobileMenu) closeMenu();
      });

      document.addEventListener('click', (event) => {
        if (!document.body.classList.contains('menu-open')) return;
        const insideMenu = mobileMenu.contains(event.target);
        const onToggle = menuToggle.contains(event.target);
        if (!insideMenu && !onToggle) closeMenu();
      });

      mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
      });
    }
  }

  function initReveal() {
    if (reducedMotion) {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        if ([0, 100, 200, 300].includes(delay)) {
          entry.target.style.transitionDelay = `${delay}ms`;
        }
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((target) => observer.observe(target));
  }

  function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    if (reducedMotion) {
      counters.forEach((el) => {
        const value = Number(el.dataset.counter || 0);
        const decimals = Number(el.dataset.decimals || 0);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      });
      return;
    }

    const animateCounter = (el) => {
      const target = Number(el.dataset.counter || 0);
      const decimals = Number(el.dataset.decimals || 0);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1200;
      const start = performance.now();

      const step = (time) => {
        const progress = Math.min(1, (time - start) / duration);
        const eased = easeOutQuad(progress);
        const current = target * eased;
        el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
        if (progress < 1) {
          const id = requestAnimationFrame(step);
          rafIds.push(id);
        }
      };
      const id = requestAnimationFrame(step);
      rafIds.push(id);
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    counters.forEach((counter) => observer.observe(counter));
  }

  function initSkeletons() {
    const wrappers = document.querySelectorAll('[data-skeleton-grid]');
    wrappers.forEach((wrapper) => {
      const skeleton = wrapper.querySelector('[data-skeleton]');
      const real = wrapper.querySelector('[data-real]');
      if (!skeleton || !real) return;
      setTimeout(() => {
        skeleton.classList.add('hidden');
        real.classList.remove('hidden');
      }, 800);
    });
  }

  function initTickerUpdates() {
    const ticker = document.querySelector('.market-ticker');
    if (!ticker) return;

    const pulse = () => {
      const items = [...ticker.querySelectorAll('.ticker-item[data-change]')];
      if (!items.length) return;
      const item = items[Math.floor(Math.random() * items.length)];
      const change = item.dataset.change || '';
      const cls = change.startsWith('-') ? 'flash-down' : 'flash-up';
      item.classList.add(cls);
      setTimeout(() => item.classList.remove(cls), 700);
    };

    const loop = () => {
      pulse();
      const nextIn = 3000 + Math.floor(Math.random() * 4000);
      setTimeout(loop, nextIn);
    };

    setTimeout(loop, 2200);
  }

  function initPageTransitions() {
    const overlay = document.querySelector('.page-transition-overlay');
    if (!overlay || reducedMotion) return;

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      const url = new URL(href, location.origin);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;

      event.preventDefault();
      overlay.classList.add('is-active');
      setTimeout(() => {
        location.href = url.href;
      }, 150);
    });
  }

  function initConstellation() {
    const canvases = document.querySelectorAll('[data-constellation]');
    if (!canvases.length) return;

    canvases.forEach((canvas) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = {
        width: 0,
        height: 0,
        nodes: [],
        pointer: { x: -9999, y: -9999 },
      };

      const container = canvas.parentElement;
      const nodeCount = Number(canvas.dataset.nodes || 36);

      const setup = () => {
        const rect = container.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        state.width = Math.max(320, rect.width);
        state.height = Math.max(220, rect.height);
        canvas.width = Math.floor(state.width * dpr);
        canvas.height = Math.floor(state.height * dpr);
        canvas.style.width = `${state.width}px`;
        canvas.style.height = `${state.height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        state.nodes = Array.from({ length: nodeCount }, () => ({
          x: Math.random() * state.width,
          y: Math.random() * state.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          r: 1.2 + Math.random() * 1.8,
          pulseOffset: Math.random() * Math.PI * 2,
        }));
      };

      setup();

      const onPointerMove = (event) => {
        const rect = canvas.getBoundingClientRect();
        state.pointer.x = event.clientX - rect.left;
        state.pointer.y = event.clientY - rect.top;
      };
      const onPointerLeave = () => {
        state.pointer.x = -9999;
        state.pointer.y = -9999;
      };

      canvas.addEventListener('mousemove', onPointerMove, { passive: true });
      canvas.addEventListener('mouseleave', onPointerLeave);

      let startTime = performance.now();

      const frame = (now) => {
        const elapsed = now - startTime;
        ctx.clearRect(0, 0, state.width, state.height);

        state.nodes.forEach((node) => {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x <= 0 || node.x >= state.width) node.vx *= -1;
          if (node.y <= 0 || node.y >= state.height) node.vy *= -1;

          node.x = Math.min(state.width, Math.max(0, node.x));
          node.y = Math.min(state.height, Math.max(0, node.y));
        });

        for (let i = 0; i < state.nodes.length; i += 1) {
          for (let j = i + 1; j < state.nodes.length; j += 1) {
            const a = state.nodes[i];
            const b = state.nodes[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 140) continue;

            const nearA = Math.hypot(a.x - state.pointer.x, a.y - state.pointer.y) < 120;
            const nearB = Math.hypot(b.x - state.pointer.x, b.y - state.pointer.y) < 120;
            const pulseWave = Math.sin(((elapsed / 4000) * Math.PI * 2) + ((i + j) * 0.3));
            const basePulse = 0.15 + ((pulseWave + 1) / 2) * 0.2;
            const opacity = nearA || nearB ? 1 : basePulse;

            ctx.strokeStyle = `rgba(15, 92, 255, ${opacity.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        state.nodes.forEach((node, i) => {
          const near = Math.hypot(node.x - state.pointer.x, node.y - state.pointer.y) < 120;
          const pulse = 0.6 + ((Math.sin((elapsed / 1800) + node.pulseOffset + i * 0.1) + 1) / 2) * 0.4;
          const opacity = near ? 1 : pulse * 0.6;
          ctx.fillStyle = `rgba(15, 92, 255, ${opacity.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
          ctx.fill();
        });

        if (!reducedMotion) {
          const id = requestAnimationFrame(frame);
          rafIds.push(id);
        }
      };

      if (!reducedMotion) {
        const id = requestAnimationFrame(frame);
        rafIds.push(id);
      } else {
        frame(performance.now());
      }

      window.addEventListener('resize', setup, { passive: true });
    });

    const cleanup = () => {
      rafIds.forEach((id) => cancelAnimationFrame(id));
    };
    window.addEventListener('pagehide', cleanup, { once: true });
    window.addEventListener('beforeunload', cleanup, { once: true });
  }

  onReady(() => {
    initPageReady();
    initNav();
    initReveal();
    initCounters();
    initSkeletons();
    initTickerUpdates();
    initPageTransitions();
    initConstellation();
  });
})();
