import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// Ganti dengan domain frontend Anda
const ALLOWED_ORIGINS = ['https://duniacrypto.vercel.app'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET'],
}));

// Rate limiter: max 30 requests per IP per minute
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/coingecko', limiter);

const cache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 jam

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || 'CG-jrJUt1cGARECPAnb9TUeCdqE';

// Validasi path agar hanya /api/v3/ yang diizinkan
app.use('/coingecko', (req, res, next) => {
  if (!req.url.startsWith('/api/v3/')) {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }
  next();
});

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
    const response = await fetch(url, { headers });
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
    // Jangan expose error detail ke user
    res.status(500).json({ error: 'Internal server error' });
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
    rate_limit: '30 calls/minute per IP',
    cors: ALLOWED_ORIGINS
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CoinGecko Proxy with security, 24h cache, and rate limit on port ${PORT}`));