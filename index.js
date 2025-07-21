import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

const cache = {}; // { [url]: { status, contentType, body, timestamp } }
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 jam

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';

// Proxy CoinGecko API
app.use('/coingecko', async (req, res) => {
  const url = `https://api.coingecko.com${req.url}`;
  const cacheKey = url;
  const now = Date.now();

  if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_DURATION)) {
    const cached = cache[cacheKey];
    res.status(cached.status);
    res.set('Content-Type', cached.contentType);
    return res.send(cached.body);
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    };
    if (COINGECKO_API_KEY) {
      headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
    }
    const response = await fetch(url, {
      headers
    });
    const arrayBuffer = await response.arrayBuffer();
    const body = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type');
    cache[cacheKey] = {
      status: response.status,
      contentType,
      body,
      timestamp: now
    };
    res.status(response.status);
    res.set('Content-Type', contentType);
    res.send(body);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
});

// Root endpoint untuk health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'DuniaCrypto Proxy - CoinGecko API',
    endpoints: {
      '/coingecko/api/v3/simple/price': 'Get current price of cryptocurrencies',
      '/coingecko/api/v3/coins/markets': 'Get market data for cryptocurrencies',
      '/coingecko/api/v3/coins/bitcoin': 'Get detailed coin data',
      '/coingecko/api/v3/exchanges': 'Get exchange data',
      '/coingecko/ping': 'Health check'
    },
    cache: '24 hours',
    rate_limit: '50 calls/minute (higher with API key)'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CoinGecko Proxy with 24h cache listening on port ${PORT}`));
