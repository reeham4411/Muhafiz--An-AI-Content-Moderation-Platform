import { Request, Response } from "express";
import { Submission } from "../models/Submission";
import { asyncHandler } from "../utils/asyncHandler";
import { NotFoundError, BadRequestError } from "../utils/errors";
import { Verdict, ModerationCategory } from "../types";

export const adminListSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const { outcome, category, from, to, userId, page = "1", limit = "20" } = req.query;

  const match: Record<string, any> = {};
  if (userId) match.user = userId;
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from as string);
    if (to) match.createdAt.$lte = new Date(to as string);
  }

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));

  let submissions = await Submission.find(match)
    .sort({ createdAt: -1 })
    .populate("user", "name email");

  if (outcome && Object.values(Verdict).includes(outcome as Verdict)) {
    submissions = submissions
      .map((s: any) => {
        const filteredImages = s.images.filter((img: any) => img.verdict === outcome);
        return { ...s.toObject(), images: filteredImages };
      })
      .filter((s: any) => s.images.length > 0) as any;
  }

  if (category && Object.values(ModerationCategory).includes(category as ModerationCategory)) {
    submissions = submissions
      .map((s: any) => {
        const filteredImages = (s.images || []).filter((img: any) =>
          img.categoryBreakdown?.some((c: any) => c.category === category)
        );
        return { ...(s.toObject ? s.toObject() : s), images: filteredImages };
      })
      .filter((s: any) => s.images.length > 0) as any;
  }

  const total = submissions.length;
  const paginated = submissions.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      submissions: paginated,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    },
  });
});

export const adminOverrideSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // submission id
  const { imageId, verdict, reason } = req.body;

  if (!imageId || !verdict) {
    throw new BadRequestError("imageId and verdict are required");
  }
  if (!Object.values(Verdict).includes(verdict)) {
    throw new BadRequestError(`verdict must be one of: ${Object.values(Verdict).join(", ")}`);
  }

  const submission = await Submission.findById(id);
  if (!submission) {
    throw new NotFoundError("Submission not found");
  }

  const image = submission.images.id(imageId);
  if (!image) {
    throw new NotFoundError("Image not found in submission");
  }

  image.verdict = verdict;
  image.overridden = true;
  image.overriddenBy = req.user!.userId as any;
  image.overrideReason = reason || "Manual admin override";

  await submission.save();

  res.json({ success: true, data: { submission } });
});
