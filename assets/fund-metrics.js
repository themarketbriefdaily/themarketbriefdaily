/* ============================================================
   fund-metrics.js — institutional performance & risk statistics
   Single source of truth: /data/funds-history.json -> funds[id].metrics
   Renders a key-metric strip (#fund-keystrip) and a full Fund-vs-
   Benchmark statistics table (#fund-stats), and reconciles the page's
   existing hero / sidebar figures by matching their labels so nothing
   can drift out of sync.
   ============================================================ */
(function () {
  'use strict';
  var DATA_URL = '/data/funds-history.json';

  function pct(x, dp, sign) {
    if (x === null || x === undefined || isNaN(x)) return '—';
    dp = (dp === undefined) ? 1 : dp;
    var s = (x * 100).toFixed(dp) + '%';
    if (sign && x > 0) s = '+' + s;
    if (x < 0) s = s.replace('-', '−'); // proper minus
    return s;
  }
  function num(x, dp) {
    if (x === null || x === undefined || isNaN(x)) return '—';
    return x.toFixed(dp === undefined ? 2 : dp).replace('-', '−');
  }
  function cls(x) { return x > 0 ? 'pos' : (x < 0 ? 'neg' : ''); }

  // map of hero/sidebar label text -> how to fill it
  function labelResolver(m) {
    var f = m.fund, b = m.bench, r = m.rel;
    return {
      'Ann. Return (5Y)':  { val: pct(f.ret, 1, true), note: m.window + ' annualised' },
      'Ann. Return (3Y)':  { val: pct(f.ret, 1, true), note: m.window + ' annualised' },
      'Ann. Return (ann.)':{ val: pct(f.ret, 1, true), note: m.window },
      'Est. Annual Return':{ val: pct(f.ret, 1, true) },
      'Sharpe Ratio':      { val: num(f.sharpe), note: m.window + ', annualised' },
      'Sortino Ratio':     { val: num(f.sortino), note: m.window },
      'Sortino':           { val: num(f.sortino) },
      'Volatility (Ann.)': { val: pct(f.vol, 1), note: 'vs ' + pct(b.vol, 1) + ' benchmark' },
      'Max Drawdown':      { val: pct(f.mdd, 1), note: m.mddDate },
      'Beta':              { val: num(r.beta) },
      'Calmar Ratio':      { val: num(f.calmar) }
    };
  }

  function reconcile(scopeSel, labelSel, valSel, noteSel, map) {
    document.querySelectorAll(scopeSel).forEach(function (cell) {
      var lab = cell.querySelector(labelSel);
      if (!lab) return;
      var key = lab.textContent.trim();
      var spec = map[key];
      if (!spec) return;
      var v = cell.querySelector(valSel);
      if (v && spec.val !== undefined) v.textContent = spec.val;
      var n = cell.querySelector(noteSel);
      if (n && spec.note) n.textContent = spec.note;
    });
  }

  function keystrip(host, fd, m) {
    var f = m.fund;
    var tiles = [
      { k: 'Ann. Return', v: pct(f.ret, 1, true), c: cls(f.ret) },
      { k: 'Sortino Ratio', v: num(f.sortino), hi: true },
      { k: 'Sharpe Ratio', v: num(f.sharpe) },
      { k: 'Calmar Ratio', v: num(f.calmar) },
      { k: 'Max Drawdown', v: pct(f.mdd, 1), c: 'neg' }
    ];
    var html = '<div class="ks-caption">' + m.window + ' annualised · benchmark ' + fd.benchmarkLabel +
      ' · ' + m.nmonths + ' monthly obs.</div><div class="ks-row">';
    tiles.forEach(function (t) {
      html += '<div class="ks-tile' + (t.hi ? ' ks-hi' : '') + '">' +
        '<span class="ks-val ' + (t.c || '') + '">' + t.v + '</span>' +
        '<span class="ks-key">' + t.k + '</span></div>';
    });
    html += '</div>';
    host.innerHTML = html;
  }

  function stats(host, fd, m) {
    var f = m.fund, b = m.bench, r = m.rel;
    function row(label, fv, bv, hi, note) {
      return '<tr' + (hi ? ' class="st-hi"' : '') + '><td class="st-m">' + label +
        (note ? '<span class="st-note">' + note + '</span>' : '') +
        '</td><td class="st-f">' + fv + '</td><td class="st-b">' + bv + '</td></tr>';
    }
    var html = '<div class="st-head"><h3>Performance &amp; Risk Statistics</h3>' +
      '<span class="st-win">' + m.window + ' · ' + m.nmonths + ' monthly observations · risk-free ' + pct(m.rf, 1) + '</span></div>' +
      '<table class="stats-table"><thead><tr><th>Metric</th><th>Fund</th><th>' + fd.benchmarkLabel + '</th></tr></thead><tbody>';
    html += row('Annualised return', pct(f.ret, 1, true), pct(b.ret, 1, true));
    html += row('Annualised volatility', pct(f.vol, 1), pct(b.vol, 1));
    html += row('Sortino ratio', num(f.sortino), num(b.sortino), true, 'return per unit of downside risk');
    html += row('Sharpe ratio', num(f.sharpe), num(b.sharpe));
    html += row('Calmar ratio', num(f.calmar), num(b.calmar), false, 'return ÷ max drawdown');
    html += row('Maximum drawdown', pct(f.mdd, 1), pct(b.mdd, 1), false, m.mddPeak + ' → ' + m.mddDate);
    html += row('Positive months', pct(f.pos, 0), pct(b.pos, 0));
    html += row('Best / worst month', pct(f.best, 1, true) + ' / ' + pct(f.worst, 1), pct(b.best, 1, true) + ' / ' + pct(b.worst, 1));
    html += '<tr class="st-sub"><td colspan="3">Relative to benchmark</td></tr>';
    html += row('Beta', num(r.beta), '1.00');
    html += row('Annualised alpha', pct(r.alpha, 1, true), '0.0%', false, 'Jensen’s α');
    html += row('Tracking error', pct(r.te, 1), '—');
    html += row('Information ratio', num(r.ir), '—');
    html += row('Upside capture', pct(r.up, 0), '100%');
    html += row('Downside capture', pct(r.down, 0), '100%');
    html += row('Correlation', num(r.corr), '1.00');
    html += '</tbody></table>';
    host.innerHTML = html;
  }

  function run() {
    var anchor = document.querySelector('[data-fund-id]');
    if (!anchor) return;
    var id = anchor.getAttribute('data-fund-id');
    fetch(DATA_URL).then(function (r) { return r.json(); }).then(function (data) {
      var fd = data && data.funds && data.funds[id];
      if (!fd || !fd.metrics) return;
      var m = fd.metrics;
      var ks = document.getElementById('fund-keystrip');
      var st = document.getElementById('fund-stats');
      if (ks) keystrip(ks, fd, m);
      if (st) stats(st, fd, m);
      var map = labelResolver(m);
      reconcile('.fund-meta-item', '.label', '.value', '.x-note', map); // hero (no note span by default)
      reconcile('.metric-cell', '.m-label', '.m-value', '.m-note', map); // sidebar
    }).catch(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
