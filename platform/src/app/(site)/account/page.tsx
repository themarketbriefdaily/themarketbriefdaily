import Link from "next/link";
import type { Metadata } from "next";
import { getSessionContext } from "@/lib/entitlements";
import { TIER_LABEL, planFor } from "@/lib/tiers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ManageBillingButton } from "@/components/billing/manage-billing-button";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const ctx = await getSessionContext();
  const plan = planFor(ctx.tier);

  return (
    <div className="container-tbp py-[clamp(48px,6vw,88px)]">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">Account</div>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
              {ctx.email ?? "Your account"}
            </h1>
          </div>
          {ctx.role === "admin" && (
            <Button asChild variant="outline">
              <Link href="/admin">Open admin →</Link>
            </Button>
          )}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-card p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted">
              Current plan
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-display text-2xl font-extrabold tracking-tight">
                {TIER_LABEL[ctx.tier]}
              </span>
              {ctx.tier !== "free" && <Badge variant="gold">Active</Badge>}
            </div>
            <p className="mt-2 text-sm text-muted">{plan.tagline}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {ctx.tier === "free" ? (
                <Button asChild variant="gold">
                  <Link href="/pricing">Upgrade →</Link>
                </Button>
              ) : (
                <ManageBillingButton />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted">
              Quick links
            </div>
            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              <Link href="/education/cfa" className="text-ink-2 hover:text-ink">
                → Question bank &amp; progress
              </Link>
              <Link href="/investments" className="text-ink-2 hover:text-ink">
                → Model portfolios
              </Link>
              <Link href="/tools" className="text-ink-2 hover:text-ink">
                → Live indicators
              </Link>
            </div>
          </div>
        </div>

        <form action="/api/auth/signout" method="post" className="mt-8">
          <Button type="submit" variant="ghost" className="text-muted">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
