/**
 * Logika bisnis auth (dipanggil controller; query Prisma langsung di sini —
 * modul ini tanpa repository). Mengembalikan user publik (tanpa password)
 * dan token via `signToken`. Error memakai `ApiError`.
 */
import bcrypt from "bcryptjs";
import { prismaAuth as prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { signToken } from "../../utils/jwt";

/** Modul yang otomatis di-install untuk setiap company baru. */
const DEFAULT_MODULES = ["base", "inventory"];

const userInclude = {
  userRoles: {
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  },
  companies: {
    include: { company: true },
    orderBy: { companyId: "asc" as const },
  },
} as const;

/** Ubah user Prisma (roles + companies) → objek publik untuk response/JWT. */
const toPublicUser = (user: any) => {
  const companies =
    user.companies?.map((uc: any) => ({
      id: uc.company.id,
      name: uc.company.name,
      code: uc.company.code,
      isDefault: uc.isDefault,
    })) ?? [];
  const defaultCompany =
    user.companies?.find((uc: any) => uc.isDefault)?.company ??
    user.companies?.[0]?.company ??
    null;
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    roles: user.userRoles?.map((ur: any) => ur.role?.name) ?? [],
    companies,
    defaultCompanyId: defaultCompany?.id ?? null,
  };
};

/** Normalisasi teks → kode company (`Nama Co` → `nama-co`). */
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "company";

/** Cari kode company unik (`personal-budi`, `personal-budi-2`, ...). */
const uniqueCompanyCode = async (base: string) => {
  let code = base;
  let i = 2;
  while (await prisma.company.findUnique({ where: { code } })) {
    code = `${base}-${i++}`;
  }
  return code;
};

/**
 * Registrasi: cek duplikat → hash password → buat user (role USER) +
 * personal company + membership default + install modul dasar.
 */
export const register = async (data: {
  name: string;
  username: string;
  email: string;
  password: string;
}) => {
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw new ApiError(409, "Email sudah terdaftar");
  const usernameExists = await prisma.user.findUnique({ where: { username: data.username } });
  if (usernameExists) throw new ApiError(409, "Username sudah terdaftar");

  const defaultRole = await prisma.role.findUnique({ where: { name: "USER" } });
  if (!defaultRole) throw new ApiError(500, "Role default USER belum di-seed");

  const hashed = await bcrypt.hash(data.password, 10);
  const code = await uniqueCompanyCode(`personal-${slug(data.username)}`);
  const baseModules = await prisma.module.findMany({
    where: { code: { in: DEFAULT_MODULES }, isActive: true },
  });

  // User baru langsung dapat company sendiri (ala Odoo) + modul dasar.
  const user = await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      password: hashed,
      userRoles: { create: { roleId: defaultRole.id } },
      companies: {
        create: {
          isDefault: true,
          company: {
            create: {
              name: `Perusahaan ${data.name}`,
              code,
              modules: {
                create: baseModules.map((m) => ({ moduleCode: m.code })),
              },
            },
          },
        },
      },
    },
    include: userInclude,
  });
  return toPublicUser(user);
};

/** Login: verifikasi kredensial → token berisi roles/permissions/companyId default. */
export const login = async (data: { username: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { username: data.username },
    include: userInclude,
  });
  if (!user) throw new ApiError(401, "Username atau password salah");

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw new ApiError(401, "Username atau password salah");

  const permissions = user.userRoles.flatMap((ur: any) =>
    ur.role.permissions.map((p: any) => p.permission.name),
  );
  const roleNames = user.userRoles.map((ur: any) => ur.role.name);
  const publicUser = toPublicUser(user);
  const token = signToken({
    id: user.id,
    roles: roleNames,
    permissions,
    companyId: publicUser.defaultCompanyId ?? undefined,
  });
  return { token, user: { ...publicUser, permissions } };
};

/** Terbitkan token baru dengan company aktif yang dipilih (user harus member). */
export const switchCompany = async (userId: number, companyId: number) => {
  const membership = await prisma.userCompany.findUnique({
    where: { userId_companyId: { userId, companyId } },
    include: {
      company: true,
      user: { include: userInclude },
    },
  });
  if (!membership || !membership.company.isActive) {
    throw new ApiError(403, "Tidak punya akses ke company ini");
  }
  const user = membership.user as any;
  const permissions = user.userRoles.flatMap((ur: any) =>
    ur.role.permissions.map((p: any) => p.permission.name),
  );
  const roleNames = user.userRoles.map((ur: any) => ur.role.name);
  const token = signToken({
    id: user.id,
    roles: roleNames,
    permissions,
    companyId,
  });
  return { token, companyId, company: membership.company };
};
