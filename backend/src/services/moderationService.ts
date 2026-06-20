import { getModerationProvider } from "../providers";
import { getPolicySnapshot } from "./policyService";
import {
  Verdict,
  EnforcementBehavior,
  CategoryBreakdown,
  PolicyCategorySnapshot,
} from "../types";

export interface ModerationOutcome {
  verdict: Verdict;
  categoryBreakdown: CategoryBreakdown[];
  policySnapshot: PolicyCategorySnapshot[];
  provider: string;
}

/**
 * Moderates a single image:
 * 1. Takes a fresh policy snapshot (point-in-time, embedded into result)
 * 2. Calls the active AI provider only for ENABLED categories
 * 3. Applies verdict logic:
 *    - disabled categories are skipped entirely
 *    - confidence below threshold -> does not contribute to verdict
 *    - threshold crossed + AUTO_BLOCK -> BLOCKED
 *    - threshold crossed + FLAG_FOR_REVIEW -> FLAGGED
 *    - BLOCKED takes priority over FLAGGED
 *    - nothing crosses threshold -> APPROVED
 */
export async function moderateImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ModerationOutcome> {
  const policySnapshot = await getPolicySnapshot();
  const enabledPolicies = policySnapshot.filter((p) => p.enabled);

  const provider = getModerationProvider();

  // Disabled categories are skipped -> never sent to the provider at all
  const enabledCategories = enabledPolicies.map((p) => p.category);

  let providerResult = { results: [] as any[], provider: provider.name };
  if (enabledCategories.length > 0) {
    providerResult = await provider.moderateImage(imageBuffer, mimeType, enabledCategories);
  }

  const policyByCategory = new Map(enabledPolicies.map((p) => [p.category, p]));

  let hasAutoBlock = false;
  let hasFlag = false;

  const categoryBreakdown: CategoryBreakdown[] = providerResult.results.map((result) => {
    const policy = policyByCategory.get(result.category)!;
    const crossedThreshold = result.confidenceScore >= policy.confidenceThreshold;

    let contributedToVerdict = false;
    if (crossedThreshold) {
      contributedToVerdict = true;
      if (policy.enforcementBehavior === EnforcementBehavior.AUTO_BLOCK) {
        hasAutoBlock = true;
      } else if (policy.enforcementBehavior === EnforcementBehavior.FLAG_FOR_REVIEW) {
        hasFlag = true;
      }
    }

    return {
      category: result.category,
      violationDetected: result.violationDetected,
      confidenceScore: result.confidenceScore,
      reasoning: result.reasoning,
      thresholdUsed: policy.confidenceThreshold,
      enforcementUsed: policy.enforcementBehavior,
      contributedToVerdict,
    };
  });

  // Also record disabled categories in the snapshot context (not in breakdown,
  // since they were skipped) - policySnapshot already captures their state.

  let verdict: Verdict;
  if (hasAutoBlock) {
    verdict = Verdict.BLOCKED; // BLOCKED has priority over FLAGGED
  } else if (hasFlag) {
    verdict = Verdict.FLAGGED;
  } else {
    verdict = Verdict.APPROVED;
  }

  return {
    verdict,
    categoryBreakdown,
    policySnapshot, // full snapshot, including disabled categories, for audit purposes
    provider: providerResult.provider,
  };
}
