import Link from "next/link";

const COLUMNS = [
  {
    title: "Content",
    links: [
      { href: "/research", label: "Research" },
      { href: "/investments", label: "Portfolios" },
      { href: "/markets", label: "Markets" },
      { href: "/learn", label: "Learn" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/pricing", label: "Subscription" },
      { href: "/learn/cfa", label: "CFA Question Bank" },
      { href: "/account", label: "Account" },
      { href: "/markets#methodology", label: "Methodology" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/disclaimer", label: "Disclaimer" },
      { href: "/disclaimer#privacy", label: "Privacy" },
      { href: "mailto:hello@themarketbriefdaily.com", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg-alt">
      <div className="container-tbp py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="font-display text-2xl font-extrabold leading-tight tracking-tight">
              The Market
              <br />
              Brief Daily.
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Independent macro and market-structure research. Educational only — not
              investment advice.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[.12em] text-muted-2">
                {col.title}
              </h4>
              <div className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          aria-hidden
          className="pointer-events-none mt-12 select-none overflow-hidden font-display text-[clamp(3rem,12vw,11rem)] font-extrabold leading-none tracking-tighter text-ink/[0.04]"
        >
          MarketBriefDaily.
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} The Market Brief Daily. Educational research only — not investment advice.</span>
          <div className="flex gap-5">
            <Link href="/disclaimer" className="hover:text-ink">Full disclaimer</Link>
            <a href="mailto:hello@themarketbriefdaily.com" className="hover:text-ink">
              hello@themarketbriefdaily.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
