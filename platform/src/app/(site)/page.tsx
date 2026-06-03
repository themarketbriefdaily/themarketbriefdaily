import Link from "next/link";
import { Ticker } from "@/components/site/ticker";
import { MULTI_ASSET_PRODUCTS } from "@/lib/data/products";
import { formatPct } from "@/lib/utils";

const RESEARCH = [
  {
    href: "/research/japan-pm-us-stocks",
    img: "/assets/images/fund-macro.jpg",
    label: "Macro · Rates",
    date: "11 Feb 2026 · 9-min read",
    title: "Japan's PM Moment and Its Shadow Over US Stocks",
    blurb:
      "JGB yield creep, BOJ normalisation and the overlooked transmission channel into US equity discount rates.",
  },
  {
    href: "/research/druckenmiller-shadow",
    img: "/assets/images/trading-desk.jpg",
    label: "Risk · Sizing",
    date: "09 Feb 2026 · 12-min read",
    title: "Druckenmiller's Shadow: Sizing Macro Bets Under Uncertainty",
    blurb:
      "How Druckenmiller sizes conviction positions — and why most macro tourists get the Kelly fraction wrong.",
  },
  {
    href: "/research/silver-comex-inventory",
    img: "/assets/images/fund-supply.jpg",
    label: "Commodities",
    date: "07 Feb 2026 · 14-min read",
    title: "Silver Market Outlook: COMEX Inventory Squeeze",
    blurb:
      "Physical delivery pressure building on COMEX as registered inventory falls to multi-year lows.",
  },
];

export default function HomePage() {
  const portfolios = MULTI_ASSET_PRODUCTS.slice(0, 4);

  return (
    <div className="tbp">
      {/* Full-viewport video hero (slides under the fixed header) */}
      <section
        className="tbp-video-hero"
        aria-label="Market Brief Daily introduction"
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          minHeight: 520,
          marginTop: -72,
          overflow: "hidden",
          background: "#0a0f1c",
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/images/hero-london-night.jpg"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source src="/loading-video.mp4" type="video/mp4" />
        </video>
      </section>

      {/* Editorial intro */}
      <section className="tbp-section tbp-editorial" style={{ paddingBlock: "clamp(72px,8vw,120px)" }}>
        <div className="tbp-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)",
              gap: "clamp(40px,6vw,100px)",
              alignItems: "center",
            }}
          >
            <div>
              <div className="hero-live" style={{ marginBottom: 24 }}>
                <span className="dot" />
                Live · Daily macro brief
              </div>
              <div className="tbp-eyebrow" style={{ marginBottom: 18 }}>
                Independent macro &amp; market structure research
              </div>
              <h1 style={{ fontSize: "clamp(2.8rem,5.5vw,5rem)", fontWeight: 850, letterSpacing: "-.04em", lineHeight: 1, margin: "0 0 22px" }}>
                Markets, <em>read</em>
                <br />
                with discipline.
              </h1>
              <p style={{ fontSize: "clamp(1rem,1.4vw,1.13rem)", lineHeight: 1.7, color: "var(--tbp-muted)", maxWidth: "52ch", margin: "0 0 36px" }}>
                Institutional-grade research on macro transmission, credit spreads, commodity supply
                and microstructure — written daily for serious investors. Transparent model
                portfolios, live indicators and an experimental AI day-trader, all from London.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link className="tbp-btn primary" href="/pricing">
                  Get full access <span className="arrow">→</span>
                </Link>
                <Link className="tbp-btn" href="/research">
                  Read today&apos;s brief <span className="arrow">↗</span>
                </Link>
              </div>
            </div>
            <aside className="tbp-hero-meta-card" aria-label="Publication details">
              {[
                ["Coverage", "Macro · Credit · Commodities · Microstructure"],
                ["Cadence", "Daily brief · weekly long-form"],
                ["Distribution", "London · themarketbriefdaily.com"],
                ["Standard", "Educational research — not investment advice"],
              ].map(([k, v]) => (
                <div className="row" key={k}>
                  <span className="k">{k}</span>
                  <span className="v">{v}</span>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </section>

      <Ticker />

      {/* Credentials strip */}
      <section className="tbp-section" style={{ paddingBlock: "clamp(40px,5vw,72px)" }}>
        <div className="tbp-container">
          <div className="tbp-credentials">
            <span className="tbp-credentials-label">Coverage drawn from</span>
            <div className="tbp-credentials-items">
              <span className="item"><em>Bloomberg</em>Terminal</span>
              <span className="item"><em>Refinitiv</em>Eikon</span>
              <span className="item"><em>FRED</em>St. Louis Fed</span>
              <span className="item"><em>BoE</em>Statistical Database</span>
              <span className="item"><em>LSEG</em>Workspace</span>
              <span className="item"><em>FT</em>Editorial Archive</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured research */}
      <section className="tbp-section">
        <div className="tbp-container">
          <div className="tbp-section-heading">
            <div className="left">
              <div className="number">01 / Research</div>
              <h2>
                This week&apos;s
                <br />
                <em>analysis.</em>
              </h2>
            </div>
            <div className="right">
              <p className="tbp-lead">
                Three frames, one publication: macro transmission, market microstructure, and
                physical supply tightness. Read the latest long-form briefs and the live commentary
                behind every model-portfolio decision.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "clamp(16px,2vw,28px)" }}>
            {RESEARCH.map((r) => (
              <Link className="tbp-premium-card" href={r.href} key={r.href}>
                <div className="visual">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.img} alt="" loading="lazy" />
                  <span className="label">{r.label}</span>
                </div>
                <div className="body">
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--tbp-muted)", marginBottom: 10 }}>
                    {r.date}
                  </div>
                  <h3>{r.title}</h3>
                  <p>{r.blurb}</p>
                  <span className="read-more">Read brief →</span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link className="tbp-btn" href="/research">
              All research briefs <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="tbp-section tight">
        <div className="tbp-container">
          <div className="tbp-pull-quote">
            <div>
              <div className="tbp-pull-quote-eyebrow">Editor&apos;s note</div>
            </div>
            <div>
              <blockquote>
                We don&apos;t publish narratives. We publish frameworks — the kind a portfolio
                manager would test before sizing a position, and the kind a student should be able to
                defend in an interview.
              </blockquote>
              <div className="tbp-pull-quote-attr">— The Market Brief Daily</div>
            </div>
          </div>
        </div>
      </section>

      {/* Model portfolios — midnight */}
      <section className="tbp-section midnight">
        <div className="tbp-container">
          <div className="tbp-section-heading" style={{ borderBottomColor: "rgba(255,255,255,.1)" }}>
            <div className="left">
              <div className="number">02 / Portfolios</div>
              <h2>
                Model
                <br />
                <em>portfolios.</em>
              </h2>
            </div>
            <div className="right">
              <p className="tbp-lead">
                A flagship systematic quant mandate, factor and index strategies, and a
                high-conviction thematic sleeve — tracked publicly with benchmark comparisons and
                full methodology. Not marketing.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,minmax(0,1fr))",
              gap: 1,
              background: "rgba(255,255,255,.1)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {portfolios.map((p) => (
              <Link
                key={p.code}
                href={`/investments/${p.slug}`}
                style={{ background: "#0a0f1c", padding: "32px 28px", textDecoration: "none", color: "#fff", display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "var(--tbp-warm)" }}>{p.code}</div>
                <div style={{ fontFamily: "'Inter Tight',sans-serif", fontSize: "2.4rem", fontWeight: 850, letterSpacing: "-.04em", color: "#4ade80" }}>
                  {formatPct(p.ytd)}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>YTD · vs {p.benchmark}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.85)", marginTop: "auto" }}>{p.name}</div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link className="tbp-btn primary" href="/investments">
              View all portfolios <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* By the numbers */}
      <section className="tbp-section tight">
        <div className="tbp-container">
          <div style={{ marginBottom: 40 }}>
            <div className="tbp-eyebrow">By the numbers</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", borderTop: "1px solid var(--tbp-line)", borderBottom: "1px solid var(--tbp-line)" }}>
            <div className="tbp-stat-premium">
              <div className="label-top">Strategies</div>
              <div className="num">08</div>
              <div className="label-bot">Model portfolios across quant, factor, thematic and research</div>
            </div>
            <div className="tbp-stat-premium">
              <div className="label-top">Education</div>
              <div className="num">07</div>
              <div className="label-bot">Chapters covering markets, instruments, UK tax and the CFA syllabus</div>
            </div>
            <div className="tbp-stat-premium">
              <div className="label-top">Archive</div>
              <div className="num">80<span className="unit">+</span></div>
              <div className="label-bot">Research briefs in the public archive</div>
            </div>
            <div className="tbp-stat-premium">
              <div className="label-top">Quant Sharpe</div>
              <div className="num">1.4<span style={{ fontSize: ".6em" }}>2</span></div>
              <div className="label-bot">Flagship quant mandate, since inception — illustrative</div>
            </div>
          </div>
        </div>
      </section>

      {/* Education + tools */}
      <section className="tbp-section">
        <div className="tbp-container">
          <div className="tbp-section-heading">
            <div className="left">
              <div className="number">03 / Learn &amp; Build</div>
              <h2>
                Education
                <br />
                and <em>tools.</em>
              </h2>
            </div>
            <div className="right">
              <p className="tbp-lead">
                A finance education library covering UK investing, tax wrappers, pensions and CFA
                material — plus a live indicator dashboard and institutional calculators.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "clamp(16px,2vw,28px)" }}>
            <Link className="tbp-premium-card" href="/education">
              <div className="visual">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/images/library-research.jpg" alt="" loading="lazy" />
                <span className="label">Free · No sign-up</span>
              </div>
              <div className="body">
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--tbp-muted)", marginBottom: 10 }}>
                  Education
                </div>
                <h3>Finance Education Library</h3>
                <p>
                  Chapters covering financial markets, asset classes, investing principles, UK tax
                  wrappers (ISA, SIPP, LISA), pensions and the CFA syllabus — plus the Quant Trader
                  course and CFA question bank.
                </p>
                <span className="read-more">Open the library →</span>
              </div>
            </Link>
            <Link className="tbp-premium-card" href="/tools">
              <div className="visual">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/images/trading-screens.jpg" alt="" loading="lazy" />
                <span className="label">Live · Indicators</span>
              </div>
              <div className="body">
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--tbp-muted)", marginBottom: 10 }}>
                  Tools
                </div>
                <h3>Indicators, DCF, Bond Yield &amp; Macro</h3>
                <p>
                  A live macro dashboard — market levels, inflation, the Treasury curve — alongside
                  institutional calculators and the CFA question bank, all in one place.
                </p>
                <span className="read-more">Open the tools →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Subscription CTA — dark */}
      <section className="tbp-section dark" style={{ paddingBlock: "clamp(72px,8vw,120px)" }}>
        <div className="tbp-container">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: "clamp(32px,5vw,80px)", alignItems: "center" }}>
            <div>
              <div className="tbp-eyebrow" style={{ marginBottom: 24 }}>Subscribe</div>
              <h2 className="tbp-h2" style={{ color: "#fff", fontSize: "clamp(2rem,5vw,3.6rem)", margin: "0 0 18px" }}>
                Read every brief.
                <br />
                Run every <em>portfolio.</em>
              </h2>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.6, color: "rgba(255,255,255,.75)", margin: "0 0 32px", maxWidth: "52ch" }}>
                Three tiers: Free for the daily brief and core education, Professional for full
                archives and portfolio access, Institutional for direct analyst access and bespoke
                research.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link className="tbp-btn primary" href="/pricing">
                  View subscription tiers <span className="arrow">→</span>
                </Link>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["F", "Free", "Daily brief · core library", "£0", false],
                ["P", "Professional", "Full archive · portfolios · tools", "£24/mo", true],
                ["I", "Institutional", "Bespoke research · API · seats", "£499/mo", false],
              ].map(([letter, name, desc, price, featured]) => (
                <div
                  key={name as string}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: 16,
                    alignItems: "center",
                    padding: "18px 22px",
                    background: featured ? "rgba(200,163,90,.08)" : "rgba(255,255,255,.04)",
                    border: featured ? "1px solid rgba(200,163,90,.3)" : "1px solid rgba(255,255,255,.1)",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: featured ? "var(--tbp-warm)" : "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", color: featured ? "#0a0f1c" : "rgba(255,255,255,.6)", fontWeight: 800, fontSize: 14 }}>
                    {letter}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff" }}>{name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>{desc}</div>
                  </div>
                  <div style={{ fontFamily: "'Inter Tight',sans-serif", fontWeight: 800, color: featured ? "var(--tbp-warm)" : "#fff" }}>
                    {price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
