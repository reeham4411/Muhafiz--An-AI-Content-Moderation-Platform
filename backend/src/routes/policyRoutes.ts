import { Router } from "express";
import { listPolicies, updatePolicy } from "../controllers/policyController";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";

// Public (authenticated) read-only policy listing
export const policyRoutes = Router();
policyRoutes.get("/", authenticate, listPolicies);

// Admin-only policy mutation, mounted separately under /api/admin/policies
export const adminPolicyRoutes = Router();
adminPolicyRoutes.use(authenticate, requireAdmin);
adminPolicyRoutes.patch("/:id", updatePolicy);
