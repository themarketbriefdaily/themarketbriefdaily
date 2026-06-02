import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Calculator, GraduationCap, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Finance education library, the CFA L1 & Quant question bank, and institutional-grade tools — DCF, bond yield and the macro dashboard.",
};

const CHAPTERS = [
  { title: "Financial Markets", desc: "How markets, instruments and participants fit together." },
  { title: "Asset Classes & Types", desc: "Equities, bonds, commodities, derivatives and alternatives." },
  { title: "Investing Principles", desc: "Risk, return, diversification and position sizing." },
  { title: "UK Investing & Tax", desc: "ISAs, SIPPs, LISAs and capital-gains treatment." },
  { title: "Pensions", desc: "Workplace, personal and state pensions explained." },
  { title: "Personal Finance", desc: "Budgeting, debt and building a portfolio." },
  { title: "Glossary", desc: "Hundreds of terms in plain English." },
];

const COURSES = [
  {
    href: "/learn/cfa",
    icon: GraduationCap,
    title: "CFA Level 1 Question Bank",
    desc: "Hundreds of exam-style questions across all 10 topic areas, with timed quizzes, explanations and saved progress.",
    badge: "Professional",
  },
  {
    href: "/learn/cfa",
    icon: LineChart,
    title: "Quant Trader Course",
    desc: "From signal construction to backtesting, risk and execution — the foundations behind the AI day-trader.",
    badge: "Professional",
  },
];

const TOOLS = [
  { icon: Calculator, title: "DCF Calculator", desc: "Build a discounted cash-flow model in one screen." },
  { icon: LineChart, title: "Bond Yield Analytics", desc: "Price, yield, duration and convexity." },
  { icon: BookOpen, title: "Macro Dashboard", desc: "Yield curves, spreads and policy path." },
];

export default function LearnPage() {
  return (
    <div className="container-tbp py-[clamp(48px,6vw,88px)]">
      <header className="max-w-3xl" data-reveal>
        <div className="eyebrow">Learn</div>
        <h1 className="mt-4 text-[clamp(2.4rem,5vw,3.4rem)] font-extrabold leading-none tracking-tight">
          Education and <span className="serif-em">tools.</span>
        </h1>
        <p className="mt-5 text-[1.05rem] leading-relaxed text-muted">
          A free education library, a paywalled question bank with progress tracking, and a set of
          institutional-grade calculators — one hub.
        </p>
      </header>

      {/* Courses */}
      <section className="mt-12" data-reveal>
        <h2 className="mb-5 text-lg font-bold tracking-tight">Courses &amp; question bank</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {COURSES.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group flex flex-col rounded-2xl border border-line bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-16px_rgba(0,0,0,.14)]"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-white">
                  <c.icon size={20} />
                </span>
                <Badge variant="gold">{c.badge}</Badge>
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-tight">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.desc}</p>
              <span className="mt-4 text-[13px] font-semibold text-ink">Start →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Library */}
      <section className="mt-12" data-reveal>
        <h2 className="mb-5 text-lg font-bold tracking-tight">
          Education library <span className="text-sm font-normal text-muted">· free</span>
        </h2>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((ch, i) => (
            <div key={ch.title} className="rounded-2xl border border-line bg-card p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted-2">
                Chapter {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-2 text-base font-bold tracking-tight">{ch.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{ch.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="mt-12" data-reveal>
        <h2 className="mb-5 text-lg font-bold tracking-tight">Tools</h2>
        <div className="grid gap-3.5 sm:grid-cols-3">
          {TOOLS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-line bg-card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-bg-alt text-ink">
                <t.icon size={18} />
              </span>
              <h3 className="mt-4 text-base font-bold tracking-tight">{t.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
