import { Router } from "express";
import { analyticsOverview } from "../controllers/analyticsController";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.use(authenticate, requireAdmin);
router.get("/overview", analyticsOverview);

export default router;
