# 05 — API Reference

Base URL dev: `http://localhost:3000/api` (frontend memakai proxy `/api` Vite).
Auth: `Authorization: Bearer <token>` + opsional `X-Company-Id` (override company aktif).
Format sukses: `{ message?, data }`. Format error: `{ message }` (+ `errors` untuk Zod 400).

## Auth — `/api/auth` (rate-limit 20/15 mnt)

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/auth/register` | publik | Body `{ name, username, email, password }` → user + personal company + modul dasar |
| POST | `/auth/login` | publik | Body `{ username, password }` → `{ token, user }`; user berisi `roles`, `permissions`, `companies[]`, `defaultCompanyId` |
| POST | `/auth/switch-company/:id` | login | Token baru dengan `companyId` terpilih (harus member) |

Contoh login:
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"password123"}'
```

## Users — `/api/users` (perlu `users:manage`)

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/users?search=..&role=..` | Filter nama/username/email + role (id/nama) |
| GET | `/users/:id` | Detail + roles (tanpa password) |
| PUT | `/users/:id` | `{ name?, username?, email?, password?, roleId? }`; password di-hash; cek unik |
| PUT | `/users/:id/roles` | `{ roleIds: number[] }` ganti multi-role |
| DELETE | `/users/:id` | Hapus user |

## Roles — `/api/roles` (perlu `roles:manage`)

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/roles` | Role + permissions + `userCount` |
| GET | `/roles/permissions` | Katalog permission |
| POST | `/roles` | `{ name }` kapital (`MANAGER`), 409 bila duplikat |
| PUT | `/roles/:id` | Ubah nama |
| PUT | `/roles/:id/permissions` | `{ permissionIds: number[] }` |
| DELETE | `/roles/:id` | 400 bila masih dipakai user |

## Companies — `/api/companies` (login)

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/companies/me` | Company milik user |
| POST | `/companies` | `{ name, code }` → + member diri sendiri + modul dasar |
| GET | `/companies/:id` | Detail + members + modules (harus member) |
| PUT | `/companies/:id` | Perlu `companies:update` |
| POST | `/companies/:id/members` | Perlu `companies:manage`, body `{ userId, isDefault? }` |
| DELETE | `/companies/:id/members/:userId` | Perlu `companies:manage` |
| POST | `/companies/:id/set-default` | Jadikan default + token baru |

## Modules — `/api/modules` (login)

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/modules` | Katalog |
| GET | `/modules/company/:companyId` | Status install per company (harus member) |
| POST | `/modules/company/:companyId/:code/install` | Perlu `modules:manage` |
| POST | `/modules/company/:companyId/:code/uninstall` | Perlu `modules:manage`; `base` diproteksi |

## Utilitas

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/` | Info API |
| GET | `/health` | `{ status: "ok" }` |

## Kode Status Error Umum

`400` validasi/Zod & aturan bisnis · `401` token hilang/invalid ·
`403` bukan member / permission kurang / modul belum install ·
`404` data tak ada · `409` duplikat unik.
