/**
 * Repository user: SATU-SATUNYA tempat query tabel `users`.
 * Selalu `select` tanpa `password`. Dipanggil oleh user.service.ts.
 */
import { prismaAuth as prisma } from "../../config/prisma";

/** Kolom publik user (tanpa password) + roles, dipakai findAll/findById/update. */
const selectWithoutPassword = {
  id: true,
  name: true,
  username: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  userRoles: {
    select: { role: { select: { id: true, name: true } } },
  },
} as const;

/** Filter GET /api/users: `search` cocok ke nama/username/email; `role` = id/nama role. */
export interface UserFilters {
  search?: string;
  /** id role (angka) atau nama role */
  role?: string;
}

/** Daftar user + roles, terfilter opsional. Dipakai service.getAll. */
export const findAll = (filters: UserFilters = {}) => {
  const { search, role } = filters;
  const roleId = role && /^\d+$/.test(role) ? Number(role) : undefined;
  return prisma.user.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search } },
                { username: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {},
        role
          ? {
              userRoles: {
                some: roleId ? { roleId } : { role: { name: role } },
              },
            }
          : {},
      ],
    },
    select: selectWithoutPassword,
    orderBy: { id: "asc" },
  });
};

/** Ambil satu user publik. Dipakai service.getById/setRoles/remove. */
export const findById = (id: number) =>
  prisma.user.findUnique({ where: { id }, select: selectWithoutPassword });

/** Update kolom user (password sudah di-hash di service). Dipakai service.update. */
export const update = (
  id: number,
  data: { name?: string; email?: string; username?: string; password?: string },
) => prisma.user.update({ where: { id }, data, select: selectWithoutPassword });

/** Hapus user + relasinya (cascade di DB). Dipakai service.remove. */
export const remove = async (id: number) => {
  // Hapus relasi dulu (user_roles, user_companies) agar FK tidak konflik
  await prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId: id } }),
    prisma.userCompany.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);
};
