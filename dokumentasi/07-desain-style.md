# 07 — Desain & Style

Acuan visual: **Flowbite Admin Dashboard** varian **stacked layout**
(header + menu horizontal). Implementasi di `frontend/src/app.css`
(Tailwind v4: `@theme` + `@custom-variant dark` + `@layer components`).

## Fondasi

| Aspek | Nilai |
|---|---|
| Font | Inter (Google Fonts, `index.html`), `--font-sans` |
| Primer | Biru Flowbite: `primary-50 #eff6ff` … `primary-700 #1d4ed8` … `primary-900 #1e3a8a` (token `--color-primary-*` → class `bg-primary-700` dsb.) |
| Netral | Gray bawaan Tailwind (`gray-50` latar, `gray-200/300` garis, `gray-900` teks) |
| Dark mode | Class `dark` di `<html>`; semua komponen punya varian `dark:` |
| Ikon | SVG stroke 1.6 di `Icon.svelte` (bukan emoji) |

## Class Komponen (`app.css`)

| Class | Pakai untuk |
|---|---|
| `.card` | Kartu putih `rounded-lg border shadow-sm p-4 sm:p-6` |
| `.page-title` / `.page-subtitle` | Judul + subjudul halaman |
| `.label` / `.input` | Label + input/text bawaan Flowbite |
| `.select` | Select native bila perlu (metrik = `.input`, panah disembunyikan) |
| `.btn-primary` / `.btn-default` / `.btn-danger` | Tombol biru / putih-border / merah kecil |
| `.link` | Teks aksi `primary-600` + underline |
| `.menu-link` (+ `-active`) / `.menu-link-mobile` | Menu horizontal header / mobile |
| `.icon-btn` | Tombol ikon header (bell, apps, theme, close) |
| `.dropdown` / `.dropdown-item` / `.dropdown-header` | Panel dropdown |
| `.table-wrap` / `.table` (+ `thead/th/td`) | Tabel CRUD Flowbite |
| `.badge` + `-green/-blue/-gray/-red` | Badge status |
| `.alert-error` / `.alert-success` | Pesan feedback |

Aturan Tailwind v4: **jangan `@apply` antar custom class** (error build
`Cannot apply unknown utility class`) — duplikasi utility-nya bila perlu
komposisi (contoh preseden: `.module-card` lama di-inline).

## Komponen Standar

- **`Select.svelte`** — dropdown custom pengganti `<select>` native (popup
  bawaan browser tak bisa di-style). Trigger + panel `rounded-lg border
  shadow-lg`, opsi hover, centang + `primary-700` untuk terpilih, tutup via
  klik-luar/Escape, ARIA listbox. Props: `value(bind)`, `options[]`,
  `label`, `placeholder`, `onchange`.
- **Modal** — pola `Users.svelte`: overlay `fixed inset-0 bg-gray-900/50`,
  kartu `max-w-2xl rounded-lg border shadow-xl`, header + tombol X (`.icon-btn`),
  form, footer Batal/Simpan.
- **Password + mata** — pola `Login.svelte`/`Users.svelte`: wrapper `relative`,
  input `pr-11`, tombol eye/eyeOff (`Icon`).

## Menambah Style Baru

1. Token warna/font baru → `@theme` (`--color-...`, `--font-...`).
2. Varian komponen baru (mis. `.btn-gold`) → `@layer components` + varian `dark:`.
3. Elemen interaktif baru → buat komponen Svelte (jangan inline berulang).
4. Cek: `npm.cmd run check` + `npm.cmd run build`.
