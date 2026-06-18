/* quant.js, shared helpers for the /quant "Markets Terminal".
   Dark Plotly theme + neon palette, access-code gate, animated background,
   and a live ticker. Auto-initialises on any page with <body class="quant-dark">. */
(function (global) {
  "use strict";

  // neon palette (matches quant.css)
  var TXT = "#eef4ff", MUTED = "#aebfdd", GRID = "rgba(120,160,255,0.12)", LINE = "rgba(120,160,255,0.22)";
  var COLORS = {
    v5c: "#28e0f0", v5b: "#a98bff", v5: "#f7bd57", spy: "#5f769b",
    bull: "#2ce8a6", contango: "#f7bd57", crisis: "#ff5d72",
    pos: "#2ce8a6", neg: "#ff5d72", blue: "#28e0f0", gold: "#f7bd57", violet: "#a98bff",
  };
  var REGIME_FILL = {
    Bull: "rgba(44,232,166,0.10)", Contango: "rgba(247,189,87,0.11)", Crisis: "rgba(255,93,114,0.13)",
  };
  var MONO = "'JetBrains Mono', ui-monospace, monospace";

  function fmtPct(x, dp) { if (x == null || isNaN(x)) return "–"; return (x * 100).toFixed(dp == null ? 1 : dp) + "%"; }
  function fmtNum(x, dp) { if (x == null || isNaN(x)) return "–"; return Number(x).toFixed(dp == null ? 2 : dp); }
  function fmtSignedPct(x, dp) { if (x == null || isNaN(x)) return "–"; return (x >= 0 ? "+" : "") + (x * 100).toFixed(dp == null ? 1 : dp) + "%"; }
  function fmtMoney(x, ccy) { if (x == null || isNaN(x)) return "–"; return (ccy || "£") + Number(x).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }); }

  function layout(over) {
    var base = {
      paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
      font: { family: MONO, color: TXT, size: 11.5 },
      margin: { l: 56, r: 18, t: 18, b: 40 },
      xaxis: { gridcolor: GRID, zerolinecolor: LINE, linecolor: LINE, tickfont: { color: MUTED } },
      yaxis: { gridcolor: GRID, zerolinecolor: LINE, linecolor: LINE, tickfont: { color: MUTED } },
      legend: { orientation: "h", y: 1.14, x: 0, font: { size: 11, color: TXT }, bgcolor: "rgba(0,0,0,0)" },
      hovermode: "x unified",
      hoverlabel: { bgcolor: "#0d1426", bordercolor: LINE, font: { color: TXT, size: 12, family: MONO } },
      colorway: ["#28e0f0", "#a98bff", "#f7bd57", "#2ce8a6", "#ff5d72", "#5f769b"],
      shapes: [], annotations: [],
    };
    return Object.assign(base, over || {});
  }
  var CONFIG = { responsive: true, displayModeBar: false, scrollZoom: false };

  function regimeShapes(segments, opacity) {
    if (!segments) return [];
    return segments.map(function (s) {
      return { type: "rect", xref: "x", yref: "paper", x0: s.start, x1: s.end, y0: 0, y1: 1,
        fillcolor: REGIME_FILL[s.regime] || "rgba(0,0,0,0)", line: { width: 0 }, layer: "below", opacity: opacity == null ? 1 : opacity };
    });
  }

  function load(path) {
    return fetch(path + (path.indexOf("?") < 0 ? "?" : "&") + "t=" + Date.now())
      .then(function (r) { if (!r.ok) throw new Error(path + " " + r.status); return r.json(); });
  }
  function setUpdated(sel, iso) {
    var el = typeof sel === "string" ? document.querySelector(sel) : sel; if (!el) return;
    var d = iso ? new Date(iso) : new Date();
    el.textContent = "Last updated " + d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }
  function regimeClass(r) { return r === "Bull" ? "q-bull" : r === "Crisis" ? "q-crisis" : "q-contango"; }
  function table(headers, rows) {
    return "<div class='q-table-wrap'><table class='q-table'><thead><tr>" +
      headers.map(function (x) { return "<th>" + x + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr" + (r._cls ? " class='" + r._cls + "'" : "") + ">" +
        r.cells.map(function (c) { return "<td class='" + (c.cls || "") + "'>" + c.v + "</td>"; }).join("") + "</tr>"; }).join("") +
      "</tbody></table></div>";
  }

  // ---------------- access gate (soft, client-side) ----------------
  // Default code: TMBD-EDGE-2026. Stored reversed+lowercased to deter casual view-source.
  // To change the code: set ACCESS_REV to your new code, lowercased and reversed
  //   e.g. in any console:  'MY-NEW-CODE'.toLowerCase().split('').reverse().join('')
  var ACCESS_REV = "6202-egde-dbmt";
  var UNLOCK_KEY = "tmbd_quant_unlocked";
  function rev(s) { return s.split("").reverse().join(""); }
  function codeOk(input) { return rev((input || "").trim().toLowerCase()) === ACCESS_REV; }

  function initGate() {
    var body = document.body;
    if (body.getAttribute("data-q-gated") !== "1") return;
    if (localStorage.getItem(UNLOCK_KEY) === "1") { body.classList.add("q-unlocked"); return; }
    var gate = document.createElement("section");
    gate.id = "q-gate";
    gate.innerHTML =
      '<div class="lock">🔒</div>' +
      '<h2>Subscriber access</h2>' +
      '<p>The live v5c terminal, signal, backtest, risk analytics and the portfolio tracker, is for Market Brief subscribers. Enter your access code to unlock it on this device.</p>' +
      '<div class="row"><input id="q-code" type="text" placeholder="ACCESS CODE" autocomplete="off" spellcheck="false" aria-label="Access code">' +
      '<button class="q-btn" id="q-unlock">Unlock</button></div>' +
      '<div class="err" id="q-err"></div>' +
      '<div class="sub">Subscribers get the code in the paid newsletter. ' +
      '<a href="https://marketbriefdaily.substack.com" target="_blank" rel="noopener">Subscribe to get access →</a></div>';
    var main = document.querySelector("main");
    (main && main.parentNode) ? main.parentNode.insertBefore(gate, main) : body.appendChild(gate);
    var input = gate.querySelector("#q-code"), err = gate.querySelector("#q-err");
    function attempt() {
      if (codeOk(input.value)) {
        localStorage.setItem(UNLOCK_KEY, "1");
        body.classList.add("q-unlocked");
        gate.remove();
        setTimeout(function () { window.dispatchEvent(new Event("resize")); }, 60); // reflow any hidden charts
      } else { err.textContent = "Incorrect code. Check the latest paid newsletter."; input.select(); }
    }
    gate.querySelector("#q-unlock").addEventListener("click", attempt);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") attempt(); });
  }

  // ---------------- animated background ----------------
  function initBg() {
    if (document.getElementById("q-bg")) return;
    var c = document.createElement("canvas"); c.id = "q-bg"; document.body.insertBefore(c, document.body.firstChild);
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ctx = c.getContext("2d"), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), t = 0;
    function size() { W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr; }
    size(); window.addEventListener("resize", size);
    // a few evolving "price feed" lines
    var lines = [];
    for (var i = 0; i < 3; i++) lines.push({ y: 0.3 + i * 0.22, amp: 28 + i * 16, sp: 0.6 + i * 0.35, ph: i * 2, col: ["40,224,240", "169,139,255", "44,232,166"][i] });
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var step = 46 * dpr;
      ctx.lineWidth = 1; ctx.strokeStyle = "rgba(120,160,255,0.05)";
      var off = (t * 8 * dpr) % step;
      for (var x = -off; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (var y = -off; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      lines.forEach(function (L) {
        ctx.beginPath();
        for (var px = 0; px <= W; px += 6 * dpr) {
          var fx = px / W;
          var yy = L.y * H + Math.sin(fx * 7 + t * L.sp + L.ph) * L.amp * dpr + Math.sin(fx * 19 + t * L.sp * 1.7) * L.amp * 0.35 * dpr;
          px === 0 ? ctx.moveTo(px, yy) : ctx.lineTo(px, yy);
        }
        ctx.strokeStyle = "rgba(" + L.col + ",0.22)"; ctx.lineWidth = 1.4 * dpr;
        ctx.shadowColor = "rgba(" + L.col + ",0.5)"; ctx.shadowBlur = 12 * dpr; ctx.stroke(); ctx.shadowBlur = 0;
      });
      t += 0.016; requestAnimationFrame(draw);
    }
    if (reduce) { draw(); /* one frame */ } else { requestAnimationFrame(draw); }
  }

  // ---------------- live ticker ----------------
  function initTicker() {
    var hero = document.querySelector(".tbp-hero");
    var anchor = document.querySelector("main");
    if (!anchor) return;
    var bar = document.createElement("div"); bar.className = "q-ticker";
    bar.innerHTML = "<div class='track' id='q-track'></div>";
    anchor.parentNode.insertBefore(bar, anchor);
    Promise.all([load("/data/quant/signal.json").catch(function () { return null; }),
                 load("/data/quant/meta.json").catch(function () { return null; })]).then(function (r) {
      var sig = r[0], meta = r[1]; if (!sig && !meta) { bar.remove(); return; }
      var items = [];
      if (sig) {
        items.push("<span class='sym'>v5c</span> regime <b class='" + (sig.regime === "Crisis" ? "dn" : sig.regime === "Bull" ? "up" : "") + "'>" + (sig.regime || "").toUpperCase() + "</b>");
        items.push("conviction <b>" + fmtNum(sig.conviction, 2) + "</b>");
        items.push("credit gate <b>" + (sig.credit_gate_active ? "ON" : "off") + "</b>");
        (sig.allocation || []).forEach(function (a) { if (a.weight > 0.001) items.push("<span class='sym'>" + a.ticker + "</span> <b>" + fmtPct(a.weight, 0) + "</b>"); });
      }
      var h = (sig && sig.headline) || (meta && meta.headline) || {};
      if (h.cagr != null) { items.push("CAGR <b class='up'>" + fmtPct(h.cagr) + "</b>"); items.push("Sharpe <b>" + fmtNum(h.sharpe) + "</b>"); items.push("MaxDD <b class='dn'>" + fmtPct(h.max_dd) + "</b>"); }
      var seq = items.join("<span style='opacity:.35'>&nbsp;&nbsp;•&nbsp;&nbsp;</span>");
      document.getElementById("q-track").innerHTML = seq + "<span style='opacity:.35'>&nbsp;&nbsp;•&nbsp;&nbsp;</span>" + seq;
    });
  }

  function init() {
    if (!document.body.classList.contains("quant-dark")) return;
    initBg(); initTicker(); initGate();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  global.QUANT = {
    COLORS: COLORS, fmtPct: fmtPct, fmtNum: fmtNum, fmtSignedPct: fmtSignedPct, fmtMoney: fmtMoney,
    layout: layout, CONFIG: CONFIG, regimeShapes: regimeShapes, load: load, setUpdated: setUpdated,
    regimeClass: regimeClass, table: table, codeOk: codeOk,
  };
})(window);
