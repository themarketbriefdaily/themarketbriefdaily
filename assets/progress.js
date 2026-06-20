/* ============================================================
   COURSE PROGRESS — per-user, localStorage-backed
   No account needed: progress is saved in the visitor's browser.
   ============================================================ */
(function (global) {
  'use strict';

  // Course registry — total lesson counts drive the progress bars.
  var COURSES = {
    'derivatives-pricing':            { title: 'Derivatives Pricing',                       total: 10 },
    'portfolio-management':           { title: 'Portfolio Management',                      total: 9  },
    'equity-analysis':                { title: 'Equity Analysis',                           total: 10 },
    'risk-management':                { title: "Financial Institutions' Risk Management",   total: 9  },
    'advanced-financial-accounting':  { title: 'Advanced Financial Accounting',             total: 11 },
    'quantitative-research-methods':  { title: 'Quantitative Research Methods',             total: 7  }
  };

  var KEY = 'tmbd_progress_v1';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function write(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  var Progress = {
    courses: COURSES,

    isDone: function (course, lesson) {
      var d = read();
      return !!(d[course] && d[course][String(lesson)]);
    },

    setDone: function (course, lesson, done) {
      var d = read();
      d[course] = d[course] || {};
      if (done) d[course][String(lesson)] = 1;
      else delete d[course][String(lesson)];
      if (d[course] && Object.keys(d[course]).length === 0) delete d[course];
      write(d);
      try { global.dispatchEvent(new CustomEvent('tmbd-progress', { detail: { course: course } })); } catch (e) {}
      return done;
    },

    toggle: function (course, lesson) {
      return this.setDone(course, lesson, !this.isDone(course, lesson));
    },

    completed: function (course) {
      var d = read();
      return d[course] ? Object.keys(d[course]).length : 0;
    },

    total: function (course) {
      return (COURSES[course] && COURSES[course].total) || 0;
    },

    pct: function (course) {
      var t = this.total(course);
      return t ? Math.round(this.completed(course) / t * 100) : 0;
    },

    // Paint every [data-progress-course] element: fills a .pbar > i and a .pct label.
    paintAll: function () {
      var self = this;
      var nodes = document.querySelectorAll('[data-progress-course]');
      Array.prototype.forEach.call(nodes, function (el) {
        var c = el.getAttribute('data-progress-course');
        var pct = self.pct(c), done = self.completed(c), tot = self.total(c);
        var fill = el.querySelector('.pbar > i');
        if (fill) fill.style.width = pct + '%';
        var lbl = el.querySelector('.pct');
        if (lbl) lbl.textContent = pct + '%';
        var frac = el.querySelector('.pfrac');
        if (frac) frac.textContent = done + ' / ' + tot;
        el.classList.toggle('is-complete', tot > 0 && done >= tot);
        el.classList.toggle('is-started', done > 0 && done < tot);
      });
    }
  };

  global.Progress = Progress;
  if (document.readyState !== 'loading') Progress.paintAll();
  else document.addEventListener('DOMContentLoaded', function () { Progress.paintAll(); });
  global.addEventListener('tmbd-progress', function () { Progress.paintAll(); });
})(window);
