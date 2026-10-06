# Keamanan

## 1. JWT_SECRET

- Sudah di-load dari `.env` (`JWT_SECRET`).
- **Wajib diganti** dengan string acak yang kuat saat production, misalnya:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Jangan commit `.env` ke repository.

## 2. Rate Limiting

Endpoint `/api/auth/*` dibatasi **20 request per 15 menit per IP** via `express-rate-limit`.
Jika melebihi, response: `429 { "message": "Terlalu banyak percobaan, coba lagi nanti" }`.

Atur di `src/app.ts`:

```ts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
});
```

## 3. CORS

- Development (`NODE_ENV=development`): semua origin diizinkan.
- Production (`NODE_ENV=production`): hanya origin dari `CORS_ORIGINS` di `.env`.

Contoh `.env` production:

```
NODE_ENV=production
CORS_ORIGINS=https://app.example.com,https://admin.example.com
```

## 4. Helmet

Dipasang global di `src/app.ts` (`app.use(helmet())`) untuk security headers (X-Content-Type-Options, X-Frame-Options, dsb.).

## 5. HTTPS

Express ini menangani HTTP. **HTTPS diaktifkan di reverse proxy / load balancer** di depan aplikasi (mis. Nginx, Caddy, atau platform seperti Railway/Vercel/Render yang otomatis TLS).

Contoh Nginx:

```nginx
server {
  listen 443 ssl;
  server_name api.example.com;
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  location / {
    proxy_pass http://localhost:3000;
  }
}
```

Selalu kirim token JWT hanya lewat HTTPS di production.
