import Link from "next/link";
import { Ticker } from "@/components/site/ticker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PORTFOLIOS } from "@/lib/data/portfolios";
import { formatPct } from "@/lib/utils";

const RESEARCH = [
  {
    href: "/research/japan-pm-us-stocks",
    img: "/images/fund-macro.jpg",
    label: "Macro · Rates",
    date: "11 Feb 2026 · 9-min read",
    title: "Japan's PM Moment and Its Shadow Over US Stocks",
    blurb:
      "JGB yield creep, BOJ normalisation and the overlooked transmission channel into US equity discount rates.",
  },
  {
    href: "/research/druckenmiller-shadow",
    img: "/images/trading-desk.jpg",
    label: "Risk · Sizing",
    date: "09 Feb 2026 · 12-min read",
    title: "Druckenmiller's Shadow: Sizing Macro Bets Under Uncertainty",
    blurb:
      "How Druckenmiller sizes conviction positions — and why most macro tourists get the Kelly fraction wrong.",
  },
  {
    href: "/research/silver-comex-inventory",
    img: "/images/fund-supply.jpg",
    label: "Commodities",
    date: "07 Feb 2026 · 14-min read",
    title: "Silver Market Outlook: COMEX Inventory Squeeze",
    blurb:
      "Physical delivery pressure building on COMEX as registered inventory falls to multi-year lows.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Full-viewport video hero */}
      <section className="relative h-[88vh] min-h-[520px] w-full overflow-hidden bg-midnight">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-london-night.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/loading-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-transparent to-transparent" />
      </section>

      {/* Editorial intro */}
      <section className="container-tbp py-[clamp(64px,8vw,120px)]">
        <div
          className="grid items-center gap-[clamp(40px,6vw,100px)] lg:grid-cols-[1.7fr_1fr]"
          data-reveal
        >
          <div>
            <span className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-line px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[.14em] text-muted">
              <span className="live-dot" /> Live · Daily macro brief
            </span>
            <div className="eyebrow mb-4">Independent macro &amp; market-structure research</div>
            <h1 className="text-[clamp(2.8rem,5.5vw,5rem)] font-extrabold leading-[1.0] tracking-[-.04em]">
              Markets, <span className="serif-em">read</span>
              <br />
              with discipline.
            </h1>
            <p className="mt-6 max-w-[52ch] text-[clamp(1rem,1.4vw,1.13rem)] leading-relaxed text-muted">
              Institutional-grade research on macro transmission, credit spreads, commodity
              supply and microstructure — written daily for serious investors. Transparent model
              portfolios, live indicators and an experimental AI day-trader, all from London.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/pricing">Get full access →</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/research">Read today&apos;s brief ↗</Link>
              </Button>
            </div>
          </div>
          <aside className="rounded-2xl border-l border-line pl-7">
            {[
              ["Coverage", "Macro · Credit · Commodities · Microstructure"],
              ["Cadence", "Daily brief · weekly long-form"],
              ["Distribution", "London · themarketbriefdaily.com"],
              ["Standard", "Educational research — not investment advice"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 border-b border-line py-4 last:border-0">
                <span className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted">
                  {k}
                </span>
                <span className="text-sm text-ink-2">{v}</span>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <Ticker />

      {/* Featured research */}
      <section className="container-tbp py-[clamp(56px,7vw,104px)]">
        <SectionHeading
          number="01 / Research"
          title={
            <>
              This week&apos;s
              <br />
              <span className="serif-em">analysis.</span>
            </>
          }
          lead="Three frames, one publication: macro transmission, market microstructure, and physical supply tightness — and the live commentary behind every portfolio decision."
        />
        <div className="grid gap-[clamp(16px,2vw,28px)] md:grid-cols-3" data-reveal>
          {RESEARCH.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-16px_rgba(0,0,0,.14)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-midnight">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.img}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Badge variant="dark" className="absolute left-3 top-3">
                  {r.label}
                </Badge>
              </div>
              <div className="p-6">
                <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[.12em] text-muted">
                  {r.date}
                </div>
                <h3 className="text-lg font-bold leading-snug tracking-tight">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{r.blurb}</p>
                <span className="mt-4 inline-block text-[13px] font-semibold text-ink">
                  Read brief →
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-12 text-center" data-reveal>
          <Button asChild variant="outline">
            <Link href="/research">All research briefs →</Link>
          </Button>
        </div>
      </section>

      {/* Model portfolios — midnight */}
      <section className="bg-midnight py-[clamp(56px,7vw,104px)] text-white">
        <div className="container-tbp">
          <div className="mb-12 grid gap-6 border-b border-white/10 pb-8 md:grid-cols-2" data-reveal>
            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[.14em] text-warm">
                02 / Portfolios
              </div>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none tracking-tight">
                Four model
                <br />
                <span className="serif-em text-white/90">portfolios.</span>
              </h2>
            </div>
            <p className="self-end text-[15px] leading-relaxed text-white/65">
              Macro regime, market microstructure, physical supply tightness and a regime-aware
              factor sleeve — tracked publicly with benchmark comparisons, monthly attribution and
              full methodology. Not marketing.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-2xl border border-white/10 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
            {PORTFOLIOS.map((p, i) => (
              <Link
                key={p.code}
                href="/investments"
                className={`flex flex-col gap-3.5 bg-[#0a0f1c] p-7 transition-colors hover:bg-white/[0.04] ${
                  i > 0 ? "border-t border-white/10 sm:border-t-0 sm:border-l" : ""
                } ${i === 2 ? "lg:border-l" : ""}`}
              >
                <div className="text-[11px] font-semibold tracking-[.12em] text-warm">{p.code}</div>
                <div className="font-display text-[2.4rem] font-extrabold leading-none tracking-tight text-[#4ade80]">
                  {formatPct(p.ytd)}
                </div>
                <div className="text-[13px] text-white/55">
                  YTD · vs {p.benchmark} {formatPct(p.excess)}
                </div>
                <div className="mt-auto text-sm text-white/85">{p.name}</div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center" data-reveal>
            <Button asChild variant="gold">
              <Link href="/investments">View all portfolios →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI day-trader feature */}
      <section className="container-tbp py-[clamp(56px,7vw,104px)]">
        <Link
          href="/research/ai-trader"
          className="group grid overflow-hidden rounded-2xl border border-line transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-16px_rgba(0,0,0,.14)] md:grid-cols-[1fr_1.4fr]"
          data-reveal
        >
          <div className="relative min-h-[340px] overflow-hidden bg-midnight">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/bot-tradingfloor.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <Badge variant="dark" className="absolute left-6 top-6">
              <span className="live-dot" /> Live experiment
            </Badge>
            <div className="absolute bottom-7 left-7">
              <div className="font-display text-[clamp(3rem,5vw,4.5rem)] font-extrabold leading-none text-white">
                AI
              </div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[.16em] text-white/65">
                Day-trader · paper account
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center bg-bg p-[clamp(32px,5vw,64px)]">
            <div className="eyebrow mb-4">Experimental · Open-book</div>
            <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold leading-tight tracking-tight">
              An <span className="serif-em">AI agent</span> running an
              <br />
              intraday macro strategy.
            </h2>
            <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-muted">
              Every trade logged in public with full reasoning — entry, exit, position size and the
              macro signal that triggered it. Backtested on 18 months; running live since Jan 2026 in
              a paper account.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-5 border-y border-line py-5">
              {[
                ["Sharpe", "1.42"],
                ["YTD", "+9.4%"],
                ["Win rate", "58%"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted">
                    {k}
                  </div>
                  <div className="font-display text-2xl font-extrabold">{v}</div>
                </div>
              ))}
            </div>
            <span className="mt-6 text-[13px] font-semibold uppercase tracking-wide text-ink">
              View the live trade log →
            </span>
          </div>
        </Link>
      </section>

      {/* Learn & build */}
      <section className="container-tbp pb-[clamp(56px,7vw,104px)]">
        <SectionHeading
          number="03 / Learn & Build"
          title={
            <>
              Education
              <br />
              and <span className="serif-em">tools.</span>
            </>
          }
          lead="A finance education library covering UK investing, tax wrappers, pensions and CFA / IMC material — plus institutional-grade calculators and a full question bank."
        />
        <div className="grid gap-[clamp(16px,2vw,28px)] md:grid-cols-2" data-reveal>
          {[
            {
              href: "/learn",
              img: "/images/library-research.jpg",
              label: "Education",
              title: "Finance Education Library",
              blurb:
                "Chapters covering financial markets, asset classes, investing principles, UK tax wrappers (ISA, SIPP, LISA), pensions and the CFA / IMC syllabus — in plain English.",
              cta: "Open the library →",
            },
            {
              href: "/learn/cfa",
              img: "/images/trading-screens.jpg",
              label: "Question bank",
              title: "CFA L1 & Quant Question Bank",
              blurb:
                "Hundreds of exam-style questions across all topic areas, with timed quizzes, explanations and saved progress. Plus DCF, bond-yield and macro tools.",
              cta: "Start practising →",
            },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-16px_rgba(0,0,0,.14)]"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-midnight">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.img}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Badge variant="dark" className="absolute left-3 top-3">
                  {c.label}
                </Badge>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold tracking-tight">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.blurb}</p>
                <span className="mt-4 inline-block text-[13px] font-semibold text-ink">{c.cta}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Subscription CTA — dark */}
      <section className="bg-midnight py-[clamp(64px,8vw,120px)] text-white">
        <div className="container-tbp grid items-center gap-[clamp(32px,5vw,80px)] md:grid-cols-[1.2fr_1fr]" data-reveal>
          <div>
            <div className="mb-5 text-[11px] font-semibold uppercase tracking-[.14em] text-warm">
              Subscribe
            </div>
            <h2 className="text-[clamp(2rem,5vw,3.6rem)] font-extrabold leading-tight">
              Read every brief.
              <br />
              Run every <span className="serif-em">portfolio.</span>
            </h2>
            <p className="mt-5 max-w-[52ch] text-[1.05rem] leading-relaxed text-white/75">
              Three tiers: Free for the daily brief and core education, Professional for full
              archives and portfolio access, Institutional for direct analyst access and bespoke
              research.
            </p>
            <div className="mt-8">
              <Button asChild variant="gold" size="lg">
                <Link href="/pricing">View subscription tiers →</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3.5">
            {[
              ["F", "Free", "Daily brief · core library", "£0", false],
              ["P", "Professional", "Full archive · portfolios · tools", "£24/mo", true],
              ["I", "Institutional", "Bespoke research · API · seats", "£499/mo", false],
            ].map(([letter, name, desc, price, featured]) => (
              <div
                key={name as string}
                className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border p-5 ${
                  featured
                    ? "border-warm/30 bg-warm/[0.08]"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold ${
                    featured ? "bg-warm text-midnight" : "bg-white/10 text-white/60"
                  }`}
                >
                  {letter}
                </div>
                <div>
                  <div className="font-semibold">{name}</div>
                  <div className="text-xs text-white/55">{desc}</div>
                </div>
                <div className={`font-display font-extrabold ${featured ? "text-warm" : "text-white"}`}>
                  {price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({
  number,
  title,
  lead,
}: {
  number: string;
  title: React.ReactNode;
  lead: string;
}) {
  return (
    <div className="mb-12 grid gap-6 border-b border-line pb-8 md:grid-cols-2" data-reveal>
      <div>
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[.14em] text-muted">
          {number}
        </div>
        <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none tracking-tight">
          {title}
        </h2>
      </div>
      <p className="self-end text-[15px] leading-relaxed text-muted">{lead}</p>
    </div>
  );
}
