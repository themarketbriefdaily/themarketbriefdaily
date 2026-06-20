/* ============================================================
   COURSE SIDEBAR UI — renders the expandable curriculum rail
   from CURRICULUM, wires dropdowns, checkmarks, progress,
   topic scrollspy, CFA badges, mark-complete, and mobile drawer.
   Requires: progress.js, courses-data.js
   Reads document.body[data-course], [data-lesson]
   ============================================================ */
(function () {
  'use strict';

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function cfaCls(l){ return l === 'L1' ? 'cfa-l1' : (l === 'L2' ? 'cfa-l2' : 'cfa-mix'); }
  function cfaBadge(l){ return l ? '<span class="cfa-badge ' + cfaCls(l) + '">CFA ' + l + '</span>' : ''; }
  function indexUrl(id){ return '/courses/' + id + '.html'; }

  var COURSE, LESSON, DATA;

  function build(){
    var body = document.body;
    COURSE = body.getAttribute('data-course');
    LESSON = body.getAttribute('data-lesson');
    var aside = document.getElementById('curric');
    if (!COURSE || !aside || !window.CURRICULUM) return;
    DATA = window.CURRICULUM[COURSE];
    if (!DATA) return;

    var h = '';
    h += '<div class="curric-head" data-progress-course="' + COURSE + '">';
    h += '<div class="ct-eyebrow">Course ' + cfaBadge(DATA.cfa) + '</div>';
    h += '<a class="ct-title" href="' + indexUrl(COURSE) + '">' + esc(DATA.title) + '</a>';
    h += '<div class="cp-row"><span class="lab">Your progress</span><span class="pct">0%</span></div>';
    h += '<div class="pbar"><i></i></div></div>';

    h += '<nav class="curric-list" aria-label="Lessons">';
    DATA.lessons.forEach(function (L) {
      var cur = (L.n === LESSON);
      var hasTopics = L.built && L.topics && L.topics.length;
      h += '<div class="cl-group' + (cur ? ' current' : '') + (cur && hasTopics ? ' open' : '') + '" data-lesson-n="' + L.n + '">';
      var inner = '<span class="check">✓</span><span class="cl-num">' + L.n + '</span>'
                + '<span class="cl-ttl">' + esc(L.title) + '</span>'
                + (L.cfa ? '<span class="cfa-badge sm ' + cfaCls(L.cfa) + '">' + L.cfa + '</span>' : '');
      if (L.built) {
        h += '<div class="cl-row">';
        h += '<a class="cl-link' + (cur ? ' is-current' : '') + '" href="' + L.url + '">' + inner + '</a>';
        if (hasTopics) h += '<button class="cl-toggle" aria-label="Show topics">▸</button>';
        h += '</div>';
        if (hasTopics) {
          h += '<div class="cl-topics">';
          L.topics.forEach(function (t) {
            h += '<a class="cl-topic" data-anchor="' + t.a + '" href="' + L.url + '#' + t.a + '">' + esc(t.t) + '</a>';
          });
          h += '</div>';
        }
      } else {
        h += '<div class="cl-row"><span class="cl-link soon">' + inner + '<span class="tag-soon">Soon</span></span></div>';
      }
      h += '</div>';
    });
    h += '</nav>';

    aside.innerHTML = h;

    // dropdown toggles
    aside.querySelectorAll('.cl-toggle').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        btn.closest('.cl-group').classList.toggle('open');
      });
    });

    // progress paint + checks
    if (window.Progress) { window.Progress.paintAll(); }
    paintChecks();
    window.addEventListener('tmbd-progress', function () {
      if (window.Progress) window.Progress.paintAll();
      paintChecks();
      paintMark();
    });

    wireMark();
    wireMobile();
    if (LESSON) wireScrollspy(aside);
  }

  function paintChecks(){
    if (!window.Progress) return;
    document.querySelectorAll('#curric .cl-group[data-lesson-n]').forEach(function (g) {
      g.classList.toggle('done', window.Progress.isDone(COURSE, g.getAttribute('data-lesson-n')));
    });
  }

  function paintMark(){
    var btn = document.getElementById('markBtn');
    if (!btn || !window.Progress || !LESSON) return;
    var done = window.Progress.isDone(COURSE, LESSON);
    btn.classList.toggle('done', done);
    var lbl = btn.querySelector('.lbl');
    if (lbl) lbl.textContent = done ? 'Lesson completed' : 'Mark lesson complete';
  }

  function wireMark(){
    var btn = document.getElementById('markBtn');
    if (!btn || !LESSON) return;
    btn.addEventListener('click', function () {
      if (window.Progress) window.Progress.toggle(COURSE, LESSON);
    });
    paintMark();
  }

  function wireMobile(){
    var c = document.getElementById('curric'), s = document.getElementById('scrim'), b = document.getElementById('menuBtn');
    if (!b) return;
    function close(){ c.classList.remove('open-drawer'); if (s) s.classList.remove('show'); }
    b.addEventListener('click', function () { c.classList.toggle('open-drawer'); if (s) s.classList.toggle('show'); });
    if (s) s.addEventListener('click', close);
    // close drawer when a link is tapped
    c.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  }

  function wireScrollspy(aside){
    var group = aside.querySelector('.cl-group.current');
    if (!group) return;
    var links = Array.prototype.slice.call(group.querySelectorAll('.cl-topic'));
    if (!links.length) return;
    var ids = links.map(function (a) { return a.getAttribute('data-anchor'); });
    function onScroll(){
      var mid = window.innerHeight * 0.28, cur = ids[0];
      ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) cur = id;
      });
      links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-anchor') === cur); });
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);
})();
