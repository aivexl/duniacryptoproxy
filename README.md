# duniacrypto-proxy

Proxy sederhana untuk API CoinGecko dan GNews.

## Fitur
- Proxy endpoint ke [CoinGecko API](https://api.coingecko.com)
- Proxy endpoint ke [GNews API](https://gnews.io)
- Mendukung CORS untuk akses dari frontend

## Cara Menjalankan

1. Install dependencies:
   ```bash
   npm install
   ```
2. Jalankan server:
   ```bash
   node index.js
   ```
3. Server akan berjalan di port 3000 (atau sesuai `process.env.PORT`)

## Contoh Penggunaan

- **Proxy CoinGecko**
  ```
  GET http://localhost:3000/coingecko/api/v3/simple/price?ids=bitcoin&vs_currencies=usd
  ```
- **Proxy GNews**
  ```
  GET http://localhost:3000/gnews/api/v4/search?q=crypto&token=YOUR_GNEWS_TOKEN
  ```

## Deploy
- Deploy backend ke Render.com
- Untuk frontend (misal Next.js), deploy ke Vercel dan arahkan fetch ke URL backend Render Anda

---

**Author:** [aivexl](https://github.com/aivexl) 