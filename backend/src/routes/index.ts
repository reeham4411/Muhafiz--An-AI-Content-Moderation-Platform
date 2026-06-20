import { Router } from "express";
import authRoutes from "./authRoutes";
import submissionRoutes from "./submissionRoutes";
import { policyRoutes, adminPolicyRoutes } from "./policyRoutes";
import { appealRoutes, adminAppealRoutes } from "./appealRoutes";
import adminSubmissionRoutes from "./adminSubmissionRoutes";
import analyticsRoutes from "./analyticsRoutes";

const router = Router();

// User-facing
router.use("/auth", authRoutes);
router.use("/submissions", submissionRoutes);
router.use("/policies", policyRoutes);
router.use("/appeals", appealRoutes);

// Admin-facing
router.use("/admin/policies", adminPolicyRoutes);
router.use("/admin/appeals", adminAppealRoutes);
router.use("/admin/submissions", adminSubmissionRoutes);
router.use("/admin/analytics", analyticsRoutes);

export default router;
