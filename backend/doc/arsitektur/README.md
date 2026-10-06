# Dokumentasi Arsitektur — express-boilerplate-multidb

Backend REST API menggunakan **Express.js + TypeScript**, **MySQL**, **Prisma ORM**, **JWT Authentication**, **RBAC**, dan validasi **Zod**.

## Daftar Dokumen

| File | Isi |
|---|---|
| [arsitektur.md](./arsitektur.md) | Penjelasan layered architecture & modular monolith, alur request, tanggung jawab tiap layer |
| [konvensi.md](./konvensi.md) | Konvensi penamaan file/folder/variabel, pola kode, cara menambah modul baru |
| [api.md](./api.md) | Daftar endpoint, akses (RBAC), contoh request/response |
| [contoh-modul.md](./contoh-modul.md) | Contoh modul lengkap dari route hingga repository |

## Tech Stack

- Runtime: Node.js + TypeScript (`tsx` untuk dev)
- Framework: Express 5
- Database: MySQL via Prisma 6
- Auth: JWT (`jsonwebtoken`) + hash password (`bcryptjs`)
- Validasi: Zod
- Env: `dotenv` (`.env`)

## Perintah Penting

```powershell
npm.cmd run dev              # jalankan dev server (tsx watch)
npm.cmd run build            # compile TypeScript ke dist/
npm.cmd start                # jalankan hasil build
npm.cmd run prisma:generate  # generate Prisma Client
npm.cmd run prisma:migrate   # migrate database (dev)
```

## Variabel Environment (`.env`)

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL_AUTH` | URL koneksi MySQL untuk database auth, mis. `mysql://root:root@localhost:3306/db_auth_rbac` |
| `DATABASE_URL_TX` | URL koneksi MySQL untuk database transaksional, mis. `mysql://root:root@localhost:3306/db_transactional` |
| `JWT_SECRET` | Secret untuk signing JWT |
| `JWT_EXPIRES_IN` | Masa berlaku token, mis. `1d` |
| `PORT` | Port server (default 3000) |
