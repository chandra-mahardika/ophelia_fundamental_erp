# Multi-Company & Modular ERP (ala Odoo)

## Konsep

- **Company = tenant.** Setiap user bisa menjadi member dari banyak company
  via tabel `user_companies` (DB `db_ophelia_admin`).
- **Satu company aktif per request.** Ditentukan dari header `X-Company-Id`
  atau klaim `companyId` di JWT. Middleware `resolveCompany` memverifikasi
  membership + status aktif company.
- **Modul di-install per company** (ala Odoo Apps). Katalog di tabel `modules`,
  status install per company di `company_modules`. Middleware `requireModule(...)`
  menolak request bila modul belum di-install.
- **Semua tabel transaksional** (DB `db_ophelia_system`) wajib punya kolom
  `companyId` (referensi logis ke `companies.id` — tanpa FK cross-database)
  + `@@index([companyId])`, dan semua query di-scope ke company aktif.

## Skema (DB admin)

| Tabel | Fungsi |
|---|---|
| `companies` | Master company (`code` unik) |
| `user_companies` | Membership user ↔ company + flag `isDefault` |
| `modules` | Katalog modul (`base`, `inventory`, `sales`, `accounting`, `hr`) |
| `company_modules` | Modul apa ter-install di company apa |

## Alur Auth + Company

1. `POST /api/auth/register` → user baru otomatis dapat company pribadi
   (`personal-<username>`) + modul `base` + `inventory`.
2. `POST /api/auth/login` → respons berisi `companies[]`, `defaultCompanyId`,
   dan token JWT yang sudah membawa `companyId` default.
3. `POST /api/auth/switch-company/:id` atau `POST /api/companies/:id/set-default`
   → token baru dengan `companyId` terpilih (harus member).
4. Request ke endpoint transaksional: sertakan `Authorization: Bearer <token>`
   dan (opsional, untuk override) header `X-Company-Id`.

## Menambah Modul Transaksional Baru

Contoh: modul `sales` dengan tabel `sales_orders`.

1. **Prisma transactions** — tambah model dengan `companyId`:
   ```prisma
   model SalesOrder {
     id        Int      @id @default(autoincrement())
     companyId Int
     // ... kolom lain
     @@index([companyId])
     @@map("sales_orders")
   }
   ```
2. **Repository** — semua query filter `where: { companyId }`; `findById`
   pakai `findFirst({ where: { id, companyId } })` agar tidak bocor antar company.
3. **Route** — `router.use(authenticate, resolveCompany, requireModule("sales"))`.
4. **Seed** — modul `sales` sudah ada di katalog; install per company via
   `POST /api/modules/company/:companyId/sales/install`.
5. **Frontend** — sembunyikan menu modul yang tidak ter-install
   (dari `GET /api/modules/company/:companyId`).

## Endpoint Terkait

| Method & Path | Keterangan |
|---|---|
| `GET /api/companies/me` | Company milik user login |
| `POST /api/companies` | Buat company baru (+ modul dasar) |
| `GET /api/companies/:id` | Detail + members + modules |
| `PUT /api/companies/:id` | Update (perlu `companies:update`) |
| `POST /api/companies/:id/members` | Tambah member (perlu `companies:manage`) |
| `DELETE /api/companies/:id/members/:userId` | Hapus member |
| `POST /api/companies/:id/set-default` | Ganti company aktif (token baru) |
| `GET /api/modules` | Katalog modul |
| `GET /api/modules/company/:companyId` | Modul ter-install di company |
| `POST /api/modules/company/:companyId/:code/install` | Install (perlu `modules:manage`) |
| `POST /api/modules/company/:companyId/:code/uninstall` | Uninstall (`base` dilindungi) |
| `GET /api/users` | Daftar user + roles (perlu `users:manage`) |
| `PUT /api/users/:id` | Update user / ganti 1 role via `roleId` |
| `PUT /api/users/:id/roles` | Ganti multi-role (`roleIds[]`) |
| `DELETE /api/users/:id` | Hapus user |
| `GET /api/roles` | Daftar role + permissions + userCount (perlu `roles:manage`) |
| `POST /api/roles` | Buat role (`name` kapital) |
| `PUT /api/roles/:id` | Ubah nama role |
| `PUT /api/roles/:id/permissions` | Ganti permission role (`permissionIds[]`) |
| `DELETE /api/roles/:id` | Hapus role (ditolak bila masih dipakai user) |
| `GET /api/roles/permissions` | Katalog permission |
