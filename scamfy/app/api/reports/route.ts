import { NextRequest, NextResponse } from "next/server";
import { IndicatorType } from "@prisma/client";
import { ingestCommunityReport } from "@/lib/services/pattern-service";
import { prisma } from "@/lib/prisma";
import { ValidationError } from "@/lib/errors";
import { getAuthSession } from "@/lib/auth";

// In-memory rate limiting for report submissions (10 per minute per IP / user)
const reportRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const REPORT_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REPORTS_PER_MINUTE = 10;

/**
 * Checks in-memory submission rate limit for a client IP and user key.
 *
 * @param rateLimitKey - Combined IP and user identifier string
 * @returns True if rate limit is exceeded, false otherwise
 */
function checkReportRateLimit(rateLimitKey: string): boolean {
  const now = Date.now();
  for (const [key, val] of reportRateLimitMap.entries()) {
    if (now > val.resetTime) {
      reportRateLimitMap.delete(key);
    }
  }

  const record = reportRateLimitMap.get(rateLimitKey);
  if (!record || now > record.resetTime) {
    reportRateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + REPORT_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REPORTS_PER_MINUTE) {
    return true;
  }

  record.count += 1;
  return false;
}

/**
 * POST /api/reports
 *
 * Submits a community scam report, validates indicator syntax, links/upserts the pattern,
 * and attributes the report to the authenticated user.
 *
 * @param req - Incoming Next.js request with indicatorType, indicatorValue, category, and description
 * @returns JSON response with report and pattern IDs, status, and confirmation message
 */
export async function POST(req: NextRequest) {
  try {
    // Identify user for report attribution via server session (REP-02)
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required to submit a community report.",
        },
        { status: 401 }
      );
    }
    const reporterUserId = session.userId;

    const forwardedHops =
      req.headers.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean) || [];
    const clientIp =
      req.headers.get("x-real-ip") ||
      (forwardedHops.length > 0 ? forwardedHops[forwardedHops.length - 1] : "127.0.0.1");

    const rateLimitKey = `${clientIp}:${reporterUserId}`;

    if (checkReportRateLimit(rateLimitKey)) {
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
    if (err instanceof ValidationError) {
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

/**
 * GET /api/reports
 *
 * Retrieves reports previously submitted by the currently authenticated user.
 *
 * @param req - Incoming Next.js request
 * @returns JSON response containing list of submitted reports
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

    const reports = await prisma.communityReport.findMany({
      where: { reporterUserId: session.userId },
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
