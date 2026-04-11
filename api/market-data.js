const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // 1-hour TTL

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const POLYGON_BASE = 'https://api.polygon.io/v2';

// ── Input validation helpers ─────────────────────────────────────────────────
const SYMBOL_RE = /^[A-Z0-9.\-]{1,12}$/i;
const DATE_RE   = /^\d{4}-\d{2}-\d{2}$/;

function validateSymbol(symbol) {
  return typeof symbol === 'string' && SYMBOL_RE.test(symbol);
}

function validateDate(date) {
  return typeof date === 'string' && DATE_RE.test(date);
}

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Single symbol OHLC bars ─────────────────────────────────────────────────
app.get('/api/stock-data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { from, to } = req.query;

    if (!validateSymbol(symbol)) {
      return res.status(400).json({ error: 'Invalid symbol' });
    }
    if (!validateDate(from) || !validateDate(to)) {
      return res.status(400).json({ error: 'Invalid or missing from/to date parameters (YYYY-MM-DD)' });
    }

    const safeSymbol = symbol.toUpperCase();
    const cacheKey = `${safeSymbol}-${from}-${to}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ data: cached, cached: true });

    const url = `${POLYGON_BASE}/aggs/ticker/${safeSymbol}/range/1/day/${from}/${to}`;
    const response = await axios.get(url, {
      params: { adjusted: true, sort: 'asc', limit: 500, apiKey: POLYGON_API_KEY }
    });

    if (response.data.results && Array.isArray(response.data.results)) {
      const prices = response.data.results.map(d => ({
        date: new Date(d.t).toISOString().split('T')[0],
        open: d.o,
        high: d.h,
        low: d.l,
        close: d.c,
        volume: d.v
      }));
      cache.set(cacheKey, prices);
      return res.json({ data: prices, cached: false });
    }

    res.status(404).json({ error: `No data for ${safeSymbol}` });
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Batch symbols ────────────────────────────────────────────────────────────
app.post('/api/batch-stock-data', async (req, res) => {
  try {
    const { symbols, from, to } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0 || symbols.length > 20) {
      return res.status(400).json({ error: 'symbols must be a non-empty array with at most 20 items' });
    }
    if (!validateDate(from) || !validateDate(to)) {
      return res.status(400).json({ error: 'Invalid or missing from/to date parameters (YYYY-MM-DD)' });
    }
    if (symbols.some(s => !validateSymbol(s))) {
      return res.status(400).json({ error: 'One or more symbols are invalid' });
    }

    const results = {};
    const promises = symbols.map(async rawSymbol => {
      const symbol = rawSymbol.toUpperCase();
      const cacheKey = `${symbol}-${from}-${to}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        results[symbol] = { data: cached, cached: true };
        return;
      }
      try {
        const url = `${POLYGON_BASE}/aggs/ticker/${symbol}/range/1/day/${from}/${to}`;
        const response = await axios.get(url, {
          params: { adjusted: true, sort: 'asc', limit: 500, apiKey: POLYGON_API_KEY }
        });
        if (response.data.results && Array.isArray(response.data.results)) {
          const prices = response.data.results.map(d => ({
            date: new Date(d.t).toISOString().split('T')[0],
            open: d.o, high: d.h, low: d.l, close: d.c, volume: d.v
          }));
          cache.set(cacheKey, prices);
          results[symbol] = { data: prices, cached: false };
        } else {
          results[symbol] = { error: 'No data' };
        }
      } catch (err) {
        console.error('Error fetching symbol:', err.message);
        results[symbol] = { error: 'Failed to fetch data' };
      }
    });

    await Promise.all(promises);
    res.json(results);
  } catch (error) {
    console.error('Batch error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Calculate metrics ────────────────────────────────────────────────────────
app.post('/api/calculate-metrics', (req, res) => {
  try {
    const { fundPrices, benchPrices } = req.body;

    if (!Array.isArray(fundPrices) || !Array.isArray(benchPrices) ||
        fundPrices.length < 2 || benchPrices.length < 2) {
      return res.status(400).json({ error: 'Invalid price data: need at least 2 data points' });
    }

    const MAX_POINTS = 1000;
    const minLen = Math.min(fundPrices.length, benchPrices.length, MAX_POINTS);

    // Validate all values are finite numbers
    const isValidPrices = arr => arr.slice(0, minLen).every(v => typeof v === 'number' && isFinite(v) && v > 0);
    if (!isValidPrices(fundPrices) || !isValidPrices(benchPrices)) {
      return res.status(400).json({ error: 'Price arrays must contain positive finite numbers' });
    }

    const fp = fundPrices.slice(0, minLen);
    const bp = benchPrices.slice(0, minLen);

    const fundReturn = ((fp[fp.length - 1] - fp[0]) / fp[0]) * 100;
    const benchReturn = ((bp[bp.length - 1] - bp[0]) / bp[0]) * 100;

    const fundReturns  = fp.slice(1).map((p, i) => (p - fp[i]) / fp[i]);
    const benchReturns = bp.slice(1).map((p, i) => (p - bp[i]) / bp[i]);

    const fundMean = fundReturns.reduce((a, b) => a + b, 0) / fundReturns.length;
    const fundVariance = fundReturns.reduce((a, b) => a + Math.pow(b - fundMean, 2), 0) / fundReturns.length;
    const fundVol = Math.sqrt(fundVariance) * Math.sqrt(252) * 100;

    const benchMean = benchReturns.reduce((a, b) => a + b, 0) / benchReturns.length;
    const benchVariance = benchReturns.reduce((a, b) => a + Math.pow(b - benchMean, 2), 0) / benchReturns.length;

    const riskFreeRate = 0.04;
    const annualizedRf = riskFreeRate * (fp.length / 252);
    const sharpe = fundVol > 0 ? (fundReturn / 100 - annualizedRf) / (fundVol / 100) : 0;

    const downReturns = fundReturns.filter(r => r < 0);
    const downVariance = downReturns.length > 0
      ? downReturns.reduce((a, b) => a + Math.pow(b, 2), 0) / fundReturns.length : 0;
    const downVol = Math.sqrt(downVariance) * Math.sqrt(252) * 100;
    const sortino = downVol > 0 ? (fundReturn / 100 - annualizedRf) / (downVol / 100) : 0;

    let maxDD = 0;
    let peak = fp[0];
    for (let i = 1; i < fp.length; i++) {
      if (fp[i] > peak) peak = fp[i];
      const dd = (peak - fp[i]) / peak * 100;
      if (dd > maxDD) maxDD = dd;
    }

    const covariance = fundReturns.reduce(
      (sum, r, i) => sum + (r - fundMean) * (benchReturns[i] - benchMean), 0
    ) / fundReturns.length;
    const beta = benchVariance > 0 ? covariance / benchVariance : 0;
    const alpha = fundReturn - (annualizedRf * 100 + beta * (benchReturn - annualizedRf * 100));

    res.json({ fundReturn, benchReturn, outperformance: fundReturn - benchReturn,
      fundVol, benchVol: Math.sqrt(benchVariance) * Math.sqrt(252) * 100,
      sharpe, sortino, maxDD, beta, alpha });
  } catch (error) {
    console.error('Metrics error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Cache status ─────────────────────────────────────────────────────────────
app.get('/api/cache-status', (req, res) => {
  const keys = cache.keys();
  res.json({ cachedItems: keys.length, timestamp: new Date().toISOString() });
});

module.exports = app;


// ── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Single symbol OHLC bars ─────────────────────────────────────────────────
app.get('/api/stock-data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Missing from or to query parameters' });
    }

    const cacheKey = `${symbol}-${from}-${to}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ data: cached, cached: true });

    const url = `${POLYGON_BASE}/aggs/ticker/${symbol}/range/1/day/${from}/${to}`;
    const response = await axios.get(url, {
      params: { adjusted: true, sort: 'asc', limit: 500, apiKey: POLYGON_API_KEY }
    });

    if (response.data.results && Array.isArray(response.data.results)) {
      const prices = response.data.results.map(d => ({
        date: new Date(d.t).toISOString().split('T')[0],
        open: d.o,
        high: d.h,
        low: d.l,
        close: d.c,
        volume: d.v
      }));
      cache.set(cacheKey, prices);
      return res.json({ data: prices, cached: false });
    }

    res.status(404).json({ error: `No data for ${symbol}` });
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── Batch symbols ────────────────────────────────────────────────────────────
app.post('/api/batch-stock-data', async (req, res) => {
  try {
    const { symbols, from, to } = req.body;

    if (!symbols || !Array.isArray(symbols) || !from || !to) {
      return res.status(400).json({ error: 'Missing symbols, from, or to parameters' });
    }

    const results = {};
    const promises = symbols.map(async symbol => {
      const cacheKey = `${symbol}-${from}-${to}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        results[symbol] = { data: cached, cached: true };
        return;
      }
      try {
        const url = `${POLYGON_BASE}/aggs/ticker/${symbol}/range/1/day/${from}/${to}`;
        const response = await axios.get(url, {
          params: { adjusted: true, sort: 'asc', limit: 500, apiKey: POLYGON_API_KEY }
        });
        if (response.data.results && Array.isArray(response.data.results)) {
          const prices = response.data.results.map(d => ({
            date: new Date(d.t).toISOString().split('T')[0],
            open: d.o, high: d.h, low: d.l, close: d.c, volume: d.v
          }));
          cache.set(cacheKey, prices);
          results[symbol] = { data: prices, cached: false };
        } else {
          results[symbol] = { error: 'No data' };
        }
      } catch (err) {
        console.error(`Error fetching ${symbol}:`, err.message);
        results[symbol] = { error: err.message };
      }
    });

    await Promise.all(promises);
    res.json(results);
  } catch (error) {
    console.error('Batch error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── Calculate metrics ────────────────────────────────────────────────────────
app.post('/api/calculate-metrics', (req, res) => {
  try {
    const { fundPrices, benchPrices } = req.body;

    if (!fundPrices || !benchPrices || fundPrices.length < 2 || benchPrices.length < 2) {
      return res.status(400).json({ error: 'Invalid price data: need at least 2 data points' });
    }

    const minLen = Math.min(fundPrices.length, benchPrices.length);
    const fp = fundPrices.slice(0, minLen);
    const bp = benchPrices.slice(0, minLen);

    const fundReturn = ((fp[fp.length - 1] - fp[0]) / fp[0]) * 100;
    const benchReturn = ((bp[bp.length - 1] - bp[0]) / bp[0]) * 100;

    const fundReturns = fp.slice(1).map((p, i) => (p - fp[i]) / fp[i]);
    const benchReturns = bp.slice(1).map((p, i) => (p - bp[i]) / bp[i]);

    const fundMean = fundReturns.reduce((a, b) => a + b, 0) / fundReturns.length;
    const fundVariance = fundReturns.reduce((a, b) => a + Math.pow(b - fundMean, 2), 0) / fundReturns.length;
    const fundVol = Math.sqrt(fundVariance) * Math.sqrt(252) * 100;

    const benchMean = benchReturns.reduce((a, b) => a + b, 0) / benchReturns.length;
    const benchVariance = benchReturns.reduce((a, b) => a + Math.pow(b - benchMean, 2), 0) / benchReturns.length;

    const riskFreeRate = 0.04;
    const annualizedRf = riskFreeRate * (fp.length / 252);
    const sharpe = fundVol > 0 ? (fundReturn / 100 - annualizedRf) / (fundVol / 100) : 0;

    const downReturns = fundReturns.filter(r => r < 0);
    const downVariance = downReturns.length > 0
      ? downReturns.reduce((a, b) => a + Math.pow(b, 2), 0) / fundReturns.length : 0;
    const downVol = Math.sqrt(downVariance) * Math.sqrt(252) * 100;
    const sortino = downVol > 0 ? (fundReturn / 100 - annualizedRf) / (downVol / 100) : 0;

    let maxDD = 0;
    let peak = fp[0];
    for (let i = 1; i < fp.length; i++) {
      if (fp[i] > peak) peak = fp[i];
      const dd = (peak - fp[i]) / peak * 100;
      if (dd > maxDD) maxDD = dd;
    }

    const covariance = fundReturns.reduce(
      (sum, r, i) => sum + (r - fundMean) * (benchReturns[i] - benchMean), 0
    ) / fundReturns.length;
    const beta = benchVariance > 0 ? covariance / benchVariance : 0;
    const alpha = fundReturn - (annualizedRf * 100 + beta * (benchReturn - annualizedRf * 100));

    res.json({ fundReturn, benchReturn, outperformance: fundReturn - benchReturn,
      fundVol, benchVol: Math.sqrt(benchVariance) * Math.sqrt(252) * 100,
      sharpe, sortino, maxDD, beta, alpha });
  } catch (error) {
    console.error('Metrics error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── Cache status ─────────────────────────────────────────────────────────────
app.get('/api/cache-status', (req, res) => {
  const keys = cache.keys();
  res.json({ cachedItems: keys.length, keys, timestamp: new Date().toISOString() });
});

module.exports = app;
