/**
 * Repository role: SATU-SATUNYA tempat query tabel `roles`/`permissions`/
 * `role_permissions`. Selalu sertakan permissions + userCount untuk UI RBAC.
 * Dipanggil oleh role.service.ts.
 */
import { prismaAuth as prisma } from "../../config/prisma";

/** Include standar role: daftar permission + jumlah user pemakai. */
const roleInclude = {
  permissions: { include: { permission: true } },
  _count: { select: { userRoles: true } },
} as const;

/** Ubah role Prisma → objek publik untuk response (`{ id, name, userCount, permissions }`). */
const toPublic = (r: any) => ({
  id: r.id,
  name: r.name,
  userCount: r._count?.userRoles ?? 0,
  permissions: (r.permissions ?? []).map((rp: any) => ({
    id: rp.permission.id,
    name: rp.permission.name,
  })),
});

/** Daftar semua role + permissions. Dipakai service.getAll. */
export const findAll = async () => {
  const roles = await prisma.role.findMany({
    include: roleInclude,
    orderBy: { name: "asc" },
  });
  return roles.map(toPublic);
};

/** Ambil satu role publik atau null. Dipakai service.getById/setPermissions. */
export const findById = async (id: number) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: roleInclude,
  });
  return role ? toPublic(role) : null;
};

/** Buat role baru. Dipakai service.create (setelah cek duplikat nama). */
export const create = async (name: string) => {
  const role = await prisma.role.create({
    data: { name },
    include: roleInclude,
  });
  return toPublic(role);
};

/** Ubah nama role. Dipakai service.update. */
export const update = async (id: number, name: string) => {
  const role = await prisma.role.update({
    where: { id },
    data: { name },
    include: roleInclude,
  });
  return toPublic(role);
};

/** Hapus role (relasi permission dibersihkan di service.remove). */
export const remove = async (id: number) => prisma.role.delete({ where: { id } });

/** Hitung user pemakai role (proteksi hapus). Dipakai service.remove. */
export const countUsers = (id: number) =>
  prisma.userRole.count({ where: { roleId: id } });

/** Ganti seluruh permission role (hapus + buat ulang). Dipakai service.setPermissions. */
export const setPermissions = async (roleId: number, permissionIds: number[]) => {
  await prisma.rolePermission.deleteMany({ where: { roleId } });
  if (permissionIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
    });
  }
  return findById(roleId);
};

/** Katalog semua permission (untuk checklist UI). Dipakai service.getPermissions. */
export const listPermissions = () =>
  prisma.permission.findMany({ orderBy: { name: "asc" } });
