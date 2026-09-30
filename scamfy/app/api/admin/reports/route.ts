import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReportStatus, VerificationStatus, RiskLevel } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";

/**
 * GET /api/admin/reports
 *
 * Retrieves community reports for moderator triage with filtering and pagination.
 * Requires authenticated session with 'moderator' or 'college_admin' role.
 *
 * @param req - The incoming Next.js request containing search query parameters (status, limit, offset)
 * @returns JSON response containing reports list, total count, limit, and offset
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required." },
        { status: 401 }
      );
    }
    if (session.role !== "moderator" && session.role !== "college_admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Moderator role required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") || "PENDING";
    const rawLimit = Number(searchParams.get("limit"));
    const limit = Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.max(rawLimit, 1), 100)
      : 50;

    const rawOffset = Number(searchParams.get("offset"));
    const offset = Number.isFinite(rawOffset) && rawOffset >= 0
      ? Math.min(Math.max(rawOffset, 0), 10000)
      : 0;

    const validStatuses = new Set<string>(Object.values(ReportStatus));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (statusParam !== "ALL") {
      if (!validStatuses.has(statusParam)) {
        return NextResponse.json(
          { error: "ValidationError", message: `Invalid status parameter: ${statusParam}` },
          { status: 400 }
        );
      }
      where.status = statusParam as ReportStatus;
    }

    const [reports, total] = await Promise.all([
      prisma.communityReport.findMany({
        where,
        include: {
          pattern: true,
          reporter: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.communityReport.count({ where }),
    ]);

    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r.id,
        reporterUserId: r.reporterUserId,
        reporterEmail: r.reporter?.email || "anonymous",
        patternId: r.patternId,
        indicatorType: r.indicatorType,
        indicatorValue: r.indicatorValue,
        category: r.category,
        description: r.description,
        status: r.status,
        moderatorNotes: r.moderatorNotes,
        pattern: r.pattern
          ? {
              id: r.pattern.id,
              reportCount: r.pattern.reportCount,
              riskLevel: r.pattern.riskLevel,
              verificationStatus: r.pattern.verificationStatus,
              lastReportedAt: r.pattern.lastReportedAt.toISOString(),
            }
          : null,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      limit,
      offset,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch moderation queue.";
    return NextResponse.json({ error: "FetchError", message: errorMsg }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/reports
 *
 * Applies a moderation triage action (APPROVE, REJECT, DISMISS, MERGE) to a community report
 * and records an immutable audit log entry.
 * Requires authenticated session with 'moderator' or 'college_admin' role.
 *
 * @param req - The incoming Next.js request containing reportId, action, moderatorNotes, targetPatternId, riskLevel
 * @returns JSON response indicating status and outcome of the moderation action
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required." },
        { status: 401 }
      );
    }

    if (session.role !== "moderator" && session.role !== "college_admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Moderator role required." },
        { status: 403 }
      );
    }

    const actorId = session.userId;
    const actorRole = session.role;

    const body = await req.json();
    const { reportId, action, moderatorNotes, targetPatternId, riskLevel } = body;

    if (!reportId || !action) {
      return NextResponse.json(
        { error: "ValidationError", message: "reportId and action are required." },
        { status: 400 }
      );
    }

    if (riskLevel && !Object.values(RiskLevel).includes(riskLevel as RiskLevel)) {
      return NextResponse.json(
        { error: "ValidationError", message: `Invalid riskLevel: ${riskLevel}` },
        { status: 400 }
      );
    }

    const report = await prisma.communityReport.findUnique({
      where: { id: reportId },
      include: { pattern: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: "NotFound", message: "Community report not found." },
        { status: 404 }
      );
    }

    switch (action) {
      case "APPROVE": {
        const targetRiskLevel = (riskLevel as RiskLevel) || report.pattern?.riskLevel || RiskLevel.HIGH_RISK;

        await prisma.$transaction(async (tx) => {
          // 1. Approve the report
          await tx.communityReport.update({
            where: { id: reportId },
            data: {
              status: ReportStatus.APPROVED,
              moderatorNotes: moderatorNotes || "Approved by moderator.",
            },
          });

          // 2. Elevate linked pattern to MODERATOR_VERIFIED (REP-05)
          if (report.patternId) {
            await tx.scamPattern.update({
              where: { id: report.patternId },
              data: {
                verificationStatus: VerificationStatus.MODERATOR_VERIFIED,
                riskLevel: targetRiskLevel,
              },
            });
          }

          // 3. Log immutable AuditEvent (SEC-06)
          await tx.auditEvent.create({
            data: {
              actorId,
              actorRole,
              action: "REPORT_APPROVED",
              targetResourceType: "CommunityReport",
              targetResourceId: reportId,
              details: {
                patternId: report.patternId,
                indicatorType: report.indicatorType,
                indicatorValue: report.indicatorValue,
                newVerificationStatus: VerificationStatus.MODERATOR_VERIFIED,
                riskLevel: targetRiskLevel,
              },
            },
          });
        });

        return NextResponse.json({
          success: true,
          message: "Report approved and pattern signature marked as MODERATOR_VERIFIED.",
          status: ReportStatus.APPROVED,
        });
      }

      case "REJECT": {
        await prisma.$transaction(async (tx) => {
          await tx.communityReport.update({
            where: { id: reportId },
            data: {
              status: ReportStatus.REJECTED,
              moderatorNotes: moderatorNotes || "Rejected by moderator.",
            },
          });

          // Log immutable AuditEvent (SEC-06)
          await tx.auditEvent.create({
            data: {
              actorId,
              actorRole,
              action: "REPORT_REJECTED",
              targetResourceType: "CommunityReport",
              targetResourceId: reportId,
              details: {
                patternId: report.patternId,
                indicatorValue: report.indicatorValue,
                reason: moderatorNotes,
              },
            },
          });
        });

        return NextResponse.json({
          success: true,
          message: "Report rejected.",
          status: ReportStatus.REJECTED,
        });
      }

      case "DISMISS": {
        await prisma.$transaction(async (tx) => {
          await tx.communityReport.update({
            where: { id: reportId },
            data: {
              status: ReportStatus.REJECTED,
              moderatorNotes: moderatorNotes || "Dismissed as false positive.",
            },
          });

          if (report.patternId) {
            await tx.scamPattern.update({
              where: { id: report.patternId },
              data: {
                verificationStatus: VerificationStatus.DISMISSED,
              },
            });
          }

          await tx.auditEvent.create({
            data: {
              actorId,
              actorRole,
              action: "PATTERN_DISMISSED",
              targetResourceType: "ScamPattern",
              targetResourceId: report.patternId || reportId,
              details: {
                reportId,
                indicatorValue: report.indicatorValue,
                reason: moderatorNotes,
              },
            },
          });
        });

        return NextResponse.json({
          success: true,
          message: "Pattern dismissed and suppressed from public intelligence.",
          status: ReportStatus.REJECTED,
        });
      }

      case "MERGE": {
        if (!targetPatternId) {
          return NextResponse.json(
            { error: "ValidationError", message: "targetPatternId required for MERGE action." },
            { status: 400 }
          );
        }

        const targetPattern = await prisma.scamPattern.findUnique({
          where: { id: targetPatternId },
        });

        if (!targetPattern) {
          return NextResponse.json(
            { error: "NotFound", message: "Target pattern not found for merge." },
            { status: 404 }
          );
        }

        await prisma.$transaction(async (tx) => {
          // Relink report to target pattern
          await tx.communityReport.update({
            where: { id: reportId },
            data: {
              patternId: targetPatternId,
              status: ReportStatus.MERGED,
              moderatorNotes: moderatorNotes || `Merged into pattern ${targetPatternId}`,
            },
          });

          // Increment target pattern reportCount
          await tx.scamPattern.update({
            where: { id: targetPatternId },
            data: {
              reportCount: { increment: 1 },
              lastReportedAt: new Date(),
            },
          });

          // Decrement source pattern reportCount if distinct
          if (report.patternId && report.patternId !== targetPatternId) {
            const sourcePattern = await tx.scamPattern.findUnique({
              where: { id: report.patternId },
            });
            if (sourcePattern && sourcePattern.reportCount > 0) {
              await tx.scamPattern.update({
                where: { id: report.patternId },
                data: {
                  reportCount: { decrement: 1 },
                },
              });
            }
          }

          await tx.auditEvent.create({
            data: {
              actorId,
              actorRole,
              action: "REPORT_MERGED",
              targetResourceType: "CommunityReport",
              targetResourceId: reportId,
              details: {
                sourcePatternId: report.patternId,
                targetPatternId,
                indicatorValue: report.indicatorValue,
              },
            },
          });
        });

        return NextResponse.json({
          success: true,
          message: "Report merged into canonical pattern successfully.",
          status: ReportStatus.MERGED,
        });
      }

      default:
        return NextResponse.json(
          { error: "ValidationError", message: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to process moderation action.";
    return NextResponse.json({ error: "ModerationError", message: errorMsg }, { status: 500 });
  }
}

