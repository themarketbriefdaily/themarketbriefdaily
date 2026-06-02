import { PageHeader, DataTable } from "@/components/admin/admin-ui";
import { indicatorsConfigured } from "@/lib/data/indicators";
import { Badge } from "@/components/ui/badge";

const SOURCES = [
  { name: "Market levels", provider: "Yahoo Finance (pipeline)", series: "ticker.json / macro.json", cadence: "2×/weekday", live: true },
  { name: "US CPI", provider: "FRED", series: "CPIAUCSL", cadence: "hourly cache", live: indicatorsConfigured },
  { name: "Core CPI", provider: "FRED", series: "CPILFESL", cadence: "hourly cache", live: indicatorsConfigured },
  { name: "Fed funds rate", provider: "FRED", series: "FEDFUNDS", cadence: "hourly cache", live: indicatorsConfigured },
  { name: "Unemployment", provider: "FRED", series: "UNRATE", cadence: "hourly cache", live: indicatorsConfigured },
  { name: "Treasury curve", provider: "FRED", series: "DGS1MO…DGS30", cadence: "hourly cache", live: indicatorsConfigured },
];

export default function AdminIndicatorsPage() {
  return (
    <div>
      <PageHeader
        title="Indicator sources"
        description="The data feeds powering the Markets dashboard. Market levels come from the existing GitHub Actions pipeline; macro series come from FRED when FRED_API_KEY is set."
      />
      {!indicatorsConfigured && (
        <div className="mb-6 rounded-xl border border-warm/30 bg-warm/[0.06] p-5 text-sm">
          <p className="font-semibold text-ink">FRED API key not set.</p>
          <p className="mt-1.5 text-muted">
            Add <code className="rounded bg-bg-alt px-1">FRED_API_KEY</code> to enable live CPI,
            rates and curve data. Market levels remain live from the pipeline regardless.
          </p>
        </div>
      )}
      <DataTable
        columns={["Indicator", "Provider", "Series", "Cadence", "Status"]}
        rows={SOURCES.map((s) => [
          <span key="n" className="font-medium text-ink">{s.name}</span>,
          s.provider,
          <code key="se" className="text-xs text-muted">{s.series}</code>,
          s.cadence,
          s.live ? (
            <Badge key="st" variant="pos" size="sm"><span className="live-dot" /> Live</Badge>
          ) : (
            <Badge key="st" size="sm">Fallback</Badge>
          ),
        ])}
      />
    </div>
  );
}
