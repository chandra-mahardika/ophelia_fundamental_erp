# Konvensi

## Penamaan

| Item | Konvensi | Contoh |
|---|---|---|
| File/folder | kebab/case mengikuti nama modul, peran PascalCase-ish | `user.routes.ts`, `auth.middleware.ts` |
| Nama modul | jamak/singular konsisten dengan domain | `users`, `companies`, `auth` |
| Variabel & fungsi | camelCase | `getById`, `userService` |
| Tipe/interface/class | PascalCase | `ApiError`, `AuthRequest` |
| Enum | UPPER_CASE | `ADMIN`, `USER` |
| Konstanta env | UPPER_SNAKE_CASE di `.env`, camelCase saat dipakai | `DATABASE_URL` → `env.port` |

## Aturan Penulisan Kode

1. **Satu file per peran** di tiap modul: `xxx.routes.ts`, `xxx.controller.ts`, `xxx.service.ts`, `xxx.repository.ts`, `xxx.validation.ts`. Modul sederhana seperti `auth` boleh tanpa repository (query Prisma di service).
2. **Validasi input selalu di route** via `validate(schema)` — schema Zod diletakkan di `xxx.validation.ts`.
3. **Error bisnis** dilempar dengan `throw new ApiError(statusCode, pesan)` dari service; jangan `res.status(...)` dari service.
4. **Password tidak boleh keluar**: repository user selalu pakai `select` tanpa field `password`.
5. **Autentikasi** pakai middleware `authenticate`, **otorisasi** pakai `requirePermission("...")` dan/atau `authorize("ADMIN", ...)`. Data user (`{ id, roles, permissions, companyId }`) ada di `(req as AuthRequest).user`. Endpoint transaksional wajib `resolveCompany` (+ `requireModule("...")`), dan semua query di-scope `companyId`.
6. Handler Express 5-nya **async** — tidak perlu try/catch manual untuk meneruskan error; cukup biarkan throw, error handler global yang mengurus. `try/catch` hanya untuk error yang ingin ditangani spesifik.
7. Jangan taruh query Prisma di controller — selalu lewat `service` → `repository`.
8. Jangan akses `req`/`res` di service/repository.

## Cara Menambah Modul Baru (mis. `categories`)

1. Buat folder `src/modules/categories/`.
2. Tambah model di `prisma/transactions/schema.prisma` (wajib `companyId` + index), lalu `npm.cmd run prisma:migrate:tx` + generate client.
3. Buat file berurutan: `category.validation.ts` → `category.repository.ts` → `category.service.ts` → `category.controller.ts` → `category.routes.ts` (pasang `authenticate, resolveCompany, requireModule("...")`).
4. Daftarkan route di `src/app.ts`: `app.use("/api/categories", categoryRoutes);`
5. Ikuti konvensi di atas (validate di route, ApiError di service, repository membungkus Prisma).

## Checklist Kode

- [ ] Input divalidasi dengan Zod di route
- [ ] Controller hanya memanggil service
- [ ] Aturan bisnis di service, melempar `ApiError`
- [ ] Query DB hanya di repository
- [ ] Endpoint sensitif dilindungi `authenticate` + `authorize`
- [ ] `npm run build` / `tsc --noEmit` lolos tanpa error
