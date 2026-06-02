import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY ?? "";

export const isStripeConfigured = Boolean(key);

/** Server-only Stripe client. `null` until STRIPE_SECRET_KEY is set. */
export const stripe = isStripeConfigured
  ? new Stripe(key, { apiVersion: "2026-05-27.dahlia" })
  : null;

import type { Tier } from "./tiers";

/** Map a Stripe price id back to a tier via env configuration. */
export function tierForPrice(priceId: string): Tier | null {
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId && priceId === process.env.STRIPE_PRICE_INSTITUTIONAL) return "institutional";
  return null;
}

export function priceIdForTier(tier: Tier): string | null {
  if (tier === "pro") return process.env.STRIPE_PRICE_PRO ?? null;
  if (tier === "institutional") return process.env.STRIPE_PRICE_INSTITUTIONAL ?? null;
  return null;
}
