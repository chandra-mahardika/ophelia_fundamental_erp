/**
 * Logika bisnis user (dipanggil controller). Menegakkan: user harus ada (404),
 * email/username unik (409), roleId valid (400), password di-hash.
 * Tak menyentuh req/res/Prisma-langsung selain via repository (kecuali
 * tabel relasi userRole/role — pola yang diizinkan untuk modul ini).
 */
import bcrypt from "bcryptjs";
import { prismaAuth as prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import * as userRepository from "./user.repository";

/** Daftar user + roles (terfilter). Dipanggil controller.getAll. */
export const getAll = (filters: { search?: string; role?: string }) =>
  userRepository.findAll(filters);

/** Ambil satu user atau 404. Dipakai controller.getById/update/remove/setRoles. */
export const getById = async (id: number) => {
  const user = await userRepository.findById(id);
  if (!user) throw new ApiError(404, "User tidak ditemukan");
  return user;
};

/**
 * Update user: cek unik email/username, hash password bila diisi,
 * ganti single-role bila `roleId` diisi. Dipanggil controller.update.
 */
export const update = async (
  id: number,
  data: {
    name?: string;
    email?: string;
    username?: string;
    password?: string;
    roleId?: number;
  },
) => {
  await getById(id);

  if (data.email) {
    const clash = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id } },
      select: { id: true },
    });
    if (clash) throw new ApiError(409, "Email sudah dipakai user lain");
  }
  if (data.username) {
    const clash = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id } },
      select: { id: true },
    });
    if (clash) throw new ApiError(409, "Username sudah dipakai user lain");
  }

  const { roleId, password, ...rest } = data;
  const payload: { name?: string; email?: string; username?: string; password?: string } = {
    ...rest,
  };
  if (password) payload.password = await bcrypt.hash(password, 10);

  if (roleId) {
    await prisma.userRole.deleteMany({ where: { userId: id } });
    await prisma.userRole.create({ data: { userId: id, roleId } });
  }
  return userRepository.update(id, payload);
};

/** Hapus user (harus ada). Dipanggil controller.remove. */
export const remove = async (id: number) => {
  await getById(id);
  return userRepository.remove(id);
};

/**
 * Buat user baru (oleh admin): hash password, cek unik, set role(s),
 * tambahkan ke company default (bila disediakan).
 * Dipanggil controller.create.
 */
export const create = async (data: {
  name: string;
  username: string;
  email: string;
  password: string;
  roleIds?: number[];
  companyId?: number;
}) => {
  // Cek unik
  const emailClash = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
  if (emailClash) throw new ApiError(409, "Email sudah dipakai user lain");
  const usernameClash = await prisma.user.findUnique({ where: { username: data.username }, select: { id: true } });
  if (usernameClash) throw new ApiError(409, "Username sudah dipakai user lain");

  // Validasi role
  if (data.roleIds && data.roleIds.length > 0) {
    const found = await prisma.role.findMany({
      where: { id: { in: data.roleIds } },
      select: { id: true },
    });
    if (found.length !== data.roleIds.length) {
      throw new ApiError(400, "Ada roleId yang tidak dikenal");
    }
  }

  // Validasi company
  if (data.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
      select: { id: true, isActive: true },
    });
    if (!company || !company.isActive) throw new ApiError(400, "Company tidak valid / tidak aktif");
  }

  // Hash password
  const hashed = await bcrypt.hash(data.password, 10);

  // Buat user + relasi dalam transaksi
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        password: hashed,
      },
      select: { id: true, name: true, username: true, email: true },
    });

    // Role(s)
    if (data.roleIds && data.roleIds.length > 0) {
      await tx.userRole.createMany({
        data: data.roleIds.map((roleId) => ({ userId: user.id, roleId })),
      });
    } else {
      // Default role USER
      const defaultRole = await tx.role.findUnique({ where: { name: "USER" }, select: { id: true } });
      if (defaultRole) {
        await tx.userRole.create({ data: { userId: user.id, roleId: defaultRole.id } });
      }
    }

    // Company membership
    if (data.companyId) {
      await tx.userCompany.create({
        data: { userId: user.id, companyId: data.companyId, isDefault: true },
      });
    }

    return user;
  });
};

/** Ganti seluruh role user sekaligus (hapus + buat ulang). Dipanggil controller.setRoles. */
export const setRoles = async (id: number, roleIds: number[]) => {
  await getById(id);
  if (roleIds.length > 0) {
    const found = await prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true },
    });
    if (found.length !== roleIds.length) {
      throw new ApiError(400, "Ada roleId yang tidak dikenal");
    }
  }
  await prisma.userRole.deleteMany({ where: { userId: id } });
  if (roleIds.length > 0) {
    await prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId: id, roleId })),
    });
  }
  return getById(id);
};
