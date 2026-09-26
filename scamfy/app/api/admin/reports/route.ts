import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReportStatus, VerificationStatus, RiskLevel } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const actorRole = req.headers.get("x-user-role") || "moderator";
    if (actorRole !== "moderator" && actorRole !== "college_admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Moderator role required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") || "PENDING";
    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (statusParam !== "ALL") {
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

export async function PATCH(req: NextRequest) {
  try {
    const actorId = req.headers.get("x-user-id") || "system_moderator";
    const actorRole = req.headers.get("x-user-role") || "moderator";

    if (actorRole !== "moderator" && actorRole !== "college_admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Moderator role required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { reportId, action, moderatorNotes, targetPatternId, riskLevel } = body;

    if (!reportId || !action) {
      return NextResponse.json(
        { error: "ValidationError", message: "reportId and action are required." },
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
        // 1. Approve the report
        await prisma.communityReport.update({
          where: { id: reportId },
          data: {
            status: ReportStatus.APPROVED,
            moderatorNotes: moderatorNotes || "Approved by moderator.",
          },
        });

        // 2. Elevate linked pattern to MODERATOR_VERIFIED (REP-05)
        if (report.patternId) {
          await prisma.scamPattern.update({
            where: { id: report.patternId },
            data: {
              verificationStatus: VerificationStatus.MODERATOR_VERIFIED,
              riskLevel: (riskLevel as RiskLevel) || report.pattern?.riskLevel || RiskLevel.HIGH_RISK,
            },
          });
        }

        // 3. Log immutable AuditEvent (SEC-06)
        await prisma.auditEvent.create({
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
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: "Report approved and pattern signature marked as MODERATOR_VERIFIED.",
          status: ReportStatus.APPROVED,
        });
      }

      case "REJECT": {
        await prisma.communityReport.update({
          where: { id: reportId },
          data: {
            status: ReportStatus.REJECTED,
            moderatorNotes: moderatorNotes || "Rejected by moderator.",
          },
        });

        // Log immutable AuditEvent (SEC-06)
        await prisma.auditEvent.create({
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

        return NextResponse.json({
          success: true,
          message: "Report rejected.",
          status: ReportStatus.REJECTED,
        });
      }

      case "DISMISS": {
        // Dismiss false-positive pattern
        await prisma.communityReport.update({
          where: { id: reportId },
          data: {
            status: ReportStatus.REJECTED,
            moderatorNotes: moderatorNotes || "Dismissed as false positive.",
          },
        });

        if (report.patternId) {
          await prisma.scamPattern.update({
            where: { id: report.patternId },
            data: {
              verificationStatus: VerificationStatus.DISMISSED,
            },
          });
        }

        await prisma.auditEvent.create({
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

        // Preserve contributing report provenance while updating canonical pattern link (REP-03, REP-05)
        await prisma.communityReport.update({
          where: { id: reportId },
          data: {
            patternId: targetPatternId,
            status: ReportStatus.MERGED,
            moderatorNotes: moderatorNotes || `Merged into pattern ${targetPatternId}`,
          },
        });

        await prisma.scamPattern.update({
          where: { id: targetPatternId },
          data: {
            reportCount: { increment: 1 },
            lastReportedAt: new Date(),
          },
        });

        await prisma.auditEvent.create({
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
