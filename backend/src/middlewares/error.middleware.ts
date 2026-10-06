import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * Error handler global (dipasang terakhir di app.ts).
 * - `ZodError` (dari `validate`) → 400 + detail field.
 * - `ApiError` (dari service) → statusCode + message terkait.
 * - Lainnya → log ke console + 500 generik (tanpa bocorkan detail).
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ message: "Validasi gagal", errors: err.issues });
  }
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};
