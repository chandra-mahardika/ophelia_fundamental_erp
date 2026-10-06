# 06 — Arsitektur Frontend

Lokasi: `frontend/src/`. Svelte 5 (runes: `$state`, `$derived`, `$effect`,
`$props`) + Vite + Tailwind 4. Validasi: `npm.cmd run check`
(`svelte-check` + `tsc`).

## Struktur

```
src/
├── main.ts                 # mount App
├── app.css                 # tema + class komponen (lihat 07)
├── App.svelte              # Login vs shell; routing berdasar store `view`
└── lib/
    ├── api.ts              # fetch wrapper + tipe + endpoint per domain
    ├── store.ts            # token, user, companies, activeCompanyId,
    │                       # installedModules, view, theme + helpers
    ├── modules.ts          # MODULE_DEFS (nama, ikon, tint, menu/modul) + SYSTEM_MENUS
    ├── Header.svelte       # header Flowbite stacked: logo, switcher company,
    │                       # menu horizontal (dalam modul), bell, theme, apps, avatar
    ├── Panel.svelte        # landing setelah login: grid kartu modul/sistem
    ├── Login.svelte        # masuk/daftar + eye toggle password
    ├── Users.svelte        # tabel + filter + modal edit + role inline
    ├── Roles.svelte        # CRUD role + checklist permission
    ├── Companies.svelte    # daftar + buat + aktifkan company
    ├── Modules.svelte      # install/uninstall per company aktif
    ├── PlaceholderPage.svelte  # home modul yang halamannya belum ada
    ├── Select.svelte       # dropdown custom standar (lihat 07)
    └── Icon.svelte         # set ikon SVG (box, cart, ledger, users, ...)
```

## Navigasi (`store.view`)

```ts
type View =
  | { name: "panel" }                                        // grid kartu modul
  | { name: "system"; page: "companies"|"users"|"roles"|"modules" }
  | { name: "module"; code: string; page: string };           // menu dari MODULE_DEFS
```

- `enterModule(code, page)` / `backToPanel()` / `view.set(...)` untuk pindah.
- Header selalu tampil; menu horizontal hanya di dalam modul/sistem
  (di Panel hanya header). Menu mobile via hamburger.
- `activeCompanyId` → dikirim sebagai header `X-Company-Id` oleh `api.ts`;
  ganti company = `api.switchCompany` + `setActiveCompany` (token baru).
- `installedModules` di-refresh tiap ganti company (effect di `App.svelte`);
  menu & kartu mengikuti modul ter-install.
- Theme `light|dark` di `localStorage["ophe_theme"]`, diterapkan sebagai
  class `dark` di `<html>` sejak `store.ts` dimuat (tanpa flash).

## API Client (`api.ts`)

`request(path, options)`: basis `/api` (relatif → memakai proxy Vite saat dev),
sisip `Authorization` + `X-Company-Id` otomatis, throw `Error(message)` bila
`!res.ok`. Objek `api` dikelompokkan per domain: `login/register/switchCompany`,
`myCompanies/createCompany/setDefaultCompany`, `modules/catalog/installModule/
uninstallModule`, `users/updateUser/deleteUser/setUserRoles`,
`roles/permissions/createRole/...`.

## Menambah Halaman / Modul UI

1. Daftarkan metadata di `MODULE_DEFS` (`frontend/src/lib/modules.ts`):
   nama, subtitle, ikon (tambah path di `Icon.svelte` bila baru), tint,
   `menus: [{ id, label }]`.
2. Buat komponen halaman (contoh: `SalesOrders.svelte`) memakai class tema
   (lihat 07) + `api.*` untuk data.
3. Tambahkan cabang render di `App.svelte` untuk `(code, page)` tersebut.
   Halaman generik bisa pakai `PlaceholderPage` sementara.
4. Elemen form baru: pakai `Select.svelte` untuk dropdown agar konsisten;
   modal mengikuti pola di `Users.svelte` (overlay `bg-gray-900/50` + kartu).
