# Autentikasi JWT

## Cara mendapatkan token

Login lewat endpoint:

```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"password123"}'
```

Response:

```json
{
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1, "name": "Admin", "username": "admin",
      "roles": ["ADMIN"], "permissions": ["users:manage", "..."],
      "companies": [{ "id": 1, "name": "Ophelia Demo", "code": "DEMO" }],
      "defaultCompanyId": 1
    }
  }
}
```

Token sudah membawa `companyId` aktif. Untuk override per-request, kirim header
`X-Company-Id`. Ganti company aktif via `POST /api/companies/:id/set-default`
atau `POST /api/auth/switch-company/:id` (token baru).

## Menggunakan token

Sertakan di header setiap request ke endpoint yang dilindungi:

```powershell
curl http://localhost:3000/api/companies/me `
  -H "Authorization: Bearer eyJhbGciOi..."
```

## Detail token

- Algoritma: HS256, secret dari `JWT_SECRET` di `.env`
- Masa berlaku: dari `JWT_EXPIRES_IN` (default `1d`)
- Payload: `{ "id": <userId>, "roles": [...], "permissions": [...], "companyId": <id> }`

## Role & akses

| Role | Hak |
|---|---|
| `USER` | Baca companies & modules miliknya; masuk modul yang ter-install |
| `ADMIN` | Semua akses USER + `users:manage`, `companies:manage`, `modules:manage` |

Role & permission disimpan di tabel `roles`/`permissions` (RBAC), diset saat login
di dalam payload JWT. Jika role berubah, user harus login ulang (atau switch company).
