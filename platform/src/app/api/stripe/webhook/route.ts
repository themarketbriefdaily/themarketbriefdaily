import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, isStripeConfigured, tierForPrice } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Tier } from "@/lib/tiers";

/**
 * Stripe webhook → keeps `profiles.tier` and `subscription_status` in sync.
 * Configure the endpoint at /api/stripe/webhook and set STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  if (!isStripeConfigured || !stripe) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${String(err)}` }, { status: 400 });
  }

  const db = createSupabaseAdminClient();
  if (!db) {
    return NextResponse.json({ error: "Supabase service role not configured." }, { status: 503 });
  }

  async function syncSubscription(sub: Stripe.Subscription) {
    const userId =
      (sub.metadata?.supabase_user_id as string | undefined) ?? null;
    const priceId = sub.items.data[0]?.price?.id ?? "";
    const tier: Tier = tierForPrice(priceId) ?? "free";
    const status = sub.status; // active, trialing, past_due, canceled, ...

    const patch = {
      tier: status === "active" || status === "trialing" ? tier : "free",
      subscription_status: status,
      stripe_subscription_id: sub.id,
      current_period_end: sub.items.data[0]?.current_period_end
        ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
        : null,
    };

    if (userId) {
      await db!.from("profiles").update(patch).eq("id", userId);
    } else {
      await db!.from("profiles").update(patch).eq("stripe_customer_id", sub.customer as string);
    }
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await syncSubscription(sub);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
