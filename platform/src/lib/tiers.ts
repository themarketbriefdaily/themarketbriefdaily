/**
 * Subscription tiers and the entitlement model.
 *
 * Tiers are ordered (free < pro < institutional). A piece of content is
 * gated by a *minimum* tier; a user is entitled if their tier rank >= the
 * required rank. The admin panel stores per-section overrides in the
 * `paywall_rules` table, but these constants are the defaults the app ships
 * with so it renders correctly before any DB rows exist.
 */

export type Tier = "free" | "pro" | "institutional";

export const TIER_RANK: Record<Tier, number> = {
  free: 0,
  pro: 1,
  institutional: 2,
};

export interface TierPlan {
  id: Tier;
  name: string;
  price: number; // GBP / month, 0 for free
  cadence: string;
  tagline: string;
  features: string[];
  /** Stripe price id — read from env so the same code works across envs. */
  stripePriceEnv?: string;
  featured?: boolean;
}

export const PLANS: TierPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    cadence: "forever",
    tagline: "The daily brief and the core education library.",
    features: [
      "Daily macro brief",
      "Core education library",
      "Live market ticker & headline indicators",
      "Public model-portfolio summaries",
    ],
  },
  {
    id: "pro",
    name: "Professional",
    price: 24,
    cadence: "per month",
    tagline: "Full archive, every portfolio, the question bank and tools.",
    stripePriceEnv: "STRIPE_PRICE_PRO",
    featured: true,
    features: [
      "Everything in Free",
      "Full research archive & long-form briefs",
      "All model portfolios with holdings & attribution",
      "Full live indicator dashboard with history",
      "CFA L1 & Quant question bank with progress tracking",
      "DCF, bond-yield and macro tools",
    ],
  },
  {
    id: "institutional",
    name: "Institutional",
    price: 499,
    cadence: "per month",
    tagline: "Bespoke research, data API access and team seats.",
    stripePriceEnv: "STRIPE_PRICE_INSTITUTIONAL",
    features: [
      "Everything in Professional",
      "Direct analyst access",
      "Bespoke research requests",
      "Indicator data API access",
      "Up to 10 team seats",
    ],
  },
];

export function planFor(tier: Tier): TierPlan {
  return PLANS.find((p) => p.id === tier) ?? PLANS[0];
}

/** Does `userTier` meet the `required` minimum tier? */
export function isEntitled(userTier: Tier, required: Tier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[required];
}

export const TIER_LABEL: Record<Tier, string> = {
  free: "Free",
  pro: "Professional",
  institutional: "Institutional",
};
