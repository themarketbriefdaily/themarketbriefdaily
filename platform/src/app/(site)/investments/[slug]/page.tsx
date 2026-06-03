import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import {
  PRODUCTS,
  productBySlug,
  type Product,
  type MethodologySection,
} from "@/lib/data/products";
import { PaywallGate } from "@/components/paywall/paywall-gate";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) return { title: "Investments" };
  return { title: `${p.name} — ${p.code}`, description: p.blurb };
}

// Group long methodologies into pillars for a factsheet-style read.
const PILLAR_BY_NUM: Record<number, string> = {
  1: "Foundations",
  2: "Return engines",
  3: "Return engines",
  4: "Return engines",
  5: "Risk allocation & compounding",
  6: "Risk allocation & compounding",
  7: "Risk allocation & compounding",
  8: "Convexity & downside",
  9: "Robustness & the edge",
  10: "Robustness & the edge",
};

function pillarOf(sec: MethodologySection): string | null {
  if (sec.pillar) return sec.pillar;
  const m = sec.title.match(/^(\d+)/);
  return m ? PILLAR_BY_NUM[Number(m[1])] ?? null : null;
}

function groupSections(sections: MethodologySection[]) {
  const groups: { pillar: string | null; items: MethodologySection[] }[] = [];
  for (const s of sections) {
    const pillar = pillarOf(s);
    const last = groups[groups.length - 1];
    if (last && last.pillar === pillar) last.items.push(s);
    else groups.push({ pillar, items: [s] });
  }
  return groups;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const groups = groupSections(product.methodology.sections);
  const grouped = groups.some((g) => g.pillar !== null);
  const highlight = (product.metrics ?? product.stats).filter((s) =>
    /sharpe|alpha|max drawdown|sortino/i.test(s.label),
  ).slice(0, 3);

  const perfData =
    product.performance?.labels.map((label, i) => ({
      label,
      strategy: product.performance!.strategy[i],
      benchmark: product.performance!.benchmark[i],
    })) ?? [];

  return (
    <article className="container-tbp py-[clamp(40px,5vw,72px)]">
      <Link href="/investments" className="text-sm text-muted hover:text-ink">
        ← All investments
      </Link>

      {/* Image banner */}
      <div className="relative mt-5 aspect-[21/7] overflow-hidden rounded-2xl bg-midnight">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt="" className="h-full w-full object-cover opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-midnight/10 to-transparent" />
        <div className="absolute bottom-5 left-6 flex items-center gap-2.5">
          <span className="rounded-full bg-black/35 px-3 py-1 text-[11px] font-semibold tracking-[.12em] text-white backdrop-blur">
            {product.code}
          </span>
          {product.badge && <Badge variant="gold" size="sm">{product.badge}</Badge>}
        </div>
      </div>

      {/* Hero */}
      <header className="mt-8 grid gap-8 border-b border-line pb-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold tracking-[.12em] text-warm">
              {product.code}
            </span>
            {product.badge && <Badge variant="gold" size="sm">{product.badge}</Badge>}
          </div>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,4.5vw,3.4rem)] font-extrabold leading-none tracking-tight">
            {product.name}
          </h1>
          <p className="mt-2 text-[15px] font-medium text-muted">{product.model}</p>
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-ink-2">
            {product.blurb}
          </p>

          <div className="mt-6 flex flex-wrap gap-1.5">
            <Badge size="sm">{product.benchmark}</Badge>
            {product.tags.map((t) => (
              <span key={t} className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Stat panel */}
        <aside className="rounded-2xl border border-line bg-bg-alt/40 p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted">
            Key metrics
          </div>
          <div className="mt-4 divide-y divide-line-soft">
            {(product.metrics ?? product.stats).map((s) => (
              <div key={s.label} className="flex items-center justify-between py-3">
                <span className="text-sm text-muted">{s.label}</span>
                <span
                  className={`font-display text-lg font-extrabold tabular ${
                    s.tone === "pos" ? "text-pos" : s.tone === "neg" ? "text-neg" : "text-ink"
                  }`}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </header>

      {product.illustrative && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-warm/30 bg-warm/[0.06] p-4 text-sm text-ink-2">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warm" />
          <p>
            <span className="font-semibold">Illustrative only</span> — not a fund, not investment
            advice. Returns are simulated and hypothetical.
          </p>
        </div>
      )}

      {/* Performance (public summary) */}
      {product.performance && (
        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Simulated growth of £100</h2>
              <p className="mt-1 text-sm text-muted">
                Hypothetical, net of estimated costs · vs {product.benchmark}
              </p>
            </div>
            <div className="flex gap-6">
              {highlight.map((s) => (
                <div key={s.label} className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-[.1em] text-muted">
                    {s.label}
                  </div>
                  <div
                    className={`font-display text-lg font-extrabold tabular ${
                      s.tone === "pos" ? "text-pos" : s.tone === "neg" ? "text-neg" : "text-ink"
                    }`}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-card p-6">
            <PerformanceChart data={perfData} benchmarkLabel={product.benchmark.split(" · ")[0]} />
          </div>
        </section>
      )}

      {/* Methodology + allocation */}
      <section className="mt-14 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Methodology</h2>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-ink-2">
            {product.methodology.overview}
          </p>

          <div className="mt-9 space-y-9">
            {grouped
              ? groups.map((g, gi) => (
                  <div key={gi}>
                    {g.pillar && (
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-warm">
                          {g.pillar}
                        </span>
                        <span className="h-px flex-1 bg-line" />
                      </div>
                    )}
                    <div className="space-y-5">
                      {g.items.map((sec, i) => (
                        <SectionBlock key={i} sec={sec} />
                      ))}
                    </div>
                  </div>
                ))
              : product.methodology.sections.map((sec, i) => <SectionBlock key={i} sec={sec} />)}
          </div>
        </div>

        {/* Allocation — gated */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 text-xl font-bold tracking-tight">
            {product.category === "research" ? "Sleeves" : "Allocation"}
          </h2>
          <PaywallGate
            required={product.detailTier}
            title="See the full book"
            description={`Current allocation and weights for ${product.name} are part of the ${
              product.detailTier === "free" ? "open" : "Professional"
            } tier.`}
            teaser={<AllocationList product={product} />}
          >
            <AllocationList product={product} live />
          </PaywallGate>
        </div>
      </section>

      {/* CTA */}
      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-bg-alt/40 p-7">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight">
            Want every holding and the live attribution?
          </h3>
          <p className="mt-1 text-sm text-muted">
            Professional unlocks holdings, monthly attribution and history across all strategies.
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href={`/pricing?plan=${product.detailTier === "free" ? "pro" : product.detailTier}`}>
            View plans →
          </Link>
        </Button>
      </div>
    </article>
  );
}

function SectionBlock({ sec }: { sec: MethodologySection }) {
  return (
    <div className="border-l-2 border-line pl-5">
      <h3 className="font-display text-base font-bold tracking-tight">{sec.title}</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{sec.body}</p>
    </div>
  );
}

const BAR_COLORS = ["#0a0f1c", "#1a8a4a", "#c8a35a", "#5a5a5a", "#0066ff", "#b03030"];

function AllocationList({ product, live }: { product: Product; live?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold">
          {product.category === "research" ? "Risk sleeves" : "Risk-weighted allocation"}
        </span>
        {live && <Badge variant="pos" size="sm">Live</Badge>}
      </div>
      <div className="space-y-3.5">
        {product.methodology.holdings.map((h, i) => {
          const pct = parseFloat(h.weight);
          return (
            <div key={h.name}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] font-medium text-ink-2">{h.name}</span>
                <span className="font-display text-[13px] font-bold tabular">{h.weight}</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-2">{h.meta}</div>
              {!Number.isNaN(pct) && (
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-alt">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
