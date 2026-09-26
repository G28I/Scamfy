import * as React from "react";
import { Copy, Check, Hash, Phone, Globe, AtSign, Landmark, FileCode, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type IndicatorType =
  | "UPI_ID"
  | "PHONE"
  | "DOMAIN"
  | "HANDLE"
  | "BANK_ACC"
  | "SCRIPT";

const typeIcons: Record<IndicatorType, LucideIcon> = {
  UPI_ID: Hash,
  PHONE: Phone,
  DOMAIN: Globe,
  HANDLE: AtSign,
  BANK_ACC: Landmark,
  SCRIPT: FileCode,
};

const typeLabels: Record<IndicatorType, string> = {
  UPI_ID: "UPI ID",
  PHONE: "Phone",
  DOMAIN: "Domain / URL",
  HANDLE: "Social Handle",
  BANK_ACC: "Bank Account",
  SCRIPT: "Script / Template",
};

export interface IndicatorTagProps extends React.HTMLAttributes<HTMLDivElement> {
  type: IndicatorType;
  value: string;
  copyable?: boolean;
  truncateLength?: number;
}

export function IndicatorTag({
  type,
  value,
  copyable = true,
  truncateLength = 32,
  className,
  ...props
}: IndicatorTagProps) {
  const [copied, setCopied] = React.useState(false);
  const Icon = typeIcons[type] || Hash;
  const typeLabel = typeLabels[type] || type;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(false);
    }
  };

  const displayValue =
    value.length > truncateLength
      ? `${value.slice(0, truncateLength)}…`
      : value;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-card-foreground shadow-sm transition-colors max-w-full min-h-[36px]",
        className
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
        <Icon className="h-3 w-3" aria-hidden="true" />
        <span>{typeLabel}</span>
      </span>

      <span
        className="font-mono text-xs font-medium text-foreground truncate max-w-[200px] sm:max-w-[320px] select-all"
        title={value}
      >
        {displayValue}
      </span>

      {copyable && (
        <button
          type="button"
          onClick={handleCopy}
          className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 transition-colors"
          aria-label={copied ? `Copied ${value} to clipboard` : `Copy ${typeLabel} ${value}`}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      )}

      {/* Screen reader live notification */}
      <span className="sr-only" aria-live="polite">
        {copied ? `${typeLabel} copied to clipboard.` : ""}
      </span>
    </div>
  );
}
