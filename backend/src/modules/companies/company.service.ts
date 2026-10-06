/**
 * Logika bisnis company (dipanggil controller). Menegakkan: company harus ada
 * (404), kode unik (409), akses data dibatasi membership (403 via
 * `findMembership` — gate level service), dan set-default menerbitkan token
 * baru via auth.service.switchCompany.
 */
import { prismaAuth as prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import * as companyRepository from "./company.repository";
import { switchCompany } from "../auth/auth.service";

const DEFAULT_MODULES = ["base", "inventory"];

/** Ubah company Prisma → objek publik (tanpa relasi internal). */
const toPublic = (c: any) => ({
  id: c.id,
  name: c.name,
  code: c.code,
  address: c.address,
  phone: c.phone,
  email: c.email,
  logoUrl: c.logoUrl,
  isActive: c.isActive,
});

/** Daftar company milik user. Dipanggil controller.getMine. */
export const getMine = async (userId: number) => {
  const rows = await companyRepository.findMyCompanies(userId);
  return rows.map((r: any) => ({ ...toPublic(r.company), isDefault: r.isDefault }));
};

/** Detail company + members + modules (hanya bila requester member). */
export const getById = async (id: number, requesterId: number) => {
  const company = await companyRepository.findById(id);
  if (!company) throw new ApiError(404, "Company tidak ditemukan");
  const member = await companyRepository.findMembership(requesterId, id);
  if (!member) throw new ApiError(403, "Tidak punya akses ke company ini");
  return {
    ...toPublic(company),
    members: company.members.map((m: any) => ({ ...m.user, isDefault: m.isDefault })),
    modules: company.modules.map((m: any) => ({
      code: m.moduleCode,
      name: m.module.name,
      isInstalled: m.isInstalled,
      installedAt: m.installedAt,
    })),
  };
};

/**
 * Buat company: kode unik → buat company + daftarkan pembuat sebagai member +
 * install modul dasar. Dipanggil controller.create.
 */
export const create = async (
  data: { name: string; code: string; address?: string; phone?: string; email?: string },
  ownerId: number,
) => {
  const codeExists = await prisma.company.findUnique({ where: { code: data.code } });
  if (codeExists) throw new ApiError(409, "Kode company sudah dipakai");

  const baseModules = await prisma.module.findMany({
    where: { code: { in: DEFAULT_MODULES }, isActive: true },
  });

  const company = await prisma.company.create({
    data: {
      ...data,
      members: { create: { userId: ownerId, isDefault: false } },
      modules: { create: baseModules.map((m) => ({ moduleCode: m.code })) },
    },
  });
  return toPublic(company);
};

/** Update company (harus ada). Dipanggil controller.update. */
export const update = async (id: number, data: any) => {
  await ensureExists(id);
  return toPublic(await companyRepository.update(id, data));
};

/** Tambah user sebagai member (reset default lain bila isDefault). */
export const addMember = async (companyId: number, userId: number, isDefault = false) => {
  await ensureExists(companyId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User tidak ditemukan");
  if (isDefault) {
    await prisma.userCompany.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }
  await companyRepository.addMember(userId, companyId, isDefault);
  return { companyId, userId };
};

/** Hapus membership (user harus member). Dipanggil controller.removeMember. */
export const removeMember = async (companyId: number, userId: number) => {
  await ensureExists(companyId);
  const membership = await companyRepository.findMembership(userId, companyId);
  if (!membership) throw new ApiError(404, "User bukan member company ini");
  await companyRepository.removeMember(userId, companyId);
  return { companyId, userId };
};

/** Ganti company aktif user → kembalikan token baru (via auth.switchCompany). */
export const setDefault = async (userId: number, companyId: number) => {
  const membership = await companyRepository.findMembership(userId, companyId);
  if (!membership) throw new ApiError(403, "Tidak punya akses ke company ini");
  await companyRepository.setDefault(userId, companyId);
  return switchCompany(userId, companyId);
};

const ensureExists = async (id: number) => {
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) throw new ApiError(404, "Company tidak ditemukan");
  return company;
};
