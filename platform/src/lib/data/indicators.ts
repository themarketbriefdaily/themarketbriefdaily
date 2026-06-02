import "server-only";

/**
 * Live indicator loader. Reads the committed macro.json (refreshed by the
 * existing GitHub Actions pipeline) for market levels, and pulls headline
 * macro series from FRED when a key is present. Everything has a representative
 * fallback so the dashboard always renders.
 */

export interface IndicatorValue {
  key: string;
  label: string;
  value: string;
  changePct?: number;
  asOf?: string;
  unit?: string;
}

export interface CurvePoint {
  tenor: string;
  yield: number;
}

const FRED_KEY = process.env.FRED_API_KEY ?? "";

async function fredLatest(seriesId: string): Promise<{ value: number; date: string } | null> {
  if (!FRED_KEY) return null;
  try {
    const url =
      `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
      `&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    const obs = json?.observations?.[0];
    if (!obs || obs.value === ".") return null;
    return { value: Number(obs.value), date: obs.date };
  } catch {
    return null;
  }
}

export interface MarketLevel {
  label: string;
  value: string;
  changePct: number | null;
  date: string;
}

/** Market levels from the committed pipeline JSON (served from /public/data). */
export async function getMarketLevels(): Promise<MarketLevel[]> {
  try {
    // Read directly from the public file via the filesystem at build/runtime.
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.join(process.cwd(), "public", "data", "macro.json");
    const raw = await fs.readFile(file, "utf8");
    const data = JSON.parse(raw);
    const markets = data.markets ?? {};
    return Object.values(markets).map((m: unknown) => {
      const v = m as { label: string; value: string; change_pct?: number; date: string };
      return {
        label: v.label,
        value: v.value,
        changePct: typeof v.change_pct === "number" ? v.change_pct : null,
        date: v.date,
      };
    });
  } catch {
    return [];
  }
}

/** Headline macro indicators (FRED with representative fallback). */
export async function getMacroIndicators(): Promise<IndicatorValue[]> {
  const specs: { key: string; series: string; label: string; unit: string; fallback: string }[] =
    [
      { key: "cpi", series: "CPIAUCSL", label: "US CPI (YoY)", unit: "%", fallback: "3.1" },
      { key: "core", series: "CPILFESL", label: "US Core CPI (YoY)", unit: "%", fallback: "3.4" },
      { key: "fedfunds", series: "FEDFUNDS", label: "Fed Funds Rate", unit: "%", fallback: "4.33" },
      { key: "unrate", series: "UNRATE", label: "Unemployment", unit: "%", fallback: "4.1" },
      { key: "gdp", series: "A191RL1Q225SBEA", label: "Real GDP (QoQ ann.)", unit: "%", fallback: "2.8" },
      { key: "ust10", series: "DGS10", label: "UST 10Y", unit: "%", fallback: "4.24" },
    ];

  const results = await Promise.all(
    specs.map(async (s) => {
      const fred = await fredLatest(s.series);
      const value = fred ? fred.value.toFixed(s.key === "ust10" || s.key === "fedfunds" ? 2 : 1) : s.fallback;
      return {
        key: s.key,
        label: s.label,
        value: `${value}${s.unit}`,
        asOf: fred?.date,
      } satisfies IndicatorValue;
    }),
  );
  return results;
}

/** US Treasury yield curve from FRED (fallback to a representative curve). */
export async function getTreasuryCurve(): Promise<CurvePoint[]> {
  const tenors: { tenor: string; series: string; fallback: number }[] = [
    { tenor: "1M", series: "DGS1MO", fallback: 4.48 },
    { tenor: "3M", series: "DGS3MO", fallback: 4.42 },
    { tenor: "6M", series: "DGS6MO", fallback: 4.36 },
    { tenor: "1Y", series: "DGS1", fallback: 4.18 },
    { tenor: "2Y", series: "DGS2", fallback: 4.02 },
    { tenor: "5Y", series: "DGS5", fallback: 4.08 },
    { tenor: "10Y", series: "DGS10", fallback: 4.24 },
    { tenor: "30Y", series: "DGS30", fallback: 4.46 },
  ];
  return Promise.all(
    tenors.map(async (t) => {
      const fred = await fredLatest(t.series);
      return { tenor: t.tenor, yield: fred ? fred.value : t.fallback };
    }),
  );
}

export const indicatorsConfigured = Boolean(FRED_KEY);
