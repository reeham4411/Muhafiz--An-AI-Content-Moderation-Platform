import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppError } from "../utils/errors";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Must have 4 params for Express to recognize this as an error handler
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof Error && err.name === "ValidationError") {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof Error && err.name === "CastError") {
    res.status(400).json({ success: false, message: "Invalid identifier format" });
    return;
  }

  console.error("[unhandled error]", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
