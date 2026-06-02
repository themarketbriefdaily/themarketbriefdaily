import type { Metadata } from "next";

export const metadata: Metadata = { title: "Disclaimer & Privacy" };

export default function DisclaimerPage() {
  return (
    <div className="container-tbp py-[clamp(48px,6vw,88px)]">
      <div className="mx-auto max-w-2xl space-y-10">
        <section>
          <div className="eyebrow">Disclaimer</div>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
            Educational research only
          </h1>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-2">
            <p>
              All content on The Market Brief Daily is for educational and informational purposes
              only and does not constitute investment advice, a recommendation, or an offer to buy or
              sell any security or instrument. Model portfolios are illustrative and hypothetical.
            </p>
            <p>
              Past performance is not indicative of future results. You should seek independent
              financial advice before making any investment decision. The authors may hold positions
              in instruments discussed.
            </p>
          </div>
        </section>

        <section id="privacy">
          <div className="eyebrow">Privacy</div>
          <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
            How we handle your data
          </h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-2">
            <p>
              We store the minimum needed to run your account: your email, subscription tier and
              learning progress. Payments are processed by Stripe; we never store card details.
              Authentication is handled by Supabase.
            </p>
            <p>
              You can export or delete your account data at any time by contacting{" "}
              <a className="font-semibold underline-offset-2 hover:underline" href="mailto:hello@themarketbriefdaily.com">
                hello@themarketbriefdaily.com
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
