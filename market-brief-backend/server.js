const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// Middleware
app.use(cors());
app.use(express.json());

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const POLYGON_API = 'https://api.polygon.io/v1';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get stock data
app.get('/api/stock-data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { from, to } = req.query;

    // Check cache first
    const cacheKey = `${symbol}-${from}-${to}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({ data: cachedData, cached: true });
    }

    // Fetch from Polygon.io
    const url = `${POLYGON_API}/open-close/${symbol}/${from}/${to}?adjusted=true&apiKey=${POLYGON_API_KEY}`;
    const response = await axios.get(url);

    if (response.data.results && Array.isArray(response.data.results)) {
      const prices = response.data.results.map(d => ({
        date: d.t,
        open: d.o,
        high: d.h,
        low: d.l,
        close: d.c,
        volume: d.v
      }));

      // Cache the result
      cache.set(cacheKey, prices);

      res.json({ data: prices, cached: false });
    } else {
      res.status(404).json({ error: `No data for ${symbol}` });
    }
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Batch get multiple stocks
app.post('/api/batch-stock-data', async (req, res) => {
  try {
    const { symbols, from, to } = req.body;

    if (!symbols || !Array.isArray(symbols) || !from || !to) {
      return res.status(400).json({ error: 'Missing symbols, from, or to parameters' });
    }

    const results = {};
    const promises = [];

    for (const symbol of symbols) {
      const cacheKey = `${symbol}-${from}-${to}`;
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        results[symbol] = { data: cachedData, cached: true };
      } else {
        promises.push(
          axios.get(`${POLYGON_API}/open-close/${symbol}/${from}/${to}?adjusted=true&apiKey=${POLYGON_API_KEY}`)
            .then(response => {
              if (response.data.results) {
                const prices = response.data.results.map(d => ({
                  date: d.t,
                  open: d.o,
                  high: d.h,
                  low: d.l,
                  close: d.c,
                  volume: d.v
                }));
                cache.set(cacheKey, prices);
                results[symbol] = { data: prices, cached: false };
              }
            })
            .catch(error => {
              console.error(`Error fetching ${symbol}:`, error.message);
              results[symbol] = { error: error.message };
            })
        );
      }
    }

    await Promise.all(promises);
    res.json(results);
  } catch (error) {
    console.error('Error in batch request:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Calculate fund metrics
app.post('/api/calculate-metrics', (req, res) => {
  try {
    const { fundPrices, benchPrices } = req.body;

    if (!fundPrices || !benchPrices || fundPrices.length < 2 || benchPrices.length < 2) {
      return res.status(400).json({ error: 'Invalid price data' });
    }

    const fundReturn = ((fundPrices[fundPrices.length - 1] - fundPrices[0]) / fundPrices[0]) * 100;
    const benchReturn = ((benchPrices[benchPrices.length - 1] - benchPrices[0]) / benchPrices[0]) * 100;

    // Daily returns
    const fundReturns = [];
    for (let i = 1; i < fundPrices.length; i++) {
      fundReturns.push((fundPrices[i] - fundPrices[i - 1]) / fundPrices[i - 1]);
    }

    const benchReturns = [];
    for (let i = 1; i < benchPrices.length; i++) {
      benchReturns.push((benchPrices[i] - benchPrices[i - 1]) / benchPrices[i - 1]);
    }

    // Volatility
    const fundMean = fundReturns.reduce((a, b) => a + b) / fundReturns.length;
    const fundVariance = fundReturns.reduce((a, b) => a + Math.pow(b - fundMean, 2), 0) / fundReturns.length;
    const fundVol = Math.sqrt(fundVariance) * Math.sqrt(252) * 100;

    const benchMean = benchReturns.reduce((a, b) => a + b) / benchReturns.length;
    const benchVariance = benchReturns.reduce((a, b) => a + Math.pow(b - benchMean, 2), 0) / benchReturns.length;
    const benchVol = Math.sqrt(benchVariance) * Math.sqrt(252) * 100;

    // Sharpe Ratio
    const riskFreeRate = 0.04;
    const annualizedRiskFree = riskFreeRate * (fundPrices.length / 252);
    const sharpe = (fundReturn - annualizedRiskFree) / fundVol;

    // Sortino Ratio
    const downReturns = fundReturns.filter(r => r < 0);
    const downVariance = downReturns.length > 0
      ? downReturns.reduce((a, b) => a + Math.pow(b, 2), 0) / fundReturns.length
      : 0;
    const downVol = Math.sqrt(downVariance) * Math.sqrt(252) * 100;
    const sortino = downVol > 0 ? (fundReturn - annualizedRiskFree) / downVol : 0;

    // Max Drawdown
    let maxDD = 0;
    let peak = fundPrices[0];
    for (let i = 1; i < fundPrices.length; i++) {
      if (fundPrices[i] > peak) peak = fundPrices[i];
      const dd = (peak - fundPrices[i]) / peak * 100;
      if (dd > maxDD) maxDD = dd;
    }

    // Beta
    const covariance = fundReturns.reduce((sum, r, i) => sum + (r - fundMean) * (benchReturns[i] - benchMean), 0) / fundReturns.length;
    const beta = covariance / benchVariance;

    // Jensen's Alpha
    const alpha = fundReturn - (annualizedRiskFree + beta * (benchReturn - annualizedRiskFree));

    res.json({
      fundReturn,
      benchReturn,
      outperformance: fundReturn - benchReturn,
      fundVol,
      benchVol,
      sharpe,
      sortino,
      maxDD,
      beta,
      alpha
    });
  } catch (error) {
    console.error('Error calculating metrics:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Cache status
app.get('/api/cache-status', (req, res) => {
  const keys = cache.keys();
  res.json({
    cachedItems: keys.length,
    keys: keys,
    timestamp: new Date().toISOString()
  });
});

// Clear cache (admin only in production)
app.post('/api/clear-cache', (req, res) => {
  cache.flushAll();
  res.json({ message: 'Cache cleared' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
