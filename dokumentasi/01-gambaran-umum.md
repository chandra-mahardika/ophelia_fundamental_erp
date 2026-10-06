# 01 — Gambaran Umum

## Visi

**Ophelia Express** adalah ERP modular ala Odoo: satu aplikasi, banyak company,
modul bisnis yang bisa di-install per company (inventory, sales, accounting, HR, ...).

## Tiga Pilar Konsep

1. **Multi-company (multi-tenant logis).** Satu user bisa menjadi member banyak
   company. Setiap request berjalan dalam konteks **satu company aktif**
   (dari klaim JWT `companyId` atau header `X-Company-Id`). Semua data
   transaksional di-scope `companyId` sehingga tidak bocor antar company.
2. **Modular (ala Odoo Apps).** Katalog modul di tabel `modules`; status
   install per company di `company_modules`. Endpoint dan menu UI ditolak/
   disembunyikan bila modul belum di-install (`requireModule(...)`).
3. **Dua database, satu proses (modular monolith).**
   - `db_ophelia_admin` — identitas & tenancy: user, role, permission,
     company, membership, modul.
   - `db_ophelia_system` — data transaksional modul ERP.
   - Tanpa join lintas DB (Prisma tidak mendukung) dan tanpa HTTP internal:
     relasi lintas DB berupa kolom angka + query langsung via dua Prisma Client.

## Tech Stack

| Lapisan | Teknologi | Versi |
|---|---|---|
| Backend runtime | Node.js + TypeScript (`tsx` untuk dev) | Node 22 / TS 5.9 |
| Framework API | Express 5 | `express@5` |
| Database | MySQL via Prisma ORM | Prisma 6 |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) | — |
| Validasi | Zod 4 | — |
| Hardening | `helmet`, `cors`, `express-rate-limit` | — |
| Frontend | Svelte 5 (runes) + Vite | Svelte 5.57 / Vite 8 |
| Styling | Tailwind CSS 4 + tema Flowbite Admin Dashboard | TW 4.3 |
| Deploy backend | `tsc` → `node dist/server.js`, PM2 (`ecosystem.config.js`) | — |

## Peta Workspace

```
ophelia_express/
├── backend/            # Express API (lihat 03)
│   ├── src/            # app, config, middlewares, modules, utils
│   ├── prisma/auth/    # schema + migrasi + seed DB admin
│   ├── prisma/transactions/  # schema + migrasi DB system
│   └── doc/            # dokumen warisan boilerplate
├── frontend/           # Svelte SPA (lihat 06)
│   └── src/            # App, lib (pages, store, api client, tema)
└── dokumentasi/        # direktori ini (acuan utama)
```

## Alur Data (ringkas)

```
Browser (:5173, Svelte)
  │  /api/* (Vite proxy saat dev)
  ▼
Express (:3000)
  authenticate (JWT) → requirePermission (RBAC) → resolveCompany (membership)
  → requireModule (install?) → controller → service → repository
  → prismaAuth (db_ophelia_admin) / prismaTx (db_ophelia_system)
```
