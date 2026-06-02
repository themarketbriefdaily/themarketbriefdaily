import type { Metadata } from "next";
import { PORTFOLIOS } from "@/lib/data/portfolios";
import { PaywallGate } from "@/components/paywall/paywall-gate";
import { Badge } from "@/components/ui/badge";
import { formatPct } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Model Portfolios",
  description:
    "Four transparent model portfolios — macro, market structure, physical supply and a regime-aware factor sleeve — with public summaries and gated holdings & attribution.",
};

export default function InvestmentsPage() {
  return (
    <div className="container-tbp py-[clamp(48px,6vw,88px)]">
      <header className="max-w-3xl" data-reveal>
        <div className="eyebrow">Portfolios</div>
        <h1 className="mt-4 text-[clamp(2.4rem,5vw,3.4rem)] font-extrabold leading-none tracking-tight">
          Four transparent <span className="serif-em">portfolios.</span>
        </h1>
        <p className="mt-5 text-[1.05rem] leading-relaxed text-muted">
          Each sleeve is tracked publicly with benchmark comparisons and full methodology. Summary
          performance is free; holdings, attribution and the live sleeve are part of Professional.
        </p>
      </header>

      <div className="mt-12 space-y-6">
        {PORTFOLIOS.map((p) => (
          <article key={p.code} className="rounded-2xl border border-line bg-card p-7" data-reveal>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line-soft pb-5">
              <div>
                <Badge size="sm">{p.code}</Badge>
                <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight">
                  {p.name}
                </h2>
                <p className="mt-1 text-sm text-muted">{p.sleeve}</p>
              </div>
              <div className="grid grid-cols-3 gap-6 text-right">
                <Stat label="YTD" value={formatPct(p.ytd)} accent />
                <Stat label={`vs ${p.benchmark}`} value={formatPct(p.excess)} />
                <Stat label="Sharpe" value={p.sharpe.toFixed(2)} />
              </div>
            </div>

            <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-ink-2">{p.thesis}</p>

            <div className="mt-6">
              <PaywallGate
                required={p.detailTier}
                title="Holdings & attribution"
                description="See current holdings, weights, monthly attribution and the live sleeve with a Professional subscription."
                teaser={<HoldingsTeaser />}
              >
                <HoldingsTeaser live />
              </PaywallGate>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted">{label}</div>
      <div className={`font-display text-xl font-extrabold tabular ${accent ? "text-pos" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function HoldingsTeaser({ live = false }: { live?: boolean }) {
  const rows = [
    ["US 2Y Treasury future", "18.0%", "+0.4%"],
    ["Gold (physical proxy)", "14.5%", "+1.8%"],
    ["TIPS 5Y", "12.0%", "+0.2%"],
    ["USD index (long)", "9.5%", "−0.1%"],
    ["EM local rates", "8.0%", "+0.6%"],
  ];
  return (
    <div className="rounded-xl border border-line bg-bg-alt/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Top holdings {live && <span className="text-muted">· updated daily</span>}</h4>
        {live && <Badge variant="pos" size="sm">Live</Badge>}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-muted">
            <th className="py-1.5 text-left font-semibold">Position</th>
            <th className="py-1.5 text-right font-semibold">Weight</th>
            <th className="py-1.5 text-right font-semibold">Contribution</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {rows.map(([name, w, c]) => (
            <tr key={name}>
              <td className="py-2 text-ink-2">{name}</td>
              <td className="py-2 text-right tabular">{w}</td>
              <td className={`py-2 text-right tabular ${c.startsWith("−") ? "text-neg" : "text-pos"}`}>
                {c}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
