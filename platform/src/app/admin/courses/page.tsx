import { PageHeader, DataTable, ConfigNotice, StatCard } from "@/components/admin/admin-ui";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { QUESTIONS, TOPICS } from "@/lib/data/questions";
import { Badge } from "@/components/ui/badge";

export default function AdminCoursesPage() {
  return (
    <div>
      <PageHeader
        title="Courses & questions"
        description="The CFA L1 and Quant question bank. In production these are stored in Supabase and editable inline; the seed set is shown here."
        action={
          <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-2">
            + New question
          </button>
        }
      />
      {!isSupabaseConfigured && (
        <div className="mb-6">
          <ConfigNotice />
        </div>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Questions" value={String(QUESTIONS.length)} sub="across all topics" />
        <StatCard label="Topics" value={String(TOPICS.length)} />
        <StatCard label="Courses" value="2" sub="CFA L1 · Quant Trader" />
      </div>
      <DataTable
        columns={["Topic", "Prompt", "Answer", "Status"]}
        rows={QUESTIONS.map((q) => [
          <Badge key="t" size="sm">{q.topic}</Badge>,
          <span key="p" className="line-clamp-1 max-w-md text-ink-2">{q.prompt}</span>,
          <span key="a" className="text-muted">{q.choices[q.answer]}</span>,
          <Badge key="s" variant="pos" size="sm">Published</Badge>,
        ])}
      />
    </div>
  );
}
