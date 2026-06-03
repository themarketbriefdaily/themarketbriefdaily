import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { PRODUCTS, productBySlug } from "@/lib/data/products";
import { PaywallGate } from "@/components/paywall/paywall-gate";
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

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
                  className={`font-display text-xl font-extrabold tabular ${
                    s.tone === "pos" ? "text-pos" : s.tone === "neg" ? "text-neg" : "text-ink"
                  }`}
                >
                  {s.value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted">Benchmark</span>
              <span className="text-sm font-semibold">{product.benchmark}</span>
            </div>
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

      {/* Methodology */}
      <section className="mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Methodology</h2>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-ink-2">
            {product.methodology.overview}
          </p>

          <div className="mt-8 space-y-6">
            {product.methodology.sections.map((sec, i) => (
              <div key={i} className="border-l-2 border-line pl-5">
                <h3 className="font-display text-base font-bold tracking-tight">{sec.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{sec.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings — gated */}
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-tight">Holdings</h2>
          <PaywallGate
            required={product.detailTier}
            title="See the full book"
            description={`Current holdings and weights for ${product.name} are part of the ${
              product.detailTier === "free" ? "open" : "Professional"
            } tier.`}
            teaser={<HoldingsList product={product} />}
          >
            <HoldingsList product={product} live />
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

function HoldingsList({ product, live }: { product: import("@/lib/data/products").Product; live?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">
          {product.category === "research" ? "Sleeves" : "Top holdings"}
        </span>
        {live && <Badge variant="pos" size="sm">Live</Badge>}
      </div>
      <div className="divide-y divide-line-soft">
        {product.methodology.holdings.map((h) => (
          <div key={h.name} className="flex items-center justify-between gap-3 py-2.5">
            <div>
              <div className="text-sm font-medium text-ink-2">{h.name}</div>
              <div className="text-xs text-muted-2">{h.meta}</div>
            </div>
            <span className="font-display text-sm font-bold tabular">{h.weight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
