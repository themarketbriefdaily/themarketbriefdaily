/* quant.js — shared helpers for the /quant dashboard (Plotly + data loading).
   Light Plotly theme tuned to the tbp editorial palette so charts match the site. */
(function (global) {
  "use strict";

  var INK = "#0a0a0a", MUTED = "#5a5a5a", LINE = "#e3e0d8", BG = "#faf9f6", BGALT = "#f0eee8";
  var COLORS = {
    v5c: "#0a0a0a", v5b: "#0066ff", v5: "#c8a35a", spy: "#9a958a",
    bull: "#1a8a4a", contango: "#c8a35a", crisis: "#b03030",
    pos: "#1a8a4a", neg: "#b03030", blue: "#0066ff", gold: "#c8a35a",
  };
  var REGIME_FILL = {
    Bull: "rgba(26,138,74,0.07)", Contango: "rgba(200,163,90,0.10)", Crisis: "rgba(176,48,48,0.10)",
  };

  function fmtPct(x, dp) { if (x == null || isNaN(x)) return "–"; return (x * 100).toFixed(dp == null ? 1 : dp) + "%"; }
  function fmtNum(x, dp) { if (x == null || isNaN(x)) return "–"; return Number(x).toFixed(dp == null ? 2 : dp); }
  function fmtSignedPct(x, dp) { if (x == null || isNaN(x)) return "–"; var s = x >= 0 ? "+" : ""; return s + (x * 100).toFixed(dp == null ? 1 : dp) + "%"; }
  function fmtMoney(x, ccy) { if (x == null || isNaN(x)) return "–"; return (ccy || "£") + Number(x).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }); }

  function layout(over) {
    var base = {
      paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
      font: { family: "'Inter Tight', sans-serif", color: INK, size: 12 },
      margin: { l: 56, r: 18, t: 18, b: 40 },
      xaxis: { gridcolor: LINE, zerolinecolor: LINE, linecolor: LINE, tickfont: { color: MUTED } },
      yaxis: { gridcolor: LINE, zerolinecolor: LINE, linecolor: LINE, tickfont: { color: MUTED } },
      legend: { orientation: "h", y: 1.12, x: 0, font: { size: 11 }, bgcolor: "rgba(0,0,0,0)" },
      hovermode: "x unified",
      hoverlabel: { bgcolor: "#fff", bordercolor: LINE, font: { color: INK, size: 12 } },
      colorway: [INK, "#0066ff", "#c8a35a", "#9a958a", "#1a8a4a", "#b03030"],
      shapes: [], annotations: [],
    };
    return Object.assign(base, over || {});
  }
  var CONFIG = { responsive: true, displayModeBar: false, scrollZoom: false };

  // Plotly rectangle shapes for regime shading behind a chart
  function regimeShapes(segments, opacity) {
    if (!segments) return [];
    return segments.map(function (s) {
      return {
        type: "rect", xref: "x", yref: "paper", x0: s.start, x1: s.end, y0: 0, y1: 1,
        fillcolor: REGIME_FILL[s.regime] || "rgba(0,0,0,0)", line: { width: 0 }, layer: "below",
        opacity: opacity == null ? 1 : opacity,
      };
    });
  }

  function load(path) {
    return fetch(path + (path.indexOf("?") < 0 ? "?" : "&") + "t=" + Date.now())
      .then(function (r) { if (!r.ok) throw new Error(path + " " + r.status); return r.json(); });
  }

  function setUpdated(sel, iso) {
    var el = typeof sel === "string" ? document.querySelector(sel) : sel;
    if (!el) return;
    var d = iso ? new Date(iso) : new Date();
    el.textContent = "Last updated " + d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }

  function regimeClass(r) { return r === "Bull" ? "q-bull" : r === "Crisis" ? "q-crisis" : "q-contango"; }

  // tiny helper to build a table from rows
  function table(headers, rows) {
    var h = "<div class='q-table-wrap'><table class='q-table'><thead><tr>" +
      headers.map(function (x) { return "<th>" + x + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) {
        return "<tr" + (r._cls ? " class='" + r._cls + "'" : "") + ">" +
          r.cells.map(function (c) { return "<td class='" + (c.cls || "") + "'>" + c.v + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
    return h;
  }

  global.QUANT = {
    COLORS: COLORS, fmtPct: fmtPct, fmtNum: fmtNum, fmtSignedPct: fmtSignedPct, fmtMoney: fmtMoney,
    layout: layout, CONFIG: CONFIG, regimeShapes: regimeShapes, load: load, setUpdated: setUpdated,
    regimeClass: regimeClass, table: table,
  };
})(window);
