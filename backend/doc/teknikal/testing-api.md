# Testing API

Semua contoh pakai PowerShell `curl` (pakai backtick `` ` `` sebagai pemisah baris).
Ganti `TOKEN` dengan JWT hasil login.

## Register

```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Budi","email":"budi@mail.com","password":"rahasia123"}'
```

## Login

```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"budi@mail.com","password":"rahasia123"}'
```

## Users (butuh token ADMIN)

```powershell
# List
curl http://localhost:3000/api/users -H "Authorization: Bearer TOKEN"

# Detail
curl http://localhost:3000/api/users/1 -H "Authorization: Bearer TOKEN"

# Update
curl -X PUT http://localhost:3000/api/users/1 `
  -H "Authorization: Bearer TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"role":"ADMIN"}'

# Delete
curl -X DELETE http://localhost:3000/api/users/1 -H "Authorization: Bearer TOKEN"
```

## Companies

```powershell
# Company milik user login
curl http://localhost:3000/api/companies/me -H "Authorization: Bearer TOKEN"

# Buat company baru
curl -X POST http://localhost:3000/api/companies `
  -H "Authorization: Bearer TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"name":"PT Maju","code":"MAJU"}'

# Ganti company aktif (token baru)
curl -X POST http://localhost:3000/api/companies/1/set-default -H "Authorization: Bearer TOKEN"
```

## Modules

```powershell
# Katalog modul
curl http://localhost:3000/api/modules -H "Authorization: Bearer TOKEN"

# Modul ter-install di company 1
curl http://localhost:3000/api/modules/company/1 -H "Authorization: Bearer TOKEN"

# Install / uninstall (butuh permission modules:manage)
curl -X POST http://localhost:3000/api/modules/company/1/sales/install -H "Authorization: Bearer TOKEN"
curl -X POST http://localhost:3000/api/modules/company/1/sales/uninstall -H "Authorization: Bearer TOKEN"
```

## Skenario error umum untuk uji coba

| Kasus | Cara uji | Hasil |
|---|---|---|
| Tanpa token | akses `/api/companies/me` tanpa header | 401 |
| Token salah | header `Bearer asal` | 401 |
| Bukan ADMIN | akses `/api/users` pakai token USER | 403 |
| Bukan member | akses `/api/companies/99` milik orang lain | 403 |
| Modul belum install | akses endpoint modul yang belum di-install | 403 |
| Validasi gagal | register tanpa email | 400 + detail Zod |
| Email duplikat | register email yang sama | 409 |
| Data tidak ada | GET `/api/companies/999` | 404 |
