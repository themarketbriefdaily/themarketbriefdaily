import Link from "next/link";
import { Lock } from "lucide-react";
import { getSessionContext } from "@/lib/entitlements";
import { isEntitled, TIER_LABEL, type Tier } from "@/lib/tiers";
import { Button } from "@/components/ui/button";

interface PaywallGateProps {
  required: Tier;
  /** Optional teaser shown (blurred) behind the lock for logged-out users. */
  teaser?: React.ReactNode;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * Server component. Renders `children` when the viewer meets `required`,
 * otherwise a premium upgrade panel. The admin panel can override which
 * sections are gated by writing `paywall_rules`; this component reads the
 * resolved tier from the session context.
 */
export async function PaywallGate({
  required,
  teaser,
  children,
  title,
  description,
}: PaywallGateProps) {
  const ctx = await getSessionContext();

  if (isEntitled(ctx.tier, required)) {
    return <>{children}</>;
  }

  const tierLabel = TIER_LABEL[required];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line">
      {teaser && (
        <div
          aria-hidden
          className="pointer-events-none select-none opacity-40 blur-[6px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        >
          {teaser}
        </div>
      )}

      <div
        className={
          teaser
            ? "absolute inset-0 grid place-items-center bg-bg/40 p-8 backdrop-blur-[2px]"
            : "grid place-items-center bg-bg-alt p-12"
        }
      >
        <div className="max-w-md text-center">
          <span className="mb-5 inline-grid h-12 w-12 place-items-center rounded-full bg-ink text-white">
            <Lock size={18} />
          </span>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.14em] text-warm">
            {tierLabel} access
          </p>
          <h3 className="font-display text-2xl font-bold tracking-tight">
            {title ?? "Unlock the full analysis"}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {description ??
              `This content is part of the ${tierLabel} tier — full holdings, attribution and history.`}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="md">
              <Link href={`/pricing?plan=${required}`}>
                {ctx.isLoggedIn ? `Upgrade to ${tierLabel}` : `View ${tierLabel} plans`}
              </Link>
            </Button>
            {!ctx.isLoggedIn && (
              <Button asChild variant="outline" size="md">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
