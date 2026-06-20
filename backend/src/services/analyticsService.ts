import { Submission } from "../models/Submission";
import { Appeal } from "../models/Appeal";
import { User } from "../models/User";
import { Verdict, AppealStatus } from "../types";

export interface AnalyticsOverview {
  totalSubmissions: number;
  totalImages: number;
  verdictDistribution: Record<string, number>;
  categoryViolationDistribution: Record<string, number>;
  appealStats: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  topUsersBySubmissionCount: Array<{ userId: string; name: string; email: string; count: number }>;
  topUsersByViolationCount: Array<{ userId: string; name: string; email: string; count: number }>;
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const totalSubmissions = await Submission.countDocuments();

  // Flatten images across all submissions for image-level aggregation
  const imageAgg = await Submission.aggregate([
    { $unwind: "$images" },
    {
      $facet: {
        totalImages: [{ $count: "count" }],
        verdictDistribution: [
          { $group: { _id: "$images.verdict", count: { $sum: 1 } } },
        ],
        categoryViolations: [
          { $unwind: "$images.categoryBreakdown" },
          { $match: { "images.categoryBreakdown.contributedToVerdict": true } },
          {
            $group: {
              _id: "$images.categoryBreakdown.category",
              count: { $sum: 1 },
            },
          },
        ],
        topUsersBySubmissions: [
          { $group: { _id: "$user", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ],
        topUsersByViolations: [
          {
            $match: {
              "images.verdict": { $in: [Verdict.FLAGGED, Verdict.BLOCKED] },
            },
          },
          { $group: { _id: "$user", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ],
      },
    },
  ]);

  const facet = imageAgg[0] || {};
  const totalImages = facet.totalImages?.[0]?.count || 0;

  const verdictDistribution: Record<string, number> = {
    [Verdict.APPROVED]: 0,
    [Verdict.FLAGGED]: 0,
    [Verdict.BLOCKED]: 0,
  };
  for (const row of facet.verdictDistribution || []) {
    verdictDistribution[row._id] = row.count;
  }

  const categoryViolationDistribution: Record<string, number> = {};
  for (const row of facet.categoryViolations || []) {
    categoryViolationDistribution[row._id] = row.count;
  }

  async function hydrateUsers(
    rows: Array<{ _id: any; count: number }>
  ): Promise<Array<{ userId: string; name: string; email: string; count: number }>> {
    const userIds = rows.map((r) => r._id);
    const users = await User.find({ _id: { $in: userIds } }).select("name email");
    const userMap = new Map(users.map((u) => [u._id.toString(), { name: u.name, email: u.email }]));
    return rows.map((r) => {
      const u = userMap.get(r._id.toString());
      return {
        userId: r._id.toString(),
        name: u?.name || "Unknown",
        email: u?.email || "unknown",
        count: r.count,
      };
    });
  }

  const topUsersBySubmissionCount = await hydrateUsers(facet.topUsersBySubmissions || []);
  const topUsersByViolationCount = await hydrateUsers(facet.topUsersByViolations || []);

  const totalAppeals = await Appeal.countDocuments();
  const pendingAppeals = await Appeal.countDocuments({ status: AppealStatus.PENDING });
  const acceptedAppeals = await Appeal.countDocuments({ status: AppealStatus.ACCEPTED });
  const rejectedAppeals = await Appeal.countDocuments({ status: AppealStatus.REJECTED });

  return {
    totalSubmissions,
    totalImages,
    verdictDistribution,
    categoryViolationDistribution,
    appealStats: {
      total: totalAppeals,
      pending: pendingAppeals,
      accepted: acceptedAppeals,
      rejected: rejectedAppeals,
    },
    topUsersBySubmissionCount,
    topUsersByViolationCount,
  };
}
