/**
 * Schema input role (dipakai `validate()` di role.routes.ts).
 * Nama role: kapital/angka/_ agar konsisten dengan seed & permission.
 */
import { z } from "zod";

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .regex(/^[A-Z0-9_]+$/, "Nama role huruf kapital, angka, dan _"),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .regex(/^[A-Z0-9_]+$/, "Nama role huruf kapital, angka, dan _"),
});

export const setPermissionsSchema = z.object({
  permissionIds: z.array(z.number().int().positive()),
});
