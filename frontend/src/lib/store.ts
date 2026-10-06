/**
 * State global aplikasi (Svelte stores).
 * - Hanya tempat yg boleh baca/tulis `localStorage` secara langsung.
 * - Akses API & UI hanya lewat store ini (bukan `localStorage` langsung).
 * - `view` mengontrol navigasi: panel | system | module.
 * - `theme` diterapkan ke `<html>` sejak load (tanpa flash).
 */
import { writable, derived } from "svelte/store";
import type { User, Company, AppModule } from "./api";

/**
 * Navigasi aplikasi:
 * - panel: halaman grid kartu modul (landing setelah login).
 * - system: halaman sistem (companies/users/roles/modules).
 * - module: di dalam modul bisnis (inventory/sales/etc.).
 */
export type View =
  | { name: "panel" }
  | { name: "system"; page: "companies" | "users" | "roles" | "modules" }
  | { name: "module"; code: string; page: string };

/** Tema aplikasi (`light` | `dark`). */
export type Theme = "light" | "dark";

/** Baca aman dari localStorage (try/catch untuk private browsing / quota). */
function stored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Aplikasi tema ke `<html>` (class `dark`). Dipakai saat load & toggle. */
function applyTheme(t: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", t === "dark");
  }
}

/** Baca preferensi tersimpan → terapkan segera (sebelum paint → no flash). */
const initialTheme: Theme = stored("ophe_theme") === "dark" ? "dark" : "light";
applyTheme(initialTheme);

/** Tema aktif (`light` | `dark`). Persist ke localStorage + class `dark` di <html>. */
export const theme = writable<Theme>(initialTheme);

/** Toggle light ↔ dark. Persist + terapkan ke DOM. */
export function toggleTheme() {
  theme.update((t) => {
    const next: Theme = t === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("ophe_theme", next);
    } catch {
      /* abaikan */
    }
    applyTheme(next);
    return next;
  });
}

/** Token JWT (kosong = belum login). Persist ke localStorage. */
export const token = writable<string>(stored("ophe_token") ?? "");

/** User login (null = belum login). Persist ke localStorage. */
export const user = writable<User | null>(
  stored("ophe_user") ? (JSON.parse(stored("ophe_user")!) as User) : null,
);

/** Company milik user login (diisi pasca-login via `saveSession`). */
export const companies = writable<Company[]>([]);

/** Company aktif (dipilih via header/X-Company-Id). Persist ke localStorage. */
export const activeCompanyId = writable<number | null>(
  stored("ophe_company_id") ? Number(stored("ophe_company_id")) : null,
);

/** Modul ter-install di company aktif (di-refresh pas ganti company). */
export const installedModules = writable<AppModule[]>([]);

/** Navigasi saat ini (panel | system | module). Default = panel. */
export const view = writable<View>({ name: "panel" });

/** Company aktif (gabungan companies + activeCompanyId). Reactive. */
export const activeCompany = derived(
  [companies, activeCompanyId],
  ([$companies, $id]) => $companies.find((c) => c.id === $id) ?? null,
);

/** True bila token ada (login). Dipakai guard di App.svelte. */
export const isLoggedIn = derived(token, ($t) => $t.length > 0);

/**
 * Simpan sesi pasca-login/register/switch-company.
 * Sinkronkan localStorage + semua store sekaligus (atomic).
 */
export function saveSession(t: string, u: User, companyId: number | null) {
  localStorage.setItem("ophe_token", t);
  localStorage.setItem("ophe_user", JSON.stringify(u));
  if (companyId) localStorage.setItem("ophe_company_id", String(companyId));
  token.set(t);
  user.set(u);
  companies.set(u.companies ?? []);
  activeCompanyId.set(companyId);
}

/**
 * Ganti company aktif (dipanggil UI company switcher).
 * Update localStorage + store + token baru bila disediakan (dari switchCompany).
 */
export function setActiveCompany(id: number, t?: string) {
  localStorage.setItem("ophe_company_id", String(id));
  activeCompanyId.set(id);
  if (t) {
    localStorage.setItem("ophe_token", t);
    token.set(t);
  }
}

/** Hapus seluruh sesi (logout). Reset semua store ke default. */
export function logout() {
  localStorage.removeItem("ophe_token");
  localStorage.removeItem("ophe_user");
  localStorage.removeItem("ophe_company_id");
  token.set("");
  user.set(null);
  companies.set([]);
  activeCompanyId.set(null);
  installedModules.set([]);
  view.set({ name: "panel" });
}

/** Masuk ke modul bisnis (setelah klik kartu di Panel). */
export function enterModule(code: string, page: string) {
  view.set({ name: "module", code, page });
}

/** Kembali ke Panel (grid kartu modul). Dipakai tombol ← Panel di header. */
export function backToPanel() {
  view.set({ name: "panel" });
}
