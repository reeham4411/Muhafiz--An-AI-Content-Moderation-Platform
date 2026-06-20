import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/errors";

export interface FieldRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "boolean";
  minLength?: number;
  enum?: string[];
}

/**
 * Minimal dependency-free body validator. Validates req.body against
 * a list of field rules and throws BadRequestError on first failure.
 */
export function validateBody(rules: FieldRule[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const rule of rules) {
      const value = req.body?.[rule.field];

      if (rule.required && (value === undefined || value === null || value === "")) {
        throw new BadRequestError(`Field "${rule.field}" is required`);
      }

      if (value === undefined || value === null) continue;

      if (rule.type === "string" && typeof value !== "string") {
        throw new BadRequestError(`Field "${rule.field}" must be a string`);
      }
      if (rule.type === "number" && typeof value !== "number") {
        throw new BadRequestError(`Field "${rule.field}" must be a number`);
      }
      if (rule.type === "boolean" && typeof value !== "boolean") {
        throw new BadRequestError(`Field "${rule.field}" must be a boolean`);
      }
      if (rule.minLength && typeof value === "string" && value.length < rule.minLength) {
        throw new BadRequestError(
          `Field "${rule.field}" must be at least ${rule.minLength} characters`
        );
      }
      if (rule.enum && !rule.enum.includes(value)) {
        throw new BadRequestError(
          `Field "${rule.field}" must be one of: ${rule.enum.join(", ")}`
        );
      }
    }
    next();
  };
}
