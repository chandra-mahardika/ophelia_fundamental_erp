import { NextFunction, Request, Response } from "express";
import { prismaAuth } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "./auth.middleware";

/**
 * Middleware konteks multi-company + gate modul (ala Odoo).
 * Dipasang SETELAH `authenticate` (butuh `req.user`).
 * - `resolveCompany`: menentukan company aktif (header `X-Company-Id`
 *   didahulukan, lalu klaim JWT), memastikan user member + company aktif,
 *   lalu menempelkan `req.companyId` untuk dipakai controller/service.
 * - `requireModule(...codes)`: menolak bila modul belum ter-install/aktif
 *   di company tersebut. Pasang SETELAH `resolveCompany`.
 */

/** Request yang sudah melewati `resolveCompany`. */
export interface CompanyRequest extends AuthRequest {
  companyId?: number;
}

/**
 * Menentukan company aktif untuk request ini dan memastikan:
 * 1. User adalah member company tersebut (via user_companies).
 * 2. Company masih aktif.
 *
 * Sumber company: header `X-Company-Id` (prioritas) atau klaim `companyId`
 * di JWT. Pasang setelah `authenticate`.
 */
export const resolveCompany = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) return next(new ApiError(401, "Tidak terautentikasi"));

    const header = req.header("X-Company-Id");
    const companyId = header ? Number(header) : user.companyId;
    if (!companyId || Number.isNaN(companyId)) {
      return next(
        new ApiError(400, "Company belum dipilih (header X-Company-Id / login ulang)"),
      );
    }

    const membership = await prismaAuth.userCompany.findUnique({
      where: { userId_companyId: { userId: user.id, companyId } },
    });
    if (!membership) {
      return next(new ApiError(403, "Tidak punya akses ke company ini"));
    }

    const company = await prismaAuth.company.findUnique({
      where: { id: companyId },
    });
    if (!company || !company.isActive) {
      return next(new ApiError(403, "Company tidak aktif"));
    }

    (req as CompanyRequest).companyId = companyId;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Memastikan modul-modul tertentu ter-install & aktif untuk company aktif
 * (ala Odoo: modul di-install per company). Pasang setelah `resolveCompany`.
 */
export const requireModule =
  (...codes: string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const companyId =
        (req as CompanyRequest).companyId ??
        (req as AuthRequest).user?.companyId;
      if (!companyId) {
        return next(new ApiError(400, "Company belum dipilih"));
      }
      const installed = await prismaAuth.companyModule.findMany({
        where: {
          companyId,
          moduleCode: { in: codes },
          isInstalled: true,
          module: { isActive: true },
        },
        select: { moduleCode: true },
      });
      const ok = new Set(installed.map((m) => m.moduleCode));
      const missing = codes.filter((c) => !ok.has(c));
      if (missing.length > 0) {
        return next(
          new ApiError(403, `Modul belum di-install: ${missing.join(", ")}`),
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
