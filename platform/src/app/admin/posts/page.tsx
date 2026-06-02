import { PageHeader, DataTable, ConfigNotice } from "@/components/admin/admin-ui";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Badge } from "@/components/ui/badge";

const POSTS = [
  { title: "Structural Inflation and the Unanchored Central Banker", topic: "Macro", date: "28 May 2026", tier: "free", status: "Published" },
  { title: "Japan's PM Moment and Its Shadow Over US Stocks", topic: "Macro", date: "11 Feb 2026", tier: "free", status: "Published" },
  { title: "Druckenmiller's Shadow: Sizing Macro Bets", topic: "Risk", date: "09 Feb 2026", tier: "pro", status: "Published" },
  { title: "Silver Market Outlook: COMEX Inventory Squeeze", topic: "Commodities", date: "07 Feb 2026", tier: "pro", status: "Published" },
  { title: "Q3 Credit Conditions — draft", topic: "Credit", date: "—", tier: "pro", status: "Draft" },
];

export default function AdminPostsPage() {
  return (
    <div>
      <PageHeader
        title="Research posts"
        description="Publish and gate research. Set a post's minimum tier to control who can read the full text."
        action={
          <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-2">
            + New post
          </button>
        }
      />
      {!isSupabaseConfigured && (
        <div className="mb-6">
          <ConfigNotice />
        </div>
      )}
      <DataTable
        columns={["Title", "Topic", "Date", "Tier", "Status"]}
        rows={POSTS.map((p) => [
          <span key="t" className="font-medium text-ink">{p.title}</span>,
          <Badge key="to" size="sm">{p.topic}</Badge>,
          p.date,
          <Badge key="ti" variant={p.tier === "free" ? "default" : "gold"} size="sm">{p.tier}</Badge>,
          p.status === "Published" ? (
            <Badge key="s" variant="pos" size="sm">Published</Badge>
          ) : (
            <Badge key="s" size="sm">Draft</Badge>
          ),
        ])}
      />
    </div>
  );
}
