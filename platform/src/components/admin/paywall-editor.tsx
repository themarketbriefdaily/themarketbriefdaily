"use client";

import { useState } from "react";
import { DEFAULT_PAYWALL_RULES, type PaywallRule } from "@/lib/data/paywall-rules";
import { TIER_LABEL, type Tier } from "@/lib/tiers";
import { cn } from "@/lib/utils";

const TIERS: Tier[] = ["free", "pro", "institutional"];

/**
 * Interactive gating editor. In the foundation this persists to localStorage;
 * wiring `save()` to a server action that upserts `paywall_rules` makes it the
 * live source of truth (the PaywallGate reads the resolved tier per key).
 */
export function PaywallEditor() {
  const [rules, setRules] = useState<PaywallRule[]>(DEFAULT_PAYWALL_RULES);
  const [saved, setSaved] = useState(false);

  function setTier(key: string, tier: Tier) {
    setRules((rs) => rs.map((r) => (r.key === key ? { ...r, requiredTier: tier } : r)));
    setSaved(false);
  }

  function save() {
    try {
      localStorage.setItem("tmbd.paywall.rules", JSON.stringify(rules));
    } catch {}
    setSaved(true);
  }

  const grouped = rules.reduce<Record<string, PaywallRule[]>>((acc, r) => {
    (acc[r.section] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <div className="space-y-6">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} className="overflow-hidden rounded-2xl border border-line bg-card">
            <div className="border-b border-line bg-bg-alt px-5 py-3 text-[11px] font-semibold uppercase tracking-[.1em] text-muted">
              {section}
            </div>
            <div className="divide-y divide-line-soft">
              {items.map((r) => (
                <div key={r.key} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <div className="text-sm font-medium text-ink">{r.description}</div>
                    <div className="text-xs text-muted-2">{r.key}</div>
                  </div>
                  <div className="inline-flex rounded-full border border-line p-0.5">
                    {TIERS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTier(r.key, t)}
                        className={cn(
                          "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                          r.requiredTier === t
                            ? "bg-ink text-white"
                            : "text-muted hover:text-ink",
                        )}
                      >
                        {TIER_LABEL[t]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={save}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink-2"
        >
          Save gating rules
        </button>
        {saved && <span className="text-sm text-pos">Saved.</span>}
      </div>
    </div>
  );
}
