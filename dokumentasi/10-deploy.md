# 10 — Deploy Sistem

## Build

```powershell
# backend → dist/
cd backend
npm.cmd run build

# frontend → dist/
cd ..\frontend
npm.cmd run build
```

## Backend Production

1. `.env`: `NODE_ENV=production`, `JWT_SECRET` acak panjang, `DATABASE_URL_*`
   ke MySQL production, `CORS_ORIGINS` = domain frontend saja, `PORT` sesuai.
2. Migrasi (tanpa prompt, tanpa buat file baru):
   ```powershell
   npx.cmd prisma migrate deploy --schema=prisma/auth/schema.prisma
   npx.cmd prisma migrate deploy --schema=prisma/transactions/schema.prisma
   ```
3. Seed awal bila DB kosong: `npm.cmd run db:seed`.
4. Jalankan: `npm.cmd start` (`node dist/server.js`) atau via PM2:
   ```powershell
   pm2 start ecosystem.config.js
   ```
   Sesuaikan `name` di `ecosystem.config.js` (saat ini masih
   `express-boilerplate-multidb`) bila perlu.

## Frontend Production

- Hasil `dist/` = file statis → serve via nginx / static hosting apa pun.
- Tidak ada env runtime: basis API relatif (`/api`), jadi serve frontend dan
  backend dalam origin yang sama, atau atur reverse proxy `/api → :3000`.
- Contoh nginx (satu domain):
  ```
  location /api/ { proxy_pass http://127.0.0.1:3000/api/; }
  location /     { root /var/www/ophelia_web/dist; try_files $uri /index.html; }
  ```

## Checklist Production

- [ ] `JWT_SECRET` kuat & unik; `JWT_EXPIRES_IN` sesuai kebijakan
- [ ] `CORS_ORIGINS` hanya domain frontend; `helmet` aktif (default)
- [ ] MySQL user khusus aplikasi (bukan root), backup terjadwal
- [ ] `migrate deploy` (bukan `dev`/`reset`); file migrasi terkunci di VCS
- [ ] HTTPS (token JWT hanya lewat TLS); `trust proxy` sudah `1` di `app.ts`
- [ ] Rate-limit auth 20/15 mnt (default `app.ts`); sesuaikan bila perlu
- [ ] Password seed (`password123`) diganti; akun dev dinonaktifkan/dihapus
- [ ] Log & monitoring proses (PM2/systemd) + restart otomatis
