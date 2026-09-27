import { NextRequest, NextResponse } from "next/server";
import { IndicatorType } from "@prisma/client";
import { ingestCommunityReport } from "@/lib/services/pattern-service";
import { prisma } from "@/lib/prisma";

// In-memory rate limiting for report submissions (10 per minute per IP)
const reportRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const REPORT_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REPORTS_PER_MINUTE = 10;

function checkReportRateLimit(ip: string): boolean {
  const now = Date.now();
  for (const [key, val] of reportRateLimitMap.entries()) {
    if (now > val.resetTime) {
      reportRateLimitMap.delete(key);
    }
  }

  const record = reportRateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    reportRateLimitMap.set(ip, { count: 1, resetTime: now + REPORT_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REPORTS_PER_MINUTE) {
    return true;
  }

  record.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (checkReportRateLimit(clientIp)) {
      return NextResponse.json(
        {
          error: "RateLimitExceeded",
          message: "Too many report submissions. Please wait a minute before submitting again.",
          status: 429,
        },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const { indicatorType, indicatorValue, category, description } = body;

    const validTypes = new Set(Object.values(IndicatorType));
    if (!indicatorType || !validTypes.has(indicatorType)) {
      return NextResponse.json(
        {
          error: "ValidationError",
          message: "Invalid or missing indicatorType.",
          status: 400,
        },
        { status: 400 }
      );
    }

    if (!indicatorValue || typeof indicatorValue !== "string" || indicatorValue.trim().length === 0) {
      return NextResponse.json(
        {
          error: "ValidationError",
          message: "Indicator value is required.",
          status: 400,
        },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 5) {
      return NextResponse.json(
        {
          error: "ValidationError",
          message: "Description must be at least 5 characters long.",
          status: 400,
        },
        { status: 400 }
      );
    }

    // Identify user for report attribution (REP-02)
    const reporterUserId = req.headers.get("x-user-id");
    if (!reporterUserId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required to submit a community report.",
        },
        { status: 401 }
      );
    }

    const result = await ingestCommunityReport(
      {
        indicatorType,
        indicatorValue,
        category: category || "SUSPICIOUS_COMMUNICATION",
        description,
      },
      reporterUserId
    );

    return NextResponse.json(
      {
        reportId: result.report.id,
        patternId: result.pattern.id,
        indicatorType: result.report.indicatorType,
        indicatorValue: result.report.indicatorValue,
        category: result.report.category,
        status: result.report.status,
        reportCount: result.pattern.reportCount,
        message: "Community report submitted successfully and queued for moderator review.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes("indicator") ||
        err.message.includes("description") ||
        err.message.includes("Invalid"))
    ) {
      return NextResponse.json(
        {
          error: "ValidationError",
          message: err.message,
          status: 400,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "InternalError",
        message: "Failed to submit report.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const reporterUserId = req.headers.get("x-user-id");
    if (!reporterUserId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required." },
        { status: 401 }
      );
    }

    const reports = await prisma.communityReport.findMany({
      where: { reporterUserId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r.id,
        indicatorType: r.indicatorType,
        indicatorValue: r.indicatorValue,
        category: r.category,
        description: r.description,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      })),
      total: reports.length,
    });
  } catch {
    return NextResponse.json(
      { error: "InternalError", message: "Failed to fetch reports." },
      { status: 500 }
    );
  }
}
