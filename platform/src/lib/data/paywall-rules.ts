import type { Tier } from "@/lib/tiers";

export interface PaywallRule {
  key: string;
  section: string;
  description: string;
  /** Minimum tier required. "free" = ungated. */
  requiredTier: Tier;
}

/**
 * Default gating map shipped with the app. The admin panel writes overrides to
 * the `paywall_rules` table; these defaults are used when no row exists, so the
 * site is correctly gated out of the box.
 */
export const DEFAULT_PAYWALL_RULES: PaywallRule[] = [
  { key: "research.archive", section: "Research", description: "Full research archive & long-form briefs", requiredTier: "pro" },
  { key: "research.daily", section: "Research", description: "Daily brief", requiredTier: "free" },
  { key: "portfolios.summary", section: "Portfolios", description: "Performance summaries", requiredTier: "free" },
  { key: "portfolios.holdings", section: "Portfolios", description: "Holdings & attribution", requiredTier: "pro" },
  { key: "markets.headline", section: "Markets", description: "Headline indicators & ticker", requiredTier: "free" },
  { key: "markets.history", section: "Markets", description: "Full indicator history & curve", requiredTier: "pro" },
  { key: "learn.library", section: "Learn", description: "Education library", requiredTier: "free" },
  { key: "learn.questionbank", section: "Learn", description: "CFA & Quant question bank", requiredTier: "pro" },
  { key: "tools.dcf", section: "Tools", description: "DCF & bond-yield tools", requiredTier: "pro" },
  { key: "data.api", section: "Data", description: "Indicator data API", requiredTier: "institutional" },
];
