import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getAnalyticsOverview } from "../services/analyticsService";

export const analyticsOverview = asyncHandler(async (_req: Request, res: Response) => {
  const overview = await getAnalyticsOverview();
  res.json({ success: true, data: overview });
});
