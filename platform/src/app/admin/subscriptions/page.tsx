import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PageHeader, DataTable, ConfigNotice, StatCard } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { PLANS, TIER_LABEL, type Tier } from "@/lib/tiers";

interface Row {
  email: string;
  tier: Tier;
  subscription_status: string | null;
  current_period_end: string | null;
}

const SAMPLE: Row[] = [
  { email: "alex@fund.com", tier: "institutional", subscription_status: "active", current_period_end: "2026-07-01" },
  { email: "jmorgan@gmail.com", tier: "pro", subscription_status: "active", current_period_end: "2026-06-20" },
  { email: "carol@advisor.co", tier: "pro", subscription_status: "past_due", current_period_end: "2026-06-04" },
];

async function getSubs(): Promise<Row[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return SAMPLE;
  const { data } = await supabase
    .from("profiles")
    .select("email, tier, subscription_status, current_period_end")
    .neq("tier", "free")
    .order("current_period_end", { ascending: true })
    .limit(200);
  return (data as Row[]) ?? [];
}

export default async function AdminSubscriptionsPage() {
  const subs = await getSubs();
  const mrr = subs
    .filter((s) => s.subscription_status === "active")
    .reduce((sum, s) => sum + (PLANS.find((p) => p.id === s.tier)?.price ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description="Active and lapsed paid subscriptions, synced from Stripe via webhook."
      />
      {!isSupabaseConfigured && (
        <div className="mb-6">
          <ConfigNotice />
        </div>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active subs" value={String(subs.filter((s) => s.subscription_status === "active").length)} />
        <StatCard label="Est. MRR" value={`£${mrr.toLocaleString()}`} sub="active recurring" />
        <StatCard label="At risk" value={String(subs.filter((s) => s.subscription_status === "past_due").length)} sub="past due" />
      </div>
      <DataTable
        columns={["Email", "Plan", "Status", "Renews"]}
        rows={subs.map((s) => [
          <span key="e" className="font-medium text-ink">{s.email}</span>,
          <Badge key="t" variant="gold">{TIER_LABEL[s.tier]}</Badge>,
          s.subscription_status === "active" ? (
            <Badge key="s" variant="pos">Active</Badge>
          ) : (
            <Badge key="s" variant="neg">{s.subscription_status ?? "—"}</Badge>
          ),
          s.current_period_end ?? "—",
        ])}
      />
    </div>
  );
}
