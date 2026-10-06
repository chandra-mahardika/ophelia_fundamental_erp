/**
 * Repository company: SATU-SATUNYA tempat query tabel `companies`/
 * `user_companies`. Dipanggil oleh company.service.ts.
 */
import { prismaAuth as prisma } from "../../config/prisma";

/** Company milik user (aktif saja) + relasi company. Dipakai service.getMine. */
export const findMyCompanies = (userId: number) =>
  prisma.userCompany.findMany({
    where: { userId, company: { isActive: true } },
    include: { company: true },
    orderBy: { companyId: "asc" },
  });

/** Detail company + members + modules. Dipakai service.getById. */
export const findById = (id: number) =>
  prisma.company.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, username: true, email: true } } } },
      modules: { include: { module: true } },
    },
  });

/** Cek membership user↔company. Dipakai service.getById/setDefault (gate akses). */
export const findMembership = (userId: number, companyId: number) =>
  prisma.userCompany.findUnique({
    where: { userId_companyId: { userId, companyId } },
  });

/** Buat company (members/modules dibuat di service.create via relasi nested). */
export const create = (data: { name: string; code: string; address?: string; phone?: string; email?: string }) =>
  prisma.company.create({ data });

/** Update kolom company. Dipakai service.update. */
export const update = (
  id: number,
  data: { name?: string; address?: string; phone?: string; email?: string; logoUrl?: string; isActive?: boolean },
) => prisma.company.update({ where: { id }, data });

/** Tambah/ubah membership (upsert). Dipakai service.addMember. */
export const addMember = (userId: number, companyId: number, isDefault = false) =>
  prisma.userCompany.upsert({
    where: { userId_companyId: { userId, companyId } },
    update: { isDefault },
    create: { userId, companyId, isDefault },
  });

/** Hapus membership. Dipakai service.removeMember. */
export const removeMember = (userId: number, companyId: number) =>
  prisma.userCompany.delete({
    where: { userId_companyId: { userId, companyId } },
  });

/** Jadikan company ini default untuk user (reset default lain dalam transaksi). */
export const setDefault = (userId: number, companyId: number) =>
  prisma.$transaction([
    prisma.userCompany.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    }),
    prisma.userCompany.update({
      where: { userId_companyId: { userId, companyId } },
      data: { isDefault: true },
    }),
  ]);
