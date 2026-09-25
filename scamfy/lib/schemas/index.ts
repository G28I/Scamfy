/**
 * Canonical Risk Levels and Category Enums for Frontend
 */

export const RiskLevels = {
  LOW: "LOW",
  MODERATE: "MODERATE",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
  UNCERTAIN: "UNCERTAIN",
} as const;

export type RiskLevel = (typeof RiskLevels)[keyof typeof RiskLevels];

export const ScamCategories = {
  CAT_JOB_TASK: "CAT_JOB_TASK",
  CAT_ROMANCE_FINANCIAL: "CAT_ROMANCE_FINANCIAL",
  CAT_MONEY_MULE: "CAT_MONEY_MULE",
  CAT_LOAN_PREDATORY: "CAT_LOAN_PREDATORY",
  CAT_INVESTMENT_TRAP: "CAT_INVESTMENT_TRAP",
  CAT_IMPERSONATION_ARREST: "CAT_IMPERSONATION_ARREST",
  CAT_MARKETPLACE_QR: "CAT_MARKETPLACE_QR",
} as const;

export type ScamCategory = (typeof ScamCategories)[keyof typeof ScamCategories];

export const CanonicalRoles = {
  ANONYMOUS: "anonymous",
  STUDENT_USER: "student_user",
  COLLEGE_ADMIN: "college_admin",
  MODERATOR: "moderator",
} as const;

export type CanonicalRole = (typeof CanonicalRoles)[keyof typeof CanonicalRoles];
