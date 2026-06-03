import type { Tier } from "@/lib/tiers";

export type ProductCategory = "multi-asset" | "strategy" | "research";

export interface Stat {
  label: string;
  value: string;
  tone?: "pos" | "neg" | "default";
}

export interface Holding {
  name: string;
  meta: string;
  weight: string;
}

export interface MethodologySection {
  title: string;
  body: string;
}

export interface Product {
  slug: string;
  code: string;
  name: string;
  badge?: string;
  category: ProductCategory;
  /** Academic / model line, e.g. "Three-factor model · Fama–French (1993)". */
  model: string;
  blurb: string;
  ytd: number;
  /** Excess vs benchmark in pp — used on research cards. */
  excess?: number;
  stats: Stat[];
  benchmark: string;
  tags: string[];
  /** e.g. "10 holdings · 5 risk variants". */
  meta?: string;
  detailTier: Tier;
  illustrative?: boolean;
  methodology: {
    overview: string;
    sections: MethodologySection[];
    holdings: Holding[];
  };
}

// ── Multi-asset model portfolios ("products") ──────────────────────────────
const MULTI_ASSET: Product[] = [
  {
    slug: "classic",
    code: "MBD-CLASSIC",
    name: "Classic",
    category: "multi-asset",
    model: "Three-factor model · Fama–French (1993)",
    blurb:
      "Globally diversified equity portfolio targeting the size and value premia documented by Fama & French. Systematic tilts toward small-cap and value, paired with investment-grade fixed income for risk control. Rebalanced quarterly to factor-weight targets.",
    ytd: 12.0,
    stats: [
      { label: "YTD", value: "+12.0%", tone: "pos" },
      { label: "Sharpe", value: "0.84" },
      { label: "OCF", value: "0.22%" },
    ],
    benchmark: "MSCI World",
    tags: ["SMB · HML factor tilts", "Quarterly rebalance"],
    meta: "10 holdings · 5 risk variants",
    detailTier: "pro",
    methodology: {
      overview:
        "Classic implements the Fama–French three-factor framework — market, size (SMB) and value (HML) — as a low-cost, rules-based equity portfolio with an investment-grade bond ballast. The thesis is that the size and value premia are compensation for systematic risk and have persisted across decades and geographies; the portfolio harvests them with deliberate, transparent tilts rather than stock selection.",
      sections: [
        {
          title: "Factor construction",
          body: "Core global equity beta is tilted toward small-cap value via dedicated ETFs (VBR, IJS). Weights are set to a target factor loading rather than a fixed sleeve size, so the portfolio maintains its intended exposure as relative prices move.",
        },
        {
          title: "Risk control",
          body: "An investment-grade fixed-income allocation scales with the chosen risk variant (five profiles from conservative to aggressive), dampening drawdowns while preserving the equity factor signal.",
        },
        {
          title: "Rebalancing",
          body: "Quarterly rebalancing back to factor-weight targets captures mean reversion and prevents drift, with turnover kept low to protect the 0.22% OCF.",
        },
      ],
      holdings: [
        { name: "VBR — Small-Cap Value", meta: "Size · Value", weight: "33%" },
        { name: "IJS — Small-Cap Value 600", meta: "Size · Value", weight: "27%" },
        { name: "VTI — Total US Market", meta: "Market beta", weight: "18%" },
        { name: "VEA — Developed ex-US", meta: "Market beta", weight: "12%" },
        { name: "IG Bond ladder", meta: "Risk control", weight: "10%" },
      ],
    },
  },
  {
    slug: "classic-esg",
    code: "MBD-ESG",
    name: "Classic ESG",
    badge: "ESG",
    category: "multi-asset",
    model: "Fama–French + ESG-screened universe",
    blurb:
      "The Classic factor framework applied to an ESG-screened investable universe. Same size and value tilts, but using MSCI ESG-leader and Article 8 SFDR-aligned funds. Excludes tobacco, controversial weapons, thermal coal, and worst-decile ESG scorers.",
    ytd: 9.0,
    stats: [
      { label: "YTD", value: "+9.0%", tone: "pos" },
      { label: "Sharpe", value: "0.77" },
      { label: "OCF", value: "0.28%" },
    ],
    benchmark: "MSCI World ESG",
    tags: ["ESG-screened", "SFDR Article 8", "Low-carbon tilt", "Factor-aware"],
    meta: "ESG-screened · factor-aware",
    detailTier: "pro",
    methodology: {
      overview:
        "Classic ESG keeps the size and value tilts of the Classic model but restricts the universe to MSCI ESG-leader and SFDR Article 8 aligned funds. The aim is to retain the factor premia while applying values-based exclusions and a structural low-carbon tilt.",
      sections: [
        {
          title: "Screening",
          body: "Excludes tobacco, controversial weapons, thermal coal and worst-decile ESG scorers; favours ESG-leader and Article 8 vehicles (ESGU, ESGV, ESGE).",
        },
        {
          title: "Factor retention",
          body: "Tilts are reconstructed within the screened universe so the portfolio keeps as much of the SMB/HML exposure as the constraints allow — a measured trade-off between purity and principle.",
        },
        {
          title: "Carbon",
          body: "A persistent low-carbon tilt reduces weighted-average carbon intensity versus the parent benchmark.",
        },
      ],
      holdings: [
        { name: "ESGU — MSCI USA ESG", meta: "US · ESG leaders", weight: "50%" },
        { name: "ESGV — US ESG (value tilt)", meta: "Value · ESG", weight: "30%" },
        { name: "ESGE — EM ESG", meta: "EM · ESG", weight: "20%" },
      ],
    },
  },
  {
    slug: "tracker",
    code: "MBD-TRACK",
    name: "Tracker",
    category: "multi-asset",
    model: "Market portfolio · Sharpe CAPM (1964)",
    blurb:
      "Pure market-cap-weighted global market portfolio implementing the Sharpe CAPM result that the market portfolio is mean-variance efficient. No factor bets, no active selection — just the lowest-cost expression of the aggregate equity and bond market.",
    ytd: 10.5,
    stats: [
      { label: "YTD", value: "+10.5%", tone: "pos" },
      { label: "Sharpe", value: "0.79" },
      { label: "OCF", value: "0.15%" },
    ],
    benchmark: "60/40 benchmark",
    tags: ["Market-cap weighted", "Pure passive", "Lowest OCF"],
    meta: "Market-cap weighted · 5 risk profiles",
    detailTier: "free",
    methodology: {
      overview:
        "Tracker implements the central CAPM result — that the market portfolio is mean-variance efficient — at the lowest possible cost. It makes no factor bets and no active selection; it simply holds the aggregate market in proportion to capitalisation, with a bond sleeve sized to the chosen risk profile.",
      sections: [
        {
          title: "Construction",
          body: "Broad US (QQQM, VTI) and international (VXUS) equity beta, market-cap weighted, with a government/IG bond ballast across five risk profiles.",
        },
        {
          title: "Cost",
          body: "At a 0.15% OCF this is the cheapest expression in the range — the benchmark every other strategy is measured against.",
        },
        {
          title: "Discipline",
          body: "Systematic rebalancing only; no tactical overlay. The point is to capture the equity risk premium with minimal frictions.",
        },
      ],
      holdings: [
        { name: "VTI — Total US Market", meta: "US equity", weight: "40%" },
        { name: "QQQM — Nasdaq-100", meta: "US growth", weight: "40%" },
        { name: "VXUS — Total International", meta: "Ex-US equity", weight: "20%" },
      ],
    },
  },
  {
    slug: "rotational",
    code: "MBD-ROTATE",
    name: "Rotational",
    badge: "FLAGSHIP",
    category: "multi-asset",
    model: "Thematic rotation · proprietary · 19 holdings",
    blurb:
      'A high-conviction thematic portfolio built around the "picks & shovels" of the AI build-out — data-centre power & cooling (Vertiv, Constellation, Eaton), networking & interconnect (Arista, Marvell, Astera Labs), semis equipment, and the cybersecurity fabric — balanced with an early-stage quantum sleeve (IonQ, Rigetti, D-Wave), precious metals, clean energy, and defensive EU staples. Tilts adjust by macro regime, not by calendar.',
    ytd: 18.6,
    stats: [
      { label: "YTD", value: "+18.6%", tone: "pos" },
      { label: "Sharpe", value: "1.12" },
      { label: "OCF", value: "0.34%" },
    ],
    benchmark: "MSCI World",
    tags: [
      "AI picks & shovels",
      "Quantum computing",
      "Cybersecurity",
      "Precious metals",
      "Clean energy",
      "EU staples",
    ],
    meta: "19 holdings · 6 themes",
    detailTier: "pro",
    methodology: {
      overview:
        'The flagship: a proprietary thematic strategy allocating across six structural mega-trends, with weights adjusted by momentum, macro-regime signals and relative valuation. The core conviction is a "picks & shovels" approach to AI — owning the indispensable infrastructure the build-out depends on, whoever wins the application layer.',
      sections: [
        {
          title: "01 · AI Infrastructure — picks & shovels",
          body: "Data-centre power & cooling (Vertiv, Eaton, Constellation Energy), networking & interconnect (Arista, Marvell, Astera Labs) and semiconductor capital equipment (MKS Instruments). Monetises AI capex on day one.",
        },
        {
          title: "02 · Cybersecurity fabric",
          body: "CrowdStrike, Palo Alto Networks, Fortinet and Cloudflare — recurring, mission-critical spend that scales with every new attack surface AI creates.",
        },
        {
          title: "03 · Quantum computing",
          body: "Venture-style sleeve in IonQ, Rigetti, D-Wave and the Defiance Quantum ETF, sized ahead of error-corrected quantum advantage.",
        },
        {
          title: "04–06 · Real assets, energy transition & EU staples",
          body: "Gold and silver as monetary hedges, global clean energy (ICLN) for the decarbonisation supercycle, and a low-beta European consumer-staples anchor. Theme weights are reviewed monthly on a quantitative score (momentum, earnings revisions, macro sensitivity).",
        },
      ],
      holdings: [
        { name: "AI infrastructure basket", meta: "Vertiv, Arista, Marvell…", weight: "32%" },
        { name: "Cybersecurity fabric", meta: "CRWD, PANW, FTNT, NET", weight: "18%" },
        { name: "Quantum sleeve", meta: "IONQ, RGTI, QBTS, QTUM", weight: "12%" },
        { name: "Precious metals", meta: "Gold, SLV, AG, HL", weight: "16%" },
        { name: "Clean energy", meta: "ICLN", weight: "12%" },
        { name: "EU consumer staples", meta: "Defensive anchor", weight: "10%" },
      ],
    },
  },
  {
    slug: "quant",
    code: "MBD-QUANT",
    name: "Quant",
    badge: "QUANT",
    category: "multi-asset",
    model: "Vol-targeted risk parity · HRP (López de Prado, 2016)",
    blurb:
      "A systematic, all-weather multi-asset portfolio engineered to maximise compounded growth per unit of risk — not the highest backtest. It allocates by Hierarchical Risk Parity on a shrinkage-estimated covariance, targets constant volatility to suppress volatility drag, overlays time-series momentum for crisis alpha, and tilts toward low-beta assets. Designed to hold up out-of-sample.",
    ytd: 9.4,
    stats: [
      { label: "YTD", value: "+9.4%", tone: "pos" },
      { label: "Sharpe", value: "1.34" },
      { label: "Vol target", value: "10%" },
    ],
    benchmark: "60/40",
    tags: [
      "Risk parity (HRP)",
      "Volatility targeting",
      "Trend overlay",
      "Shrinkage covariance",
      "Low-beta tilt",
    ],
    meta: "Systematic · monthly rebalance",
    detailTier: "pro",
    methodology: {
      overview:
        "The quant mandate optimises for long-run compounded growth, which is governed not by average return but by return net of variance. Because the geometric (compounded) return is approximately the arithmetic return minus half the variance — the 'volatility drag' or variance drain — cutting portfolio volatility without sacrificing expected return mechanically improves terminal wealth. Every component below serves that objective and is chosen for out-of-sample robustness rather than in-sample fit.",
      sections: [
        {
          title: "Allocation — Hierarchical Risk Parity",
          body: "Capital is allocated by Hierarchical Risk Parity (López de Prado, 2016), which clusters assets by correlation and allocates down the tree. Unlike mean-variance optimisation it never inverts an unstable covariance matrix, so it avoids Markowitz's estimation-error problem and is markedly more stable out-of-sample. The covariance is estimated with Ledoit–Wolf shrinkage (2004) for further robustness.",
        },
        {
          title: "Volatility targeting — attacking the drag",
          body: "Gross exposure is scaled inversely to recent realised volatility to hold a constant ~10% portfolio vol (Moreira & Muir, 'Volatility-Managed Portfolios', JF 2017). De-risking when volatility spikes both raises the risk-adjusted return and directly reduces the σ²/2 drag on compounding.",
        },
        {
          title: "Trend overlay — crisis alpha",
          body: "A time-series momentum overlay (Moskowitz, Ooi & Pedersen, JFE 2012) adds positive convexity: it tends to be long going into and short coming out of sustained moves, which historically delivers 'crisis alpha' and shortens left-tail drawdowns when correlations converge to one.",
        },
        {
          title: "Tilts & sizing",
          body: "Within sleeves the book tilts toward low-beta assets (Frazzini & Pedersen, 'Betting Against Beta', 2014), whose superior risk-adjusted returns compound well under vol targeting. Disciplined monthly rebalancing of volatile, low-correlation sleeves harvests the diversification / rebalancing return (Willenbrock, 2011), and position sizing follows a fractional-Kelly rule to maximise geometric growth without over-betting.",
        },
      ],
      holdings: [
        { name: "Global equity beta", meta: "Risk-weighted, low-beta tilt", weight: "18%" },
        { name: "Long-duration Treasuries", meta: "Convexity / deflation hedge", weight: "22%" },
        { name: "TIPS / inflation-linked", meta: "Real-rate ballast", weight: "16%" },
        { name: "Gold", meta: "Monetary diversifier", weight: "14%" },
        { name: "Broad commodities", meta: "Inflation / supply", weight: "12%" },
        { name: "Managed-futures trend overlay", meta: "Crisis alpha", weight: "18%" },
      ],
    },
  },
];

// ── Single-mandate asset-class strategies ──────────────────────────────────
const STRATEGIES: Product[] = [
  {
    slug: "fixed-income",
    code: "MBD-FI",
    name: "Fixed Income",
    category: "strategy",
    model: "Duration-managed credit barbell",
    blurb:
      "Barbell allocation between long-duration Treasuries (rate-cut hedge) and short-duration credit (carry). Adds opportunistic IG / HY, TIPS, and EM USD exposure. Duration target: 5–7 years. Credit overlay rotates by spread regime.",
    ytd: 4.2,
    stats: [
      { label: "YTD", value: "+4.2%", tone: "pos" },
      { label: "Sharpe", value: "0.68" },
      { label: "Duration", value: "6.1y" },
    ],
    benchmark: "Bloomberg US Agg",
    tags: ["Treasuries", "IG / HY credit", "TIPS", "EM USD bonds"],
    meta: "Duration 5–7y · spread-regime overlay",
    detailTier: "pro",
    methodology: {
      overview:
        "A duration-managed credit barbell: long-duration Treasuries provide a rate-cut hedge at one end, short-duration credit harvests carry at the other. The credit overlay rotates between IG, HY, TIPS and EM USD depending on the spread regime, targeting a 5–7 year portfolio duration.",
      sections: [
        { title: "Barbell", body: "Long Treasuries (rate convexity) vs short credit (carry) — the shape adjusts as the curve and cuts re-price." },
        { title: "Credit overlay", body: "Opportunistic IG/HY, TIPS for breakevens, and EM USD for spread — sized by a spread-regime classifier." },
        { title: "Duration", body: "Held to a 5–7 year target so rate sensitivity is deliberate rather than incidental." },
      ],
      holdings: [
        { name: "Long Treasuries (20y+)", meta: "Rate hedge", weight: "30%" },
        { name: "Short-duration IG credit", meta: "Carry", weight: "30%" },
        { name: "TIPS 5Y", meta: "Breakevens", weight: "15%" },
        { name: "HY credit", meta: "Spread", weight: "15%" },
        { name: "EM USD bonds", meta: "Spread", weight: "10%" },
      ],
    },
  },
  {
    slug: "equities",
    code: "MBD-EQ",
    name: "Equities",
    category: "strategy",
    model: "Multi-factor · quality & momentum",
    blurb:
      "Global equity sleeve combining quality, momentum, low-volatility, and value factor ETFs in a regime-aware blend. Factor weights shift with the rate cycle and credit conditions. No single-stock selection — pure factor expression at the portfolio level.",
    ytd: 9.5,
    stats: [
      { label: "YTD", value: "+9.5%", tone: "pos" },
      { label: "Sharpe", value: "0.91" },
      { label: "Beta", value: "0.92" },
    ],
    benchmark: "MSCI World",
    tags: ["Quality", "Momentum", "Min vol", "Value"],
    meta: "Regime-aware factor blend",
    detailTier: "pro",
    methodology: {
      overview:
        "A pure factor sleeve: quality, momentum, low-volatility and value ETFs blended in proportions that shift with the rate cycle and credit conditions. There is no single-stock selection — the strategy expresses factor views at the portfolio level only.",
      sections: [
        { title: "Factor stack", body: "Quality and momentum lead in expansion; min-vol and value are added as conditions tighten." },
        { title: "Regime engine", body: "Weights respond to the rate cycle and credit spreads rather than a fixed allocation." },
        { title: "Beta", body: "Run near a 0.92 beta so factor selection, not market timing, drives the active return." },
      ],
      holdings: [
        { name: "Quality factor ETF", meta: "QUAL", weight: "30%" },
        { name: "Momentum factor ETF", meta: "MTUM", weight: "30%" },
        { name: "Min-volatility ETF", meta: "USMV", weight: "20%" },
        { name: "Value factor ETF", meta: "VLUE", weight: "20%" },
      ],
    },
  },
  {
    slug: "commodities",
    code: "MBD-CM",
    name: "Commodities",
    category: "strategy",
    model: "Diversified physical exposure",
    blurb:
      "Broad commodity sleeve: precious metals (gold, silver, platinum), energy (oil, natural gas, uranium), industrial metals (copper), and softs (agriculture, wheat). Targeted exposure to roll-yield in backwardated curves; risk-off rotation in contango regimes.",
    ytd: 11.4,
    stats: [
      { label: "YTD", value: "+11.4%", tone: "pos" },
      { label: "Sharpe", value: "0.86" },
      { label: "OCF", value: "0.41%" },
    ],
    benchmark: "Bloomberg Cmdty",
    tags: ["Precious metals", "Energy", "Base metals", "Agriculture"],
    meta: "Roll-yield aware",
    detailTier: "pro",
    methodology: {
      overview:
        "A diversified physical-commodity sleeve across precious metals, energy, industrial metals and softs. The strategy leans into roll-yield where curves are backwardated and rotates risk-off when curves move into contango.",
      sections: [
        { title: "Curve awareness", body: "Targets backwardated curves for positive roll; trims contango exposure to avoid roll drag." },
        { title: "Diversification", body: "Precious metals (gold, silver, platinum), energy (oil, gas, uranium), copper and agriculture spread the risk across distinct supply cycles." },
        { title: "Regime", body: "Precious metals carry a structural tailwind from de-dollarisation and central-bank accumulation." },
      ],
      holdings: [
        { name: "Precious metals", meta: "Gold, silver, platinum", weight: "35%" },
        { name: "Energy", meta: "Oil, nat gas, uranium", weight: "30%" },
        { name: "Industrial metals", meta: "Copper", weight: "20%" },
        { name: "Agriculture / softs", meta: "Wheat, grains", weight: "15%" },
      ],
    },
  },
  {
    slug: "options-derivatives",
    code: "MBD-OPT",
    name: "Options & Derivatives",
    badge: "VOL ARB",
    category: "strategy",
    model: "Earnings volatility crush · short premium",
    blurb:
      "Systematic short-volatility strategy harvesting the implied-volatility risk premium around single-stock earnings events. Filters for IV30/RV30 ≥ 1.25, term-structure backwardation, and adequate liquidity. Positions held through earnings, closed on IV collapse.",
    ytd: 14.2,
    stats: [
      { label: "YTD", value: "+14.2%", tone: "pos" },
      { label: "Sharpe", value: "1.38" },
      { label: "Win rate", value: "71%" },
    ],
    benchmark: "S&P 500",
    tags: ["Short straddle", "Iron condor", "Term-structure", "Yang–Zhang RV"],
    meta: "Event-driven · defined risk",
    detailTier: "pro",
    methodology: {
      overview:
        "A systematic short-volatility strategy that harvests the implied-vol risk premium around single-stock earnings. It enters defined-risk short-premium structures when implied vol is rich relative to realised, and closes them on the post-earnings IV collapse.",
      sections: [
        { title: "Signal", body: "Filters for IV30/RV30 ≥ 1.25 (Yang–Zhang realised vol), term-structure backwardation into the event, and adequate option liquidity." },
        { title: "Structures", body: "Short straddles and iron condors sized to a defined-risk budget; positions are held through the print and closed on the vol crush." },
        { title: "Risk", body: "A 71% historical win rate reflects positive expectancy from the premium, with defined-risk wings capping the tail." },
      ],
      holdings: [
        { name: "Earnings short straddles", meta: "Pre-print entry", weight: "55%" },
        { name: "Iron condors", meta: "Defined-risk", weight: "30%" },
        { name: "Cash / collateral", meta: "Margin buffer", weight: "15%" },
      ],
    },
  },
];

// ── Research / illustrative model portfolios ───────────────────────────────
const RESEARCH: Product[] = [
  {
    slug: "macro-transmission",
    code: "MBD-MACRO",
    name: "Macro Transmission",
    category: "research",
    model: "Multi-asset macro overlay",
    blurb:
      "Multi-asset macro overlay positioned around rate-curve inflections, real-yield decomposition, and dollar-liquidity regime shifts. Adds or subtracts risk based on transmission state, not consensus narrative.",
    ytd: 8.4,
    excess: 3.3,
    stats: [
      { label: "YTD", value: "+8.4%", tone: "pos" },
      { label: "vs 60/40", value: "+3.3pp", tone: "pos" },
      { label: "Max DD", value: "−4.8%", tone: "neg" },
    ],
    benchmark: "60/40",
    tags: ["Macro", "Multi-asset", "Tactical", "Rate-driven"],
    detailTier: "pro",
    illustrative: true,
    methodology: {
      overview:
        "An illustrative multi-asset overlay positioned around the dominant macro transmission channel — rate-curve inflections, real-yield decomposition and dollar-liquidity regime shifts. Risk is added or subtracted based on the transmission state, not the consensus narrative.",
      sections: [
        { title: "Signal", body: "Classifies the regime from the curve, real yields and dollar liquidity, then sets gross risk accordingly." },
        { title: "Expression", body: "Multi-asset (rates, FX, equity, commodities) so the view is expressed wherever it is cheapest." },
      ],
      holdings: [
        { name: "Rates / curve", meta: "Front-end vs long-end", weight: "—" },
        { name: "Dollar / liquidity", meta: "DXY, real yields", weight: "—" },
        { name: "Equity beta overlay", meta: "Regime-scaled", weight: "—" },
      ],
    },
  },
  {
    slug: "market-structure",
    code: "MBD-STRUCT",
    name: "Market Structure Alpha",
    category: "research",
    model: "Microstructure · short-window equity",
    blurb:
      "Captures dislocations from order-flow telemetry, dealer positioning, and zero-day option microstructure effects. A short-window equity strategy keyed off how price formation actually clears.",
    ytd: 6.2,
    excess: 1.8,
    stats: [
      { label: "YTD", value: "+6.2%", tone: "pos" },
      { label: "vs S&P 500", value: "+1.8pp", tone: "pos" },
      { label: "Max DD", value: "−5.6%", tone: "neg" },
    ],
    benchmark: "S&P 500",
    tags: ["Microstructure", "Equity", "Quant", "Short-window"],
    detailTier: "pro",
    illustrative: true,
    methodology: {
      overview:
        "An illustrative short-window equity strategy that captures dislocations from order-flow telemetry, dealer positioning and zero-day option microstructure — keyed off how price formation actually clears rather than fundamentals.",
      sections: [
        { title: "Telemetry", body: "Reads dealer gamma positioning and order-flow imbalance to anticipate where liquidity clears." },
        { title: "Horizon", body: "Short holding windows; the edge decays quickly as the dislocation resolves." },
      ],
      holdings: [
        { name: "Dealer-gamma signal", meta: "0DTE microstructure", weight: "—" },
        { name: "Order-flow imbalance", meta: "Telemetry", weight: "—" },
      ],
    },
  },
  {
    slug: "physical-supply",
    code: "MBD-SUPPLY",
    name: "Physical Supply Premia",
    category: "research",
    model: "Commodity physical-tightness premia",
    blurb:
      "Long physical-tightness premia in metals and energy via inventory, lease, and delivery-window signals. Compensates the futures curve for physical scarcity where paper and physical markets diverge.",
    ytd: 11.7,
    excess: 4.9,
    stats: [
      { label: "YTD", value: "+11.7%", tone: "pos" },
      { label: "vs BCOM", value: "+4.9pp", tone: "pos" },
      { label: "Max DD", value: "−6.4%", tone: "neg" },
    ],
    benchmark: "Bloomberg Cmdty",
    tags: ["Commodities", "Physical", "Supply cycle", "Metals & energy"],
    detailTier: "pro",
    illustrative: true,
    methodology: {
      overview:
        "An illustrative commodity strategy that goes long physical-tightness premia in metals and energy, using inventory, lease-rate and delivery-window signals where paper and physical markets diverge.",
      sections: [
        { title: "Signals", body: "Registered inventory, lease rates and delivery-window stress flag where the curve under-prices physical scarcity." },
        { title: "Expression", body: "Positions the curve to be compensated for tightness rather than taking outright price direction." },
      ],
      holdings: [
        { name: "Metals tightness", meta: "Inventory / lease", weight: "—" },
        { name: "Energy delivery stress", meta: "Curve structure", weight: "—" },
      ],
    },
  },
];

export const PRODUCTS: Product[] = [...MULTI_ASSET, ...STRATEGIES, ...RESEARCH];

export const MULTI_ASSET_PRODUCTS = MULTI_ASSET;
export const STRATEGY_PRODUCTS = STRATEGIES;
export const RESEARCH_PORTFOLIOS = RESEARCH;

export function productBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
