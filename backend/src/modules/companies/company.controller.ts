/**
 * Controller company: jembatan HTTP ↔ service (tanpa logika bisnis).
 * `user.id` diambil dari `req.user` (hasil `authenticate`).
 */
import { Request, Response } from "express";
import * as companyService from "./company.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

/** GET /api/companies/me → company milik user login. */
export const getMine = async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user!;
  res.json({ data: await companyService.getMine(user.id) });
};

/** GET /api/companies/:id → detail + members + modules. */
export const getById = async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user!;
  res.json({ data: await companyService.getById(Number(req.params.id), user.id) });
};

/** POST /api/companies → buat company (201). */
export const create = async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user!;
  const company = await companyService.create(req.body, user.id);
  res.status(201).json({ message: "Company dibuat", data: company });
};

/** PUT /api/companies/:id → update (perlu companies:update). */
export const update = async (req: Request, res: Response) => {
  const company = await companyService.update(Number(req.params.id), req.body);
  res.json({ message: "Company diperbarui", data: company });
};

/** POST /api/companies/:id/members → tambah member (201). */
export const addMember = async (req: Request, res: Response) => {
  const result = await companyService.addMember(
    Number(req.params.id),
    req.body.userId,
    req.body.isDefault ?? false,
  );
  res.status(201).json({ message: "Member ditambahkan", data: result });
};

/** DELETE /api/companies/:id/members/:userId → hapus member. */
export const removeMember = async (req: Request, res: Response) => {
  const result = await companyService.removeMember(
    Number(req.params.id),
    Number(req.params.userId),
  );
  res.json({ message: "Member dihapus", data: result });
};

/** POST /api/companies/:id/set-default → ganti aktif + token baru. */
export const setDefault = async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user!;
  const result = await companyService.setDefault(user.id, Number(req.params.id));
  res.json({ message: "Company aktif diganti", data: result });
};
