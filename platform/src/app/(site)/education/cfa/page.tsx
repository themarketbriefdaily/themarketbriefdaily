import type { Metadata } from "next";
import { Quiz } from "@/components/learn/quiz";
import { PaywallGate } from "@/components/paywall/paywall-gate";
import { QUESTIONS, TOPICS } from "@/lib/data/questions";

export const metadata: Metadata = {
  title: "CFA L1 Question Bank",
  description:
    "Practise hundreds of CFA Level 1 style questions across every topic area, with timed quizzes, explanations and saved progress.",
};

export default function CfaPage() {
  return (
    <div className="container-tbp py-[clamp(48px,6vw,88px)]">
      <header className="max-w-3xl" data-reveal>
        <div className="eyebrow">Question bank · Professional</div>
        <h1 className="mt-4 text-[clamp(2.4rem,5vw,3.4rem)] font-extrabold leading-none tracking-tight">
          CFA Level 1 <span className="serif-em">practice.</span>
        </h1>
        <p className="mt-5 text-[1.05rem] leading-relaxed text-muted">
          {QUESTIONS.length}+ exam-style questions across {TOPICS.length} topic areas with worked
          explanations and saved progress. Built to be defended in an interview, not just memorised.
        </p>
      </header>

      <div className="mt-10">
        <PaywallGate
          required="pro"
          title="Unlock the full question bank"
          description="The CFA L1 & Quant question bank, timed quizzes and progress tracking are part of Professional."
        >
          <Quiz />
        </PaywallGate>
      </div>
    </div>
  );
}
