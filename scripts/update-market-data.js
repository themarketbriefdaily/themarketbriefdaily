#!/usr/bin/env node
/**
 * scripts/update-market-data.js
 *
 * Daily snapshot generator for fund performance data.
 * Fetches historical daily adjusted-close prices from Yahoo Finance (free,
 * no API key required) for all fund holdings and benchmarks, computes
 * weighted fund series + KPIs for YTD and 1Y timeframes, then writes the
 * result to data/funds-snapshot.json.
 *
 * Usage:
 *   node scripts/update-market-data.js
 *
 * Requires Node 18+ (uses global fetch).
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Fund definitions ────────────────────────────────────────────────────────
const FUNDS = [
  {
    id: 'f1',
    code: 'F1',
    name: 'Active Rotation',
    allocation: [
      { symbol: 'ICLN', weight: 0.40 },
      { symbol: 'IXY',  weight: 0.30 },
      { symbol: 'SLV',  weight: 0.20 },
      { symbol: 'AG',   weight: 0.05 },
      { symbol: 'HL',   weight: 0.05 }
    ],
    bench: 'SPY'
  },
  {
    id: 'f2',
    code: 'F2',
    name: 'Market Tracker',
    allocation: [
      { symbol: 'QQQM', weight: 0.40 },
      { symbol: 'VTI',  weight: 0.40 },
      { symbol: 'VXUS', weight: 0.20 }
    ],
    bench: 'SPY'
  },
  {
    id: 'f3',
    code: 'F3',
    name: 'Value Factor',
    allocation: [
      { symbol: 'VBR', weight: 0.55 },
      { symbol: 'IJS', weight: 0.45 }
    ],
    bench: 'SPY'
  },
  {
    id: 'f4',
    code: 'F4',
    name: 'ESG Global',
    allocation: [
      { symbol: 'ESGU', weight: 0.50 },
      { symbol: 'ESGV', weight: 0.30 },
      { symbol: 'ESGE', weight: 0.20 }
    ],
    bench: 'ACWX'
  }
];

// ── Date helpers ─────────────────────────────────────────────────────────────
function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

function getDateRanges() {
  const today = new Date();
  const toDate = toDateStr(today);

  // YTD: from Jan 1 of this year
  const ytdFrom = `${today.getFullYear()}-01-01`;

  // 1Y: from exactly one year ago
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearFrom = toDateStr(oneYearAgo);

  return { toDate, ytdFrom, oneYearFrom };
}

// ── Yahoo Finance fetch ────────────────────────────────────────────────────────
// Free, no API key required. Uses the unofficial v8 chart endpoint.

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; mbd-bot/1.0)',
        'Accept': 'application/json'
      }
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpsGet(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error for ${url}: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

/**
 * Fetch adjusted daily closes from Yahoo Finance for a given symbol and date range.
 * Returns [{date: 'YYYY-MM-DD', close: number}, ...] sorted ascending.
 */
async function fetchSymbolHistory(symbol, from, to) {
  const period1 = Math.floor(new Date(from).getTime() / 1000);
  const period2 = Math.floor(new Date(to + 'T23:59:59Z').getTime() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=1d&includeAdjustedClose=true`;

  const data = await httpsGet(url);

  const result = data && data.chart && data.chart.result && data.chart.result[0];
  if (!result) return [];

  const timestamps = result.timestamp || [];
  // Prefer adjclose for total-return accuracy; fall back to close
  const adjClose = result.indicators && result.indicators.adjclose &&
                   result.indicators.adjclose[0] && result.indicators.adjclose[0].adjclose;
  const regularClose = result.indicators && result.indicators.quote &&
                       result.indicators.quote[0] && result.indicators.quote[0].close;
  const prices = adjClose || regularClose || [];

  const out = [];
  for (let i = 0; i < timestamps.length; i++) {
    const price = prices[i];
    if (typeof price !== 'number' || !isFinite(price) || price <= 0) continue;
    const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
    out.push({ date, close: price });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

// Small delay between requests to be polite to Yahoo Finance
async function fetchAllSymbols(symbols, from, to) {
  const results = {};
  const DELAY_MS = 300;

  for (const symbol of symbols) {
    try {
      console.log(`  Fetching ${symbol} (${from} → ${to})…`);
      results[symbol] = await fetchSymbolHistory(symbol, from, to);
      if (results[symbol].length === 0) {
        console.warn(`  ⚠ No data returned for ${symbol}`);
      }
    } catch (err) {
      console.warn(`  ⚠ Failed to fetch ${symbol}: ${err.message}`);
      results[symbol] = [];
    }
    await new Promise(r => setTimeout(r, DELAY_MS));
  }
  return results;
}

// ── Metrics calculation ───────────────────────────────────────────────────────
function computeMetrics(fundSeries, benchSeries) {
  const n = Math.min(fundSeries.length, benchSeries.length);
  if (n < 2) return null;

  const fp = fundSeries.slice(0, n);
  const bp = benchSeries.slice(0, n);

  const fundReturn  = ((fp[n - 1] - fp[0]) / fp[0]) * 100;
  const benchReturn = ((bp[n - 1] - bp[0]) / bp[0]) * 100;

  // Daily returns
  const fundReturns  = fp.slice(1).map((p, i) => (p - fp[i]) / fp[i]);
  const benchReturns = bp.slice(1).map((p, i) => (p - bp[i]) / bp[i]);

  const fundMean     = fundReturns.reduce((a, b) => a + b, 0) / fundReturns.length;
  const fundVariance = fundReturns.reduce((a, b) => a + Math.pow(b - fundMean, 2), 0) / fundReturns.length;
  const fundVol      = Math.sqrt(fundVariance) * Math.sqrt(252) * 100;

  const benchMean     = benchReturns.reduce((a, b) => a + b, 0) / benchReturns.length;
  const benchVariance = benchReturns.reduce((a, b) => a + Math.pow(b - benchMean, 2), 0) / benchReturns.length;

  const riskFreeRate = 0.04;
  const annualizedRf = riskFreeRate * (n / 252);
  const sharpe       = fundVol > 0 ? (fundReturn / 100 - annualizedRf) / (fundVol / 100) : 0;

  // Sortino: downside deviation
  const downReturns  = fundReturns.filter(r => r < 0);
  const downVariance = downReturns.length > 0
    ? downReturns.reduce((a, b) => a + Math.pow(b, 2), 0) / fundReturns.length : 0;
  const downVol      = Math.sqrt(downVariance) * Math.sqrt(252) * 100;
  const sortino      = downVol > 0 ? (fundReturn / 100 - annualizedRf) / (downVol / 100) : 0;

  // Max drawdown (on actual fp series)
  let maxDD = 0;
  let peak  = fp[0];
  for (let i = 1; i < fp.length; i++) {
    if (fp[i] > peak) peak = fp[i];
    const dd = (peak - fp[i]) / peak * 100;
    if (dd > maxDD) maxDD = dd;
  }

  // Jensen's alpha via beta
  const covariance = fundReturns.reduce(
    (sum, r, i) => sum + (r - fundMean) * (benchReturns[i] - benchMean), 0
  ) / fundReturns.length;
  const beta  = benchVariance > 0 ? covariance / benchVariance : 0;
  const alpha = fundReturn - (annualizedRf * 100 + beta * (benchReturn - annualizedRf * 100));

  return {
    fundReturn:      +fundReturn.toFixed(4),
    benchmarkReturn: +benchReturn.toFixed(4),
    outperformance:  +(fundReturn - benchReturn).toFixed(4),
    volatility:      +fundVol.toFixed(4),
    sharpe:          +sharpe.toFixed(4),
    sortino:         +sortino.toFixed(4),
    maxDrawdown:     +maxDD.toFixed(4),
    jensensAlpha:    +alpha.toFixed(4),
    beta:            +beta.toFixed(4)
  };
}

// ── Series builders ───────────────────────────────────────────────────────────

/**
 * Build a weighted composite price series aligned to the shortest available
 * holding, normalized to base 100 at the first shared date.
 */
function buildWeightedFundSeries(fund, priceMap) {
  // Only include holdings with actual data
  const available = fund.allocation.filter(a => priceMap[a.symbol] && priceMap[a.symbol].length > 0);
  if (available.length === 0) return null;

  // Align to the first date that ALL available holdings share
  const allDates = available.map(a => new Set(priceMap[a.symbol].map(d => d.date)));
  const sharedDates = [...allDates[0]].filter(date => allDates.every(s => s.has(date))).sort();

  if (sharedDates.length < 2) return null;

  // Re-normalize weights among available holdings (in case some are missing)
  const totalWeight = available.reduce((s, a) => s + a.weight, 0);

  // Build series
  const series = sharedDates.map(date => {
    let value = 0;
    for (const asset of available) {
      const entry = priceMap[asset.symbol].find(d => d.date === date);
      if (!entry) return null; // should not happen after date filtering
      const startEntry = priceMap[asset.symbol].find(d => d.date === sharedDates[0]);
      if (!startEntry || startEntry.close === 0) continue;
      const pct = (entry.close - startEntry.close) / startEntry.close;
      value += pct * (asset.weight / totalWeight);
    }
    return value;
  }).filter(v => v !== null);

  // Convert to base-100 values
  return series.map(pct => +(100 + pct * 100).toFixed(4));
}

/**
 * Build benchmark series from a priceMap entry, normalized to base 100.
 * If benchmark data has a date superset of fundDates, align to fundDates.
 */
function buildBenchmarkSeries(benchSymbol, priceMap, sharedDates) {
  const data = priceMap[benchSymbol];
  if (!data || data.length === 0) return null;

  const dateSet = sharedDates || data.map(d => d.date);
  const filtered = data.filter(d => dateSet.includes(d.date));
  if (filtered.length < 2) return null;

  const base = filtered[0].close;
  return filtered.map(d => +(d.close / base * 100).toFixed(4));
}

/**
 * Return sorted shared dates between fund allocation holdings and benchmark.
 */
function getSharedDates(fund, priceMap) {
  const available = fund.allocation.filter(a => priceMap[a.symbol] && priceMap[a.symbol].length > 0);
  if (available.length === 0) return [];

  const benchData = priceMap[fund.bench];
  if (!benchData || benchData.length === 0) return [];

  const allSets = [
    ...available.map(a => new Set(priceMap[a.symbol].map(d => d.date))),
    new Set(benchData.map(d => d.date))
  ];

  return [...allSets[0]].filter(date => allSets.every(s => s.has(date))).sort();
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const { toDate, ytdFrom, oneYearFrom } = getDateRanges();
  console.log(`\n📊 Market data snapshot generator (Yahoo Finance)`);
  console.log(`   YTD range  : ${ytdFrom} → ${toDate}`);
  console.log(`   1Y range   : ${oneYearFrom} → ${toDate}\n`);

  // Collect all unique symbols
  const allSymbols = [...new Set([
    ...FUNDS.flatMap(f => f.allocation.map(a => a.symbol)),
    ...FUNDS.map(f => f.bench)
  ])];

  console.log(`Symbols to fetch: ${allSymbols.join(', ')}\n`);

  // Fetch data for the wider 1Y window (YTD is a subset)
  console.log('— Fetching 1Y data —');
  const priceMap1Y = await fetchAllSymbols(allSymbols, oneYearFrom, toDate);

  // Derive YTD subset from the 1Y data (avoids duplicate API calls)
  const priceMapYTD = {};
  for (const sym of allSymbols) {
    priceMapYTD[sym] = (priceMap1Y[sym] || []).filter(d => d.date >= ytdFrom);
  }

  const snapshot = {
    generated_at: new Date().toISOString(),
    date_range: { ytd_from: ytdFrom, one_year_from: oneYearFrom, to: toDate },
    funds: {}
  };

  for (const fund of FUNDS) {
    console.log(`\nProcessing fund ${fund.code}: ${fund.name}…`);

    const fundSnapshot = { id: fund.id, code: fund.code, name: fund.name };

    for (const [tfKey, pm] of [['ytd', priceMapYTD], ['1y', priceMap1Y]]) {
      const sharedDates = getSharedDates(fund, pm);
      if (sharedDates.length < 2) {
        console.warn(`  ⚠ Not enough shared dates for ${fund.code} [${tfKey}]`);
        fundSnapshot[tfKey] = null;
        continue;
      }

      // Build series
      const fundSeries  = buildWeightedFundSeries(fund, pm);
      const benchSeries = buildBenchmarkSeries(fund.bench, pm, sharedDates);

      if (!fundSeries || !benchSeries) {
        console.warn(`  ⚠ Could not build series for ${fund.code} [${tfKey}]`);
        fundSnapshot[tfKey] = null;
        continue;
      }

      // Align lengths
      const len = Math.min(sharedDates.length, fundSeries.length, benchSeries.length);

      const kpi = computeMetrics(fundSeries.slice(0, len), benchSeries.slice(0, len));
      console.log(`  [${tfKey}] dates=${len}, fundReturn=${kpi ? kpi.fundReturn + '%' : 'N/A'}`);

      fundSnapshot[tfKey] = {
        chart: {
          labels:    sharedDates.slice(0, len),
          fund:      fundSeries.slice(0, len),
          benchmark: benchSeries.slice(0, len)
        },
        kpi
      };
    }

    // Summary values from YTD for fund card display
    if (fundSnapshot.ytd && fundSnapshot.ytd.kpi) {
      fundSnapshot.ytdReturn       = fundSnapshot.ytd.kpi.fundReturn;
      fundSnapshot.outperformance  = fundSnapshot.ytd.kpi.outperformance;
    } else {
      fundSnapshot.ytdReturn      = null;
      fundSnapshot.outperformance = null;
    }

    snapshot.funds[fund.id] = fundSnapshot;
  }

  // Write output
  const outDir  = path.join(__dirname, '..', 'data');
  const outFile = path.join(outDir, 'funds-snapshot.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');

  console.log(`\n✅ Snapshot written to data/funds-snapshot.json`);
  console.log(`   generated_at: ${snapshot.generated_at}`);
}

main().catch(err => {
  console.error('\n❌ Snapshot generation failed:', err);
  process.exit(1);
});
