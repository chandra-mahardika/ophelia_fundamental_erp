/**
 * Logika registry modul ala Odoo (tanpa repository — query langsung di sini).
 * - Katalog (`modules`) vs status per company (`company_modules`).
 * - `base` tidak bisa di-uninstall. Baca status wajib member company terkait.
 */
import { prismaAuth as prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

/** Ubah modul Prisma → objek publik. */
const toPublic = (m: any) => ({
  code: m.code,
  name: m.name,
  description: m.description,
  version: m.version,
  isActive: m.isActive,
});

/** Katalog semua modul (untuk Panel). Dipanggil controller.listCatalog. */
export const listCatalog = async () => {
  const modules = await prisma.module.findMany({ orderBy: { code: "asc" } });
  return modules.map(toPublic);
};

/** Modul ter-install di company (harus member). Dipakai controller.listInstalled. */
export const listInstalled = async (companyId: number, requesterId: number) => {
  await ensureMember(companyId, requesterId);
  const rows = await prisma.companyModule.findMany({
    where: { companyId },
    include: { module: true },
    orderBy: { moduleCode: "asc" },
  });
  return rows.map((r) => ({ ...toPublic(r.module), isInstalled: r.isInstalled, installedAt: r.installedAt }));
};

/** Install modul di company (perlu modules:manage). Dipakai controller.install. */
export const install = async (companyId: number, code: string) => {
  await ensureCompany(companyId);
  const mod = await prisma.module.findUnique({ where: { code } });
  if (!mod || !mod.isActive) throw new ApiError(404, "Modul tidak ditemukan / tidak aktif");
  await prisma.companyModule.upsert({
    where: { companyId_moduleCode: { companyId, moduleCode: code } },
    update: { isInstalled: true },
    create: { companyId, moduleCode: code, isInstalled: true },
  });
  return { companyId, moduleCode: code, isInstalled: true };
};

/** Uninstall modul (base diproteksi). Dipakai controller.uninstall. */
export const uninstall = async (companyId: number, code: string) => {
  await ensureCompany(companyId);
  if (code === "base") throw new ApiError(400, "Modul base tidak bisa di-uninstall");
  const row = await prisma.companyModule.findUnique({
    where: { companyId_moduleCode: { companyId, moduleCode: code } },
  });
  if (!row) throw new ApiError(404, "Modul belum di-install di company ini");
  await prisma.companyModule.update({
    where: { companyId_moduleCode: { companyId, moduleCode: code } },
    data: { isInstalled: false },
  });
  return { companyId, moduleCode: code, isInstalled: false };
};

const ensureCompany = async (companyId: number) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company || !company.isActive) throw new ApiError(404, "Company tidak ditemukan / tidak aktif");
};

const ensureMember = async (companyId: number, requesterId: number) => {
  await ensureCompany(companyId);
  const member = await prisma.userCompany.findUnique({
    where: { userId_companyId: { userId: requesterId, companyId } },
  });
  if (!member) throw new ApiError(403, "Tidak punya akses ke company ini");
};
