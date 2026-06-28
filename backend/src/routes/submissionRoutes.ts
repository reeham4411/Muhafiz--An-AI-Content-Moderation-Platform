import { Router } from "express";
import {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
  deleteSubmission,
  deleteSubmissionImage,
} from "../controllers/submissionController";
import { authenticate } from "../middleware/authenticate";
import { uploadImages } from "../middleware/upload";

const router = Router();

router.use(authenticate);

router.post("/", uploadImages.array("images", 10), createSubmission);
router.get("/my", getMySubmissions);
router.get("/:id", getSubmissionById);
router.delete("/:id/images/:imageId", deleteSubmissionImage);
router.delete("/:id", deleteSubmission);
export default router;
