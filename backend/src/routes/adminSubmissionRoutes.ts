import { Router } from "express";
import {
  adminListSubmissions,
  adminOverrideSubmission,
} from "../controllers/adminSubmissionController";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.use(authenticate, requireAdmin);
router.get("/", adminListSubmissions);
router.patch("/:id/override", adminOverrideSubmission);

export default router;
