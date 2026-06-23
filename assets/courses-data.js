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
        { n: '05', title: 'Interest Rate Derivative Instruments', cfa: 'L2', built: true,
          url: '/courses/derivatives-pricing-05-interest-rate-instruments.html',
          topics: [
            { a: 'intro',       t: '1 · Introduction' },
            { a: 'futures',     t: '2 · IR futures' },
            { a: 'options',     t: '3 · IR options' },
            { a: 'swaps',       t: '4 · IR swaps' },
            { a: 'caps-floors', t: '5 · Caps &amp; floors' },
            { a: 'collar',      t: '5.3 · Collars' }
          ] },
        { n: '06', title: 'Credit Derivatives &amp; CDS', cfa: 'L2', built: true,
          url: '/courses/derivatives-pricing-06-credit-derivatives.html',
          topics: [
            { a: 'intro',       t: '1–2 · What a CDS is' },
            { a: 'cds-vs-bond', t: '2.1 · CDS vs bond' },
            { a: 'structured',  t: '2.4 · Structured credit' },
            { a: 'strategies',  t: '3 · Credit strategies' }
          ] },
        { n: '07', title: 'Solving the Liquidity Conundrum', cfa: 'L2', built: true,
          url: '/courses/derivatives-pricing-07-liquidity-conundrum.html',
          topics: [
            { a: 'intro',     t: '1 · Liquidity &amp; Nonbanks' },
            { a: 'conundrum', t: '2 · Solving the Conundrum' },
            { a: 'minsky',    t: '3 · The Minsky Framework' },
            { a: 'subprime',  t: '3.4 · Minsky &amp; Subprime' },
            { a: 'dalio',     t: '4 · Ray Dalio\'s Bubble Indicators' }
          ] },
        { n: '08', title: 'Valuing Bonds with Embedded Options', cfa: 'L2', built: true,
          url: '/courses/derivatives-pricing-08-embedded-options.html',
          topics: [
            { a: 'benchmarks',   t: '3 · Benchmark Rates &amp; Spreads' },
            { a: 'oas',          t: '3.5 · OAS &amp; Relative Value' },
            { a: 'binomial',     t: '5 · The Binomial Model' },
            { a: 'callable',     t: '6 · Valuing Callable Bonds' },
            { a: 'duration',     t: '6.4 · Effective Duration' },
            { a: 'putable',      t: '7 · Valuing Putable Bonds' },
            { a: 'floaters',     t: '9 · Capped Floaters' },
            { a: 'convertibles', t: '10 · Convertible Bonds' }
          ] },
        { n: '09', title: 'Mortgage-Backed Sector of the Bond Market', cfa: 'L2', built: true,
          url: '/courses/derivatives-pricing-09-mortgage-backed.html',
          topics: [
            { a: 'loans',      t: '2 · Residential mortgage loans' },
            { a: 'passthrough',t: '3 · Passthrough securities' },
            { a: 'prepay',     t: '3.4 · Measuring prepayments' },
            { a: 'avglife',    t: '3.5 · Average life &amp; risk' },
            { a: 'cmo',        t: '4 · CMOs &amp; tranches' },
            { a: 'pac',        t: '4.5 · PAC &amp; support' },
            { a: 'strips',     t: '5 · Stripped MBS' },
            { a: 'cmbs',       t: '7 · Commercial MBS' }
          ] },
        { n: '10', title: "Europe's Whole-Loan Sales Market", cfa: 'L2', built: true,
          url: '/courses/derivatives-pricing-10-european-mortgage-market.html',
          topics: [
            { a: 'background', t: '1 · Whole-loan sales market' },
            { a: 'funding',    t: 'Whole-loan vs securitisation' },
            { a: 'mirror',     t: '2 · Will Europe mirror the U.S.?' },
            { a: 'countries',  t: '3 · Prospects by country' },
            { a: 'servicing',  t: '4 · Importance of servicing' }
          ] }
      ]
    },

    'advanced-financial-accounting': {
      title: 'Advanced Financial Accounting', cfa: 'L1',
      blurb: 'Financial reporting and earnings quality — the full CFA Level 1 FRA syllabus.',
      lessons: [
        { n: '01', title: 'Financial Reporting & Analysis: Balance Sheet and Income Statement', cfa: 'L1', built: true,
          url: '/courses/advanced-financial-accounting-01-balance-sheet-income-statement.html',
          topics: [
            { a: 'ratios',        t: 'Ratios as tools' },
            { a: 'roe',           t: 'ROE &amp; DuPont' },
            { a: 'profitability', t: 'Profitability analysis' },
            { a: 'opleverage',    t: 'Operating leverage' },
            { a: 'activity',      t: 'Activity ratios' },
            { a: 'liquidity',     t: 'Liquidity ratios' },
            { a: 'solvency',      t: 'Solvency ratios' },
            { a: 'benchmarks',    t: 'Benchmarks &amp; segments' }
          ] },
        { n: '02', title: 'Financial Reporting & Analysis: Cash Flow Statement', cfa: 'L1', built: true,
          url: '/courses/advanced-financial-accounting-02-cash-flow-statement.html',
          topics: [
            { a: 'classification', t: 'CFO / CFI / CFF' },
            { a: 'methods',        t: 'Direct vs indirect' },
            { a: 'direct',         t: 'Direct-method CFO' },
            { a: 'indirect',       t: 'Indirect-method CFO' },
            { a: 'cfi-cff',        t: 'CFI &amp; CFF' },
            { a: 'analysis',       t: 'Analysis &amp; life cycle' },
            { a: 'manipulation',   t: 'CFO manipulation' },
            { a: 'fcf',            t: 'Free cash flow' }
          ] },
        { n: '03', title: 'Revenue Recognition', cfa: 'L1', built: true,
          url: '/courses/advanced-financial-accounting-03-revenue-recognition.html',
          topics: [
            { a: 'fivesteps',    t: 'The five-step model' },
            { a: 'principal',    t: 'Principal vs agent' },
            { a: 'longterm',     t: 'Long-term contracts' },
            { a: 'receivables',  t: 'Receivables &amp; bad debt' },
            { a: 'earnings-mgmt',t: 'Managing the allowance' },
            { a: 'factoring',    t: 'Factoring &amp; channel stuffing' },
            { a: 'deferred',     t: 'Deferred revenue' }
          ] },
        { n: '04', title: 'Tangible Assets and Inventory', cfa: 'L1', built: true,
          url: '/courses/advanced-financial-accounting-04-tangible-assets-inventory.html',
          topics: [
            { a: 'recognition',   t: 'Initial recognition' },
            { a: 'depreciation',  t: 'Depreciation' },
            { a: 'revaluation',   t: 'Revaluation &amp; investment property' },
            { a: 'impairment',    t: 'Impairment' },
            { a: 'derecognition', t: 'Derecognition' },
            { a: 'inv-cost',      t: 'Inventory cost' },
            { a: 'inv-methods',   t: 'FIFO / LIFO / average' },
            { a: 'inv-writedown', t: 'LIFO reserve &amp; write-downs' }
          ] },
        { n: '05', title: 'Financial and Intangible Assets', cfa: 'L1', built: true,
          url: '/courses/advanced-financial-accounting-05-financial-intangible-assets.html',
          topics: [
            { a: 'fin-assets',    t: 'Financial assets' },
            { a: 'classification',t: 'Classification &amp; measurement' },
            { a: 'fin-impact',    t: 'Income &amp; equity impact' },
            { a: 'intangibles',   t: 'Intangible assets' },
            { a: 'rd',            t: 'R&amp;D &amp; internal intangibles' },
            { a: 'expensers',     t: 'Expensers vs purchasers' },
            { a: 'goodwill',      t: 'Goodwill' },
            { a: 'gw-impairment', t: 'Goodwill impairment' }
          ] },
        { n: '06', title: 'Liabilities and Provisions', cfa: 'L1', built: true,
          url: '/courses/advanced-financial-accounting-06-liabilities-provisions.html',
          topics: [
            { a: 'bonds',            t: 'Bonds &amp; effective interest' },
            { a: 'bond-reporting',   t: 'Reporting &amp; extinguishment' },
            { a: 'leases',           t: 'Leases — IFRS 16' },
            { a: 'lessor',           t: 'Lessor &amp; the evidence' },
            { a: 'pensions',         t: 'Pensions: DB vs DC' },
            { a: 'pension-reporting',t: 'Pension reporting' },
            { a: 'provisions',       t: 'Provisions &amp; contingents' },
            { a: 'environmental',    t: 'Environmental liabilities' }
          ] },
        { n: '07', title: 'Deferred Tax', cfa: 'L1', built: true,
          url: '/courses/advanced-financial-accounting-07-deferred-tax.html',
          topics: [
            { a: 'basics',      t: 'Tax expense vs tax paid' },
            { a: 'dtl',         t: 'Deferred tax liability' },
            { a: 'dta',         t: 'Deferred tax asset' },
            { a: 'types',       t: 'Difference types' },
            { a: 'recognition', t: 'Recognition &amp; allowances' },
            { a: 'rates',       t: 'Tax-rate changes' },
            { a: 'effective',   t: 'Statutory vs effective' },
            { a: 'equity',      t: 'Deferred tax in equity' }
          ] },
        { n: '08', title: 'Shareholders’ Capital and Employee Compensation', cfa: 'L1', built: true,
          url: '/courses/advanced-financial-accounting-08-shareholders-capital-compensation.html',
          topics: [
            { a: 'equity',       t: 'Share capital &amp; equity' },
            { a: 'oci',          t: 'OCI &amp; accounting changes' },
            { a: 'dividends',    t: 'Dividends &amp; treasury shares' },
            { a: 'eps-basic',    t: 'Basic EPS' },
            { a: 'eps-diluted',  t: 'Diluted EPS' },
            { a: 'sbc',          t: 'Share-based compensation' },
            { a: 'sbc-debate',   t: 'The SBC debate' },
            { a: 'cash-settled', t: 'Cash-settled awards' }
          ] },
        { n: '09', title: 'Business Combinations and Investments in Associates', cfa: 'L1', built: true,
          url: '/courses/advanced-financial-accounting-09-business-combinations.html',
          topics: [
            { a: 'relationships',   t: 'Group relationships' },
            { a: 'control-interest',t: 'Control vs interest' },
            { a: 'consolidation',   t: 'Full consolidation' },
            { a: 'goodwill-mi',     t: 'Goodwill &amp; minorities' },
            { a: 'equity-method',   t: 'The equity method' },
            { a: 'comparison',      t: 'Method comparison' },
            { a: 'gw-asset',        t: 'Is goodwill an asset?' },
            { a: 'ma',              t: 'Does M&amp;A create value?' }
          ] },
        { n: '10', title: 'Financial Reporting and Earnings Quality', cfa: 'L1', built: true,
          url: '/courses/advanced-financial-accounting-10-earnings-quality.html',
          topics: [
            { a: 'setters',      t: 'Setters &amp; regulators' },
            { a: 'framework',    t: 'The IFRS framework' },
            { a: 'conservatism', t: 'Conservatism' },
            { a: 'quality',      t: 'Reporting vs earnings quality' },
            { a: 'choices',      t: 'Aggressive &amp; conservative' },
            { a: 'cfo',          t: 'The CFO/earnings test' },
            { a: 'nongaap',      t: 'Non-GAAP earnings' }
          ] },
        { n: '11', title: 'From Financial Reporting to ESG Reporting', cfa: 'L1', built: true,
          url: '/courses/advanced-financial-accounting-11-esg-reporting.html',
          topics: [
            { a: 'demand', t: 'Why investors want ESG' },
            { a: 'issb',   t: 'The ISSB' },
            { a: 's1',     t: 'IFRS S1' },
            { a: 's2',     t: 'IFRS S2 — climate' },
            { a: 'ghg',    t: 'Scope 1/2/3 emissions' },
            { a: 'csrd',   t: 'CSRD &amp; double materiality' }
          ] }
      ]
    },

    'portfolio-management': {
      title: 'Portfolio Management', cfa: 'L1',
      blurb: 'Mean-variance optimisation, CAPM, factor models, and performance.',
      lessons: [
        { n: '01', title: 'Portfolio Risk and Return', cfa: 'L1', built: true,
          url: '/courses/portfolio-management-01-risk-and-return.html',
          topics: [
            { a: 'mean-var',      t: 'Return, risk &amp; utility' },
            { a: 'cal',           t: 'Capital allocation line' },
            { a: 'optimal-y',     t: 'Optimal risky/riskfree split' },
            { a: 'two-risky',     t: 'Two risky assets' },
            { a: 'frontier',      t: 'The efficient frontier' },
            { a: 'optimal-risky', t: 'The optimal risky portfolio' },
            { a: 'mutual-fund',   t: 'The mutual-fund theorem' },
            { a: 'practical',     t: 'Practical issues' }
          ] },
        { n: '02', title: 'CAPM and Performance Evaluation', cfa: 'L1', built: true,
          url: '/courses/portfolio-management-02-capm-performance.html',
          topics: [
            { a: 'equilibrium',     t: 'Equilibrium &amp; market portfolio' },
            { a: 'cml',             t: 'Capital market line' },
            { a: 'capm',            t: 'The CAPM &amp; beta' },
            { a: 'sml',             t: 'Security market line' },
            { a: 'sim',             t: 'The single-index model' },
            { a: 'diversification', t: 'Diversification' },
            { a: 'measures',        t: 'Performance measures' },
            { a: 'which',           t: 'Which measure to use' }
          ] },
        { n: '03', title: 'Factor Models, APT and Factor Investing', cfa: 'L1', built: true,
          url: '/courses/portfolio-management-03-factor-models-apt.html',
          topics: [
            { a: 'factor-model', t: 'Factor models' },
            { a: 'arbitrage',    t: 'Arbitrage &amp; APT' },
            { a: 'apt',          t: 'The APT equation' },
            { a: 'capm-apt',     t: 'CAPM vs APT' },
            { a: 'fama-french',  t: 'Fama-French 3-factor' },
            { a: 'smart-beta',   t: 'Factor investing' },
            { a: 'attribution',  t: 'Style &amp; attribution' },
            { a: 'buffett',      t: 'Buffett’s alpha' }
          ] },
        { n: '04', title: 'Portfolio Risk Management', cfa: 'L1', built: true,
          url: '/courses/portfolio-management-04-risk-management.html',
          topics: [
            { a: 'types',      t: 'Types of risk' },
            { a: 'var',        t: 'Value at risk' },
            { a: 'historical', t: 'Historical simulation' },
            { a: 'parametric', t: 'Parametric method' },
            { a: 'sim-var',    t: 'VaR under a factor model' },
            { a: 'fat-tails',  t: 'Beyond normal' },
            { a: 'backtest',   t: 'Backtesting' },
            { a: 'es',         t: 'Expected shortfall &amp; control' }
          ] },
        { n: '05', title: 'Active Portfolio Management', cfa: 'L1', built: true,
          url: '/courses/portfolio-management-05-active-management.html',
          topics: [
            { a: 'active-return',   t: 'Active return &amp; weights' },
            { a: 'decomposition',   t: 'Allocation vs selection' },
            { a: 'info-ratio',      t: 'Information ratio' },
            { a: 'optimal-risk',    t: 'Optimal active risk' },
            { a: 'treynor-black',   t: 'Treynor-Black model' },
            { a: 'grinold',         t: 'Grinold’s rule' },
            { a: 'fundamental-law', t: 'The fundamental law' }
          ] },
        { n: '06', title: 'International Portfolio Management', cfa: 'L1', built: false },
        { n: '07', title: 'Applied Portfolio Management', cfa: 'L1', built: false },
        { n: '08', title: 'Electronic Markets, Trade Execution and Technology', cfa: 'L1', built: false },
        { n: '09', title: 'Revision', cfa: 'L1', built: false }
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
