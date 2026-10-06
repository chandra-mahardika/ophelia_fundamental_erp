import { prismaAuth } from "../../src/config/prisma";
import bcrypt from "bcryptjs";

const PERMISSIONS = [
  "users:manage",
  "roles:manage",
  "companies:create",
  "companies:read",
  "companies:update",
  "companies:manage",
  "modules:read",
  "modules:manage",
] as const;

const MODULES = [
  { code: "base", name: "Base", description: "Fitur dasar ERP (wajib, tidak bisa di-uninstall)" },
  { code: "inventory", name: "Inventory", description: "Produk & stok" },
  { code: "sales", name: "Sales", description: "Penjualan" },
  { code: "accounting", name: "Accounting", description: "Akuntansi & keuangan" },
  { code: "hr", name: "HR", description: "Sumber daya manusia" },
] as const;

async function main() {
  // Bersihkan sisa permission modul sample `products` yang sudah dihapus.
  await prismaAuth.rolePermission.deleteMany({
    where: { permission: { name: { startsWith: "products:" } } },
  });
  await prismaAuth.permission.deleteMany({
    where: { name: { startsWith: "products:" } },
  });

  const permissions = [];
  for (const name of PERMISSIONS) {
    permissions.push(
      await prismaAuth.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    );
  }

  const admin = await prismaAuth.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const user = await prismaAuth.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER" },
  });

  for (const p of permissions) {
    await prismaAuth.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: admin.id, permissionId: p.id } },
      update: {},
      create: { roleId: admin.id, permissionId: p.id },
    });
  }

  const readPerms = permissions.filter((p) =>
    ["companies:read", "modules:read"].includes(p.name),
  );
  for (const p of readPerms) {
    await prismaAuth.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: user.id, permissionId: p.id } },
      update: {},
      create: { roleId: user.id, permissionId: p.id },
    });
  }

  for (const m of MODULES) {
    await prismaAuth.module.upsert({
      where: { code: m.code },
      update: { name: m.name, description: m.description },
      create: { code: m.code, name: m.name, description: m.description },
    });
  }

  const adminPassword = await bcrypt.hash("password123", 10);
  const adminUser = await prismaAuth.user.upsert({
    where: { email: "admin@example.com" },
    update: { username: "admin", userRoles: { deleteMany: {}, create: { roleId: admin.id } } },
    create: {
      name: "Admin",
      username: "admin",
      email: "admin@example.com",
      password: adminPassword,
      userRoles: { create: { roleId: admin.id } },
    },
  });

  const userPassword = await bcrypt.hash("password123", 10);
  const normalUser = await prismaAuth.user.upsert({
    where: { email: "user@example.com" },
    update: { username: "user", userRoles: { deleteMany: {}, create: { roleId: user.id } } },
    create: {
      name: "User",
      username: "user",
      email: "user@example.com",
      password: userPassword,
      userRoles: { create: { roleId: user.id } },
    },
  });

  // Demo company + kedua user jadi member + modul dasar ter-install.
  const company = await prismaAuth.company.upsert({
    where: { code: "DEMO" },
    update: { name: "Ophelia Demo" },
    create: { name: "Ophelia Demo", code: "DEMO" },
  });

  for (const u of [adminUser, normalUser]) {
    await prismaAuth.userCompany.upsert({
      where: { userId_companyId: { userId: u.id, companyId: company.id } },
      update: {},
      create: { userId: u.id, companyId: company.id, isDefault: true },
    });
  }

  for (const m of MODULES) {
    await prismaAuth.companyModule.upsert({
      where: { companyId_moduleCode: { companyId: company.id, moduleCode: m.code } },
      update: { isInstalled: true },
      create: { companyId: company.id, moduleCode: m.code, isInstalled: true },
    });
  }

  console.log("Seed selesai: roles, permissions, modules, users + demo company (admin@example.com / user@example.com, password: password123).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prismaAuth.$disconnect());
