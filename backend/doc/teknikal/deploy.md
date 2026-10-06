# Deploy ke Production / Hosting

## 1. Environment (`.env`)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL_AUTH="mysql://user:pass@host:3306/db_auth_rbac"
DATABASE_URL_TX="mysql://user:pass@host:3306/db_transactional"
JWT_SECRET=<random kuat>
JWT_EXPIRES_IN="1h"
CORS_ORIGINS="https://app-kamu.com,https://www.app-kamu.com"
```

- Ganti `JWT_SECRET` dengan nilai acak kuat:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `DATABASE_URL_*` mengikuti kredensial MySQL dari provider hosting.
- `CORS_ORIGINS` hanya domain frontend production.

## 2. Build & Start

```bash
npm install
npm run build          # compile TypeScript ke dist/
npm start              # node dist/server.js
```

## 3. Database (Prisma)

```bash
npx prisma generate
npx prisma migrate deploy
```

Gunakan `migrate deploy` (bukan `migrate dev`) di production.

## 4. HTTPS

Aktifkan TLS di reverse proxy (Nginx/Caddy) atau fitur SSL hosting. Semua request (terutama Authorization header) harus lewat `https://`.

Contoh Nginx:

```nginx
server {
  listen 443 ssl;
  server_name api.example.com;
  ssl_certificate     /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  location / { proxy_pass http://localhost:3000; }
}
```

Jika memakai reverse proxy, tambahkan di `src/app.ts` agar IP klien terbaca benar (penting untuk rate limit):

```ts
app.set("trust proxy", 1);
```

## 5. Shared Hosting

- Shared hosting murni (PHP-only) **tidak bisa** menjalankan Node.js. Butuh paket Node.js (Node Selector di cPanel, atau VPS/PaaS seperti Railway, Render, DigitalOcean, dsb.).
- Di cPanel Node.js: set startup file ke `dist/server.js`, environment variables diisi di panel.

## 6. PM2 (Process Manager)

PM2 menjaga aplikasi Node.js tetap berjalan, auto-restart saat crash, dan start otomatis saat server reboot. Konfigurasi sudah dibuat di `ecosystem.config.js`.

```bash
npm install -g pm2
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup        # jalankan sekali agar start otomatis saat reboot
```

Perintah berguna lainnya:

```bash
pm2 status         # status aplikasi
pm2 logs express-boilerplate-multidb
pm2 restart express-boilerplate-multidb
pm2 stop express-boilerplate-multidb
pm2 delete express-boilerplate-multidb
```

Catatan: PM2 dipakai untuk VPS. Jika deploy ke PaaS (Railway/Render/dsb.), tidak perlu PM2 karena mereka sudah menangani process management.

## 7. Checklist Sebelum Go Live

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` baru & kuat
- [ ] `CORS_ORIGINS` hanya domain production
- [ ] HTTPS aktif
- [ ] `prisma migrate deploy` sudah dijalankan
- [ ] `npm audit` bersih dari critical/high
- [ ] Rate limit auth aktif
- [ ] `.env` tidak ikut ter-commit
