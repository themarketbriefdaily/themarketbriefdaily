// scripts/fetch_prices.mjs
import fs from "fs";

const ENTRY_DATE = "2026-02-11"; // YYYY-MM-DD (Feb 11, 2026)
const OUT_PATH = "data/prices.json";

// Adjust these if any symbol fails (errors will be written to prices.json)
const TICKERS = [
  { key: "AGI",  stooq: "AGI.US"  },
  { key: "FSM",  stooq: "FSM.US"  },
  { key: "GAU",  stooq: "GAU.US"  },
  { key: "NFGC", stooq: "NFGC.US" },
  { key: "VGZ",  stooq: "VGZ.US"  },
  { key: "NEWP", stooq: "NEWP.US" }
];

function pickTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`, "i"));
  return m ? m[1].trim() : null;
}

async function fetchQuoteXML(symbol) {
  const url = `https://stooq.pl/q/l/?s=${encodeURIComponent(symbol)}&e=xml`;
  const res = await fetch(url, { headers: { "User-Agent": "marketbriefdaily-bot/1.0" } });
  if (!res.ok) throw new Error(`Quote HTTP ${res.status}`);
  const xml = await res.text();

  const date = pickTag(xml, "date");
  const time = pickTag(xml, "time");
  const close = pickTag(xml, "close");

  return {
    symbol,
    date,
    time,
    close: close ? Number(close) : null
  };
}

async function fetchEntryOpenFromCSV(symbol, entryDate) {
  // Stooq daily history CSV endpoint
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=d`;
  const res = await fetch(url, { headers: { "User-Agent": "marketbriefdaily-bot/1.0" } });
  if (!res.ok) throw new Error(`History HTTP ${res.status}`);

  const csv = await res.text();
  // CSV header: Date,Open,High,Low,Close,Volume
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("History empty");

  // Find row matching ENTRY_DATE
  // Example line: 2026-02-11,12.34,12.50,12.20,12.45,123456
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts[0] === entryDate) {
      const open = Number(parts[1]);
      if (!Number.isFinite(open)) throw new Error("Bad open value");
      return open;
    }
  }

  throw new Error(`No row for ${entryDate} (market holiday or symbol mismatch)`);
}

async function main() {
  const quotes = {};
  const errors = [];

  for (const t of TICKERS) {
    try {
      const [q, entryOpen] = await Promise.all([
        fetchQuoteXML(t.stooq),
        fetchEntryOpenFromCSV(t.stooq, ENTRY_DATE)
      ]);

      quotes[t.key] = {
        symbol: t.stooq,
        entryDate: ENTRY_DATE,
        entryOpen,
        last: q.close,     // latest close/quote Stooq provides
        quoteDate: q.date,
        quoteTime: q.time
      };
    } catch (e) {
      errors.push({ ticker: t.key, symbol: t.stooq, error: String(e.message || e) });
    }
  }

  const out = {
    asOf: new Date().toISOString(),
    entryDate: ENTRY_DATE,
    source: "stooq",
    quotes,
    errors: errors.length ? errors : undefined
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`Wrote ${OUT_PATH}`);
  if (errors.length) console.warn("Some tickers failed:", errors);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
