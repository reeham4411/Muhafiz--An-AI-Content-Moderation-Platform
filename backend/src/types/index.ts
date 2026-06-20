// Central type definitions and enums used across the backend

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum Verdict {
  APPROVED = "APPROVED",
  FLAGGED = "FLAGGED",
  BLOCKED = "BLOCKED",
}

export enum EnforcementBehavior {
  AUTO_BLOCK = "AUTO_BLOCK",
  FLAG_FOR_REVIEW = "FLAG_FOR_REVIEW",
}

export enum ModerationCategory {
  GRAPHIC_VIOLENCE = "GRAPHIC_VIOLENCE",
  HATE_SYMBOLS = "HATE_SYMBOLS",
  SELF_HARM = "SELF_HARM",
  EXTREMIST_PROPAGANDA = "EXTREMIST_PROPAGANDA",
  WEAPONS_CONTRABAND = "WEAPONS_CONTRABAND",
  HARASSMENT_HUMILIATION = "HARASSMENT_HUMILIATION",
}

export enum AppealStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

// Result returned by any moderation provider for a single category check
export interface CategoryProviderResult {
  category: ModerationCategory;
  violationDetected: boolean;
  confidenceScore: number; // 0 - 1
  reasoning: string;
}

// Full provider response for one image, one result per enabled category
export interface ProviderModerationResult {
  results: CategoryProviderResult[];
  provider: string;
}

// Policy snapshot embedded into a verdict at moderation time
export interface PolicyCategorySnapshot {
  category: ModerationCategory;
  enabled: boolean;
  confidenceThreshold: number;
  enforcementBehavior: EnforcementBehavior;
}

// Per-category breakdown stored on each moderated image
export interface CategoryBreakdown {
  category: ModerationCategory;
  violationDetected: boolean;
  confidenceScore: number;
  reasoning: string;
  thresholdUsed: number;
  enforcementUsed: EnforcementBehavior;
  contributedToVerdict: boolean;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}
