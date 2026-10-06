# 02 — Menjalankan Sistem

## Prasyarat

- Node.js 22+ (`node -v`)
- MySQL 8 di `localhost:3306` (user `root`, password `root` — sesuai `.env`)
- Windows: gunakan `npm.cmd` / `npx.cmd` (eksekusi script `.ps1` diblokir ExecutionPolicy)

## Konfigurasi Env (`backend/.env`)

| Variabel | Contoh | Keterangan |
|---|---|---|
| `DATABASE_URL_AUTH` | `mysql://root:root@localhost:3306/db_ophelia_admin` | DB identitas & tenancy |
| `DATABASE_URL_TX` | `mysql://root:root@localhost:3306/db_ophelia_system` | DB transaksional |
| `JWT_SECRET` | string acak panjang | **Wajib diganti di production** |
| `JWT_EXPIRES_IN` | `1d` | Masa berlaku token |
| `PORT` | `3000` | Port backend |
| `NODE_ENV` | `development` | `production` saat deploy |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Origin diizinkan (production saja) |

Contoh lengkap: `backend/.env.example`.

## Langkah Pertama Kali

```powershell
cd backend
npm.cmd install
npm.cmd run prisma:migrate     # migrate auth + transactions (buat DB bila belum ada)
npm.cmd run db:seed            # roles, permissions, modules, user admin/user, demo company
npm.cmd run dev                # tsx watch src/server.ts → http://localhost:3000

cd ..\frontend
npm.cmd install
npm.cmd run dev                # vite → http://localhost:5173 (proxy /api ke :3000)
```

Akun dev (password `password123`): `admin` (ADMIN), `user` (USER).

## Perintah Harian

| Perintah (di `backend/`) | Fungsi |
|---|---|
| `npm.cmd run dev` | Dev server hot-reload |
| `npm.cmd run build` / `npm.cmd start` | Compile `tsc` ke `dist/` / jalankan hasil build |
| `npm.cmd run prisma:generate` | Regenerate kedua Prisma Client |
| `npm.cmd run prisma:migrate` | `migrate dev` kedua schema |
| `npm.cmd run prisma:migrate:auth` / `:tx` | Migrate satu schema saja |
| `npm.cmd run db:seed` | Seed ulang (idempoten via upsert) |

| Perintah (di `frontend/`) | Fungsi |
|---|---|
| `npm.cmd run dev` | Dev server + HMR |
| `npm.cmd run check` | `svelte-check` + `tsc` validasi tipe |
| `npm.cmd run build` / `preview` | Build production ke `dist/` / pratinjau |

## Cek Kesehatan

- Backend: `GET http://localhost:3000/health` → `{"status":"ok"}`
- Frontend: buka `http://localhost:5173/` → halaman login
- API via proxy: `GET http://localhost:5173/api/modules` (dengan Bearer token)

## Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| `EPERM ... query_engine-windows.dll.node` saat `prisma generate` | Dev server (`tsx watch`) mengunci DLL. Hentikan dev server, generate, jalankan lagi. Biner engine identik per versi Prisma, jadi aman. |
| `migrate dev` minta reset / "modified after applied" | File migrasi diubah setelah di-apply. Di dev: backup data → `prisma migrate reset --force --schema=...` → seed ulang. Jangan reset di production. |
| `migrate dev` menolak (non-interactive) saat drop tabel berisi | Kosongkan tabel dulu, atau buat migrasi manual. Hanya untuk data dev. |
| `Akses ditolak: permission tidak cukup` setelah seed baru | Token lama tidak membawa permission baru. Login ulang / switch company untuk token baru. |
| Port bentrok | Backend `PORT` di `.env`; frontend `vite.config.ts → server.port`. |
