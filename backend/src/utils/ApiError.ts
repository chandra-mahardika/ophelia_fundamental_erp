/**
 * Error bisnis yang dilempar dari service layer.
 * Ditangkap oleh `errorHandler` (middlewares/error.middleware.ts)
 * dan diubah menjadi HTTP response `{ message }` dengan `statusCode` terkait.
 * Jangan pakai `res.status()` di service — lempar ini sebagai gantinya.
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
