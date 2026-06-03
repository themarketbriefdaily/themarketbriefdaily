import Link from "next/link";

export function Footer() {
  return (
    <footer className="tbp tbp-footer" role="contentinfo">
      <div className="tbp-container">
        <div className="tbp-footer-top">
          <div>
            <div className="tbp-footer-brand">
              The Market
              <br />
              Brief Daily.
            </div>
            <p className="tbp-footer-blurb">
              Independent macro and market-structure research. Educational only — not investment
              advice.
            </p>
          </div>
          <div>
            <h4>Content</h4>
            <div className="tbp-footer-links">
              <Link href="/research">Research</Link>
              <Link href="/investments">Investments</Link>
              <Link href="/tools">Tools</Link>
              <Link href="/education">Education</Link>
            </div>
          </div>
          <div>
            <h4>Platform</h4>
            <div className="tbp-footer-links">
              <Link href="/tools#indicators">Indicators</Link>
              <Link href="/education/cfa">CFA Question Bank</Link>
              <Link href="/pricing">Subscription</Link>
              <Link href="/account">Account</Link>
            </div>
          </div>
          <div>
            <h4>Company</h4>
            <div className="tbp-footer-links">
              <Link href="/about">About</Link>
              <Link href="/disclaimer">Disclaimer</Link>
              <Link href="/disclaimer#privacy">Privacy</Link>
              <a href="mailto:hello@themarketbriefdaily.com">Contact</a>
            </div>
          </div>
        </div>
        <div className="tbp-footer-massive" aria-hidden="true">
          MarketBriefDaily.
        </div>
        <div className="tbp-footer-bottom">
          <span>
            © {new Date().getFullYear()} The Market Brief Daily. Educational research only — not
            investment advice.
          </span>
          <div className="legal">
            <Link href="/disclaimer">Full disclaimer</Link>
            <a href="mailto:hello@themarketbriefdaily.com">hello@themarketbriefdaily.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
