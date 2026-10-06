/**
 * Controller role: jembatan HTTP ↔ service (tanpa logika bisnis).
 * GET daftar/detail/katalog, POST buat, PUT ubah/setPermissions, DELETE hapus.
 */
import { Request, Response } from "express";
import * as roleService from "./role.service";

/** GET /api/roles → daftar role. */
export const getAll = async (_req: Request, res: Response) => {
  res.json({ data: await roleService.getAll() });
};

/** GET /api/roles/:id → detail role. */
export const getById = async (req: Request, res: Response) => {
  res.json({ data: await roleService.getById(Number(req.params.id)) });
};

/** GET /api/roles/permissions → katalog permission. */
export const getPermissions = async (_req: Request, res: Response) => {
  res.json({ data: await roleService.getPermissions() });
};

/** POST /api/roles → buat role (201). */
export const create = async (req: Request, res: Response) => {
  const role = await roleService.create(req.body.name);
  res.status(201).json({ message: "Role dibuat", data: role });
};

/** PUT /api/roles/:id → ubah nama role. */
export const update = async (req: Request, res: Response) => {
  const role = await roleService.update(Number(req.params.id), req.body.name);
  res.json({ message: "Role diperbarui", data: role });
};

/** DELETE /api/roles/:id → hapus role. */
export const remove = async (req: Request, res: Response) => {
  await roleService.remove(Number(req.params.id));
  res.json({ message: "Role dihapus" });
};

/** PUT /api/roles/:id/permissions → ganti permission (`{ permissionIds }`). */
export const setPermissions = async (req: Request, res: Response) => {
  const role = await roleService.setPermissions(
    Number(req.params.id),
    req.body.permissionIds ?? [],
  );
  res.json({ message: "Permission role diperbarui", data: role });
};
