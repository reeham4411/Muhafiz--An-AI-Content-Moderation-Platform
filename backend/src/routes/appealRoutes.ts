import { Router } from "express";
import {
  createAppeal,
  getMyAppeals,
  getAllAppeals,
  resolveAppeal,
} from "../controllers/appealController";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";

// User-facing appeal routes, mounted at /api/appeals
export const appealRoutes = Router();
appealRoutes.use(authenticate);
appealRoutes.post("/", createAppeal);
appealRoutes.get("/my", getMyAppeals);

// Admin appeal routes, mounted at /api/admin/appeals
export const adminAppealRoutes = Router();
adminAppealRoutes.use(authenticate, requireAdmin);
adminAppealRoutes.get("/", getAllAppeals);
adminAppealRoutes.patch("/:id/resolve", resolveAppeal);
