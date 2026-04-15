(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  function initScrollReveal() {
    const revealItems = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!revealItems.length || prefersReducedMotion) {
      revealItems.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        window.setTimeout(() => entry.target.classList.add('is-visible'), delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach((el) => observer.observe(el));
  }

  function initNavbar() {
    const header = $('.site-header');
    const mobileToggle = $('.mobile-nav-toggle');
    const panel = $('.mobile-nav-panel');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 60);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!mobileToggle || !panel) return;

    const closePanel = () => {
      mobileToggle.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!isOpen));
      panel.classList.toggle('is-open', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    panel.addEventListener('click', (event) => {
      const menu = $('.mobile-nav-menu', panel);
      if (menu && !menu.contains(event.target)) closePanel();
      if (event.target.closest('a')) closePanel();
    });
  }

  function initPageTransitions() {
    if (prefersReducedMotion) return;
    const shell = $('.site-shell');
    const overlay = $('.page-transition-overlay');
    if (!shell || !overlay) return;

    shell.style.opacity = '0';
    requestAnimationFrame(() => {
      shell.style.transition = 'opacity 200ms ease-out';
      shell.style.opacity = '1';
    });

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey) return;

      const targetUrl = new URL(link.href, window.location.href);
      if (targetUrl.origin !== window.location.origin) return;
      if (targetUrl.pathname === window.location.pathname && targetUrl.hash) return;

      event.preventDefault();
      overlay.classList.add('active');
      shell.style.opacity = '0';
      window.setTimeout(() => {
        window.location.href = targetUrl.href;
      }, 150);
    });
  }

  function initCounters() {
    const counters = $$('.metric-counter[data-target]');
    if (!counters.length) return;

    const formatValue = (value, format) => {
      if (format === 'percent') return `${value.toFixed(1)}%`;
      if (format === 'currency') return `£${value.toLocaleString()}`;
      if (format === 'decimal') return value.toFixed(2);
      return value.toLocaleString();
    };

    const animateCounter = (el) => {
      const target = Number(el.dataset.target || 0);
      const duration = 1200;
      const format = el.dataset.format || 'number';
      const start = performance.now();

      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - t) * (1 - t);
        const value = target * eased;
        el.textContent = formatValue(value, format);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    counters.forEach((counter) => obs.observe(counter));
  }

  function initSortableTables() {
    const tables = $$('.table[data-sortable="true"]');
    tables.forEach((table) => {
      const tbody = $('tbody', table);
      if (!tbody) return;

      $$('th.sortable', table).forEach((th) => {
        th.addEventListener('click', () => {
          const key = th.dataset.key;
          const type = th.dataset.type || 'text';
          const current = th.dataset.order === 'asc' ? 'desc' : 'asc';

          $$('th.sortable', table).forEach((item) => {
            item.dataset.order = '';
            item.classList.remove('sorted');
            const arrow = $('.arrow', item);
            if (arrow) arrow.textContent = '↕';
          });

          th.dataset.order = current;
          th.classList.add('sorted');
          const arrow = $('.arrow', th);
          if (arrow) arrow.textContent = current === 'asc' ? '↑' : '↓';

          const rows = [...tbody.querySelectorAll('tr[data-row="true"]')];
          rows.sort((a, b) => {
            const av = a.dataset[key] || '';
            const bv = b.dataset[key] || '';
            let compare = 0;
            if (type === 'number') compare = Number(av) - Number(bv);
            else compare = av.localeCompare(bv);
            return current === 'asc' ? compare : -compare;
          });

          rows.forEach((row) => {
            const detailId = row.dataset.detailId;
            tbody.appendChild(row);
            if (detailId) {
              const detailRow = document.getElementById(detailId);
              if (detailRow) tbody.appendChild(detailRow);
            }
          });
        });
      });
    });
  }

  function initAccordionRows() {
    $$('.js-expand-row').forEach((button) => {
      button.addEventListener('click', () => {
        const detailId = button.dataset.target;
        const detailRow = document.getElementById(detailId);
        if (!detailRow) return;
        const expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!expanded));
        detailRow.dataset.visible = expanded ? 'false' : 'true';
      });
    });
  }

  function initFilters() {
    $$('.js-filter-group').forEach((group) => {
      group.addEventListener('click', (event) => {
        const button = event.target.closest('[data-filter]');
        if (!button) return;

        $$('[data-filter]', group).forEach((btn) => btn.classList.remove('is-active'));
        button.classList.add('is-active');

        const value = button.dataset.filter;
        $$('.js-filter-item').forEach((item) => {
          const show = value === 'all' || item.dataset.category === value;
          item.dataset.visible = String(show);
        });
      });
    });
  }

  function initSearchFilter() {
    const input = $('.js-live-search');
    if (!input) return;

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      $$('.js-search-item').forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.dataset.visible = String(!query || text.includes(query));
      });
    });
  }

  function initAtoZ() {
    $$('.js-atoz').forEach((wrap) => {
      wrap.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#letter-"]');
        if (!link) return;
        const section = $(link.getAttribute('href'));
        if (!section) return;
        event.preventDefault();
        section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  function initLoadMore() {
    const button = $('.js-load-more');
    if (!button) return;

    button.addEventListener('click', () => {
      const hidden = $$('.js-load-item[data-visible="false"]');
      hidden.slice(0, 3).forEach((item, index) => {
        window.setTimeout(() => {
          item.dataset.visible = 'true';
          item.classList.add('reveal', 'is-visible');
        }, index * 100);
      });
      if ($$('.js-load-item[data-visible="false"]').length === 0) button.disabled = true;
    });
  }

  function initTickerFlash() {
    const dots = $$('.ticker-dot');
    if (!dots.length || prefersReducedMotion) return;

    const flashRandom = () => {
      const dot = dots[Math.floor(Math.random() * dots.length)];
      if (!dot) return;
      dot.classList.add('flash');
      window.setTimeout(() => dot.classList.remove('flash'), 320);
    };

    const loop = () => {
      flashRandom();
      const next = 3000 + Math.random() * 4000;
      window.setTimeout(loop, next);
    };
    loop();
  }

  function initSkeletons() {
    $$('.js-skeleton-grid').forEach((grid) => {
      const skeleton = $('.js-skeleton', grid.parentElement || document);
      if (!skeleton) return;
      grid.hidden = true;
      skeleton.hidden = false;
      window.setTimeout(() => {
        skeleton.hidden = true;
        grid.hidden = false;
      }, 800);
    });
  }

  function initCalculator() {
    const form = $('.js-growth-calculator');
    if (!form) return;
    const output = $('.js-growth-output');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const principal = Number($('#principal', form).value || 0);
      const monthly = Number($('#monthly', form).value || 0);
      const annual = Number($('#rate', form).value || 0) / 100;
      const years = Number($('#years', form).value || 0);

      const months = years * 12;
      const monthlyRate = annual / 12;
      let balance = principal;

      for (let i = 0; i < months; i += 1) {
        balance = (balance + monthly) * (1 + monthlyRate);
      }

      output.textContent = `Projected value: £${Math.round(balance).toLocaleString()} over ${years} years.`;
    });
  }

  function initConstellation() {
    const svg = $('[data-constellation]');
    if (!svg || prefersReducedMotion) return;

    const nodes = $$('[data-node]', svg).map((node) => ({
      el: node,
      x: Number(node.getAttribute('cx')),
      y: Number(node.getAttribute('cy')),
      dx: (Math.random() > 0.5 ? 1 : -1) * (0.1 + Math.random() * 0.3),
      dy: (Math.random() > 0.5 ? 1 : -1) * (0.1 + Math.random() * 0.3)
    }));

    const lines = $$('[data-line]', svg).map((line) => ({
      el: line,
      a: Number(line.dataset.a),
      b: Number(line.dataset.b)
    }));

    let rafId = null;
    const bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 };

    const updateLine = (lineObj) => {
      const a = nodes[lineObj.a];
      const b = nodes[lineObj.b];
      if (!a || !b) return;
      lineObj.el.setAttribute('x1', `${a.x}`);
      lineObj.el.setAttribute('y1', `${a.y}`);
      lineObj.el.setAttribute('x2', `${b.x}`);
      lineObj.el.setAttribute('y2', `${b.y}`);
    };

    const tick = () => {
      nodes.forEach((node) => {
        node.x += node.dx * 0.12;
        node.y += node.dy * 0.12;

        if (node.x < bounds.minX || node.x > bounds.maxX) node.dx *= -1;
        if (node.y < bounds.minY || node.y > bounds.maxY) node.dy *= -1;

        node.el.setAttribute('cx', `${Math.max(bounds.minX, Math.min(bounds.maxX, node.x))}`);
        node.el.setAttribute('cy', `${Math.max(bounds.minY, Math.min(bounds.maxY, node.y))}`);
      });

      lines.forEach(updateLine);
      rafId = requestAnimationFrame(tick);
    };

    const brighten = (x, y) => {
      nodes.forEach((node, index) => {
        const distance = Math.hypot(node.x - x, node.y - y);
        const near = distance <= 12;
        node.el.classList.toggle('is-near', near);

        lines.forEach((line) => {
          if (line.a === index || line.b === index) {
            line.el.classList.toggle('is-near', near);
          }
        });
      });
    };

    svg.addEventListener('pointermove', (event) => {
      const rect = svg.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      brighten(x, y);
    });

    svg.addEventListener('pointerleave', () => {
      nodes.forEach((node) => node.el.classList.remove('is-near'));
      lines.forEach((line) => line.el.classList.remove('is-near'));
    });

    rafId = requestAnimationFrame(tick);
    window.addEventListener('beforeunload', () => {
      if (rafId) cancelAnimationFrame(rafId);
    });
  }

  function initFundRowExpansion() {
    const table = $('.js-fund-table');
    if (!table) return;

    table.addEventListener('click', (event) => {
      const trigger = event.target.closest('.js-expand-row');
      if (!trigger) return;
      const detailId = trigger.dataset.target;
      const detail = document.getElementById(detailId);
      if (!detail) return;
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      detail.dataset.visible = expanded ? 'false' : 'true';
      detail.hidden = expanded;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initPageTransitions();
    initScrollReveal();
    initCounters();
    initSortableTables();
    initAccordionRows();
    initFilters();
    initSearchFilter();
    initAtoZ();
    initLoadMore();
    initTickerFlash();
    initSkeletons();
    initCalculator();
    initConstellation();
    initFundRowExpansion();
  });
})();
