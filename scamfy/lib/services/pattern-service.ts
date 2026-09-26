import { prisma } from "@/lib/prisma";
import {
  IndicatorType,
  ReportStatus,
  RiskLevel,
  VerificationStatus,
  type ScamPattern,
  type CommunityReport,
} from "@prisma/client";
import { validateIndicator } from "@/lib/indicators";

export interface IngestReportInput {
  indicatorType: IndicatorType;
  indicatorValue: string;
  category: string;
  description: string;
}

export interface ListPatternsFilters {
  tier?: "verified" | "community" | "all";
  indicatorType?: IndicatorType;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PublicPatternDto {
  id: string;
  indicatorType: IndicatorType;
  indicatorValue: string;
  category: string;
  riskLevel: RiskLevel;
  verificationStatus: VerificationStatus;
  reportCount: number;
  firstReportedAt: string;
  lastReportedAt: string;
  metadataPayload: Record<string, unknown>;
  createdAt: string;
}

/**
 * Ingests a new community indicator report with automated normalization, composite deduplication,
 * and linking to a ScamPattern (REP-01, REP-02, REP-03).
 *
 * CRITICAL SAFETY INVARIANT: Increasing reportCount alone NEVER auto-promotes an indicator
 * to MODERATOR_VERIFIED.
 */
export async function ingestCommunityReport(
  input: IngestReportInput,
  reporterUserId: string
): Promise<{ report: CommunityReport; pattern: ScamPattern }> {
  const validation = validateIndicator(input.indicatorType, input.indicatorValue);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid indicator value.");
  }

  const normalizedValue = validation.normalizedValue;
  const category = input.category.trim().toUpperCase() || "SUSPICIOUS_COMMUNICATION";
  const description = input.description.trim();

  if (description.length < 5) {
    throw new Error("Report description must be at least 5 characters.");
  }

  // 1. Check for existing pattern with composite key [indicatorType, indicatorValue] (REP-03)
  const existingPattern = await prisma.scamPattern.findUnique({
    where: {
      uq_scam_patterns_indicator_type_value: {
        indicatorType: input.indicatorType,
        indicatorValue: normalizedValue,
      },
    },
  });

  let pattern: ScamPattern;

  if (existingPattern) {
    // Increment report count & bump lastReportedAt.
    // INVARIANT: Do NOT change verificationStatus; volume accumulation does NOT verify a pattern.
    pattern = await prisma.scamPattern.update({
      where: { id: existingPattern.id },
      data: {
        reportCount: { increment: 1 },
        lastReportedAt: new Date(),
      },
    });
  } else {
    // Create new UNVERIFIED pattern record
    pattern = await prisma.scamPattern.create({
      data: {
        indicatorType: input.indicatorType,
        indicatorValue: normalizedValue,
        category,
        riskLevel: RiskLevel.HIGH_RISK,
        verificationStatus: VerificationStatus.UNVERIFIED,
        reportCount: 1,
        firstReportedAt: new Date(),
        lastReportedAt: new Date(),
        metadataPayload: {},
      },
    });
  }

  // 2. Insert CommunityReport linked to pattern, preserving reporter provenance (REP-02)
  const report = await prisma.communityReport.create({
    data: {
      reporterUserId,
      patternId: pattern.id,
      indicatorType: input.indicatorType,
      indicatorValue: normalizedValue,
      category,
      description,
      status: ReportStatus.PENDING,
    },
  });

  return { report, pattern };
}

/**
 * Lists public threat patterns strictly segmented by verification tier (REP-04).
 * Excludes internal moderation notes and private reporter identities.
 */
export async function listPublicPatterns(
  filters: ListPatternsFilters = {}
): Promise<{ patterns: PublicPatternDto[]; total: number; limit: number; offset: number }> {
  const limit = Math.min(Math.max(Number(filters.limit) || 20, 1), 100);
  const offset = Math.max(Number(filters.offset) || 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (filters.tier === "verified") {
    where.verificationStatus = VerificationStatus.MODERATOR_VERIFIED;
  } else if (filters.tier === "community") {
    where.verificationStatus = {
      in: [VerificationStatus.COMMUNITY_FLAGGED, VerificationStatus.UNVERIFIED],
    };
  } else {
    // By default exclude DISMISSED patterns from public view
    where.verificationStatus = {
      not: VerificationStatus.DISMISSED,
    };
  }

  if (filters.indicatorType) {
    where.indicatorType = filters.indicatorType;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.search && filters.search.trim().length > 0) {
    where.indicatorValue = {
      contains: filters.search.trim(),
      mode: "insensitive",
    };
  }

  const [patterns, total] = await Promise.all([
    prisma.scamPattern.findMany({
      where,
      orderBy: [{ reportCount: "desc" }, { lastReportedAt: "desc" }],
      take: limit,
      skip: offset,
    }),
    prisma.scamPattern.count({ where }),
  ]);

  const dtos: PublicPatternDto[] = patterns.map((p) => ({
    id: p.id,
    indicatorType: p.indicatorType,
    indicatorValue: p.indicatorValue,
    category: p.category,
    riskLevel: p.riskLevel,
    verificationStatus: p.verificationStatus,
    reportCount: p.reportCount,
    firstReportedAt: (p.firstReportedAt || new Date()).toISOString(),
    lastReportedAt: (p.lastReportedAt || new Date()).toISOString(),
    metadataPayload: (p.metadataPayload as Record<string, unknown>) || {},
    createdAt: (p.createdAt || new Date()).toISOString(),
  }));

  return { patterns: dtos, total, limit, offset };
}
