import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { RiskLevel } from "@prisma/client";

export interface CheckApiRequest {
  text: string;
}

export interface ExtractedEntitiesDto {
  upi_ids: string[];
  phone_numbers: string[];
  urls: string[];
  emails: string[];
  bank_accounts: string[];
  amounts: string[];
  handles: string[];
}

export interface AnalysisSignalDto {
  id: string;
  name: string;
  description: string;
  severity: "SAFE" | "CAUTION" | "SUSPICIOUS" | "HIGH_RISK" | "CRITICAL";
  evidence: string;
}

export interface AnalysisResultDto {
  id: string;
  overall_risk: "SAFE" | "CAUTION" | "SUSPICIOUS" | "HIGH_RISK" | "CRITICAL";
  confidence: "low" | "medium" | "high";
  primary_category: string;
  secondary_categories: string[];
  signals: AnalysisSignalDto[];
  extracted_entities: ExtractedEntitiesDto;
  action_recommendations: string[];
  model_metadata: Record<string, unknown>;
  created_at: string;
}

// In-memory rate limiter per IP for SEC-05 (30 requests per minute)
const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_MINUTE = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Prune expired entries to prevent memory accumulation
  for (const [key, val] of ipRateLimitMap.entries()) {
    if (now > val.resetTime) {
      ipRateLimitMap.delete(key);
    }
  }

  const record = ipRateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    ipRateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return true;
  }

  record.count += 1;
  return false;
}

function isValidAnalysisPayload(data: unknown): data is Omit<AnalysisResultDto, "id" | "created_at"> {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;

  const validRisks = new Set(["SAFE", "CAUTION", "SUSPICIOUS", "HIGH_RISK", "CRITICAL"]);
  const validConfidences = new Set(["low", "medium", "high"]);

  if (typeof d.overall_risk !== "string" || !validRisks.has(d.overall_risk)) return false;
  if (typeof d.confidence !== "string" || !validConfidences.has(d.confidence)) return false;
  if (typeof d.primary_category !== "string") return false;
  if (!Array.isArray(d.secondary_categories)) return false;
  if (!Array.isArray(d.signals)) return false;
  if (!Array.isArray(d.action_recommendations)) return false;
  if (!d.model_metadata || typeof d.model_metadata !== "object") return false;

  const entities = d.extracted_entities as Record<string, unknown> | undefined;
  if (!entities || typeof entities !== "object") return false;
  if (!Array.isArray(entities.upi_ids)) return false;
  if (!Array.isArray(entities.phone_numbers)) return false;
  if (!Array.isArray(entities.urls)) return false;
  if (!Array.isArray(entities.emails)) return false;
  if (!Array.isArray(entities.bank_accounts)) return false;
  if (!Array.isArray(entities.amounts)) return false;
  if (!Array.isArray(entities.handles)) return false;

  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Rate Limiting (SEC-05)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          error: "RateLimitExceeded",
          message: "Too many analysis requests. Please wait a minute before submitting again.",
          status: 429,
        },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // 2. Validate Input Payload (DET-01)
    const body = await req.json();
    const { text } = body as Partial<CheckApiRequest>;

    if (!text || typeof text !== "string" || text.trim().length < 3) {
      return NextResponse.json(
        {
          error: "ValidationError",
          message: "Input message text must be at least 3 characters long.",
          status: 400,
        },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        {
          error: "ValidationError",
          message: "Input message text cannot exceed 10,000 characters.",
          status: 400,
        },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const inputHash = crypto.createHash("sha256").update(trimmedText).digest("hex");

    // 3. Call Upstream FastAPI Analysis Engine
    const backendBaseUrl = process.env.FASTAPI_BACKEND_URL || "http://127.0.0.1:8000";
    const internalSecret = process.env.INTERNAL_API_SECRET || "scamfy-internal-secret-dev";
    let analysisPayload: Omit<AnalysisResultDto, "id" | "created_at">;

    try {
      const response = await fetch(`${backendBaseUrl}/api/v1/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Secret": internalSecret,
          "X-Client-IP": clientIp,
        },
        body: JSON.stringify({ text: trimmedText }),
        signal: AbortSignal.timeout(8000), // 8s timeout
      });

      if (!response.ok) {
        throw new Error(`Upstream analysis service error: ${response.status}`);
      }

      const rawJson = await response.json();
      if (!isValidAnalysisPayload(rawJson)) {
        throw new Error("Invalid response schema received from upstream analysis service");
      }

      analysisPayload = rawJson;
    } catch (fetchErr) {
      console.error("FastAPI analysis service unreachable or returned invalid response:", fetchErr);
      return NextResponse.json(
        {
          error: "AnalysisServiceUnavailable",
          message:
            "The scam analysis engine is temporarily unavailable. Please try again shortly.",
          status: 503,
        },
        { status: 503 }
      );
    }

    // 4. Persist Check Record to PostgreSQL via Prisma (SEC-01, SEC-04)
    let savedRecord;
    try {
      savedRecord = await prisma.scamCheck.create({
        data: {
          userId: null,
          inputHash,
          overallRisk: analysisPayload.overall_risk as RiskLevel,
          primaryCategory: analysisPayload.primary_category,
          secondaryCategories: analysisPayload.secondary_categories,
          signals: analysisPayload.signals as unknown as object,
          extractedEntities: analysisPayload.extracted_entities as unknown as object,
          modelMetadata: analysisPayload.model_metadata as unknown as object,
          actionRecommendations: analysisPayload.action_recommendations,
        },
      });
    } catch (dbErr) {
      console.error("Prisma persistence failed for scam check:", dbErr);
      return NextResponse.json(
        {
          error: "PersistenceError",
          message: "Unable to record the analysis results. Please try again.",
          status: 500,
        },
        { status: 500 }
      );
    }

    // 5. Return Full Structured Triage Result
    const result: AnalysisResultDto = {
      id: savedRecord.id,
      overall_risk: analysisPayload.overall_risk,
      confidence: analysisPayload.confidence,
      primary_category: analysisPayload.primary_category,
      secondary_categories: analysisPayload.secondary_categories,
      signals: analysisPayload.signals,
      extracted_entities: analysisPayload.extracted_entities,
      action_recommendations: analysisPayload.action_recommendations,
      model_metadata: analysisPayload.model_metadata,
      created_at: savedRecord.createdAt.toISOString(),
    };

    return NextResponse.json(result, { status: 200 });
  } catch {
    // SEC-03: Never leak internal error details or stack traces
    return NextResponse.json(
      {
        error: "InternalServerError",
        message: "An unexpected error occurred while analyzing the message. Please try again.",
        status: 500,
      },
      { status: 500 }
    );
  }
}
