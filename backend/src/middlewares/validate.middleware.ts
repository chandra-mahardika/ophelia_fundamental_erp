import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

/**
 * Middleware validasi body. Dipasang di route BERSAMA schema Zod modul
 * (`validate(createXSchema)`): body yang lolos menjadi `req.body` yang sudah
 * ter-coerce sesuai schema; gagal → diteruskan ke `errorHandler` sebagai 400.
 */
export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
