// ... existing code ...

app.use('/coincap', async (req, res) => {
  const url = `https://api.coincap.io${req.url}`;
  const cacheKey = url;
  const now = Date.now();

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

// ... existing code ...
