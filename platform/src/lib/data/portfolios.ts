import type { Tier } from "@/lib/tiers";

export interface Portfolio {
  code: string;
  name: string;
  sleeve: string;
  ytd: number;
  benchmark: string;
  excess: number;
  sharpe: number;
  vol: number;
  thesis: string;
  /** Minimum tier required to see holdings & full attribution. */
  detailTier: Tier;
}

/**
 * The four flagship model portfolios. Summary numbers are public; holdings,
 * attribution and the live sleeve are gated to Professional via `detailTier`.
 * In production these are read from Supabase + the funds-history pipeline.
 */
export const PORTFOLIOS: Portfolio[] = [
  {
    code: "MBD-MACRO",
    name: "Macro Transmission",
    sleeve: "Cross-asset macro regime",
    ytd: 8.4,
    benchmark: "60/40",
    excess: 3.3,
    sharpe: 1.31,
    vol: 7.2,
    thesis:
      "Positions the portfolio around the dominant macro transmission channel — rates, the dollar and global liquidity — rotating risk as the regime shifts.",
    detailTier: "pro",
  },
  {
    code: "MBD-STRUCT",
    name: "Market Structure Alpha",
    sleeve: "Microstructure & flows",
    ytd: 6.2,
    benchmark: "S&P 500",
    excess: 1.8,
    sharpe: 1.18,
    vol: 9.1,
    thesis:
      "Harvests structural inefficiencies in market microstructure: index rebalances, options dealer positioning and liquidity dislocations.",
    detailTier: "pro",
  },
  {
    code: "MBD-SUPPLY",
    name: "Physical Supply Premia",
    sleeve: "Commodities & carry",
    ytd: 11.7,
    benchmark: "BCOM",
    excess: 4.9,
    sharpe: 1.44,
    vol: 12.6,
    thesis:
      "Captures physical supply tightness across metals and energy through curve structure, inventory signals and lease-rate dynamics.",
    detailTier: "pro",
  },
  {
    code: "MBD-FACT",
    name: "Regime-Aware Factor",
    sleeve: "Equity factors",
    ytd: 7.1,
    benchmark: "MSCI World",
    excess: 1.7,
    sharpe: 1.09,
    vol: 8.4,
    thesis:
      "A factor sleeve that tilts between value, quality and momentum based on the prevailing macro regime rather than holding static weights.",
    detailTier: "pro",
  },
];
