/**
 * Logika bisnis role (dipanggil controller). Menegakkan: role harus ada (404),
 * nama unik (409), permissionId valid (400), role terpakai tak bisa dihapus (400).
 * Hapus role membersihkan `role_permissions` dalam transaksi.
 */
import { prismaAuth as prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import * as roleRepository from "./role.repository";

/** Daftar role. Dipanggil controller.getAll. */
export const getAll = () => roleRepository.findAll();

/** Ambil satu role atau 404. Dipakai controller.getById/update/remove/setPermissions. */
export const getById = async (id: number) => {
  const role = await roleRepository.findById(id);
  if (!role) throw new ApiError(404, "Role tidak ditemukan");
  return role;
};

/** Katalog permission. Dipanggil controller.getPermissions. */
export const getPermissions = () => roleRepository.listPermissions();

/** Buat role (nama unik). Dipanggil controller.create. */
export const create = async (name: string) => {
  const exists = await prisma.role.findUnique({ where: { name } });
  if (exists) throw new ApiError(409, "Nama role sudah dipakai");
  return roleRepository.create(name);
};

/** Ubah nama role (unik). Dipanggil controller.update. */
export const update = async (id: number, name: string) => {
  await getById(id);
  const exists = await prisma.role.findFirst({
    where: { name, NOT: { id } },
  });
  if (exists) throw new ApiError(409, "Nama role sudah dipakai");
  return roleRepository.update(id, name);
};

/** Hapus role + relasi permission-nya (transaksi). Ditolak bila masih dipakai user. */
export const remove = async (id: number) => {
  await getById(id);
  const used = await roleRepository.countUsers(id);
  if (used > 0) {
    throw new ApiError(400, `Role masih dipakai ${used} user, kosongkan dulu`);
  }
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: id } }),
    prisma.role.delete({ where: { id } }),
  ]);
  return { id };
};

/** Ganti permission role (validasi id dulu). Dipanggil controller.setPermissions. */
export const setPermissions = async (id: number, permissionIds: number[]) => {
  await getById(id);
  if (permissionIds.length > 0) {
    const found = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
      select: { id: true },
    });
    if (found.length !== permissionIds.length) {
      throw new ApiError(400, "Ada permissionId yang tidak dikenal");
    }
  }
  return roleRepository.setPermissions(id, permissionIds);
};
