import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Daily macro briefs and weekly long-form research on macro transmission, market structure and commodity supply.",
};

const POSTS = [
  {
    slug: "japan-pm-us-stocks",
    img: "/images/fund-macro.jpg",
    label: "Macro · Rates",
    date: "11 Feb 2026",
    read: "9-min",
    title: "Japan's PM Moment and Its Shadow Over US Stocks",
    blurb:
      "JGB yield creep, BOJ normalisation and the overlooked transmission channel into US equity discount rates.",
    tier: "Free",
  },
  {
    slug: "druckenmiller-shadow",
    img: "/images/trading-desk.jpg",
    label: "Risk · Sizing",
    date: "09 Feb 2026",
    read: "12-min",
    title: "Druckenmiller's Shadow: Sizing Macro Bets Under Uncertainty",
    blurb:
      "How Druckenmiller sizes conviction positions — and why most macro tourists get the Kelly fraction wrong.",
    tier: "Pro",
  },
  {
    slug: "silver-comex-inventory",
    img: "/images/fund-supply.jpg",
    label: "Commodities",
    date: "07 Feb 2026",
    read: "14-min",
    title: "Silver Market Outlook: COMEX Inventory Squeeze",
    blurb:
      "Physical delivery pressure building on COMEX as registered inventory falls to multi-year lows.",
    tier: "Pro",
  },
  {
    slug: "structural-inflation",
    img: "/images/library-research.jpg",
    label: "Macro · Inflation",
    date: "28 May 2026",
    read: "16-min",
    title: "Structural Inflation and the Unanchored Central Banker",
    blurb:
      "Why the post-pandemic inflation regime may be structurally stickier than the consensus assumes.",
    tier: "Free",
  },
];

export default function ResearchPage() {
  const [lead, ...rest] = POSTS;
  return (
    <div className="container-tbp py-[clamp(48px,6vw,88px)]">
      <header className="max-w-3xl" data-reveal>
        <div className="eyebrow">Research</div>
        <h1 className="mt-4 text-[clamp(2.4rem,5vw,3.4rem)] font-extrabold leading-none tracking-tight">
          The daily <span className="serif-em">brief.</span>
        </h1>
        <p className="mt-5 text-[1.05rem] leading-relaxed text-muted">
          Macro transmission, market microstructure and physical supply — written for investors who
          test frameworks before they size positions.
        </p>
      </header>

      <Link
        href={`/research/${lead.slug}`}
        className="group mt-12 grid overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-16px_rgba(0,0,0,.14)] md:grid-cols-2"
        data-reveal
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-midnight md:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lead.img} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <Badge variant="dark" className="absolute left-4 top-4">{lead.label}</Badge>
        </div>
        <div className="flex flex-col justify-center p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted">
            {lead.date} · {lead.read} read · {lead.tier}
          </div>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight">
            {lead.title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{lead.blurb}</p>
          <span className="mt-5 text-[13px] font-semibold text-ink">Read brief →</span>
        </div>
      </Link>

      <div className="mt-6 grid gap-6 md:grid-cols-3" data-reveal>
        {rest.map((p) => (
          <Link
            key={p.slug}
            href={`/research/${p.slug}`}
            className="group overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-16px_rgba(0,0,0,.14)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-midnight">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <Badge variant="dark" className="absolute left-3 top-3">{p.label}</Badge>
            </div>
            <div className="p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted">
                {p.date} · {p.read} · {p.tier}
              </div>
              <h3 className="mt-2 text-lg font-bold leading-snug tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
