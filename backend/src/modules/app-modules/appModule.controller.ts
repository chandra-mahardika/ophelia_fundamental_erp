/**
 * Controller modul: jembatan HTTP ↔ service (tanpa logika bisnis).
 * GET katalog/ter-install, POST install/uninstall (perlu modules:manage).
 */
import { Request, Response } from "express";
import * as appModuleService from "./appModule.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

/** GET /api/modules → katalog modul. */
export const listCatalog = async (_req: Request, res: Response) => {
  res.json({ data: await appModuleService.listCatalog() });
};

/** GET /api/modules/company/:companyId → status install (harus member). */
export const listInstalled = async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user!;
  const data = await appModuleService.listInstalled(
    Number(req.params.companyId),
    user.id,
  );
  res.json({ data });
};

/** POST /api/modules/company/:companyId/:code/install → install (200). */
export const install = async (req: Request, res: Response) => {
  const data = await appModuleService.install(
    Number(req.params.companyId),
    String(req.params.code),
  );
  res.json({ message: "Modul di-install", data });
};

/** POST /api/modules/company/:companyId/:code/uninstall → uninstall (200). */
export const uninstall = async (req: Request, res: Response) => {
  const data = await appModuleService.uninstall(
    Number(req.params.companyId),
    String(req.params.code),
  );
  res.json({ message: "Modul di-uninstall", data });
};