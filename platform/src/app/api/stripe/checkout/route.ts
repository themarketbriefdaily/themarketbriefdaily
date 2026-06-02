import { NextResponse } from "next/server";
import { stripe, isStripeConfigured, priceIdForTier } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tier } from "@/lib/tiers";

export async function POST(req: Request) {
  if (!isStripeConfigured || !stripe) {
    return NextResponse.json(
      { error: "Billing is not configured yet. Add STRIPE_SECRET_KEY and price IDs." },
      { status: 503 },
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth not configured." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { tier } = (await req.json()) as { tier: Tier };
  const priceId = priceIdForTier(tier);
  if (!priceId) {
    return NextResponse.json({ error: `No Stripe price configured for ${tier}.` }, { status: 400 });
  }

  // Reuse an existing Stripe customer if we have one on the profile.
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/account?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    metadata: { supabase_user_id: user.id, tier },
    subscription_data: { metadata: { supabase_user_id: user.id, tier } },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
