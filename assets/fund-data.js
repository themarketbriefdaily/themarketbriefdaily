/**
 * The Market Brief Daily — Shared Fund Data
 * Single source of truth for fund metadata used by both index.html and funds.html.
 *
 * Performance figures (r1y, benchR) are static fallbacks shown on the home page
 * flip cards. The funds page fetches live data from funds-snapshot.json and uses
 * these values only as a fallback.
 */
const FUND_DATA = [
  {
    id:    'f1',
    code:  'F1',
    name:  'Active Rotation',
    stage: 'Clean energy & commodities rotation',
    desc:  'Strategic allocation across clean energy transition, consumer staples, and precious metals (AG, HL) for macro regime flexibility and inflation protection.',
    allocation: [
      { symbol: 'ICLN', weight: 0.40 },
      { symbol: 'IXY',  weight: 0.30 },
      { symbol: 'SLV',  weight: 0.20 },
      { symbol: 'AG',   weight: 0.05 },
      { symbol: 'HL',   weight: 0.05 }
    ],
    allocationDisplay: ['ICLN (40%)', 'IXY (30%)', 'SLV (20%)', 'AG (5%)', 'HL (5%)'],
    bench:  'SPY',
    r1y:    18.32,
    benchR: 24.56,
    color:  '#60a5fa',
    img:    'https://raw.githubusercontent.com/themarketbriefdaily/themarketbriefdaily/main/assets/images/investments/fund1-bg.webp',
    thesis: [
      'Clean energy ETF captures ESG and inflation-responsive sectors.',
      'Consumer staples provide defensive positioning during volatility.',
      'Precious metals (SLV, AG, HL) hedge inflation and geopolitical risk.',
      'Mining stocks (AG, HL) offer high leverage to commodity cycles.'
    ]
  },
  {
    id:    'f2',
    code:  'F2',
    name:  'Market Tracker',
    stage: 'Diversified core allocation',
    desc:  '40% QQQM (Nasdaq-100), 40% VTI (Total Market), 20% VXUS (International) with systematic rebalancing discipline.',
    allocation: [
      { symbol: 'QQQM', weight: 0.40 },
      { symbol: 'VTI',  weight: 0.40 },
      { symbol: 'VXUS', weight: 0.20 }
    ],
    allocationDisplay: ['QQQM (40%)', 'VTI (40%)', 'VXUS (20%)'],
    bench:  'SPY',
    r1y:    24.56,
    benchR: 24.56,
    color:  '#a78bfa',
    img:    'https://raw.githubusercontent.com/themarketbriefdaily/themarketbriefdaily/main/assets/images/investments/fund2-bg.webp',
    thesis: [
      'Balanced exposure across growth, broad market, and international.',
      'Nasdaq tilt captures mega-cap technology leadership.',
      'International diversification reduces US concentration risk.',
      'Systematic rebalancing captures momentum and mean reversion.'
    ]
  },
  {
    id:    'f3',
    code:  'F3',
    name:  'Value Factor',
    stage: 'Small-cap value tilt',
    desc:  'Small-cap and mid-cap value exposure with cyclical mean reversion and Fama-French factor premia implementation.',
    allocation: [
      { symbol: 'VBR', weight: 0.55 },
      { symbol: 'IJS', weight: 0.45 }
    ],
    allocationDisplay: ['VBR (55%)', 'IJS (45%)'],
    bench:  'SPY',
    r1y:    31.45,
    benchR: 24.56,
    color:  '#f472b6',
    img:    'https://raw.githubusercontent.com/themarketbriefdaily/themarketbriefdaily/main/assets/images/investments/fund3-bg.webp',
    thesis: [
      'Small/value premium exhibits persistent return generation.',
      'Cyclical rebounds create significant asymmetric upside opportunities.',
      'Diversifies large-cap growth concentration risk.',
      'Mean reversion triggers during market dislocations.'
    ]
  },
  {
    id:    'f4',
    code:  'F4',
    name:  'ESG Global',
    stage: 'Sustainability-screened global',
    desc:  'Sustainability-screened multi-region sleeve across US, developed, and emerging market exposures with governance bias.',
    allocation: [
      { symbol: 'ESGU', weight: 0.50 },
      { symbol: 'ESGV', weight: 0.30 },
      { symbol: 'ESGE', weight: 0.20 }
    ],
    allocationDisplay: ['ESGU (50%)', 'ESGV (30%)', 'ESGE (20%)'],
    bench:  'ACWX',
    r1y:    20.87,
    benchR: 19.45,
    color:  '#34d399',
    img:    'https://raw.githubusercontent.com/themarketbriefdaily/themarketbriefdaily/main/assets/images/investments/fund4-bg.webp',
    thesis: [
      'Quality and governance bias through ESG filters.',
      'Secular transition themes with integrated risk discipline.',
      'Balanced developed and emerging market opportunity sets.',
      'Reduced tail risk from environmental and social factors.'
    ]
  }
];
