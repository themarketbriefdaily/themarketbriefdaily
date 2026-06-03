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
      "Our institutional quant mandate — a single, all-weather portfolio that replaces a shelf of single-asset sleeves. It spreads risk (not capital) across equities, rates, credit and commodities by Hierarchical Risk Parity, targets constant volatility to defeat the volatility tax, harvests trend, carry and the variance-risk premium, and runs a defined-risk options overlay that is short volatility for carry yet long the tail for crash convexity. Engineered to maximise compounded growth per unit of risk and to survive out-of-sample.",
    ytd: 9.4,
    stats: [
      { label: "YTD", value: "+9.4%", tone: "pos" },
      { label: "Sharpe", value: "1.42" },
      { label: "Vol target", value: "10%" },
    ],
    metrics: [
      { label: "YTD", value: "+9.4%", tone: "pos" },
      { label: "Sharpe (since incep.)", value: "1.42" },
      { label: "Sortino", value: "2.06" },
      { label: "Volatility (target)", value: "10.0%" },
      { label: "Max drawdown", value: "−7.1%", tone: "neg" },
      { label: "Corr. to 60/40", value: "0.41" },
    ],
    benchmark: "60/40 · ARP composite",
    tags: [
      "Risk parity (HRP)",
      "Volatility targeting",
      "Trend & carry",
      "Variance-risk premium",
      "Tail convexity",
      "Multi-asset",
    ],
    meta: "Equities · rates · credit · commodities · options",
    detailTier: "pro",
    methodology: {
      overview:
        "The quant mandate is built the way an institutional multi-strategy desk would build it: optimise for long-run compounded growth, which is governed not by average return but by return net of variance. The geometric return an investor actually earns is approximately the arithmetic mean minus half the variance — the 'volatility tax' or variance drain — so a strategy that cuts volatility and truncates the left tail without sacrificing expected return mechanically compounds faster. It deliberately replaces a row of single-asset sleeves: the equity, rates, credit and commodity exposures all live here, sized by risk and combined with systematic risk premia and a convex options overlay. Every block is chosen for out-of-sample robustness, not in-sample fit.",
      sections: [
        {
          title: "01 · Objective — geometric growth & the volatility tax",
          body: "We maximise the geometric growth rate g ≈ μ − σ²/2. Two assets with the same average return but different volatility compound to very different wealth; the higher-vol one is taxed by the variance term, and a single deep drawdown is mathematically the hardest thing to recover from. Everything downstream — diversification, vol targeting, tail hedging — is in service of lifting μ while shrinking σ² and the left tail.",
        },
        {
          title: "02 · Risk allocation — diversification done properly",
          body: "Capital is allocated by risk contribution, not dollars, across equities, government bonds, credit, commodities and gold (Qian, 'Risk Parity', 2005; Maillard–Roncalli–Teïletche equal-risk-contribution, 2010). Weights are solved with Hierarchical Risk Parity (López de Prado, 2016), which clusters assets and allocates down the tree — it never inverts an unstable covariance matrix, sidestepping Markowitz's estimation-error problem and proving far more stable out-of-sample. The covariance feeding it uses Ledoit–Wolf shrinkage (2004).",
        },
        {
          title: "03 · Volatility targeting — attacking the drag",
          body: "Gross exposure scales inversely to recent realised volatility to hold a constant ~10% portfolio vol (Moreira & Muir, 'Volatility-Managed Portfolios', JF 2017). Cutting risk precisely when volatility spikes both improves the realised Sharpe and directly reduces the σ²/2 drag — the single cheapest lever on compounded return.",
        },
        {
          title: "04 · Alternative risk premia — trend, carry, defensive",
          body: "Three diversifying, academically-durable premia sit on top of the risk-parity core: time-series momentum / trend (Moskowitz, Ooi & Pedersen, JFE 2012; Hurst, Ooi & Pedersen, 'A Century of Evidence on Trend-Following', 2017) for crisis alpha and convexity; cross-asset carry (Koijen, Moskowitz, Pedersen & Vrugt, 'Carry', JFE 2018); and a defensive equity tilt — quality and low-beta (Asness, Frazzini & Pedersen, 'Quality Minus Junk', 2019; Frazzini & Pedersen, 'Betting Against Beta', 2014).",
        },
        {
          title: "05 · Options overlay — selling the variance-risk premium, owning the tail",
          body: "Index implied volatility has, on average, exceeded subsequent realised volatility — a persistent variance-risk premium (Carr & Wu, 'Variance Risk Premiums', RFS 2009; Bakshi & Kapadia, 2003). We harvest it through small, defined-risk index option writing, then barbell it with a standing allocation to out-of-the-money puts funded by that carry, so the book is net short volatility for yield yet long convexity into a crash. The aim is an asymmetric payoff that truncates the left tail rather than naïve, ungated premium selling (Israelov, 'Pathetic Protection', 2019, on hedging-cost discipline).",
        },
        {
          title: "06 · Rebalancing premium & position sizing",
          body: "Systematic monthly rebalancing of volatile, low-correlation sleeves harvests a structural diversification / rebalancing return that partially offsets the variance drain (Willenbrock, 2011). Position sizing follows a fractional-Kelly rule (Kelly, 1956; Thorp) — large enough to compound, small enough to make ruin and over-betting effectively impossible.",
        },
      ],
      holdings: [
        { name: "Global equities", meta: "Quality & low-beta tilt", weight: "20%" },
        { name: "Government bonds / rates", meta: "Duration, risk-weighted", weight: "22%" },
        { name: "Credit (IG / HY)", meta: "Spread carry", weight: "12%" },
        { name: "Commodities & gold", meta: "Inflation / supply premia", weight: "16%" },
        { name: "Trend & carry overlay", meta: "Managed futures, crisis alpha", weight: "18%" },
        { name: "Options overlay", meta: "Short VRP + long tail", weight: "12%" },
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
