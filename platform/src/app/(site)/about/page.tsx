import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container-tbp py-[clamp(48px,6vw,88px)]">
      <div className="mx-auto max-w-2xl" data-reveal>
        <div className="eyebrow">About</div>
        <h1 className="mt-4 text-[clamp(2.4rem,5vw,3.4rem)] font-extrabold leading-none tracking-tight">
          Independent research, <span className="serif-em">from London.</span>
        </h1>
        <div className="mt-8 space-y-5 text-[1.05rem] leading-relaxed text-ink-2">
          <p>
            The Market Brief Daily publishes institutional-grade macro and market-structure research
            for serious investors and students. We don&apos;t publish narratives — we publish
            frameworks: the kind a portfolio manager would test before sizing a position, and the
            kind a candidate should be able to defend in an interview.
          </p>
          <p>
            Coverage spans macro transmission, credit, commodities and microstructure. Alongside the
            daily brief we run four transparent model portfolios, a live indicator dashboard, a
            finance education library and an experimental AI day-trader — every trade logged in
            public.
          </p>
          <p>
            Everything here is educational research and not investment advice. Data is drawn from
            public sources including FRED, the Bank of England and exchange feeds, and is clearly
            attributed throughout.
          </p>
        </div>
      </div>
    </div>
  );
}
