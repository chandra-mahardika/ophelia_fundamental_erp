# 09 — RBAC & Permissions

Dua lapis otorisasi: **global** (role → permission) dan **konteks company**
(membership + modul ter-install).

## Cara Kerja

1. Login: permission user = gabungan permission semua role-nya, disematkan di JWT.
2. `requirePermission(...names)` (AND): 403 `Akses ditolak: permission tidak cukup`.
3. `resolveCompany`: user harus member company aktif (atau 403);
   `requireModule(...)`: modul harus installed+aktif (atau 403).
4. Perubahan role/permission efektif setelah **login ulang / switch company**
   (token baru). UI Roles mengingatkan hal ini.

## Matriks Permission Saat Ini

| Permission | Diberikan ke | Melindungi |
|---|---|---|
| `users:manage` | ADMIN | CRUD user, ganti roles (`/api/users/*`) |
| `roles:manage` | ADMIN | CRUD role + permissions (`/api/roles/*`) |
| `companies:create` | ADMIN (+ semua pendaftar untuk company sendiri*) | Buat company |
| `companies:read` | ADMIN, USER | Lihat company sendiri |
| `companies:update` | ADMIN | Ubah company |
| `companies:manage` | ADMIN | Kelola members |
| `modules:read` | ADMIN, USER | Lihat katalog/status modul |
| `modules:manage` | ADMIN | Install/uninstall |

\* `POST /api/companies` hanya butuh login (tanpa permission) — semua user boleh
membuat company baru (dan otomatis jadi member).

## Peran Bawaan (seed)

- **ADMIN**: semua permission. Akun `admin` / `password123`.
- **USER**: `companies:read`, `modules:read`. Akun `user` / `password123`.
  Role default saat registrasi.

## Menambah Permission / Role

- Permission: tambah ke `PERMISSIONS` di `prisma/auth/seed.ts` → seed →
  atur via halaman Roles (atau seed untuk ADMIN).
- Role: via `POST /api/roles` / halaman Roles → centang permissions.
- Hapus role: ditolak (400) bila masih dipakai ≥1 user — kosongkan dulu via
  halaman Users.
