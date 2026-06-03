import type { Metadata } from "next";
import {
  getMarketLevels,
  getMacroIndicators,
  getTreasuryCurve,
  indicatorsConfigured,
} from "@/lib/data/indicators";
import { RESEARCH_PORTFOLIOS as PORTFOLIOS } from "@/lib/data/products";
import { YieldCurveChart } from "@/components/charts/yield-curve";
import { Badge } from "@/components/ui/badge";
import { formatPct } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Markets",
  description:
    "Live macro dashboard: market levels, inflation, the Fed funds rate, the Treasury yield curve, jobs and growth — plus model-portfolio snapshots.",
};

export const revalidate = 3600;

export default async function MarketsPage() {
  const [levels, macro, curve] = await Promise.all([
    getMarketLevels(),
    getMacroIndicators(),
    getTreasuryCurve(),
  ]);

  return (
    <div className="container-tbp py-[clamp(48px,6vw,88px)]">
      <header className="max-w-3xl" data-reveal>
        <span className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-line px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[.14em] text-muted">
          <span className="live-dot" /> Live · auto-refreshed
        </span>
        <h1 className="text-[clamp(2.4rem,5vw,3.4rem)] font-extrabold leading-none tracking-tight">
          The macro <span className="serif-em">dashboard.</span>
        </h1>
        <p className="mt-5 text-[1.05rem] leading-relaxed text-muted">
          Market levels, inflation, policy path, the Treasury curve, labour and growth — refreshed
          from the data pipeline (Yahoo Finance) and FRED. {!indicatorsConfigured && (
            <span className="text-muted-2">
              Macro series show representative values until a FRED API key is set.
            </span>
          )}
        </p>
      </header>

      {/* Market levels */}
      <section className="mt-12">
        <SectionTitle>Market levels</SectionTitle>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {levels.map((m) => (
            <div key={m.label} className="rounded-2xl border border-line bg-card p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[.1em] text-muted">
                {m.label}
              </div>
              <div className="mt-2.5 font-display text-2xl font-extrabold tabular tracking-tight">
                {m.value}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[13px]">
                {m.changePct !== null ? (
                  <span className={m.changePct >= 0 ? "tabular text-pos" : "tabular text-neg"}>
                    {formatPct(m.changePct, 2)}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
                <span className="text-muted-2">{m.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Treasury curve + macro */}
      <section className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-line bg-card p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <SectionTitle className="mb-0">US Treasury yield curve</SectionTitle>
            <span className="text-xs text-muted">Par yields, %</span>
          </div>
          <YieldCurveChart data={curve} />
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Source: FRED (DGS series). The shape of the curve summarises the market&apos;s growth and
            policy expectations; an inverted front end signals expected cuts.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-6">
          <SectionTitle>Headline macro</SectionTitle>
          <div className="divide-y divide-line-soft">
            {macro.map((i) => (
              <div key={i.key} className="flex items-center justify-between py-3.5">
                <span className="text-sm text-ink-2">{i.label}</span>
                <span className="font-display text-lg font-bold tabular">{i.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio snapshots */}
      <section className="mt-12" id="portfolios">
        <div className="mb-5 flex items-baseline justify-between">
          <SectionTitle className="mb-0">Model-portfolio snapshots</SectionTitle>
          <Link href="/investments" className="text-sm font-semibold text-ink hover:underline">
            All portfolios →
          </Link>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {PORTFOLIOS.map((p) => (
            <Link
              key={p.code}
              href="/investments"
              className="rounded-2xl border border-line bg-card p-5 transition-colors hover:border-ink/30"
            >
              <Badge size="sm">{p.code}</Badge>
              <div className="mt-3 font-display text-2xl font-extrabold tabular text-pos">
                {formatPct(p.ytd)}
              </div>
              <div className="mt-1 text-[13px] text-muted">
                YTD · vs {p.benchmark} {formatPct(p.excess ?? 0)}
              </div>
              <div className="mt-3 text-sm font-medium">{p.name}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`mb-5 text-lg font-bold tracking-tight ${className}`}>{children}</h2>
  );
}
