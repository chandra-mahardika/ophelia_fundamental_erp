# 08 — Konvensi

## Umum

- Bahasa UI, pesan API, dan dokumen: **Indonesia**. Kode (identifier): Inggris.
- Tabel DB: `snake_case` jamak + `@@map`; model Prisma: PascalCase singular.
- Permission: `resource:aksi` huruf kecil (`users:manage`, `roles:manage`).
- Nama role: kapital (`ADMIN`, `USER`, `MANAGER`).

## Backend (`backend/src`)

- Satu file per peran per modul: `xxx.routes.ts`, `xxx.controller.ts`,
  `xxx.service.ts`, `xxx.repository.ts`, `xxx.validation.ts`.
- `routes`: definisi endpoint + rantai middleware saja.
- `controller`: baca `req`, panggil service, tulis `res` (jangan query Prisma).
- `service`: logika bisnis + `throw new ApiError(status, pesan)` (jangan sentuh `req`/`res`).
- `repository`: query Prisma saja (jangan logika bisnis). User: selalu `select`
  tanpa `password`.
- `validation`: schema Zod, dipasang via `validate(schema)` di route.
- Proteksi: `authenticate` → `requirePermission(...)` → (`resolveCompany`,
  `requireModule(...)` untuk transaksional). Query transaksional selalu filter
  `companyId`; `findById` via `findFirst({ where: { id, companyId } })`.
- Jangan edit `src/generated/*` dan file migrasi yang sudah di-apply.

## Frontend (`frontend/src`)

- Svelte 5 runes: state `$state`, turunan `$derived`, efek `$effect`, props
  `$props`. Jangan `let` biasa untuk state reaktif di file ber-runes.
- Halaman di `lib/*.svelte` (PascalCase); utilitas `camelCase.ts`.
- State global hanya di `store.ts`; akses API hanya lewat `api.ts`
  (jangan `fetch` langsung di komponen).
- Styling: class tema `app.css` + utility Tailwind; semua komponen visual
  punya varian `dark:`. Ikon via `Icon.svelte`; dropdown via `Select.svelte`.
- Teks tombol/aksi konsisten: Simpan, Batal, Tambah, Edit, Hapus, Masuk, Install.

## Menambah Modul ERP (checklist)

- [ ] Schema tx: model + `companyId` + index + `@@map`; migrasi + generate
- [ ] Backend: 5 file modul + route `authenticate, resolveCompany, requireModule`
- [ ] Daftarkan route di `app.ts`; permission baru di seed bila perlu
- [ ] Frontend: `MODULE_DEFS` + halaman + cabang `App.svelte`
- [ ] `npm.cmd run build` (backend) + `check` & `build` (frontend) hijau
