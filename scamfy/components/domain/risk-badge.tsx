import * as React from "react";
import {
  ShieldCheck,
  Info,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export type RiskLevel = "SAFE" | "CAUTION" | "SUSPICIOUS" | "HIGH_RISK" | "CRITICAL";

const riskBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-semibold transition-all select-none border",
  {
    variants: {
      level: {
        SAFE: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
        CAUTION:
          "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
        SUSPICIOUS:
          "bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800",
        HIGH_RISK:
          "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
        CRITICAL:
          "bg-red-100 text-red-950 border-red-400 font-bold dark:bg-red-950 dark:text-red-100 dark:border-red-600 shadow-sm",
      },
      size: {
        sm: "px-2.5 py-0.5 text-xs",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      level: "SAFE",
      size: "md",
    },
  }
);

const riskIconMap: Record<RiskLevel, LucideIcon> = {
  SAFE: ShieldCheck,
  CAUTION: Info,
  SUSPICIOUS: AlertTriangle,
  HIGH_RISK: AlertOctagon,
  CRITICAL: AlertCircle,
};

const riskLabels: Record<RiskLevel, string> = {
  SAFE: "Safe / Verified",
  CAUTION: "Caution Advised",
  SUSPICIOUS: "Suspicious Activity",
  HIGH_RISK: "High Risk Scam",
  CRITICAL: "Critical Threat (Immediate Loss)",
};

export interface RiskBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof riskBadgeVariants> {
  level: RiskLevel;
  showIcon?: boolean;
  showPulse?: boolean;
  customLabel?: string;
}

export function RiskBadge({
  level,
  size = "md",
  showIcon = true,
  showPulse = false,
  customLabel,
  className,
  ...props
}: RiskBadgeProps) {
  const Icon = riskIconMap[level];
  const label = customLabel || riskLabels[level];
  const isEmergency = level === "CRITICAL" || level === "HIGH_RISK";

  return (
    <div
      role="status"
      aria-label={`Risk Level: ${label}`}
      className={cn(riskBadgeVariants({ level, size }), className)}
      {...props}
    >
      {showPulse && isEmergency && (
        <span
          className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400 animate-ping motion-reduce:animate-none shrink-0"
          aria-hidden="true"
        />
      )}
      {showIcon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      <span>{label}</span>
    </div>
  );
}
