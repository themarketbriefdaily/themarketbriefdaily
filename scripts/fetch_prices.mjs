// scripts/fetch_prices.mjs
import fs from "fs";

const TICKERS = [
  // Stooq uses EXCHANGE suffix like .US on many US listings
  // If one doesn't work, we'll adjust the symbol mapping.
  { key: "AGI", stooq: "AGI.US" },
  { key: "FSM", stooq: "FSM.US" },
  { key: "GAU", stooq: "GAU.US" },
  { key: "NFGC", stooq: "NFGC.US" },
  { key: "VGZ", stooq: "VGZ.US" },
  { key: "NEWP", stooq: "NEWP.US" }
];

const OUT_PATH = "data/prices.json";

function pickTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`, "i"));
  return m ? m[1].trim() : null;
}

async function fetchOne(symbol) {
  const url = `https://stooq.pl/q/l/?s=${encodeURIComponent(symbol)}&e=xml`;
  const res = await fetch(url, { headers: { "User-Agent": "marketbriefdaily-bot/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${symbol}`);
  const xml = await res.text();

  // The XML contains fields like date/time/open/high/low/close/volume (per Stooq API wrappers)
  const date = pickTag(xml, "date");
  const time = pickTag(xml, "time");
  const open = pickTag(xml, "open");
  const close = pickTag(xml, "close");

  if (!date || !close) {
    throw new Error(`Missing fields for ${symbol}. Got date=${date} close=${close}`);
  }

  return {
    symbol,
    date,
    time,
    open: open ? Number(open) : null,
    close: Number(close)
  };
}

async function main() {
  const quotes = {};
  const errors = [];

  for (const t of TICKERS) {
    try {
      const q = await fetchOne(t.stooq);
      quotes[t.key] = q;
    } catch (e) {
      errors.push({ ticker: t.key, symbol: t.stooq, error: String(e.message || e) });
    }
  }

  const out = {
    asOf: new Date().toISOString(),
    source: "stooq",
    quotes,
    errors: errors.length ? errors : undefined
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`Wrote ${OUT_PATH}`);
  if (errors.length) {
    console.warn("Some tickers failed:", errors);
    // Don't hard-fail; you can decide later if you want to fail the build.
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
