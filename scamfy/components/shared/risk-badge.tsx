import * as React from "react";
import { cn } from "@/lib/utils";
import { type RiskLevel, RiskLevels } from "@/lib/schemas";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const styles = {
    [RiskLevels.LOW]: "bg-emerald-100 text-emerald-800 border-emerald-300",
    [RiskLevels.MODERATE]: "bg-amber-100 text-amber-800 border-amber-300",
    [RiskLevels.HIGH]: "bg-orange-100 text-orange-800 border-orange-300",
    [RiskLevels.CRITICAL]: "bg-rose-100 text-rose-800 border-rose-300",
    [RiskLevels.UNCERTAIN]: "bg-slate-100 text-slate-800 border-slate-300",
  }[level];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        styles,
        className
      )}
    >
      {level}
    </span>
  );
}
