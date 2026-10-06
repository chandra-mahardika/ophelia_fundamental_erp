# API Reference

Base URL: `http://localhost:3000/api`

Autentikasi: header `Authorization: Bearer <token>` (token didapat dari `/auth/login`).

## Auth

### POST /api/auth/register
Akses: publik

```json
{ "name": "Budi", "email": "budi@mail.com", "password": "rahasia123" }
```

Response `201`:
```json
{ "message": "Registrasi berhasil", "data": { "id": 1, "name": "Budi", "email": "budi@mail.com", "role": "USER" } }
```

> Role selalu `USER` saat registrasi. Jadikan ADMIN via update manual di DB atau oleh ADMIN lain.

### POST /api/auth/login
Akses: publik

```json
{ "email": "budi@mail.com", "password": "rahasia123" }
```

Response `200`:
```json
{ "message": "Login berhasil", "data": { "token": "<jwt>", "user": { "id": 1, "name": "Budi", "email": "budi@mail.com", "role": "USER" } } }
```

## Users (semua endpoint: Bearer token + permission `users:manage`)

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/users?search=..&role=..` | Daftar user; filter nama/username/email + role (id/nama) |
| GET | `/api/users/:id` | Detail user |
| PUT | `/api/users/:id` | Update `name`/`username`/`email`/`password` (hash otomatis; kosongkan password bila tak diubah) |
| PUT | `/api/users/:id/roles` | Ganti multi-role sekaligus, body `{ "roleIds": [1, 3] }` |
| DELETE | `/api/users/:id` | Hapus user |

Body PUT (semua opsional):
```json
{ "name": "Budi Baru", "email": "budi2@mail.com", "role": "ADMIN" }
```

Ganti role sekaligus (multi-role):
```json
// PUT /api/users/:id/roles
{ "roleIds": [1, 3] }
```

## Roles (Bearer token + permission `roles:manage`)

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/roles` | Daftar role + permissions + jumlah user |
| GET | `/api/roles/permissions` | Katalog semua permission |
| POST | `/api/roles` | Buat role, body `{ "name": "MANAGER" }` |
| PUT | `/api/roles/:id` | Ubah nama role |
| PUT | `/api/roles/:id/permissions` | Ganti permission, body `{ "permissionIds": [1, 2] }` |
| DELETE | `/api/roles/:id` | Hapus role (gagal 400 bila masih dipakai user) |

> Modul sample `products` (`/api/products`) sudah dihapus. Lihat
> [multi-company.md](./multi-company.md) untuk endpoint Companies & Modules,
> dan [contoh-modul.md](./contoh-modul.md) sebagai template modul baru.

## Format Error

```json
{ "message": "Validasi gagal", "errors": [ { "path": ["email"], "message": "Email tidak valid" } ] }
```

```json
{ "message": "Akses ditolak" }
```
