"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { QUESTIONS, TOPICS, type Question } from "@/lib/data/questions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "tmbd.cfa.progress";

interface Progress {
  answered: Record<string, boolean>; // id -> correct?
}

function loadProgress(): Progress {
  if (typeof window === "undefined") return { answered: {} };
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "") as Progress;
  } catch {
    return { answered: {} };
  }
}

export function Quiz() {
  const [topic, setTopic] = useState<string>("All");
  const [progress, setProgress] = useState<Progress>({ answered: {} });
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => setProgress(loadProgress()), []);

  const pool = useMemo<Question[]>(
    () => (topic === "All" ? QUESTIONS : QUESTIONS.filter((q) => q.topic === topic)),
    [topic],
  );

  const q = pool[index] ?? pool[0];
  const total = pool.length;
  const answeredCount = Object.keys(progress.answered).length;
  const correctCount = Object.values(progress.answered).filter(Boolean).length;

  function choose(i: number) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    const correct = i === q.answer;
    const next = { answered: { ...progress.answered, [q.id]: correct } };
    setProgress(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  function nextQ() {
    setSelected(null);
    setRevealed(false);
    setIndex((i) => (i + 1) % total);
  }

  function reset() {
    setProgress({ answered: {} });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSelected(null);
    setRevealed(false);
    setIndex(0);
  }

  return (
    <div>
      {/* Progress header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card p-5">
        <div className="flex items-center gap-6">
          <Metric label="Answered" value={`${answeredCount}/${QUESTIONS.length}`} />
          <Metric label="Correct" value={`${correctCount}`} accent />
          <Metric
            label="Accuracy"
            value={answeredCount ? `${Math.round((correctCount / answeredCount) * 100)}%` : "—"}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-muted">
          <RotateCcw size={14} /> Reset
        </Button>
      </div>

      {/* Topic filter */}
      <div className="mt-5 flex flex-wrap gap-2">
        {["All", ...TOPICS].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTopic(t);
              setIndex(0);
              setSelected(null);
              setRevealed(false);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              topic === t ? "border-ink bg-ink text-white" : "border-line text-muted hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Question card */}
      <div className="mt-5 rounded-2xl border border-line bg-card p-7">
        <div className="flex items-center justify-between">
          <Badge size="sm">{q.topic}</Badge>
          <span className="text-xs text-muted">
            Question {index + 1} of {total}
          </span>
        </div>
        <h3 className="mt-4 text-lg font-semibold leading-snug">{q.prompt}</h3>

        <div className="mt-5 space-y-2.5">
          {q.choices.map((choice, i) => {
            const isCorrect = i === q.answer;
            const isPicked = i === selected;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={revealed}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  !revealed && "border-line hover:border-ink/40",
                  revealed && isCorrect && "border-pos/40 bg-pos/[0.06]",
                  revealed && isPicked && !isCorrect && "border-neg/40 bg-neg/[0.06]",
                  revealed && !isCorrect && !isPicked && "border-line opacity-60",
                )}
              >
                <span>{choice}</span>
                {revealed && isCorrect && <Check size={16} className="text-pos" />}
                {revealed && isPicked && !isCorrect && <X size={16} className="text-neg" />}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-5 rounded-xl bg-bg-alt/50 p-4 text-sm leading-relaxed text-ink-2">
            <span className="font-semibold">
              {selected === q.answer ? "Correct. " : "Not quite. "}
            </span>
            {q.explanation}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button onClick={nextQ} disabled={!revealed}>
            Next question →
          </Button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted">{label}</div>
      <div className={cn("font-display text-xl font-extrabold tabular", accent && "text-pos")}>
        {value}
      </div>
    </div>
  );
}
