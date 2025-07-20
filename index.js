import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

const cache = {}; // { [url]: { status, contentType, body, timestamp } }
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 6 jam

app.use('/coingecko', async (req, res) => {
  const url = `https://api.coingecko.com${req.url}`;
  const cacheKey = url;
  const now = Date.now();

  // Serve from cache if available and not expired
  if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_DURATION)) {
    const cached = cache[cacheKey];
    res.status(cached.status);
    res.set('Content-Type', cached.contentType);
    return res.send(cached.body);
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    const body = await response.buffer();
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy with 1 hour cache listening on port ${PORT}`));
