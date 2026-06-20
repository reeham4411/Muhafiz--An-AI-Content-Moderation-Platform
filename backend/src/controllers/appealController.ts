import { Request, Response } from "express";
import { Appeal } from "../models/Appeal";
import { Submission } from "../models/Submission";
import { asyncHandler } from "../utils/asyncHandler";
import { BadRequestError, NotFoundError, ForbiddenError, ConflictError } from "../utils/errors";
import { Verdict, AppealStatus } from "../types";

export const createAppeal = asyncHandler(async (req: Request, res: Response) => {
  const { submissionId, imageId, justification } = req.body;

  if (!submissionId || !imageId || !justification) {
    throw new BadRequestError("submissionId, imageId and justification are required");
  }
  if (typeof justification !== "string" || justification.trim().length < 10) {
    throw new BadRequestError("justification must be at least 10 characters");
  }

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new NotFoundError("Submission not found");
  }

  if (submission.user.toString() !== req.user!.userId) {
    throw new ForbiddenError("You can only appeal your own submissions");
  }

  const image = submission.images.id(imageId);
  if (!image) {
    throw new NotFoundError("Image not found in submission");
  }

  if (image.verdict !== Verdict.FLAGGED && image.verdict !== Verdict.BLOCKED) {
    throw new BadRequestError("Only FLAGGED or BLOCKED images can be appealed");
  }

  const existingAppeal = await Appeal.findOne({
    submission: submissionId,
    imageId,
    status: AppealStatus.PENDING,
  });
  if (existingAppeal) {
    throw new ConflictError("An appeal for this image is already pending");
  }

  const appeal = await Appeal.create({
    user: req.user!.userId,
    submission: submissionId,
    imageId,
    justification: justification.trim(),
    status: AppealStatus.PENDING,
  });

  res.status(201).json({ success: true, data: { appeal } });
});

export const getMyAppeals = asyncHandler(async (req: Request, res: Response) => {
  const appeals = await Appeal.find({ user: req.user!.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: { appeals } });
});

export const getAllAppeals = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const filter: Record<string, any> = {};
  if (status && Object.values(AppealStatus).includes(status as AppealStatus)) {
    filter.status = status;
  }
  const appeals = await Appeal.find(filter).sort({ createdAt: -1 }).populate("user", "name email");
  res.json({ success: true, data: { appeals } });
});

export const resolveAppeal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { decision, adminResponse } = req.body;

  if (!decision || ![AppealStatus.ACCEPTED, AppealStatus.REJECTED].includes(decision)) {
    throw new BadRequestError(`decision must be one of: ${AppealStatus.ACCEPTED}, ${AppealStatus.REJECTED}`);
  }

  const appeal = await Appeal.findById(id);
  if (!appeal) {
    throw new NotFoundError("Appeal not found");
  }
  if (appeal.status !== AppealStatus.PENDING) {
    throw new ConflictError("This appeal has already been resolved");
  }

  appeal.status = decision;
  appeal.adminResponse = adminResponse || undefined;
  appeal.resolvedBy = req.user!.userId as any;
  appeal.resolvedAt = new Date();
  await appeal.save();

  // If accepted, override the related submission image's verdict to APPROVED
  if (decision === AppealStatus.ACCEPTED) {
    const submission = await Submission.findById(appeal.submission);
    if (submission) {
      const image = submission.images.id(appeal.imageId);
      if (image) {
        image.verdict = Verdict.APPROVED;
        image.overridden = true;
        image.overriddenBy = req.user!.userId as any;
        image.overrideReason = `Appeal accepted: ${adminResponse || "No additional comment"}`;
        await submission.save();
      }
    }
  }

  res.json({ success: true, data: { appeal } });
});
