import { describe, it, expect } from "vitest";
import { RiskLevels, ScamCategories, CanonicalRoles } from "./schemas";

describe("Frontend Core Schema Sanity", () => {
  it("defines exactly 5 canonical risk levels", () => {
    expect(Object.keys(RiskLevels)).toEqual([
      "LOW",
      "MODERATE",
      "HIGH",
      "CRITICAL",
      "UNCERTAIN",
    ]);
  });

  it("defines exactly 7 core scam categories", () => {
    expect(Object.keys(ScamCategories)).toHaveLength(7);
    expect(ScamCategories.CAT_IMPERSONATION_ARREST).toBe("CAT_IMPERSONATION_ARREST");
    expect(ScamCategories.CAT_ROMANCE_FINANCIAL).toBe("CAT_ROMANCE_FINANCIAL");
  });

  it("defines the 4 canonical RBAC roles", () => {
    expect(Object.values(CanonicalRoles)).toEqual([
      "anonymous",
      "student_user",
      "college_admin",
      "moderator",
    ]);
  });
});
