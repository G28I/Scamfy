import { NextRequest, NextResponse } from "next/server";
import { IndicatorType } from "@prisma/client";
import { listPublicPatterns, type ListPatternsFilters } from "@/lib/services/pattern-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const tier = (searchParams.get("tier") as "verified" | "community" | "all") || "verified";
    const indicatorType = searchParams.get("indicatorType") as IndicatorType | undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = Number(searchParams.get("limit")) || 20;
    const offset = Number(searchParams.get("offset")) || 0;

    const filters: ListPatternsFilters = {
      tier,
      category,
      search,
      limit,
      offset,
    };

    if (indicatorType && Object.values(IndicatorType).includes(indicatorType)) {
      filters.indicatorType = indicatorType;
    }

    const result = await listPublicPatterns(filters);

    return NextResponse.json({
      patterns: result.patterns,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      tier,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to query threat patterns.";
    return NextResponse.json(
      {
        error: "QueryError",
        message: errorMsg,
      },
      { status: 500 }
    );
  }
}
