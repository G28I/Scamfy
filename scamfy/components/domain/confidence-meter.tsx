import * as React from "react";
import { Gauge, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ConfidenceTier = "low" | "medium" | "high";

export interface ConfidenceMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  level: ConfidenceTier;
  score?: number; // 0.0 to 1.0 (internal weighting)
  label?: string; // Default: "Analysis Confidence"
  signalCount?: number;
  explanation?: string;
}

const tierConfig: Record<
  ConfidenceTier,
  { label: string; segments: number; colorClass: string; description: string }
> = {
  low: {
    label: "Limited Data",
    segments: 1,
    colorClass: "bg-amber-500",
    description: "Preliminary analysis based on few observed signals; further verification recommended.",
  },
  medium: {
    label: "Moderate Confidence",
    segments: 2,
    colorClass: "bg-blue-500",
    description: "Corroborated by deterministic pattern matches and structured entity extraction.",
  },
  high: {
    label: "High Analysis Confidence",
    segments: 3,
    colorClass: "bg-emerald-500",
    description: "Strong signal alignment across multiple independent indicators and known fraud templates.",
  },
};

export function ConfidenceMeter({
  level,
  score,
  label = "Analysis Confidence",
  signalCount,
  explanation,
  className,
  ...props
}: ConfidenceMeterProps) {
  void score;
  const config = tierConfig[level] || tierConfig.medium;
  const tooltipText =
    explanation ||
    `${config.description} Note: Analysis confidence reflects data completeness and model signal strength, not legal or investigative determinations.`;

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3 shadow-sm",
        className
      )}
      role="region"
      aria-label={`${label}: ${config.label}`}
      {...props}
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 font-medium text-foreground">
          <Gauge className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <span>{label}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                  aria-label="Confidence meter explanation"
                >
                  <HelpCircle className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs leading-relaxed">
                <p>{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <span className="text-[11px] font-semibold text-muted-foreground">
          {config.label}
          {signalCount !== undefined && ` (${signalCount} signals)`}
        </span>
      </div>

      {/* 3-segment visual meter */}
      <div className="grid grid-cols-3 gap-1.5 h-2 w-full rounded bg-muted/50 p-0.5" aria-hidden="true">
        {[1, 2, 3].map((seg) => (
          <div
            key={seg}
            className={cn(
              "h-full rounded-sm transition-all",
              seg <= config.segments ? config.colorClass : "bg-muted"
            )}
          />
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground leading-tight">
        Indicates signal correlation strength, not legal proof.
      </p>
    </div>
  );
}
