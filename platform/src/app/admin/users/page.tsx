import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PageHeader, DataTable, ConfigNotice } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { TIER_LABEL, type Tier } from "@/lib/tiers";

interface Row {
  email: string;
  tier: Tier;
  role: string;
  subscription_status: string | null;
  created_at: string | null;
}

const SAMPLE: Row[] = [
  { email: "alex@fund.com", tier: "institutional", role: "user", subscription_status: "active", created_at: "2026-01-12" },
  { email: "jmorgan@gmail.com", tier: "pro", role: "user", subscription_status: "active", created_at: "2026-02-03" },
  { email: "you@themarketbriefdaily.com", tier: "institutional", role: "admin", subscription_status: "active", created_at: "2025-11-30" },
  { email: "student@uni.ac.uk", tier: "free", role: "user", subscription_status: null, created_at: "2026-03-21" },
];

async function getUsers(): Promise<Row[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return SAMPLE;
  const { data } = await supabase
    .from("profiles")
    .select("email, tier, role, subscription_status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data as Row[]) ?? [];
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div>
      <PageHeader
        title="Users"
        description="Everyone with an account. Tier and role are kept in sync by the Stripe webhook; promote a user to admin in Supabase."
      />
      {!isSupabaseConfigured && (
        <div className="mb-6">
          <ConfigNotice />
        </div>
      )}
      <DataTable
        columns={["Email", "Tier", "Role", "Status", "Joined"]}
        rows={users.map((u) => [
          <span key="e" className="font-medium text-ink">{u.email}</span>,
          <Badge key="t" variant={u.tier === "free" ? "default" : "gold"}>{TIER_LABEL[u.tier]}</Badge>,
          u.role === "admin" ? <Badge key="r" variant="pos">Admin</Badge> : "User",
          u.subscription_status ?? "—",
          u.created_at ?? "—",
        ])}
      />
    </div>
  );
}
