# Hubungan Auth ↔ Modul Transaksional

Backend ini menggunakan dua database dalam satu server:

- `db_ophelia_admin` — User, role, permission, company, modul (identitas & tenancy)
- `db_ophelia_system` — tabel transaksional modul ERP (di-scope per company)

## Prinsip

1. **Join lintas database tidak digunakan** — Prisma tidak mendukung join lintas DB.
2. **API internal HTTP tidak digunakan** — modul auth bukan service terpisah; semua masih satu proses monolith.
3. **Verifikasi token dilakukan secara lokal** oleh middleware.

## Alur Autentikasi

```
Request (Authorization: Bearer <jwt>, opsional X-Company-Id)
        │
        ▼
src/middlewares/auth.middleware.ts
  → verifyToken() menggunakan JWT_SECRET (tanpa query DB / tanpa HTTP)
  → isi req.user = { id, roles, permissions, companyId }
        │
        ▼
src/middlewares/rbac.middleware.ts
  → requirePermission("...") cek req.user.permissions
        │
        ▼
src/middlewares/company.middleware.ts
  → resolveCompany(): pastikan user member company aktif
  → requireModule("..."): pastikan modul ter-install di company
        │
        ▼
Modul bisnis (mis. inventory)
  → pakai req.companyId untuk scope semua query (isolasi antar company)
```

## Mengambil Data User dari Modul Transaksional

Jika modul transaksional butuh nama/email user, query langsung via client auth — **bukan HTTP internal**:

```ts
import { prismaAuth } from "../../config/prisma";

const user = await prismaAuth.user.findUnique({
  where: { id: createdByUserId },
  select: { id: true, name: true },
});
```

Relasi di tabel transaksional cukup menyimpan `userId`/`companyId` sebagai kolom
angka biasa (`prisma/transactions/schema.prisma`). Tidak ada foreign key lintas DB.

## Kapan Perlu API Internal?

Hanya jika modul auth dipisah menjadi **service/microservice tersendiri**. Dalam arsitektur monolith saat ini, memanggil API HTTP dari dalam modul lain menambah overhead dan coupling tanpa manfaat.
