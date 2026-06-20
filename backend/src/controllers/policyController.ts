import { Request, Response } from "express";
import { Policy } from "../models/Policy";
import { asyncHandler } from "../utils/asyncHandler";
import { NotFoundError, BadRequestError } from "../utils/errors";
import { getAllPolicies } from "../services/policyService";
import { EnforcementBehavior } from "../types";

export const listPolicies = asyncHandler(async (_req: Request, res: Response) => {
  const policies = await getAllPolicies();
  res.json({ success: true, data: { policies } });
});

export const updatePolicy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { enabled, confidenceThreshold, enforcementBehavior } = req.body;

  const policy = await Policy.findById(id);
  if (!policy) {
    throw new NotFoundError("Policy not found");
  }

  if (confidenceThreshold !== undefined) {
    if (typeof confidenceThreshold !== "number" || confidenceThreshold < 0 || confidenceThreshold > 1) {
      throw new BadRequestError("confidenceThreshold must be a number between 0 and 1");
    }
    policy.confidenceThreshold = confidenceThreshold;
  }

  if (enabled !== undefined) {
    if (typeof enabled !== "boolean") {
      throw new BadRequestError("enabled must be a boolean");
    }
    policy.enabled = enabled;
  }

  if (enforcementBehavior !== undefined) {
    if (!Object.values(EnforcementBehavior).includes(enforcementBehavior)) {
      throw new BadRequestError(
        `enforcementBehavior must be one of: ${Object.values(EnforcementBehavior).join(", ")}`
      );
    }
    policy.enforcementBehavior = enforcementBehavior;
  }

  await policy.save();

  // NOTE: This change only affects future submissions. Existing submissions
  // already hold their own policySnapshot taken at moderation time.
  res.json({ success: true, data: { policy } });
});
