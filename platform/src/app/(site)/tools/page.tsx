import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, LineChart, GraduationCap, Gauge } from "lucide-react";
import {
  getMarketLevels,
  getMacroIndicators,
  getTreasuryCurve,
  indicatorsConfigured,
} from "@/lib/data/indicators";
import { YieldCurveChart } from "@/components/charts/yield-curve";
import { formatPct } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Live macro indicators — market levels, inflation, the Fed funds rate, the Treasury yield curve, jobs and growth — plus institutional calculators (DCF, bond yield) and the CFA question bank.",
};

export const revalidate = 3600;

const CALCULATORS = [
  { icon: Calculator, title: "DCF Model", desc: "Build a discounted cash-flow valuation in one screen.", href: null },
  { icon: LineChart, title: "Bond Yield Analytics", desc: "Price, yield, duration and convexity for any bond.", href: null },
  { icon: Gauge, title: "Macro Dashboard", desc: "Yield curves, spreads and the policy path — above.", href: "#indicators" },
  { icon: GraduationCap, title: "CFA Question Bank", desc: "Hundreds of exam-style questions with progress tracking.", href: "/education/cfa" },
];

export default async function ToolsPage() {
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
          Tools &amp; <span className="serif-em">indicators.</span>
        </h1>
        <p className="mt-5 text-[1.05rem] leading-relaxed text-muted">
          A live macro dashboard and a set of institutional-grade calculators in one place. Market
          levels, inflation, the policy path and the Treasury curve refresh from the data pipeline
          (Yahoo Finance) and FRED.{" "}
          {!indicatorsConfigured && (
            <span className="text-muted-2">
              Macro series show representative values until a FRED API key is set.
            </span>
          )}
        </p>
      </header>

      {/* Live indicators */}
      <section className="mt-12" id="indicators">
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

      {/* Calculators & models */}
      <section className="mt-14">
        <SectionTitle>Calculators &amp; models</SectionTitle>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {CALCULATORS.map((c) => {
            const inner = (
              <>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-bg-alt text-ink">
                  <c.icon size={18} />
                </span>
                <h3 className="mt-4 text-base font-bold tracking-tight">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.desc}</p>
              </>
            );
            return c.href ? (
              <Link
                key={c.title}
                href={c.href}
                className="rounded-2xl border border-line bg-card p-6 transition-colors hover:border-ink/30"
              >
                {inner}
              </Link>
            ) : (
              <div key={c.title} className="rounded-2xl border border-line bg-card p-6">
                {inner}
              </div>
            );
          })}
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
  return <h2 className={`mb-5 text-lg font-bold tracking-tight ${className}`}>{children}</h2>;
}
