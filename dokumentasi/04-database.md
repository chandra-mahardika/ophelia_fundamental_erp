# 04 — Database

Dua database MySQL, dua schema Prisma, dua riwayat migrasi independen.

## DB Admin — `db_ophelia_admin`

Schema: `backend/prisma/auth/schema.prisma`. Isi: identitas + tenancy + RBAC.

| Tabel | Model | Kolom kunci |
|---|---|---|
| `users` | `User` | `username` uq, `email` uq, `password` (bcrypt) |
| `roles` | `Role` | `name` uq (`ADMIN`, `USER`, ...) |
| `user_roles` | `UserRole` | PK `(userId, roleId)` |
| `permissions` | `Permission` | `name` uq (`resource:aksi`) |
| `role_permissions` | `RolePermission` | PK `(roleId, permissionId)` |
| `companies` | `Company` | `code` uq, `isActive` |
| `user_companies` | `UserCompany` | PK `(userId, companyId)`, `isDefault` |
| `modules` | `Module` | PK `code` (`base`, `inventory`, `sales`, `accounting`, `hr`), `isActive` |
| `company_modules` | `CompanyModule` | PK `(companyId, moduleCode)`, `isInstalled` |

Relasi: User ↔ Role (N-N via `user_roles`), Role ↔ Permission (N-N via
`role_permissions`), User ↔ Company (N-N via `user_companies`), Company ↔
Module (N-N via `company_modules`). Semua FK bertipe `Int`.

## DB System — `db_ophelia_system`

Schema: `backend/prisma/transactions/schema.prisma`. **Saat ini kosong**
(modul sample `products` dihapus via migrasi `remove_products_sample`).
Setiap model baru **wajib**:

```prisma
model Contoh {
  id        Int      @id @default(autoincrement())
  companyId Int      // referensi logis → companies.id (tanpa FK lintas DB)
  // ... kolom domain
  @@index([companyId])
  @@map("contoh")
}
```

## Workflow Migrasi

```powershell
# buat + terapkan migrasi baru (dev)
npx.cmd prisma migrate dev --schema=prisma/auth/schema.prisma --name <nama>
npx.cmd prisma migrate dev --schema=prisma/transactions/schema.prisma --name <nama>
# atau sekaligus: npm.cmd run prisma:migrate (auth lalu tx)

# regenerate client bila schema berubah tanpa migrasi
npm.cmd run prisma:generate
```

- Folder migrasi: `prisma/{auth,transactions}/migrations/`.
- **Jangan edit file migrasi yang sudah di-apply** (menyebabkan drift → dev
  wajib `migrate reset`, production rusak). Perbaikan = migrasi baru.
- `migrate dev` interaktif: menolak drop tabel **berisi** di mode non-interaktif.
- Client ter-generate di `src/generated/{auth,transactions}/` (jangan edit manual).

## Seed (`prisma/auth/seed.ts`, via `npm.cmd run db:seed`)

Idempoten (upsert): permissions, roles ADMIN/USER (+ relasinya), katalog 5 modul,
user `admin@example.com` / `user@example.com` (password `password123`), demo
company `DEMO` (kedua user member + semua modul installed). Juga membersihkan
permission yatim modul yang sudah dihapus (`products:*`).
