import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/tiers";
import { getSessionContext } from "@/lib/entitlements";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Subscription",
  description:
    "Three subscription tiers — Free, Professional and Institutional. Research, model portfolios, live indicators, the question bank and tools.",
};

export default async function PricingPage() {
  const ctx = await getSessionContext();

  return (
    <div className="container-tbp py-[clamp(56px,7vw,104px)]">
      <div className="mx-auto max-w-2xl text-center" data-reveal>
        <div className="eyebrow justify-center">Subscription</div>
        <h1 className="mt-4 text-[clamp(2.4rem,5vw,3.6rem)] font-extrabold leading-none tracking-tight">
          Choose your <span className="serif-em">access.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-relaxed text-muted">
          Start free with the daily brief and core education. Upgrade for the full archive,
          every model portfolio, the question bank and the indicator dashboard.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3" data-reveal>
        {PLANS.map((plan) => {
          const isCurrent = ctx.tier === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                plan.featured ? "border-warm/40 bg-warm/[0.04] shadow-lg" : "border-line bg-card"
              }`}
            >
              {plan.featured && (
                <Badge variant="gold" className="absolute -top-3 left-7">
                  Most popular
                </Badge>
              )}
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-xl font-bold tracking-tight">{plan.name}</h3>
                {isCurrent && (
                  <Badge variant="pos" size="sm">
                    Current
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{plan.tagline}</p>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-extrabold tracking-tight">
                  £{plan.price}
                </span>
                <span className="text-sm text-muted">/{plan.cadence}</span>
              </div>

              <div className="mt-7">
                {plan.id === "free" ? (
                  <div className="grid h-12 place-items-center rounded-full border border-line text-sm font-semibold text-muted">
                    Included
                  </div>
                ) : (
                  <CheckoutButton
                    tier={plan.id}
                    isLoggedIn={ctx.isLoggedIn}
                    variant={plan.featured ? "gold" : "primary"}
                  >
                    {isCurrent ? "Manage plan" : `Choose ${plan.name}`}
                  </CheckoutButton>
                )}
              </div>

              <ul className="mt-7 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-pos" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-12 text-center text-xs text-muted">
        Prices in GBP. Cancel anytime from your account. Educational research only — not investment
        advice.
      </p>
    </div>
  );
}
