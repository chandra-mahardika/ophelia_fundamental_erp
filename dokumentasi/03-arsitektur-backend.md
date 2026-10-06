# 03 — Arsitektur Backend

Lokasi: `backend/src/`. Pola: **Layered** (Route → Middleware → Controller →
Service → Repository → Prisma) dalam **Modular Monolith** (satu folder per domain).

## Struktur

```
src/
├── server.ts               # entry: listen PORT
├── app.ts                  # express setup + registrasi route /api/*
├── config/
│   ├── env.ts              # baca .env (port, jwt, cors)
│   └── prisma.ts           # prismaAuth (DB admin) + prismaTx (DB system)
├── middlewares/
│   ├── auth.middleware.ts      # authenticate: JWT → req.user { id, roles, permissions, companyId? }
│   ├── rbac.middleware.ts      # authorize(...roles) / requirePermission(...perms)
│   ├── company.middleware.ts   # resolveCompany / requireModule (multi-company)
│   ├── validate.middleware.ts  # validate(schemaZod)
│   └── error.middleware.ts     # errorHandler: Zod→400, ApiError→statusnya, lain→500
├── modules/
│   ├── auth/       # register, login, switch-company
│   ├── users/      # CRUD user + filter + set roles (users:manage)
│   ├── roles/      # CRUD role + set permissions + katalog (roles:manage)
│   ├── companies/  # CRUD company + members + set-default (companies:*)
│   └── app-modules/# katalog + install/uninstall per company (modules:*)
└── utils/
    ├── ApiError.ts # error bisnis (statusCode + message)
    └── jwt.ts      # signToken / verifyToken + tipe JwtPayload
```

Tiap modul bisnis: `xxx.routes.ts` → `xxx.controller.ts` → `xxx.service.ts` →
`xxx.repository.ts` (+ `xxx.validation.ts` schema Zod). Pengecualian: `auth`
tanpa repository (query di service), `app-modules` tanpa validation.

## Rantai Middleware Tipikal (endpoint transaksional)

```ts
router.use(authenticate, resolveCompany, requireModule("inventory"));
router.post("/", requirePermission("products:create"), validate(schema), controller.create);
```

| Middleware | Tugas |
|---|---|
| `authenticate` | Wajib di semua route privat. 401 bila token hilang/invalid. |
| `requirePermission(...)` | RBAC global (AND semua permission). 403 bila kurang. |
| `resolveCompany` | Tentukan company aktif (`X-Company-Id` header didahulukan, lalu klaim JWT). Cek membership `user_companies` + `company.isActive`. Hasil di `(req as CompanyRequest).companyId`. 400 bila belum pilih, 403 bila bukan member/nonaktif. |
| `requireModule(...codes)` | Cek `company_modules.isInstalled` + `module.isActive`. 403 + daftar modul kurang. |
| `validate(schema)` | Validasi body Zod. 400 + detail field. |

## JWT

- Payload: `{ id, roles: string[], permissions: string[], companyId?: number }`
  (`companyId` opsional agar token lama tetap valid).
- `register` → user baru otomatis dapat **personal company**
  (`personal-<username>`) + modul `base` + `inventory`, lalu login.
- `login` → token membawa `companyId` default + daftar `companies`.
- Ganti aktif: `POST /api/auth/switch-company/:id` atau
  `POST /api/companies/:id/set-default` → token baru. **Permission dibaca saat
  login** — perubahan role/permission efektif setelah login ulang/switch.

## Multi-DB Prisma

`src/config/prisma.ts` mengekspor dua client dari `src/generated/{auth,transactions}/`
(output generator per schema). Tidak ada join lintas DB: relasi `companyId`/
`userId` di DB system adalah kolom angka biasa + validasi di service/middleware.

## Menambah Modul Transaksional Baru (contoh: `sales`)

1. **Schema** (`prisma/transactions/schema.prisma`): model dengan `companyId Int`
   + `@@index([companyId])` + `@@map("tabel_snake")`. Lalu
   `prisma migrate dev --schema=prisma/transactions/schema.prisma` + generate.
2. **Kode** `src/modules/sales/`: `validation → repository → service →
   controller → routes`. Repository: semua query filter `{ companyId }`;
   `findById` via `findFirst({ where: { id, companyId } })` (cegah IDOR).
3. **Routes**: `router.use(authenticate, resolveCompany, requireModule("sales"))`
   + `requirePermission(...)` per aksi. Daftarkan di `app.ts`.
4. **Seed/katalog**: pastikan `Module { code: "sales" }` ada (tambah di
   `prisma/auth/seed.ts` bila modul baru permanen).
5. **Frontend**: tambah entri `MODULE_DEFS` + halaman (lihat 06).

## Menambah Permission Baru

1. Tambah nama ke `PERMISSIONS` di `prisma/auth/seed.ts` (format `resource:aksi`).
2. Jalankan seed (upsert idempoten) + berikan ke role via UI Roles atau seed.
3. Pakai `requirePermission("resource:aksi")` di route.
