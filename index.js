import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

// Proxy CoinGecko
app.use('/coingecko', async (req, res) => {
  const url = `https://api.coingecko.com${req.url}`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    res.status(response.status);
    res.set('Content-Type', response.headers.get('content-type'));
    res.send(await response.buffer());
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy listening on port ${PORT}`));
