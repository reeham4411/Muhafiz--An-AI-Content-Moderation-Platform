import { Policy } from "../models/Policy";
import { ModerationCategory, EnforcementBehavior, PolicyCategorySnapshot } from "../types";

// Sensible defaults for each category, used only on first boot (seeding)
const DEFAULT_POLICIES: Array<{
  category: ModerationCategory;
  enabled: boolean;
  confidenceThreshold: number;
  enforcementBehavior: EnforcementBehavior;
}> = [
  {
    category: ModerationCategory.GRAPHIC_VIOLENCE,
    enabled: true,
    confidenceThreshold: 0.75,
    enforcementBehavior: EnforcementBehavior.AUTO_BLOCK,
  },
  {
    category: ModerationCategory.HATE_SYMBOLS,
    enabled: true,
    confidenceThreshold: 0.7,
    enforcementBehavior: EnforcementBehavior.AUTO_BLOCK,
  },
  {
    category: ModerationCategory.SELF_HARM,
    enabled: true,
    confidenceThreshold: 0.6,
    enforcementBehavior: EnforcementBehavior.AUTO_BLOCK,
  },
  {
    category: ModerationCategory.EXTREMIST_PROPAGANDA,
    enabled: true,
    confidenceThreshold: 0.7,
    enforcementBehavior: EnforcementBehavior.AUTO_BLOCK,
  },
  {
    category: ModerationCategory.WEAPONS_CONTRABAND,
    enabled: true,
    confidenceThreshold: 0.65,
    enforcementBehavior: EnforcementBehavior.FLAG_FOR_REVIEW,
  },
  {
    category: ModerationCategory.HARASSMENT_HUMILIATION,
    enabled: true,
    confidenceThreshold: 0.65,
    enforcementBehavior: EnforcementBehavior.FLAG_FOR_REVIEW,
  },
];

/**
 * Idempotent seed: creates any missing category policy documents.
 * Safe to call on every app start.
 */
export async function seedDefaultPolicies(): Promise<void> {
  for (const def of DEFAULT_POLICIES) {
    const exists = await Policy.findOne({ category: def.category });
    if (!exists) {
      await Policy.create(def);
      console.log(`[policy-seed] created default policy for ${def.category}`);
    }
  }
}

export async function getAllPolicies() {
  return Policy.find().sort({ category: 1 });
}

export async function getPolicyByCategory(category: ModerationCategory) {
  return Policy.findOne({ category });
}

/**
 * Returns a point-in-time snapshot of all category policies.
 * This snapshot is what gets embedded into a submission's verdict,
 * so future policy edits never retroactively alter past verdicts.
 */
export async function getPolicySnapshot(): Promise<PolicyCategorySnapshot[]> {
  const policies = await Policy.find();
  return policies.map((p) => ({
    category: p.category,
    enabled: p.enabled,
    confidenceThreshold: p.confidenceThreshold,
    enforcementBehavior: p.enforcementBehavior,
  }));
}
