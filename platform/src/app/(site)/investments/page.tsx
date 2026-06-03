import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import {
  MULTI_ASSET_PRODUCTS,
  STRATEGY_PRODUCTS,
  RESEARCH_PORTFOLIOS,
  type Product,
} from "@/lib/data/products";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Investments",
  description:
    "Multi-asset model portfolios, single-mandate asset-class strategies and transparent research portfolios — each with full methodology.",
};

export default function InvestmentsPage() {
  return (
    <div className="container-tbp py-[clamp(48px,6vw,88px)]">
      <header className="max-w-3xl" data-reveal>
        <div className="eyebrow">Investments</div>
        <h1 className="mt-4 text-[clamp(2.4rem,5vw,3.4rem)] font-extrabold leading-none tracking-tight">
          Strategies, grounded in <span className="serif-em">theory.</span>
        </h1>
        <p className="mt-5 text-[1.05rem] leading-relaxed text-muted">
          Every portfolio traces to a documented model — Fama–French factors, the Sharpe CAPM, a
          proprietary thematic engine. Summary performance is open; full holdings and attribution
          are part of Professional. Click any product for its methodology.
        </p>
      </header>

      {/* 01 — Multi-asset products */}
      <Section
        number="01 / Multi-asset"
        title="Model portfolios."
        lead="Five diversified, rules-based portfolios spanning factor investing, pure indexing, systematic risk-parity quant and high-conviction thematic rotation — each available in multiple risk variants."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {MULTI_ASSET_PRODUCTS.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </Section>

      {/* 02 — Asset-class strategies */}
      <Section
        number="02 / Asset-class strategies"
        title={<>Single-mandate <span className="serif-em">specialists.</span></>}
        lead="Four focused single-asset-class strategies for investors who already own broad diversification and want a specialist sleeve. Each runs independently — discrete return profile, benchmark and risk budget."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {STRATEGY_PRODUCTS.map((p) => (
            <ProductCard key={p.slug} product={p} compact />
          ))}
        </div>
      </Section>

      {/* 03 — Research portfolios */}
      <Section
        number="03 / Research portfolios"
        title={<>The four MBD <span className="serif-em">model portfolios.</span></>}
        lead="Fully transparent illustrative strategies tracked publicly — macro regime, market microstructure, physical supply and regime-aware factor. These drive the editorial research direction, not allocatable capital."
      >
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-warm/30 bg-warm/[0.06] p-4 text-sm text-ink-2">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warm" />
          <p>
            <span className="font-semibold">Illustrative only</span> — not a fund, not investment
            advice. Returns are simulated. Past hypothetical performance is not indicative of future
            results.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {RESEARCH_PORTFOLIOS.map((p) => (
            <ProductCard key={p.slug} product={p} compact />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  number,
  title,
  lead,
  children,
}: {
  number: string;
  title: React.ReactNode;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16" data-reveal>
      <div className="mb-8 grid gap-5 border-b border-line pb-6 md:grid-cols-2">
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[.14em] text-muted">
            {number}
          </div>
          <h2 className="text-[clamp(1.7rem,3.2vw,2.4rem)] font-extrabold leading-tight tracking-tight">
            {title}
          </h2>
        </div>
        <p className="self-end text-[15px] leading-relaxed text-muted">{lead}</p>
      </div>
      {children}
    </section>
  );
}

function ProductCard({ product, compact }: { product: Product; compact?: boolean }) {
  return (
    <Link
      href={`/investments/${product.slug}`}
      className="group flex flex-col rounded-2xl border border-line bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-16px_rgba(0,0,0,.14)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-[.12em] text-warm">
              {product.code}
            </span>
            {product.badge && (
              <Badge variant="gold" size="sm">
                {product.badge}
              </Badge>
            )}
          </div>
          <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
            {product.name}
          </h3>
          <p className="mt-0.5 text-sm text-muted">{product.model}</p>
        </div>
        <ArrowUpRight
          size={20}
          className="shrink-0 text-muted-2 transition-colors group-hover:text-ink"
        />
      </div>

      {!compact && (
        <p className="mt-4 text-[14px] leading-relaxed text-ink-2">{product.blurb}</p>
      )}

      <div className="mt-5 grid grid-cols-3 gap-3 border-y border-line-soft py-4">
        {product.stats.map((s) => (
          <div key={s.label}>
            <div className="text-[10px] font-semibold uppercase tracking-[.1em] text-muted">
              {s.label}
            </div>
            <div
              className={`font-display text-xl font-extrabold tabular ${
                s.tone === "pos" ? "text-pos" : s.tone === "neg" ? "text-neg" : "text-ink"
              }`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge size="sm">{product.benchmark}</Badge>
        {product.tags.slice(0, compact ? 3 : 5).map((t) => (
          <span
            key={t}
            className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        {product.meta && <span className="text-xs text-muted-2">{product.meta}</span>}
        <span className="ml-auto text-[13px] font-semibold text-ink">
          {product.category === "research" ? "View methodology →" : "Learn more →"}
        </span>
      </div>
    </Link>
  );
}
