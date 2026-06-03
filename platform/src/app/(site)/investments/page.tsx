import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import {
  MULTI_ASSET_PRODUCTS,
  RESEARCH_PORTFOLIOS,
  type Product,
} from "@/lib/data/products";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Investments",
  description:
    "Model portfolios grounded in financial theory — from a flagship systematic quant mandate to factor, index and thematic strategies — plus transparent research portfolios. Each with full methodology.",
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
          Every portfolio traces to a documented model — a flagship systematic quant mandate, the
          Fama–French factors, the Sharpe CAPM, a proprietary thematic engine. Summary performance is
          open; full holdings and attribution are part of Professional. Click any product for its
          methodology.
        </p>
      </header>

      {/* 01 — Multi-asset products */}
      <Section
        number="01 / Model portfolios"
        title={<>Multi-asset <span className="serif-em">mandates.</span></>}
        lead="Five diversified, rules-based portfolios — a flagship systematic quant strategy, pure indexing, factor investing and high-conviction thematic rotation. The quant mandate spans equities, rates, credit, commodities and options in one risk-balanced book."
      >
        {/* Flagship spans full width, then a clean grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {MULTI_ASSET_PRODUCTS.map((p, i) => (
            <ProductCard key={p.slug} product={p} feature={i === 0} />
          ))}
        </div>
      </Section>

      {/* 02 — Research portfolios */}
      <Section
        number="02 / Research portfolios"
        title={<>Illustrative <span className="serif-em">research.</span></>}
        lead="Three fully transparent illustrative strategies tracked publicly — macro regime, market microstructure and physical supply. These drive the editorial research direction, not allocatable capital."
      >
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-warm/30 bg-warm/[0.06] p-4 text-sm text-ink-2">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warm" />
          <p>
            <span className="font-semibold">Illustrative only</span> — not a fund, not investment
            advice. Returns are simulated. Past hypothetical performance is not indicative of future
            results.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
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

function ProductCard({
  product,
  feature,
  compact,
}: {
  product: Product;
  feature?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/investments/${product.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-16px_rgba(0,0,0,.14)] ${
        feature ? "lg:col-span-2 lg:flex-row" : ""
      }`}
    >
      {/* Image banner */}
      <div
        className={`relative overflow-hidden bg-midnight ${
          feature ? "lg:w-2/5" : ""
        } ${compact ? "aspect-[16/8]" : "aspect-[16/9]"} ${feature ? "lg:aspect-auto" : ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-midnight/10 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold tracking-[.12em] text-white backdrop-blur">
            {product.code}
          </span>
          {product.badge && <Badge variant="gold" size="sm">{product.badge}</Badge>}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-2xl font-extrabold tracking-tight text-white">
            {product.name}
          </h3>
          <p className="mt-0.5 text-[12px] font-medium text-white/75">{product.model}</p>
        </div>
      </div>

      {/* Body */}
      <div className={`flex flex-1 flex-col p-6 ${feature ? "lg:p-8" : ""}`}>
        {!compact && (
          <p className="text-[14px] leading-relaxed text-ink-2">
            {feature ? product.blurb : truncate(product.blurb, 165)}
          </p>
        )}

        <div className="mt-auto">
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
            {product.tags.slice(0, feature ? 5 : 3).map((t) => (
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
            <span className="ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-ink">
              {product.category === "research" ? "View methodology" : "Learn more"}
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n).trimEnd()}…` : s;
}
