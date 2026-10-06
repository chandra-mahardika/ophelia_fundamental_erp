/**
 * Tipe respons API (dipakai seluruh aplikasi).
 * Hanya data yang dibutuhkan UI — password tidak pernah keluar dari backend.
 */
export interface Company {
  id: number;
  name: string;
  code: string;
  isDefault?: boolean;
  address?: string;
  phone?: string;
  email?: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  roles: string[];
  permissions?: string[];
  companies: Company[];
  defaultCompanyId: number | null;
}

export interface AppModule {
  code: string;
  name: string;
  description?: string;
  version: string;
  isInstalled?: boolean;
  installedAt?: string;
}

export interface Role {
  id: number;
  name: string;
  userCount: number;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
}

export interface ManagedUser {
  id: number;
  name: string;
  username: string;
  email: string;
  userRoles: { role: { id: number; name: string } }[];
}

/**
 * Wrapper `fetch` standar untuk semua panggilan API.
 * - Basis path: `/api` (relatif → pakai proxy Vite di dev, nginx di prod).
 * - Otomatis sisipkan `Authorization: Bearer <token>` + `X-Company-Id` bila ada.
 * - Throw `Error(message)` bila response tidak OK → ditangkap UI.
 */
const getToken = () => localStorage.getItem("ophe_token") ?? "";
const getCompanyId = () => localStorage.getItem("ophe_company_id") ?? "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const companyId = getCompanyId();
  if (companyId) headers["X-Company-Id"] = companyId;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message ?? `Request gagal (${res.status})`);
  return body as T;
}

/**
 * Kumpulan endpoint terkelompok per domain (dipakai komponen via `api.xxx()`).
 * Semua fungsi mengembalikan Promise yang resolve ke `{ message?, data }`.
 */
export const api = {
  login: (username: string, password: string) =>
    request<{ message: string; data: { token: string; user: User } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  register: (data: { name: string; username: string; email: string; password: string }) =>
    request<{ message: string; data: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  switchCompany: (id: number) =>
    request<{ message: string; data: { token: string; companyId: number } }>(
      `/auth/switch-company/${id}`,
      { method: "POST" },
    ),

  myCompanies: () => request<{ data: Company[] }>("/companies/me"),
  createCompany: (data: { name: string; code: string }) =>
    request<{ message: string; data: Company }>("/companies", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  setDefaultCompany: (id: number) =>
    request<{ message: string; data: { token: string; companyId: number } }>(
      `/companies/${id}/set-default`,
      { method: "POST" },
    ),

  modules: (companyId: number) =>
    request<{ data: AppModule[] }>(`/modules/company/${companyId}`),
  catalog: () => request<{ data: AppModule[] }>("/modules"),
  installModule: (companyId: number, code: string) =>
    request<{ message: string }>(`/modules/company/${companyId}/${code}/install`, {
      method: "POST",
    }),
  uninstallModule: (companyId: number, code: string) =>
    request<{ message: string }>(`/modules/company/${companyId}/${code}/uninstall`, {
      method: "POST",
    }),

  users: (filters: { search?: string; role?: string } = {}) => {
    const q = new URLSearchParams();
    if (filters.search) q.set("search", filters.search);
    if (filters.role) q.set("role", filters.role);
    const suffix = q.toString() ? `?${q.toString()}` : "";
    return request<{ data: ManagedUser[] }>(`/users${suffix}`);
  },
  updateUser: (
    id: number,
    data: { name?: string; username?: string; email?: string; password?: string },
  ) =>
    request<{ message: string; data: ManagedUser }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteUser: (id: number) =>
    request<{ message: string }>(`/users/${id}`, { method: "DELETE" }),
  setUserRoles: (id: number, roleIds: number[]) =>
    request<{ message: string; data: ManagedUser }>(`/users/${id}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roleIds }),
    }),

  roles: () => request<{ data: Role[] }>("/roles"),
  permissions: () => request<{ data: Permission[] }>("/roles/permissions"),
  createRole: (name: string) =>
    request<{ message: string; data: Role }>("/roles", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  updateRole: (id: number, name: string) =>
    request<{ message: string; data: Role }>(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  deleteRole: (id: number) =>
    request<{ message: string }>(`/roles/${id}`, { method: "DELETE" }),
  setRolePermissions: (id: number, permissionIds: number[]) =>
    request<{ message: string; data: Role }>(`/roles/${id}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissionIds }),
    }),
  createUser: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    roleIds?: number[];
    companyId?: number;
  }) =>
    request<{ message: string; data: ManagedUser }>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};