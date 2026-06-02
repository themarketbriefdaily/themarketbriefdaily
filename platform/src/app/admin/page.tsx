import Link from "next/link";
import { Users, CreditCard, GraduationCap, Lock } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PageHeader, StatCard, ConfigNotice } from "@/components/admin/admin-ui";
import { QUESTIONS } from "@/lib/data/questions";

async function getMetrics() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const [{ count: users }, { count: subs }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .neq("tier", "free"),
  ]);
  return { users: users ?? 0, subs: subs ?? 0 };
}

const QUICK = [
  { href: "/admin/users", label: "Manage users", icon: Users },
  { href: "/admin/subscriptions", label: "View subscriptions", icon: CreditCard },
  { href: "/admin/courses", label: "Edit question bank", icon: GraduationCap },
  { href: "/admin/paywall", label: "Configure paywalls", icon: Lock },
];

export default async function AdminDashboard() {
  const metrics = await getMetrics();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of users, subscriptions, content and gating."
      />

      {!isSupabaseConfigured && (
        <div className="mb-6">
          <ConfigNotice />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={metrics ? String(metrics.users) : "—"} sub="all tiers" />
        <StatCard
          label="Paid subscribers"
          value={metrics ? String(metrics.subs) : "—"}
          sub="Pro + Institutional"
        />
        <StatCard label="Question bank" value={`${QUESTIONS.length}`} sub="active questions" />
        <StatCard label="Live indicators" value="6" sub="FRED + pipeline" />
      </div>

      <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-[.1em] text-muted">
        Quick actions
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="flex items-center gap-3 rounded-2xl border border-line bg-card p-5 text-sm font-medium transition-colors hover:border-ink/30"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-bg-alt">
              <q.icon size={18} />
            </span>
            {q.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
