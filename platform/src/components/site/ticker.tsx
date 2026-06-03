"use client";

import { useEffect, useState } from "react";

interface TickerItem {
  sym: string;
  value: string;
  change: string;
  dir: "pos" | "neg" | "neut";
}

const FALLBACK: TickerItem[] = [
  { sym: "FTSE 100", value: "8,432.1", change: "+0.42%", dir: "pos" },
  { sym: "S&P 500", value: "5,287.6", change: "+0.28%", dir: "pos" },
  { sym: "UST 10Y", value: "4.24%", change: "−4.2 bp", dir: "neg" },
  { sym: "GILT 10Y", value: "4.13%", change: "−2.8 bp", dir: "neg" },
  { sym: "DXY", value: "104.86", change: "−0.18%", dir: "neg" },
  { sym: "GBP/USD", value: "1.2814", change: "+0.21%", dir: "pos" },
  { sym: "BRENT", value: "$83.42", change: "+1.18%", dir: "pos" },
  { sym: "GOLD", value: "$2,378.10", change: "+0.62%", dir: "pos" },
  { sym: "VIX", value: "13.42", change: "−2.1%", dir: "neg" },
];

export function Ticker() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK);

  useEffect(() => {
    fetch("/data/ticker.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.items?.length) setItems(d.items);
      })
      .catch(() => {});
  }, []);

  const loop = [...items, ...items];

  return (
    <div className="tbp-ticker" aria-label="Market overview">
      <div className="tbp-ticker-track">
        {loop.map((it, i) => (
          <span key={i} className="tbp-ticker-item">
            <span className="sym">{it.sym}</span>
            <span>{it.value}</span>
            <span className={it.dir}>{it.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
