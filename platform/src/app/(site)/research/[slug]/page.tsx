import Link from "next/link";
import { PaywallGate } from "@/components/paywall/paywall-gate";
import { Badge } from "@/components/ui/badge";

// In production this is fetched from Supabase by slug. The foundation renders a
// consistent article shell so every research link resolves.
const PRO_SLUGS = new Set(["druckenmiller-shadow", "silver-comex-inventory"]);

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ResearchPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gated = PRO_SLUGS.has(slug);
  const title = titleFromSlug(slug);

  const body = (
    <div className="space-y-5 text-[1.05rem] leading-relaxed text-ink-2">
      <p>
        This is the full brief. The production build loads the long-form content for{" "}
        <strong>{title}</strong> from the research store, preserving the original Substack
        formatting, charts and footnotes.
      </p>
      <p>
        The framework here walks through the setup, the transmission channel, the positioning
        implication and the risks — the same structure used across every brief so readers can
        compare theses on like terms.
      </p>
      <p>
        Subscribers get the full archive, the supporting data and the model-portfolio decision that
        followed.
      </p>
    </div>
  );

  return (
    <article className="container-tbp py-[clamp(48px,6vw,88px)]">
      <div className="mx-auto max-w-2xl">
        <Link href="/research" className="text-sm text-muted hover:text-ink">
          ← All research
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <Badge size="sm">Macro</Badge>
          {gated && <Badge variant="gold" size="sm">Professional</Badge>}
        </div>
        <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted">The Market Brief Daily · Educational research</p>

        <div className="mt-8">
          {gated ? (
            <PaywallGate
              required="pro"
              title="Read the full brief"
              description="This long-form brief is part of Professional. Subscribe to read the full archive."
              teaser={<div className="opacity-80">{body}</div>}
            >
              {body}
            </PaywallGate>
          ) : (
            body
          )}
        </div>
      </div>
    </article>
  );
}
