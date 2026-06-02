import "server-only";
import { createSupabaseServerClient } from "./supabase/server";
import { isEntitled, type Tier } from "./tiers";

export interface SessionContext {
  userId: string | null;
  email: string | null;
  role: "user" | "admin";
  tier: Tier;
  isLoggedIn: boolean;
}

const ANON: SessionContext = {
  userId: null,
  email: null,
  role: "user",
  tier: "free",
  isLoggedIn: false,
};

/**
 * Resolve the current viewer's entitlement context from Supabase. Always
 * returns a value — anonymous/free when logged out or unconfigured — so
 * server components never have to special-case the unconfigured state.
 */
export async function getSessionContext(): Promise<SessionContext> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return ANON;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return ANON;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, tier, subscription_status")
    .eq("id", user.id)
    .single();

  // Only an active/trialing subscription confers a paid tier.
  const active =
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "trialing";
  const tier: Tier = active && profile?.tier ? (profile.tier as Tier) : "free";

  return {
    userId: user.id,
    email: user.email ?? null,
    role: (profile?.role as "user" | "admin") ?? "user",
    tier,
    isLoggedIn: true,
  };
}

/** Convenience: does the current viewer meet a minimum tier? */
export async function viewerEntitled(required: Tier): Promise<boolean> {
  const ctx = await getSessionContext();
  return isEntitled(ctx.tier, required);
}
