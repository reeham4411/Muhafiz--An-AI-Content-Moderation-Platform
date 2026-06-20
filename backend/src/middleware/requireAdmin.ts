import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors";
import { UserRole } from "../types";

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    throw new ForbiddenError("Admin access required");
  }
  next();
}
