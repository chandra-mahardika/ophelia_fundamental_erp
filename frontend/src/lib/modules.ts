/**
 * Definisi modul frontend (sisi UI).
 * - `code`: harus sama persis dengan `modules.code` di DB.
 * - `menus`: menu horizontal yang tampil di header saat di dalam modul.
 * - `tint`/`solid`: class Tailwind untuk warna kartu/ikon di Panel.
 * Tambah entry di sini + halaman di App.svelte saat buat modul baru.
 */
export interface ModuleMenu {
  id: string;
  label: string;
}

export interface ModuleDef {
  code: string;
  name: string;
  subtitle: string;
  /** nama ikon di Icon.svelte */
  icon: string;
  /** pasangan tint pastel + warna ikon */
  tint: string;
  solid: string;
  menus: ModuleMenu[];
}

/**
 * Katalog modul bisnis (UI). Tambah entry di sini saat buat modul baru,
 * lalu buat halaman + cabang render di App.svelte.
 * `tint`/`solid` = class Tailwind untuk warna kartu/ikon di Panel.
 */
export const MODULE_DEFS: Record<string, ModuleDef> = {
  inventory: {
    code: "inventory",
    name: "Inventory",
    subtitle: "Produk & Stok",
    icon: "box",
    tint: "bg-blue-100 dark:bg-blue-900",
    solid: "text-blue-700 dark:text-blue-300",
    menus: [{ id: "dashboard", label: "Dashboard" }],
  },
  sales: {
    code: "sales",
    name: "Sales",
    subtitle: "Penjualan",
    icon: "cart",
    tint: "bg-green-100 dark:bg-green-900",
    solid: "text-green-700 dark:text-green-300",
    menus: [
      { id: "dashboard", label: "Dashboard" },
      { id: "orders", label: "Pesanan" },
    ],
  },
  accounting: {
    code: "accounting",
    name: "Accounting",
    subtitle: "Keuangan",
    icon: "ledger",
    tint: "bg-yellow-100 dark:bg-yellow-900",
    solid: "text-yellow-700 dark:text-yellow-300",
    menus: [
      { id: "dashboard", label: "Dashboard" },
      { id: "journal", label: "Jurnal" },
    ],
  },
  hr: {
    code: "hr",
    name: "HR",
    subtitle: "Karyawan",
    icon: "users",
    tint: "bg-purple-100 dark:bg-purple-900",
    solid: "text-purple-700 dark:text-purple-300",
    menus: [
      { id: "dashboard", label: "Dashboard" },
      { id: "employees", label: "Karyawan" },
    ],
  },
};

/** Menu horizontal di header saat di halaman sistem (Companies/Users/Roles/Modules). */
export const SYSTEM_MENUS: ModuleMenu[] = [
  { id: "companies", label: "Companies" },
  { id: "users", label: "Users" },
  { id: "roles", label: "Roles" },
  { id: "modules", label: "Modul" },
];

/**
 * Ambil definisi modul by code (fallback ke generic bila tidak ditemukan).
 * Dipakai Panel (kartu) + Header (menu) + PlaceholderPage.
 */
export function moduleDef(code: string): ModuleDef {
  return (
    MODULE_DEFS[code] ?? {
      code,
      name: code,
      subtitle: "Modul",
      icon: "grid",
      tint: "bg-gray-100 dark:bg-gray-700",
      solid: "text-gray-600 dark:text-gray-300",
      menus: [{ id: "dashboard", label: "Dashboard" }],
    }
  );
}
