# IMC Course — Complete DeepSeek Prompt Pack

A complete, self-contained prompt pack for generating an Investment Management Certificate (IMC v18) study course using DeepSeek (DeepSeek-V3 or DeepSeek-Chat). Run the prompts in order. Together they produce enough material to sit and pass the IMC with no other resource.

The IMC is owned by the CFA Society of the UK. There are two papers:

- **Unit 1 — The Investment Environment** (multiple-choice, 100 questions, 120 min). Covers the UK regulatory regime, ethics, taxation, advice frameworks, time value of money, and statistics.
- **Unit 2 — Investment Practice** (multiple-choice, 105 questions, 140 min). Covers asset classes, equity & fixed-income analysis, derivatives, investment theory, portfolio construction, performance measurement, pooled vehicles, pensions, and selection.

Pass mark is ~70% per unit. The syllabus rotates annually each September; check the CFA UK website for the live version before sitting the exam.

---

## How to use this pack

1. Open a fresh DeepSeek chat for each chapter — keeps context clean and avoids context overflow.
2. Paste **Prompt 0 (System primer)** as the *first* message of every chat.
3. Then paste the chapter-specific prompt that follows.
4. Save the output as Markdown. Build a notebook over 2–3 weeks.
5. At the end, run the **Mock-paper** and **Final-revision condensation** prompts.

Tip: After each chapter run, ask DeepSeek to "produce a one-page 'cheat sheet' summary of the above, with every formula, definition, and decision rule retained, no prose." That becomes your revision card.

---

# PROMPT 0 — SYSTEM PRIMER (paste at start of every chat)

```
You are a senior CFA UK examiner and former buy-side training manager. You are writing
study material for a candidate sitting the CFA UK Investment Management Certificate (IMC),
which is the entry-level UK regulatory qualification used by asset managers, IFAs, and
wealth firms.

Style rules — apply to every reply unless I say otherwise:
1.  Write in clear, plain UK English. No filler, no "in conclusion", no "it's worth noting".
2.  Define every term the first time it appears. Bracket it as "(term: definition)".
3.  Use British spelling and British currency conventions throughout (£, p, GBP).
4.  Where a formula exists, state it in words AND in algebraic form. Then give one fully
    worked numerical example with units and rounding shown.
5.  Where a rule has a numeric threshold, give the exact figure for the 2024/25 UK tax
    year. If the rule changed in the last 24 months, flag the change explicitly.
6.  Use UK regulator names: FCA (Financial Conduct Authority), PRA (Prudential Regulation
    Authority), FOS (Financial Ombudsman Service), FSCS (Financial Services Compensation
    Scheme), HMRC, BoE (Bank of England). Spell out on first use only.
7.  When citing regulation, name the FCA Handbook reference (e.g. COBS, SYSC, PRIN) but
    don't quote text verbatim — paraphrase.
8.  Avoid US-centric content (no FINRA, no Reg-T, no IRA/401k unless explicitly comparing).
9.  Output structure: H2 for each main topic, H3 for sub-topics, then bulleted lists for
    enumerable items. Use tables for comparisons.
10. End every chapter response with these three sections:
    a) "Exam triggers" — phrases the exam uses that map to this topic.
    b) "Common traps" — 3-5 distractor patterns the IMC uses.
    c) "5 practice MCQs" — single-best-answer, 4 options each, with worked answer below.

If asked for content beyond the IMC syllabus, decline politely and steer back to syllabus.
If a topic spans both Unit 1 and Unit 2 (e.g. tax wrappers), note it but only cover the
slice owned by the current Unit being studied.

Confirm "Ready. Send the chapter prompt." and wait.
```

---

# UNIT 1 — THE INVESTMENT ENVIRONMENT

Each prompt below assumes Prompt 0 has been sent. Send one prompt per chat session.

## PROMPT 1.1 — Industry Regulation, Ethics & Integrity

```
Produce the complete IMC Unit 1 chapter on Industry Regulation, Ethics & Integrity.
Cover, in order:

1.  Why we regulate financial services — the case for and against intervention.
2.  The FCA's three operational objectives in full (consumer protection, market integrity,
    competition) AND its single strategic objective.
3.  The FCA's 12 Principles for Businesses (PRIN 2.1). Give the exact wording in a table,
    then a one-line plain-English gloss for each.
4.  The Senior Managers and Certification Regime (SM&CR) — Senior Managers, Certified
    Persons, Conduct Rules (Tier 1 and Tier 2). Use a table.
5.  The five Consumer Duty cross-cutting rules and the four outcomes (products & services,
    price & value, consumer understanding, consumer support). Effective date: 31 July 2023.
6.  Ethics theories at IMC level — utilitarianism, deontology, virtue ethics — and how
    they map to advice scenarios. One paragraph each, no more.
7.  Conflicts of interest: identification, management, disclosure. Tie to SYSC 10.
8.  Market abuse regime: UK MAR Article 8 (insider dealing), Article 12 (market
    manipulation), Article 14 (unlawful disclosure). Include penalty range.
9.  Money laundering: 3 stages (placement / layering / integration), the MLR 2017, JMLSG
    guidance, role of MLRO, customer due diligence (CDD) tiers.
10. Whistleblowing under PIDA 1998 and FCA whistleblowing rules.

Finish with: exam triggers · common traps · 5 MCQs.
```

## PROMPT 1.2 — The Regulation of Financial Services

```
Produce the complete IMC Unit 1 chapter on the Regulation of Financial Services. Cover:

1.  FSMA 2000 architecture, including the post-2013 split into FCA and PRA, and the role
    of the FPC (Financial Policy Committee) at the Bank of England.
2.  Authorisation: the s.19 general prohibition, how a firm obtains Part 4A permission,
    "regulated activities" vs "specified investments" (RAO 2001).
3.  The four FCA "threshold conditions" a firm must keep meeting.
4.  The FCA's supervision approach: firm categorisation (fixed vs flexible portfolio),
    PRA dual-regulated firms.
5.  Approved Persons → SM&CR transition (covered already in 1.1 — recap only here).
6.  Enforcement powers: fines, public censure, prohibition orders, restitution under s.382,
    skilled-person review under s.166.
7.  The Financial Ombudsman Service (FOS): scope, eligible complainants (private,
    micro-enterprise, charity, trust thresholds — quote the £6.85m / 50-employee / £5m
    figures), money-award limit (£430,000 for 2024/25), DISP rules.
8.  The Financial Services Compensation Scheme (FSCS): investments £85,000 per person per
    failed firm; deposits £85,000; long-term insurance 100%; pensions vs trust-based
    nuances.
9.  Consumer redress: complaint handling under DISP, 8-week rule, final response letter.
10. UK MAR vs the FCA's market abuse rules — split since onshoring after Brexit.

Finish with: exam triggers · common traps · 5 MCQs.
```

## PROMPT 1.3 — Legal Concepts

```
Produce the IMC Unit 1 chapter on Legal Concepts. Aim: enough to answer any IMC-level
question without producing a law-school text. Cover:

1.  Sole trader, partnership, LLP, private limited company (Ltd), public limited company
    (plc). Table compares: legal personality, liability, tax, accounts filing.
2.  Trusts: settlor, trustee, beneficiary; bare, interest-in-possession, discretionary,
    accumulation & maintenance. Tax overview only (full IHT in chapter 1.5).
3.  Powers of Attorney: ordinary, lasting (LPA — property & financial affairs vs health &
    welfare), enduring (pre-2007). Registration with OPG.
4.  Agency: principal, agent, apparent vs actual authority. Implications for advice
    delegation.
5.  Contract law essentials: offer, acceptance, consideration, intention to create legal
    relations, capacity. Voidable vs void contracts.
6.  Joint vs tenants-in-common ownership; right of survivorship.
7.  Bankruptcy & insolvency basics — IVA, bankruptcy order, debt relief order, effect on
    investments held in trust.
8.  Wills and intestacy at IMC level: spouse exemption, statutory legacy figure (£322,000
    from 26 July 2023), per stirpes.
9.  Data Protection Act 2018 and UK GDPR: lawful basis, individual rights, data subject
    access request (DSAR), ICO role, breach notification 72-hour rule.

Finish with: exam triggers · common traps · 5 MCQs.
```

## PROMPT 1.4 — Client Advice (Suitability & ATR)

```
Produce the IMC Unit 1 chapter on Client Advice. The exam tests process and rules, not
investment views. Cover:

1.  Distinction between advice, guidance, and information. The FCA "personal
    recommendation" definition.
2.  The advice process end-to-end: engagement → KYC → ATR & capacity for loss
    assessment → suitability → recommendation → review.
3.  Customer categorisation under COBS 3: retail, professional (elective and per-se),
    eligible counterparty. Effect on protections.
4.  KYC (Know Your Client) under COBS 9: knowledge & experience, financial situation,
    investment objectives.
5.  Attitude to risk (ATR) vs capacity for loss vs need to take risk — three distinct
    concepts the IMC loves to confuse.
6.  Suitability report content under COBS 9.4.
7.  Vulnerable customers — FG21/1 four drivers of vulnerability (health, life events,
    resilience, capability). Examples.
8.  Anti-money-laundering: KYC at onboarding, simplified due diligence, enhanced due
    diligence triggers, PEPs.
9.  Best execution under COBS 11.2A.
10. Periodic review obligations (suitability every 12 months for ongoing advice).

Finish with: exam triggers · common traps · 5 MCQs.
```

## PROMPT 1.5 — UK Taxation

```
Produce the complete IMC Unit 1 chapter on UK Taxation for the 2024/25 tax year. State
every threshold explicitly. Cover:

1.  Residency and domicile — statutory residence test (UK ties, days, automatic tests).
    Remittance basis basics.
2.  Income tax bands for 2024/25 (England & NI): personal allowance £12,570 (tapered above
    £100,000), basic rate band £37,700 (20%), higher rate £37,701–£125,140 (40%),
    additional rate >£125,140 (45%). Scotland separate.
3.  Personal Savings Allowance: £1,000 basic, £500 higher, £0 additional.
4.  Dividend Allowance: £500 for 2024/25 (down from £1,000); rates 8.75% / 33.75% / 39.35%.
5.  Capital Gains Tax: annual exempt amount £3,000 (down from £6,000 in 2023/24). Rates
    10% / 20% (general); 18% / 24% on residential property.
6.  Inheritance Tax: nil-rate band £325,000, residence nil-rate band £175,000 (tapered
    above £2m estate), 40% above. 7-year rule, taper relief table.
7.  ISA family: £20,000 limit (Stocks & Shares, Cash, IFISA, LISA all share it). LISA
    £4,000 sub-limit, 25% bonus, age 18-39 to open, withdraw at 60 or for first home up
    to £450k.
8.  Pensions tax: annual allowance £60,000 (tapered for >£260,000 adjusted income, floor
    £10,000); 100% of earnings limit; carry-forward 3 years; lifetime allowance ABOLISHED
    from 6 April 2024 — replaced by Lump Sum Allowance £268,275 and Lump Sum and Death
    Benefit Allowance £1,073,100.
9.  Corporation tax: 25% main rate, 19% small-profits rate (under £50k), marginal relief
    £50k-£250k.
10. VAT: 20% standard, 5% reduced, 0% zero-rated; registration threshold £90,000 (Apr 2024).

Finish with: exam triggers · common traps · 5 MCQs.
```

## PROMPT 1.6 — Investment Distribution & Vehicles (Unit 1 scope only)

```
Produce the IMC Unit 1 chapter on Investment Distribution. Note: deep product mechanics
are Unit 2 — here cover only the distribution and regulatory framework. Cover:

1.  Distribution channels: tied agents, multi-tied, independent advisers (post-RDR),
    restricted advisers, execution-only, direct-to-consumer (D2C) platforms, robo-advice.
2.  RDR 2013 implications: adviser charging (no commission on retail investment products),
    independent vs restricted, qualification level (Level 4 minimum).
3.  Platforms: wraps, fund supermarkets, custody model, omnibus vs designated accounts.
4.  Outline of vehicle types (full mechanics in Unit 2): OEICs / ICVCs, unit trusts,
    investment trusts (closed-ended), ETFs, hedge funds, structured products, with-profits.
5.  UCITS framework and the post-Brexit UK UCITS regime.
6.  PRIIPs Regulation — KID requirement, summary risk indicator (1-7), performance
    scenarios, costs presentation.
7.  Disclosure documents an IFA must give: KFD/KID, suitability report, terms of business.
8.  Consumer Duty implications for distribution and value chains.

Finish with: exam triggers · common traps · 5 MCQs.
```

## PROMPT 1.7 — Establishing the Client Relationship

```
Produce the IMC Unit 1 chapter on Establishing the Client Relationship. Cover:

1.  Pre-contract disclosures the firm must make (terms of business, costs & charges,
    conflicts policy summary).
2.  Identification and verification (ID&V): standard documents, electronic verification,
    enhanced for PEPs, ongoing monitoring.
3.  Initial fact-find content checklist.
4.  Risk profiling tools — limitations, FCA criticism of psychometric tools alone.
5.  Treating Customers Fairly (TCF) — six outcomes (still examinable, now subsumed under
    Consumer Duty).
6.  Documenting recommendations: suitability report, why-not-the-others reasoning, the
    "explanation in a way the client can understand" duty.
7.  Ongoing service: minimum review frequency for ongoing-charge clients, sending updates,
    re-confirmation of ATR after life events.
8.  Ending the relationship: client-initiated, firm-initiated, transfer-out procedures.

Finish with: exam triggers · common traps · 5 MCQs.
```

## PROMPT 1.8 — Time Value of Money

```
Produce the IMC Unit 1 chapter on Time Value of Money. Be quantitative. Show the maths.
Cover:

1.  Simple vs compound interest. Formulas. Worked example with £10,000 over 5 years at 5%.
2.  Effective Annual Rate (EAR) vs Annual Equivalent Rate (AER) vs Annual Percentage Rate
    (APR) vs nominal. Conversion formulas. When each is used in UK rules.
3.  Future Value (FV) and Present Value (PV) — single sums and ordinary annuities.
    Provide the four core formulas (FV single, PV single, FV annuity, PV annuity).
4.  Discounting cashflows — worked NPV example with 3-year projection.
5.  Internal Rate of Return (IRR) — definition, when NPV and IRR can disagree, multiple-IRR
    problem.
6.  Real vs nominal rates — Fisher equation. Worked example: 6% nominal, 2.5% inflation →
    real rate.
7.  Time-weighted return (TWR) vs money-weighted return (MWR / IRR of cashflows) — when
    each is appropriate (TWR for manager skill, MWR for client experience).
8.  Continuous compounding — formula (FV = PV · e^(rt)) and why it appears in derivative
    pricing but rarely in IMC questions.

Finish with: exam triggers · common traps · 5 MCQs. Provide one MCQ that requires the
candidate to compute PV by hand.
```

## PROMPT 1.9 — Investment Statistics

```
Produce the IMC Unit 1 chapter on Investment Statistics. The exam tests calculation as
much as definition — show every step. Cover:

1.  Measures of central tendency: mean (arithmetic, geometric, harmonic — when to use
    each), median, mode. Geometric mean for returns explicitly.
2.  Measures of dispersion: range, mean absolute deviation, variance, standard deviation,
    coefficient of variation. Worked example.
3.  Skewness and kurtosis at IMC level — positive vs negative skew with a return
    distribution interpretation; leptokurtic vs platykurtic implications for tail risk.
4.  Probability: independent events, conditional probability, Bayes' theorem at IMC level.
5.  Normal distribution: 68/95/99.7 rule. Why returns aren't normally distributed in
    reality. Z-scores.
6.  Covariance and correlation. Formula in algebraic form. Why correlation is bounded
    [-1, +1].
7.  Linear regression: dependent vs independent variable, slope (beta), intercept (alpha),
    R-squared interpretation, residuals.
8.  Hypothesis testing concepts at IMC level: null hypothesis, t-statistic, p-value, Type I
    and Type II errors. No need to derive — just explain.
9.  Index numbers: Laspeyres, Paasche; price index, weighted index, market-cap weighting.

Provide one fully worked numerical example for each of: standard deviation of 5 returns,
correlation of two 5-return series, and a 1-factor beta estimation.

Finish with: exam triggers · common traps · 5 MCQs.
```

## PROMPT 1.10 — Bodies, Schemes & Acronyms Cheat Sheet

```
Produce a single comprehensive reference table covering every body, scheme, and acronym
that appears in IMC Unit 1. Columns:

| Acronym | Full name | What it does in one line | When it appears in the syllabus |

Include at minimum: FCA, PRA, BoE, FPC, MPC, HMRC, HMT, FOS, FSCS, OPG, ICO, JMLSG, NCA,
MLRO, SM&CR, FSMA, MAR, MLR, COBS, SYSC, DISP, PRIN, RAO, ICVC, OEIC, UCITS, PRIIPs, KID,
SUP, GENPRU, MIFIDPRU, DEPP, EG.

After the table, give a 60-second oral-exam-style recitation of the FCA's objectives, the
PRA's objective, and what UK MAR Article 8 prohibits in plain English.

Finish with: exam triggers · common traps · 5 MCQs across the regulatory landscape.
```

---

# UNIT 2 — INVESTMENT PRACTICE

Switch to a fresh chat for each. Resend Prompt 0 first.

## PROMPT 2.1 — Asset Classes Overview

```
Produce the IMC Unit 2 chapter on Asset Classes (overview). Detailed chapters follow.

For each asset class — cash & equivalents, fixed income, equities, property, commodities,
derivatives, alternatives (PE, infrastructure, hedge funds) — produce a one-row entry in
a table with columns:

| Asset class | Primary return driver | Primary risk | Typical Sharpe range | Liquidity | UK tax wrapper fit | Inflation behaviour |

Then for each, write 3 paragraphs:
- What it is (legal form / payoff structure)
- How it's priced (the dominant model used)
- How it behaves in 4 macro regimes: growth-up/inflation-up, growth-up/inflation-down,
  growth-down/inflation-up (stagflation), growth-down/inflation-down (recession).

Conclude with the correlation matrix (typical realised correlations over the last 20 years
for UK investors) between: UK equities, US equities, EM equities, gilts, USTs, corporate
IG credit, HY credit, UK property (direct), gold, broad commodities.

Finish with: exam triggers · common traps · 5 MCQs.
```

## PROMPT 2.2 — Equities

```
Produce the IMC Unit 2 chapter on Equities. Cover:

1.  Share classes: ordinary, preference (cumulative, participating, redeemable),
    A/B shares, GDRs/ADRs.
2.  Rights of ordinary shareholders: voting, dividends, residual on wind-up,
    pre-emption rights.
3.  Primary market events: IPO (book-building, allocation, greenshoe), rights issue,
    open offer, placing, vendor placing. Tax/dilution effects.
4.  Secondary market mechanics: order-driven vs quote-driven, market makers, central
    counterparty, T+2 settlement, CREST.
5.  Equity valuation:
    a) Dividend Discount Model — Gordon growth model, two-stage DDM. Worked example.
    b) Multiples — P/E (trailing vs forward), P/B, EV/EBITDA, EV/Sales, PEG, dividend
       yield. When each works.
    c) DCF / FCFE / FCFF — formulas and high-level worked example.
6.  Style: value, growth, quality, momentum, low-vol, size. How factor investing fits.
7.  Industry analysis: Porter's 5 forces at IMC level.
8.  Efficient Market Hypothesis: weak, semi-strong, strong. Tests of each form.
    Behavioural finance challenges (anchoring, herding, overconfidence, disposition).
9.  Indices: FTSE 100, FTSE 250, FTSE All-Share, S&P 500, MSCI World, MSCI EM,
    construction (free-float-adjusted market-cap weighting).

Finish with: exam triggers · common traps · 5 MCQs. One must be a numeric Gordon-growth
question.
```

## PROMPT 2.3 — Fixed Income

```
Produce the IMC Unit 2 chapter on Fixed Income. Be heavy on maths. Cover:

1.  Bond types: government (gilts, USTs, bunds, JGBs), corporate, supranational, covered,
    asset-backed, mortgage-backed, sukuk, inflation-linked (TIPS, index-linked gilts).
2.  Bond mechanics: face value, coupon, frequency, maturity, day-count conventions
    (Act/Act for gilts, 30/360 for US corp), clean vs dirty price, accrued interest.
3.  Yield measures:
    a) Current yield = coupon / clean price.
    b) Yield to maturity (YTM) — the IRR of the bond's cashflows. Conceptual + worked.
    c) Yield to call.
    d) Running yield, redemption yield (UK terminology).
4.  Bond pricing: pull-to-par effect. Why prices and yields move inversely.
5.  Duration:
    - Macaulay duration: weighted-average time to cashflows. Formula in algebra.
    - Modified duration ≈ Macaulay / (1 + YTM). Used for price sensitivity.
    - Effective duration for bonds with options.
    Show: %ΔPrice ≈ −Modified Duration × Δy. Worked example: 5-year 4% bond at par,
    yield rises 25bp.
6.  Convexity: second-order term. Why long bonds are positively convex. Embedded calls
    can create negative convexity.
7.  Yield curve theories: pure expectations, liquidity preference, market segmentation,
    preferred habitat. Curve shapes: normal, inverted, humped, flat. What an inversion
    typically predicts.
8.  Credit risk: rating scales (S&P, Moody's, Fitch — table), investment grade vs high
    yield boundary, credit spreads (G-spread, Z-spread, OAS).
9.  Inflation-linked gilts: how the principal indexes (lag 3-month, formerly 8-month), real
    yield concept, breakeven inflation.
10. Securitisation overview: tranching, waterfalls, credit enhancement. GFC-relevance.

Finish with: exam triggers · common traps · 5 MCQs. Include one duration calculation.
```

## PROMPT 2.4 — Derivatives

```
Produce the IMC Unit 2 chapter on Derivatives. The IMC tests concepts and basic pricing —
not Black-Scholes. Cover:

1.  Forwards vs futures: OTC vs exchange, margin (initial vs variation), mark-to-market.
2.  Future pricing — cost-of-carry: F = S·(1 + r − q)^t. Convenience yield for commodities.
3.  Hedging with futures: hedge ratio basics, basis risk.
4.  Options:
    - Call vs put. Long vs short. Payoff diagrams.
    - Moneyness: ITM, ATM, OTM.
    - Intrinsic value vs time value.
    - Six factors affecting option price (S, K, r, t, σ, q).
    - Put-call parity: C − P = S − K·e^(−rt). Worked example.
5.  Greeks at IMC level: delta, gamma, vega, theta, rho. One sentence each.
6.  Option strategies: covered call, protective put, long straddle, long strangle, bull
    spread, bear spread. Payoff diagrams.
7.  Swaps: interest rate (fixed-for-floating), currency, equity, credit default swap (CDS).
    How they're used.
8.  Uses of derivatives in practice: hedging, speculation, arbitrage, structured products,
    risk transfer.
9.  Counterparty risk and central clearing post-EMIR / Dodd-Frank.

Finish with: exam triggers · common traps · 5 MCQs. Include one put-call parity question.
```

## PROMPT 2.5 — Investment Theory

```
Produce the IMC Unit 2 chapter on Investment Theory. Cover:

1.  Modern Portfolio Theory (Markowitz 1952): mean, variance, covariance, efficient
    frontier, minimum-variance portfolio, two-asset case with worked numerical example.
2.  Diversification: systematic vs idiosyncratic risk; the formula for portfolio variance
    in the two-asset case; why correlation < 1 reduces risk; the "20-stock" diversification
    benefit chart.
3.  Capital Market Line (CML) — adds risk-free asset to efficient frontier. Tangency
    portfolio.
4.  Capital Asset Pricing Model (CAPM):
    E(Ri) = Rf + βi · (E(Rm) − Rf)
    Define each term. Worked example. Beta interpretation. Limitations of CAPM.
5.  Security Market Line (SML) vs CML — the distinction the exam loves.
6.  Single-factor vs multi-factor models. Arbitrage Pricing Theory (APT) at concept level.
    Fama-French 3-factor (market, size SMB, value HML) and 5-factor.
7.  Behavioural finance: heuristics, biases (anchoring, availability, overconfidence,
    herding, loss aversion, framing, mental accounting, hindsight). Prospect theory at
    concept level.
8.  Limits to arbitrage: noise trader risk, fundamental risk, implementation costs.

Finish with: exam triggers · common traps · 5 MCQs. Include one CAPM calculation.
```

## PROMPT 2.6 — Portfolio Construction

```
Produce the IMC Unit 2 chapter on Portfolio Construction. Cover:

1.  Investment Policy Statement (IPS): objectives (return, risk), constraints (liquidity,
    horizon, tax, legal/regulatory, unique). UK-specific examples.
2.  Strategic Asset Allocation (SAA) vs Tactical Asset Allocation (TAA) vs Dynamic Asset
    Allocation (DAA). Time horizons.
3.  Top-down vs bottom-up approaches. When each is appropriate.
4.  Liability-Driven Investment (LDI) for UK DB pensions — concept of cashflow matching
    vs duration matching, the LDI episode of October 2022 and the lessons.
5.  Risk budgeting: equal-risk-contribution portfolios, risk parity concept.
6.  Factor-based portfolio construction: tilts vs pure factor exposure.
7.  Rebalancing rules: calendar, threshold, drift-based. Tax cost of rebalancing in taxable
    accounts.
8.  Currency hedging: 50%-hedged benchmarks, regret minimisation, cost vs vol-reduction
    trade-off.
9.  Black-Litterman at IMC concept level — combines CAPM equilibrium with views.
10. ESG integration: exclusion, best-in-class, ESG integration, impact, thematic.
    SFDR Article 6/8/9 mapping post-Brexit (UK SDR labels: Sustainability Focus,
    Sustainability Improvers, Sustainability Impact, Sustainability Mixed Goals).

Finish with: exam triggers · common traps · 5 MCQs.
```

## PROMPT 2.7 — Portfolio Performance & Risk Measurement

```
Produce the IMC Unit 2 chapter on Portfolio Performance & Risk. Cover:

1.  Return measures:
    - Holding-period return.
    - Time-weighted return (TWR) — geometric linking; insensitive to cashflows.
    - Money-weighted return (MWR / IRR of cashflows) — sensitive to cashflows.
    - GIPS standard requires TWR for manager comparison.
    Worked example showing TWR vs MWR producing different numbers for the same portfolio.
2.  Risk-adjusted return measures:
    - Sharpe ratio = (Rp − Rf) / σp
    - Treynor ratio = (Rp − Rf) / βp
    - Jensen's alpha = Rp − [Rf + βp(Rm − Rf)]
    - Information ratio = (Rp − Rb) / Tracking Error
    - Sortino ratio
    - M² (M-squared) measure
    Worked example for each.
3.  Drawdown analysis: peak-to-trough, recovery period, max drawdown, Calmar ratio.
4.  Value at Risk (VaR): parametric, historical simulation, Monte Carlo. Conditional VaR
    (Expected Shortfall). 95% vs 99% confidence. Limitations.
5.  Tracking error: ex-ante vs ex-post. Active risk budget.
6.  Performance attribution:
    - Brinson-Hood-Beebower model: allocation + selection + interaction.
    - Worked example with two sectors.
7.  Benchmark selection: SAMURAI criteria (Specified in advance, Appropriate, Measurable,
    Unambiguous, Reflective, Accountable, Investable).
8.  GIPS at IMC concept level: composite construction, mandatory disclosures.

Finish with: exam triggers · common traps · 5 MCQs. Include a Sharpe-ratio calculation
and a Brinson attribution question.
```

## PROMPT 2.8 — Pooled Investment Vehicles

```
Produce the IMC Unit 2 chapter on Pooled Investment Vehicles. The IMC asks about UK
vehicles primarily. Cover:

1.  Unit Trusts: legal form (trust), manager + trustee structure, pricing (forward
    pricing, dual or single), creation/cancellation, FCA authorisation.
2.  OEICs (Open-Ended Investment Companies) / ICVCs: corporate form, ACD + depositary,
    single price, share classes (income vs accumulation, hedged classes).
3.  Investment Trusts: closed-ended, Stock Exchange listed, premium/discount to NAV,
    gearing allowed, AIC sectors. Worked example of premium/discount.
4.  ETFs: physical vs synthetic replication, creation/redemption via APs in-kind, tracking
    error sources, total cost of ownership, UK reporting status.
5.  Hedge funds: legal forms (LP, ICAV, Cayman SPC), prime broker, lock-up, side pocket,
    high-water mark, 2&20 fee. Strategies overview: long-short equity, global macro,
    relative value, event-driven, statistical arbitrage, managed futures.
6.  Private equity: buyout, venture, growth, fund-of-funds, secondaries. J-curve,
    drawdown, distribution waterfalls, GP/LP economics, carry.
7.  Real estate funds: REITs (UK REIT rules — 75% PID test, 90% PID distribution
    requirement), property unit trusts, property authorised investment funds.
8.  Structured products: capital-protected, capital-at-risk, autocalls, reverse
    convertibles. Counterparty risk vs the underlying.
9.  With-profits funds: smoothing, MVR, guarantees. Decline in market relevance.
10. Liquid Alternatives (e.g. UCITS hedge funds): liquidity vs leverage constraints.

Finish with: exam triggers · common traps · 5 MCQs.
```

## PROMPT 2.9 — Pensions & Long-Term Savings (Unit 2 cut)

```
Produce the IMC Unit 2 chapter on Pensions & Long-Term Savings — investment-management
angle (the regulatory angle was Unit 1). Cover:

1.  UK pension types:
    a) Defined Benefit (DB) — final salary, CARE. Sponsor risk. PPF.
    b) Defined Contribution (DC) — personal, stakeholder, group personal pension,
       master trust.
    c) Self-Invested Personal Pension (SIPP) — permitted investments, prohibited
       investments (residential property), commercial property in SIPP.
    d) Small Self-Administered Scheme (SSAS).
2.  Auto-enrolment: minimum contributions (employee 5%, employer 3%, total 8%),
    qualifying earnings band.
3.  Pension input periods, annual allowance (£60k 2024/25), tapered annual allowance
    (down to £10k floor), money purchase annual allowance (£10k after flexible access),
    carry-forward 3 years.
4.  Lifetime allowance abolition from 6 April 2024 — what replaces it: Lump Sum Allowance
    (£268,275), Lump Sum & Death Benefit Allowance (£1,073,100), Overseas Transfer
    Allowance.
5.  Access at retirement (DC): tax-free cash up to 25%, flexi-access drawdown, UFPLS,
    annuity types (level, escalating, joint life, with guarantee period, impaired/enhanced).
    Pension Freedoms 2015.
6.  Death benefits: pre-75 (tax-free), post-75 (taxed at recipient's marginal rate).
7.  DB transfer rules: must take regulated advice if CETV > £30k, FCA's starting position
    that transfer out is unsuitable, transfer-value analysis (TVAS / APTA).
8.  Pension scheme investment governance: trustee duties, Statement of Investment
    Principles (SIP), implementation statement.
9.  LDI for DB schemes: cashflow-matching vs hedge-ratio approach, leverage in pooled LDI
    funds, the September/October 2022 gilt crisis lessons.

Finish with: exam triggers · common traps · 5 MCQs.
```

## PROMPT 2.10 — Investment Selection & Practice

```
Produce the IMC Unit 2 chapter on Investment Selection & Practice. Cover:

1.  Active vs passive: arithmetic of active management (Sharpe 1991), zero-sum game
    before costs, fee drag impact compounded over 30 years (worked example: 1% active
    fee on a 4% real return).
2.  Manager selection process: investment philosophy, process, people, performance,
    operations (the 4 P's plus operations).
3.  Operational due diligence: separation of investment and operations, NAV calculation,
    valuation policy, independent administrator, audit, cyber.
4.  Performance persistence — academic consensus is weak; awareness of survivorship and
    selection bias.
5.  Smart beta / factor ETFs: rules-based exposure to value/quality/momentum/low-vol/size,
    crowding risk.
6.  ESG investing approaches (already in 2.6) — selection-level implications.
7.  Currency overlay management.
8.  Direct vs indirect property investment trade-offs.
9.  Costs analysis: ongoing charge figure (OCF), TER, total cost of ownership including
    transaction costs (PRIIPs / MiFID II RTS-28), platform fee, adviser fee.
10. Manager monitoring: minimum frequency, qualitative review triggers, watch list, hire/
    fire discipline.

Finish with: exam triggers · common traps · 5 MCQs.
```

---

# REVISION & MOCK-PAPER PROMPTS

## PROMPT R.1 — Build the IMC Formula Sheet

```
Produce a single-page formula sheet for the IMC. Two columns: Unit 1 formulas, Unit 2
formulas. Group by topic (TVM, statistics, equity, fixed income, derivatives, theory,
performance). State each formula in algebraic form with one-line definition of every
variable. No prose explanation. The candidate must be able to print this on one side of
A4 and revise the morning of the exam.
```

## PROMPT R.2 — UK Tax & Threshold Sheet (2024/25)

```
Produce a single-page reference card listing every UK numerical threshold that an IMC
exam can ask. Cover: income tax bands and personal allowance (England), Scotland income
tax, dividend allowance and rates, personal savings allowance, CGT annual exempt amount
and rates, IHT nil-rate bands and rates, ISA limits (all variants), LISA bonus and
penalty rules, pension annual allowance (and taper floor), pension lump sum allowances
(post-LTA), MPAA, JISA limit, corporation tax thresholds, VAT threshold, NIC thresholds,
FOS money-award limit, FSCS limits, statutory legacy, gilts/CGT exemption, NS&I premium
bond max. Two columns: figure, what it applies to. State the tax year.
```

## PROMPT M.1 — Unit 1 Mock Paper

```
You are setting an IMC Unit 1 mock paper, sat under exam conditions. Produce 100
single-best-answer MCQs covering Unit 1 syllabus weightings (approximate):
- Regulation & Ethics: 25
- Legal concepts: 8
- Client advice & vulnerability: 12
- Taxation (UK 2024/25): 20
- Distribution & vehicles (regulatory cut): 8
- Establishing the relationship: 5
- Time value of money: 8
- Statistics: 14

For each question:
- Stem, four options (A-D), only one correct.
- Mix factual recall, application, and short calculation (specifically TVM and statistics).
- After all 100 are presented, output an answer key with the letter only.
- Then output a worked-answer commentary section explaining the right answer and why each
  distractor is wrong — concise, exam-style.
```

## PROMPT M.2 — Unit 2 Mock Paper

```
You are setting an IMC Unit 2 mock paper. Produce 105 single-best-answer MCQs across
Unit 2 weightings (approximate):
- Asset classes overview: 8
- Equities (valuation + market): 16
- Fixed income (incl duration): 18
- Derivatives & strategies: 12
- Investment theory (MPT, CAPM, behavioural): 12
- Portfolio construction & ESG: 10
- Performance & risk (incl. Sharpe, IR, attribution): 13
- Pooled vehicles: 10
- Pensions: 6

Include at least: 3 duration / convexity calculations, 2 put-call parity questions, 2
CAPM calculations, 2 Sharpe-ratio calculations, 1 Brinson attribution, 1 Gordon-growth.

Output stems + answer key + worked answers.
```

## PROMPT M.3 — Exam-Day Diagnostic

```
You have just received my scores for the two mock papers: Unit 1 = [X]%, Unit 2 = [Y]%.
For each unit below 70%, identify:
1. The two topics where I most likely lost marks (based on common IMC weak spots).
2. Three sharper questions for each weak topic to re-test me on.
3. A 20-line revision note for each weak topic — purely the rules / formulas / numeric
   thresholds I likely got wrong.
Wait for my numbers before producing.
```

---

# OPTIONAL DEEPER PROMPTS

These aren't strictly required to pass, but help with the marginal 10-15 points.

## PROMPT D.1 — Ethics in Practice

```
Give me 15 short ethics scenarios at IMC level — 4 sentences each, ending with the
question "What should the firm do?". Then give the recommended action, the FCA rule
that backs it (with COBS/SYSC/PRIN reference), and the wrong action it's most often
confused with. Span Senior Manager conflicts, market abuse, gifts/inducements, vulnerable
client treatment, complaint handling delays, and conflicts at fund-of-funds level.
```

## PROMPT D.2 — Historical Memory

```
Produce a 1-page table of UK financial-services events from 1986 onwards that an IMC
candidate is expected to recognise, with one sentence on the regulatory consequence of
each: Big Bang 1986, Maxwell 1991, BCCI 1991, Barings 1995, FSA 2001, Equitable Life
2000s, GFC 2008, LIBOR 2012, FCA/PRA 2013, RDR 2013, MiFID II 2018, GDPR 2018, SM&CR
2019, Woodford 2019, Greensill 2021, LDI 2022, FTX 2022, Consumer Duty 2023, LTA
abolition 2024. Output as a chronological table.
```

## PROMPT D.3 — One-Day Final Revision

```
Treat this as the morning before the exam. In one continuous response, no more than
2,000 words total, give me:
- The 30 highest-frequency facts the IMC tests (numeric thresholds, rules, formulas).
- A 90-second oral recitation of CAPM, the Brinson decomposition, duration, put-call
  parity, the Gordon model, and the 12 PRIN.
- One short pep-talk paragraph on exam technique (timing, flagging, distractor
  elimination, calculation noise).
Nothing else.
```

---

# DELIVERY GUIDE

A realistic 4-week schedule:

| Week | Unit | Chapters | Total study hours |
|------|------|----------|-------------------|
| 1 | Unit 1 | 1.1 – 1.5 | ~14 hours |
| 2 | Unit 1 | 1.6 – 1.10, R.1, R.2 | ~12 hours |
| 3 | Unit 2 | 2.1 – 2.5 | ~14 hours |
| 4 | Unit 2 + mocks | 2.6 – 2.10, M.1, M.2 | ~14 hours |

Daily ritual: 1 prompt → save the output → 2 hours active reading → write your own
one-page summary from memory → take the 5 MCQs at the end of the chapter → fix gaps.

Sit M.1 and M.2 under exam conditions in week 4. If either is < 70%, run M.3 with the
specific scores and re-revise the flagged sections before booking.

Good luck.
