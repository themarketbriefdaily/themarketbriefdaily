import Link from "next/link";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ConfigNotice() {
  return (
    <div className="rounded-xl border border-warm/30 bg-warm/[0.06] p-5 text-sm">
      <p className="font-semibold text-ink">Supabase isn&apos;t connected yet.</p>
      <p className="mt-1.5 text-muted">
        This screen shows representative sample data. Add your Supabase keys and run the migration
        (see{" "}
        <Link href="/admin" className="font-semibold underline-offset-2 hover:underline">
          README
        </Link>
        ) to manage live records.
      </p>
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted">{label}</div>
      <div className="mt-2 font-display text-3xl font-extrabold tabular tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: (React.ReactNode)[][];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <table className="w-full text-sm">
        <thead className="bg-bg-alt">
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[.1em] text-muted"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-bg-alt/40">
              {row.map((cell, j) => (
                <td key={j} className="px-5 py-3.5 align-middle text-ink-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
