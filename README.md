# Ophelia Express Fundamental ERP

**Author:** Chandra Mahardika — chandra.libertania@gmail.com

**Lisensi:** MIT

---

## Visi

**Ophelia Express Fundamental ERP** adalah ERP modular ala Odoo: satu aplikasi, banyak company, modul bisnis yang bisa di-install per company (inventory, sales, accounting, HR, ...). Dibangun dengan arsitektur backend **layered-architecture** dan **modular-monolith**.

## Tiga Pilar Konsep

1. **Multi-company (multi-tenant logis).** Satu user bisa menjadi member banyak company. Setiap request berjalan dalam konteks **satu company aktif** (dari klaim JWT `companyId` atau header `X-Company-Id`). Semua data transaksional di-scope `companyId` sehingga tidak bocor antar company.

2. **Modular (ala Odoo Apps).** Katalog modul di tabel `modules`; status install per company di `company_modules`. Endpoint dan menu UI ditolak/disembunyikan bila modul belum di-install (`requireModule(...)`).

3. **Dua database, satu proses (modular monolith).**
   - `db_ophelia_admin` — identitas & tenancy: user, role, permission, company, membership, modul.
   - `db_ophelia_system` — data transaksional modul ERP.
   - Tanpa join lintas DB (Prisma tidak mendukung) dan tanpa HTTP internal: relasi lintas DB berupa kolom angka + query langsung via dua Prisma Client.

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
ophelia_fundamental_erp/
├── backend/                # Express API
│   ├── src/                # app, config, middlewares, modules, utils
│   ├── prisma/auth/        # schema + migrasi + seed DB admin
│   ├── prisma/transactions/ # schema + migrasi DB system
│   └── doc/                # dokumen warisan boilerplate
├── frontend/               # Svelte SPA
│   └── src/                # App, lib (pages, store, api client, tema)
├── dokumentasi/            # dokumentasi teknis lengkap
├── sql/                    # dump SQL database
└── LICENSE                 # lisensi MIT
```

## Arsitektur Backend

Pola: **Layered** (Route → Middleware → Controller → Service → Repository → Prisma) dalam **Modular Monolith** (satu folder per domain).

### Struktur

```
src/
├── server.ts               # entry: listen PORT
├── app.ts                  # express setup + registrasi route /api/*
├── config/
│   ├── env.ts              # baca .env (port, jwt, cors)
│   └── prisma.ts           # prismaAuth (DB admin) + prismaTx (DB system)
├── middlewares/
│   ├── auth.middleware.ts      # authenticate: JWT → req.user
│   ├── rbac.middleware.ts      # authorize(...roles) / requirePermission(...perms)
│   ├── company.middleware.ts   # resolveCompany / requireModule (multi-company)
│   ├── validate.middleware.ts  # validate(schemaZod)
│   └── error.middleware.ts     # errorHandler: Zod→400, ApiError→statusnya, lain→500
├── modules/
│   ├── auth/       # register, login, switch-company
│   ├── users/      # CRUD user + filter + set roles
│   ├── roles/      # CRUD role + set permissions + katalog
│   ├── companies/  # CRUD company + members + set-default
│   └── app-modules/# katalog + install/uninstall per company
└── utils/
    ├── ApiError.ts # error bisnis (statusCode + message)
    └── jwt.ts      # signToken / verifyToken + tipe JwtPayload
```

### Rantai Middleware Tipikal

```ts
router.use(authenticate, resolveCompany, requireModule("inventory"));
router.post("/", requirePermission("products:create"), validate(schema), controller.create);
```

| Middleware | Tugas |
|---|---|
| `authenticate` | Wajib di semua route privat. 401 bila token hilang/invalid. |
| `requirePermission(...)` | RBAC global (AND semua permission). 403 bila kurang. |
| `resolveCompany` | Tentukan company aktif. Cek membership + `company.isActive`. |
| `requireModule(...codes)` | Cek `company_modules.isInstalled` + `module.isActive`. |
| `validate(schema)` | Validasi body Zod. 400 + detail field. |

### JWT

- Payload: `{ id, roles: string[], permissions: string[], companyId?: number }`
- `register` → user baru otomatis dapat **personal company** + modul `base` + `inventory`
- `login` → token membawa `companyId` default + daftar `companies`
- Ganti aktif: `POST /api/auth/switch-company/:id` → token baru

## Arsitektur Frontend

Svelte 5 (runes: `$state`, `$derived`, `$effect`, `$props`) + Vite + Tailwind 4.

### Struktur

```
src/
├── main.ts                 # mount App
├── app.css                 # tema + class komponen
├── App.svelte              # Login vs shell; routing berdasar store `view`
└── lib/
    ├── api.ts              # fetch wrapper + tipe + endpoint per domain
    ├── store.ts            # token, user, companies, activeCompanyId, view, theme
    ├── modules.ts          # MODULE_DEFS (nama, ikon, tint, menu/modul)
    ├── Header.svelte       # header: logo, switcher company, menu, theme, avatar
    ├── Panel.svelte        # landing: grid kartu modul/sistem
    ├── Login.svelte        # masuk/daftar
    ├── Users.svelte        # tabel + filter + modal edit + role inline
    ├── Roles.svelte        # CRUD role + checklist permission
    ├── Companies.svelte    # daftar + buat + aktifkan company
    ├── Modules.svelte      # install/uninstall per company aktif
    ├── PlaceholderPage.svelte
    ├── Select.svelte       # dropdown custom standar
    └── Icon.svelte         # set ikon SVG
```

### Navigasi

- `store.view` mengatur tampilan: `panel` (grid modul), `system` (companies/users/roles/modules), atau `module` (halaman modul ter-install)
- `activeCompanyId` → dikirim sebagai header `X-Company-Id` oleh `api.ts`
- Theme `light|dark` di `localStorage["ophe_theme"]`, diterapkan sebagai class `dark` di `<html>`

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

## Mulai Cepat

```powershell
# backend (http://localhost:3000)
cd backend
npm.cmd install
npm.cmd run prisma:migrate
npm.cmd run db:seed
npm.cmd run dev

# frontend (http://localhost:5173)
cd frontend
npm.cmd install
npm.cmd run dev
```

Login dev: `admin` / `password123` (atau `user` / `password123`).

## Dokumentasi Lengkap

Lihat folder [`dokumentasi/`](./dokumentasi/) untuk dokumentasi teknis lengkap (arsitektur, database, API reference, deploy, dll).
