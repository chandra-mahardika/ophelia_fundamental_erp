# Dokumentasi Teknis Ophelia Fundamental ERP

**Author:** Chandra Mahardika — chandra.libertania@gmail.com

**Lisensi:** MIT

Dokumentasi pengembangan sistem: codebase, arsitektur, desain, konvensi,
cara menjalankan, dan deploy. Berlaku untuk seluruh workspace `ophelia_express/`
(`backend/` + `frontend/`).

> Catatan: `backend/doc/` adalah dokumentasi warisan boilerplate (sebagian sudah
> diselaraskan). Direktori `dokumentasi/` ini adalah acuan utama.

## Daftar Isi

| File | Isi |
|---|---|
| [01-gambaran-umum.md](./01-gambaran-umum.md) | Visi ERP, konsep multi-company & modular, tech stack |
| [02-menjalankan-sistem.md](./02-menjalankan-sistem.md) | Prasyarat, install, env, migrasi, seed, dev server, troubleshooting |
| [03-arsitektur-backend.md](./03-arsitektur-backend.md) | Struktur, layered + modular monolith, middleware, JWT, menambah modul |
| [04-database.md](./04-database.md) | Skema 2 database, relasi, workflow migrasi & seed |
| [05-api-reference.md](./05-api-reference.md) | Daftar endpoint + contoh request/response |
| [06-arsitektur-frontend.md](./06-arsitektur-frontend.md) | Struktur, navigasi Panel/modul, store, API client, menambah halaman |
| [07-desain-style.md](./07-desain-style.md) | Design system: font, warna, komponen, dark mode |
| [08-konvensi.md](./08-konvensi.md) | Konvensi penamaan & pola kode backend + frontend |
| [09-rbac-permissions.md](./09-rbac-permissions.md) | Matriks permission, peran, dan cara kerja token |
| [10-deploy.md](./10-deploy.md) | Build production, migrasi deploy, PM2, nginx, checklist |

## Mulai Cepat

```powershell
# backend (http://localhost:3000)
cd backend
npm.cmd install
npm.cmd run prisma:migrate
npm.cmd run db:seed
npm.cmd run dev

# frontend (http://localhost:5173)
cd frontend
npm.cmd install
npm.cmd run dev
```

Login dev: `admin` / `password123` (atau `user` / `password123).
