/* ============================================================
   CURRICULUM DATA — drives the course sidebar, dropdowns, and
   CFA Level tags across every lesson page.
   cfa: "L1" | "L2" | "L1/L2"   (level the material maps to)
   built: true  -> lesson page exists; topics[] populate the dropdown
   ============================================================ */
(function (global) {
  'use strict';

  var CURRICULUM = {

    'derivatives-pricing': {
      title: 'Derivatives Pricing', cfa: 'L2',
      blurb: 'Forwards, futures, options and swaps — priced from no-arbitrage.',
      lessons: [
        { n: '01', title: 'Forward Markets and Contracts', cfa: 'L2', built: true,
          url: '/courses/derivatives-pricing-01-forward-markets.html',
          topics: [
            { a: 'intro',    t: '1 · Introduction' },
            { a: 'market',   t: '2 · Global forward market' },
            { a: 'types',    t: '3 · Types of forwards' },
            { a: 'daycount', t: 'Day-count conventions' },
            { a: 'generic',  t: '4.1 · Generic valuation' },
            { a: 'equity',   t: '4.2 · Equity forwards' },
            { a: 'fixed',    t: '4.3 · Fixed-income forwards' },
            { a: 'fra',      t: '4.3 · Forward rate agreements' },
            { a: 'currency', t: '4.4 · Currency forwards' },
            { a: 'credit',   t: '5 · Credit risk' }
          ] },
        { n: '02', title: 'Futures Markets and Contracts', cfa: 'L2', built: true,
          url: '/courses/derivatives-pricing-02-futures-markets.html',
          topics: [
            { a: 'intro',    t: '1 · Introduction' },
            { a: 'margins',  t: '2–3 · Margins &amp; limits' },
            { a: 'delivery', t: '4 · Delivery &amp; settlement' },
            { a: 'exchanges',t: '5 · Futures exchanges' },
            { a: 'types',    t: '6 · Types of futures' },
            { a: 'generic',  t: '7.1 · Cost-of-carry' },
            { a: 'interest', t: '7.2 · Rate &amp; bond futures' },
            { a: 'index',    t: '7.3 · Stock-index futures' },
            { a: 'currency', t: '7.4 · Currency futures' },
            { a: 'role',     t: '8 · Role of futures markets' }
          ] },
        { n: '03', title: 'Option Markets and Contracts', cfa: 'L2', built: true,
          url: '/courses/derivatives-pricing-03-option-markets.html',
          topics: [
            { a: 'intro',           t: '1–2 · Definitions' },
            { a: 'markets',         t: '3–4 · Markets &amp; types' },
            { a: 'payoffs',         t: '5.1 · Payoff values' },
            { a: 'boundaries',      t: '5.2 · Boundary conditions' },
            { a: 'parity',          t: '5.5 · Put–call parity' },
            { a: 'sensitivities',   t: '5.6 · American &amp; Greeks' },
            { a: 'binomial',        t: '6 · Binomial model' },
            { a: 'bsm',             t: '7 · Black–Scholes–Merton' },
            { a: 'futures-options', t: '8 · Options on futures' }
          ] },
        { n: '04', title: 'Swap Markets and Contracts', cfa: 'L2', built: true,
          url: '/courses/derivatives-pricing-04-swap-markets.html',
          topics: [
            { a: 'intro',        t: '1 · What a swap is' },
            { a: 'types',        t: '3 · Types of swaps' },
            { a: 'equivalence',  t: '4.1 · Swap equivalences' },
            { a: 'pricing',      t: '4.2 · Pricing rate swaps' },
            { a: 'currency-val', t: '4.2.2 · Currency swaps' },
            { a: 'equity-val',   t: '4.2.3 · Equity swaps' },
            { a: 'variations',   t: '5 · Variations' },
            { a: 'swaptions',    t: '6 · Swaptions' },
            { a: 'credit',       t: '7 · Credit risk' }
          ] },
        { n: '05', title: 'Topic 5', cfa: 'L2', built: false },
        { n: '06', title: 'Topic 6', cfa: 'L2', built: false },
        { n: '08', title: 'Topic 8', cfa: 'L2', built: false },
        { n: '10', title: 'Topic 10', cfa: 'L2', built: false },
        { n: '11', title: 'Topic 11', cfa: 'L2', built: false },
        { n: '12', title: 'Topic 12', cfa: 'L2', built: false }
      ]
    },

    'advanced-financial-accounting': {
      title: 'Advanced Financial Accounting', cfa: 'L1',
      blurb: 'Financial reporting and earnings quality — the full CFA Level 1 FRA syllabus.',
      lessons: [
        { n: '01', title: 'Financial Reporting & Analysis: Balance Sheet and Income Statement', cfa: 'L1', built: false },
        { n: '02', title: 'Financial Reporting & Analysis: Cash Flow Statement', cfa: 'L1', built: false },
        { n: '03', title: 'Revenue Recognition', cfa: 'L1', built: false },
        { n: '04', title: 'Tangible Assets and Inventory', cfa: 'L1', built: false },
        { n: '05', title: 'Financial and Intangible Assets', cfa: 'L1', built: false },
        { n: '06', title: 'Liabilities and Provisions', cfa: 'L1', built: false },
        { n: '07', title: 'Deferred Tax', cfa: 'L1', built: false },
        { n: '08', title: 'Shareholders’ Capital and Employee Compensation', cfa: 'L1', built: false },
        { n: '09', title: 'Business Combinations and Investments in Associates', cfa: 'L1', built: false },
        { n: '10', title: 'Financial Reporting and Earnings Quality', cfa: 'L1', built: false },
        { n: '11', title: 'From Financial Reporting to ESG Reporting', cfa: 'L1', built: false }
      ]
    },

    'portfolio-management': {
      title: 'Portfolio Management', cfa: 'L1',
      blurb: 'Mean-variance optimisation, CAPM, factor models, and performance.',
      lessons: [
        { n: '01', title: 'Portfolio Management — Lesson 1', cfa: 'L1', built: false },
        { n: '02', title: 'Portfolio Management — Lesson 2', cfa: 'L1', built: false },
        { n: '03', title: 'Portfolio Management — Lesson 3', cfa: 'L1', built: false },
        { n: '04', title: 'Portfolio Management — Lesson 4', cfa: 'L1', built: false },
        { n: '05', title: 'Portfolio Management — Lesson 5', cfa: 'L1', built: false },
        { n: '06', title: 'Portfolio Management — Lesson 6', cfa: 'L1', built: false },
        { n: '07', title: 'Portfolio Management — Lesson 7', cfa: 'L1', built: false },
        { n: '08', title: 'Portfolio Management — Lesson 8', cfa: 'L1', built: false },
        { n: '09', title: 'Portfolio Management — Revision', cfa: 'L1', built: false }
      ]
    },

    'equity-analysis': {
      title: 'Equity Analysis', cfa: 'L1',
      blurb: 'Valuing companies — DCF, multiples, residual income and forecasting.',
      lessons: [
        { n: '01', title: 'Equity Analysis — Class 1', cfa: 'L1', built: false },
        { n: '02', title: 'Equity Analysis — Class 2', cfa: 'L1', built: false },
        { n: '03', title: 'Equity Analysis — Class 3', cfa: 'L1', built: false },
        { n: '04', title: 'Equity Analysis — Class 4', cfa: 'L1', built: false },
        { n: '05', title: 'Equity Analysis — Class 5', cfa: 'L1', built: false },
        { n: '06', title: 'Equity Analysis — Class 6', cfa: 'L1', built: false },
        { n: '07', title: 'Equity Analysis — Class 7', cfa: 'L1', built: false },
        { n: '08', title: 'Equity Analysis — Class 8', cfa: 'L1', built: false },
        { n: '09', title: 'Equity Analysis — Class 9', cfa: 'L1', built: false },
        { n: '10', title: 'Equity Analysis — Revision', cfa: 'L1', built: false }
      ]
    },

    'risk-management': {
      title: "Financial Institutions' Risk Management", cfa: 'L1',
      blurb: 'Credit, rate, market, liquidity and off-balance-sheet risk; capital & regulation.',
      lessons: [
        { n: '01', title: 'Introduction to FI Risk Management', cfa: 'L1', built: false },
        { n: '02', title: 'Credit Risk', cfa: 'L1', built: false },
        { n: '03', title: 'Interest Rate Risk', cfa: 'L1', built: false },
        { n: '04', title: 'Market Risk', cfa: 'L1', built: false },
        { n: '06', title: 'Liability and Liquidity Management', cfa: 'L1', built: false },
        { n: '07', title: 'Capital Adequacy and Regulation', cfa: 'L1', built: false },
        { n: '08', title: 'Off-Balance-Sheet Risk', cfa: 'L1', built: false },
        { n: '09', title: 'Integrated Risk Management', cfa: 'L1', built: false },
        { n: '10', title: 'Climate Risk and Technology Innovation', cfa: 'L1', built: false }
      ]
    },

    'quantitative-research-methods': {
      title: 'Quantitative Research Methods', cfa: 'L1',
      blurb: 'Inference, OLS regression, binary-choice models and model accuracy.',
      lessons: [
        { n: '01', title: 'Foundations of Quantitative Methods', cfa: 'L1', built: false },
        { n: '02', title: 'Inference and Hypothesis Testing', cfa: 'L1', built: false },
        { n: '03', title: 'OLS Regression', cfa: 'L1', built: false },
        { n: '04', title: 'OLS Regression (Part 2)', cfa: 'L1', built: false },
        { n: '05', title: 'Binary Choice Models', cfa: 'L1', built: false },
        { n: '06', title: 'Testing and Model Accuracy', cfa: 'L1', built: false },
        { n: '07', title: 'Data Collection', cfa: 'L1', built: false }
      ]
    }

  };

  global.CURRICULUM = CURRICULUM;
})(window);
