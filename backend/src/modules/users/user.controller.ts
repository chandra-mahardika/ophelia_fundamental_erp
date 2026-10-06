/**
 * Controller user: jembatan HTTP ↔ service (tanpa logika bisnis).
 * GET daftar/detail, POST create, PUT update/setRoles, DELETE hapus.
 */
import { Request, Response } from "express";
import * as userService from "./user.service";

/** GET /api/users?search=&role= → daftar user + roles. */
export const getAll = async (req: Request, res: Response) => {
  const users = await userService.getAll({
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    role: typeof req.query.role === "string" ? req.query.role : undefined,
  });
  res.json({ data: users });
};

/** POST /api/users → buat user baru (admin only). */
export const create = async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  res.status(201).json({ message: "User dibuat", data: user });
};

/** GET /api/users/:id → detail user. */
export const getById = async (req: Request, res: Response) => {
  const user = await userService.getById(Number(req.params.id));
  res.json({ data: user });
};

/** PUT /api/users/:id → update (body tervalidasi Zod). */
export const update = async (req: Request, res: Response) => {
  const user = await userService.update(Number(req.params.id), req.body);
  res.json({ message: "User diperbarui", data: user });
};

/** DELETE /api/users/:id → hapus user. */
export const remove = async (req: Request, res: Response) => {
  await userService.remove(Number(req.params.id));
  res.json({ message: "User dihapus" });
};

/** PUT /api/users/:id/roles → ganti multi-role (`{ roleIds }`). */
export const setRoles = async (req: Request, res: Response) => {
  const user = await userService.setRoles(
    Number(req.params.id),
    req.body.roleIds ?? [],
  );
  res.json({ message: "Role user diperbarui", data: user });
};
