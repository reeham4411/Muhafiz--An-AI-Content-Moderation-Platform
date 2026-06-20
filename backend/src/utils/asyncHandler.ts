import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async express handler so thrown/rejected errors are forwarded
 * to the centralized error middleware instead of crashing the process.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
