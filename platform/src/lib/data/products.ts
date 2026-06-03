import type { Tier } from "@/lib/tiers";

export type ProductCategory = "multi-asset" | "research";

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
  /** Hero image (in /public/images). */
  image: string;
  ytd: number;
  /** Excess vs benchmark in pp — used on research cards. */
  excess?: number;
  stats: Stat[];
  /** Optional richer metric set for the detail page (falls back to stats). */
  metrics?: Stat[];
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
    slug: "quant",
    code: "MBD-QUANT",
    name: "Quant",
    badge: "FLAGSHIP QUANT",
    category: "multi-asset",
    model: "Systematic multi-asset risk premia & convexity",
    image: "/images/trading-desk.jpg",
    blurb:
      "Our flagship systematic mandate — an institutional, multi-strategy book engineered to compound ahead of the market on a risk-adjusted basis. It stacks diversified, academically-replicated return premia (value, momentum, quality, carry and trend) and a machine-learning signal blend on top of a Hierarchical-Risk-Parity core, targets constant volatility to defeat the volatility tax, and runs a convex options overlay — short the variance-risk premium for carry, long the tail for crash protection. Every edge is small, diversified, net-of-cost and stress-tested against overfitting.",
    ytd: 9.4,
    stats: [
      { label: "YTD", value: "+9.4%", tone: "pos" },
      { label: "Sharpe", value: "1.42" },
      { label: "Vol target", value: "10%" },
    ],
    metrics: [
      { label: "YTD", value: "+9.4%", tone: "pos" },
      { label: "Sharpe (since incep.)", value: "1.42" },
      { label: "Ann. alpha vs 60/40 (gross)", value: "+3.6%", tone: "pos" },
      { label: "Sortino", value: "2.06" },
      { label: "Volatility (target)", value: "10.0%" },
      { label: "Max drawdown", value: "−7.1%", tone: "neg" },
      { label: "Corr. to 60/40", value: "0.41" },
      { label: "Deflated Sharpe (p)", value: "0.98" },
    ],
    benchmark: "60/40 · ARP composite",
    tags: [
      "Multi-factor",
      "Trend & carry",
      "Variance-risk premium",
      "Machine learning",
      "Risk parity (HRP)",
      "Tail convexity",
    ],
    meta: "Equities · rates · credit · commodities · options",
    detailTier: "pro",
    methodology: {
      overview:
        "This is the strategy a quant desk at a multi-strategy fund would actually run, written out in full. The objective is not the highest average return — it is the highest *compounded* return per unit of risk, net of trading costs, with the left tail deliberately truncated. Outperformance is engineered from four sources working together: (1) a basket of diversified, independently-replicated return premia rather than one fragile bet; (2) a machine-learning layer that blends those signals non-linearly; (3) a risk-allocation and volatility-targeting engine that defeats the 'volatility tax' on compounding; and (4) a convex options overlay that protects the portfolio precisely when correlations go to one. Critically, the real edge is discipline: every signal is validated with purged cross-validation, deflated for the number of trials, and modelled net of costs and capacity. Edges in markets are small and decay — stacking many small, low-correlation, cost-survivable edges is what gives a credible path to beating the benchmark, not a single 'genius' signal. (Illustrative and educational; documented historical premia, not a promise of future returns.)",
      sections: [
        {
          title: "01 · The objective — compounding, not averages",
          body: "Long-run wealth is driven by the geometric growth rate, g ≈ μ − σ²/2. Two books with the same average return but different volatility compound to very different terminal wealth, and a single deep drawdown is mathematically the hardest thing to recover from (a −50% loss needs +100% to break even). So the mandate is engineered to lift expected return μ while aggressively shrinking variance σ² and the left tail. Sizing follows a fractional-Kelly rule (Kelly 1956; Thorp; MacLean–Thorp–Ziemba 2011) — large enough to compound, fractional enough that ruin is effectively impossible.",
        },
        {
          title: "02 · Return engine — diversified, replicated factor premia",
          body: "The core long/short return engines are the factor premia that have survived out-of-sample and multiple-testing scrutiny: value and cross-sectional momentum (Asness, Moskowitz & Pedersen, 'Value and Momentum Everywhere', JF 2013), profitability/quality (Novy-Marx 2013; Asness–Frazzini–Pedersen 'Quality Minus Junk' 2019), and low-beta (Frazzini & Pedersen, 'Betting Against Beta', 2014), framed within the Fama–French five-factor (2015) and Hou–Xue–Zhang q-factor (2015) models. We deliberately exclude the 'factor zoo' anomalies that fail Harvey–Liu–Zhu (2016) multiple-testing thresholds or that don't survive trading costs (Frazzini, Israel & Moskowitz 2018). Value and momentum are negatively correlated, so combining them raises the Sharpe of the sleeve more than either alone.",
        },
        {
          title: "03 · Trend & carry — the diversifiers that pay in crises",
          body: "Two cross-asset premia that are largely uncorrelated with the equity factors sit alongside them. Time-series momentum / managed-futures trend (Moskowitz, Ooi & Pedersen, JFE 2012; Hurst, Ooi & Pedersen, 'A Century of Evidence on Trend-Following', 2017) is long going into sustained moves and short coming out — it historically delivers positive 'crisis alpha' and convexity exactly when a 60/40 is bleeding. Carry across bonds, FX, commodities and equities (Koijen, Moskowitz, Pedersen & Vrugt, 'Carry', JFE 2018) harvests the premium for holding higher-yielding assets, hedged for its own crash risk.",
        },
        {
          title: "04 · Machine-learning signal blend",
          body: "The individual signals are combined by a regularised machine-learning layer rather than fixed weights. Gu, Kelly & Xiu ('Empirical Asset Pricing via Machine Learning', RFS 2020) show that gradient-boosted trees and shallow neural nets materially improve out-of-sample return prediction by capturing non-linearities and interactions that linear factor models miss. We use them only as an ensemble *blender* of economically-motivated features — never as a black box mining raw prices — with heavy regularisation to keep the model from overfitting the noise.",
        },
        {
          title: "05 · Risk allocation — diversification done properly (HRP)",
          body: "Capital is allocated by risk contribution, not dollars, across equities, rates, credit, commodities and gold (Qian 'Risk Parity' 2005; Maillard–Roncalli–Teïletche equal-risk-contribution 2010). Weights are solved with Hierarchical Risk Parity and Nested Clustered Optimisation (López de Prado 2016, 2019), which cluster assets by correlation and allocate down the tree — they never invert an unstable covariance matrix, so they sidestep the estimation-error blow-ups of classic Markowitz mean-variance and are far more stable out-of-sample. The covariance estimate uses Ledoit–Wolf shrinkage (2004).",
        },
        {
          title: "06 · Volatility targeting — defeating the volatility tax",
          body: "Gross exposure is scaled inversely to recent realised volatility to hold a roughly constant ~10% portfolio vol (Moreira & Muir, 'Volatility-Managed Portfolios', JF 2017). Because volatility is persistent and spikes coincide with poor returns, de-risking into turbulence both raises the realised Sharpe ratio and directly cuts the σ²/2 drag — the single cheapest lever on compounded return.",
        },
        {
          title: "07 · The rebalancing / diversification return",
          body: "Systematically rebalancing volatile, low-correlation sleeves back to target harvests a structural 'diversification return' (Willenbrock 2011; Fernholz stochastic portfolio theory; the 'Shannon's Demon' effect) — a positive contribution to compounded growth that comes purely from the discipline of selling what rose and buying what fell, partially offsetting the variance drain for free.",
        },
        {
          title: "08 · Options overlay — sell the variance-risk premium, own the tail",
          body: "Index implied volatility has, on average, exceeded subsequent realised volatility — a persistent variance-risk premium (Carr & Wu, 'Variance Risk Premiums', RFS 2009; Bakshi & Kapadia 2003). We harvest it with small, defined-risk index option writing, then barbell that carry against a standing allocation to out-of-the-money puts and long-volatility/commodity-trend convexity (in the spirit of Cole's 'Hawk and Serpent' all-regime work, 2020). Net: short vol for yield, long the tail for crashes — an asymmetric payoff that truncates the left tail rather than naïve ungated premium selling (Israelov, 'Pathetic Protection', 2019, on getting the cost of hedging right).",
        },
        {
          title: "09 · Why the edge should persist — anti-overfitting discipline",
          body: "Most published 'market-beating' strategies are statistical mirages. Our defence is the part that actually matters: signals are validated with purged and combinatorial cross-validation to prevent look-ahead leakage, and every candidate strategy's Sharpe is adjusted by the Deflated Sharpe Ratio for the number of trials run (Bailey & López de Prado 2014; 'Advances in Financial Machine Learning' 2018). Returns are simulated net of realistic transaction costs, market impact and capacity (Frazzini, Israel & Moskowitz 2018). A thin, fragile backtest is rejected even if its in-sample numbers look spectacular.",
        },
        {
          title: "10 · How it is meant to beat the benchmark",
          body: "Put together: many small, independently-documented, low-correlation edges (factors, trend, carry, VRP) are blended by ML, allocated by risk so no single bet dominates, scaled to constant volatility to protect compounding, and wrapped in convexity so crashes don't reset the geometric return. The aim is a materially higher Sharpe and a shallower max drawdown than a 60/40 — which, compounded over time and net of costs, is what 'beating the market' actually means. No strategy can guarantee it; this one is built to give the most robust, evidence-based shot at it.",
        },
      ],
      holdings: [
        { name: "Multi-factor equity L/S", meta: "Value · momentum · quality · low-beta", weight: "22%" },
        { name: "Government bonds / rates", meta: "Risk-weighted duration", weight: "20%" },
        { name: "Credit (IG / HY)", meta: "Spread carry", weight: "10%" },
        { name: "Commodities & gold", meta: "Inflation / supply premia", weight: "14%" },
        { name: "Trend & carry overlay", meta: "Managed futures · crisis alpha", weight: "20%" },
        { name: "Options overlay", meta: "Short VRP + long-tail convexity", weight: "14%" },
      ],
    },
  },
  {
    slug: "rotational",
    code: "MBD-ROTATE",
    name: "Rotational",
    badge: "THEMATIC",
    category: "multi-asset",
    model: "Thematic rotation · proprietary · 19 holdings",
    image: "/images/trading-screens.jpg",
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
        'A proprietary thematic strategy allocating across six structural mega-trends, with weights adjusted by momentum, macro-regime signals and relative valuation. The core conviction is a "picks & shovels" approach to AI — owning the indispensable infrastructure the build-out depends on, whoever wins the application layer.',
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
    slug: "classic",
    code: "MBD-CLASSIC",
    name: "Classic",
    category: "multi-asset",
    model: "Three-factor model · Fama–French (1993)",
    image: "/images/glass-tower.jpg",
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
    image: "/images/wind-turbines.jpg",
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
    image: "/images/global-clusters.jpg",
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
];

// ── Research / illustrative model portfolios ───────────────────────────────
const RESEARCH: Product[] = [
  {
    slug: "macro-transmission",
    code: "MBD-MACRO",
    name: "Macro Transmission",
    category: "research",
    model: "Multi-asset macro overlay",
    image: "/images/fund-macro.jpg",
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
    image: "/images/fund-struct.jpg",
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
    image: "/images/fund-supply.jpg",
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

export const PRODUCTS: Product[] = [...MULTI_ASSET, ...RESEARCH];

export const MULTI_ASSET_PRODUCTS = MULTI_ASSET;
export const RESEARCH_PORTFOLIOS = RESEARCH;

export function productBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
