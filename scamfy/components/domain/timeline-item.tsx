import * as React from "react";
import { CircleDot, ArrowUpRight, ArrowDownLeft, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  timestamp: string | Date;
  eventType: string;
  description: string;
  amount?: number | string;
  currency?: string;
  counterparty?: string;
  isDebit?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export function TimelineItem({
  timestamp,
  eventType,
  description,
  amount,
  currency = "₹",
  counterparty,
  isDebit = true,
  isFirst: _isFirst = false,
  isLast = false,
  className,
  ...props
}: TimelineItemProps) {
  const formattedDate =
    typeof timestamp === "string"
      ? timestamp
      : timestamp.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

  return (
    <div
      className={cn("relative flex items-start gap-4 pb-6", className)}
      role="article"
      aria-label={`Timeline event: ${eventType} at ${formattedDate}`}
      {...props}
    >
      {/* Connector Line */}
      {!isLast && (
        <div
          className="absolute left-[15px] top-6 bottom-0 w-[2px] bg-border"
          aria-hidden="true"
        />
      )}

      {/* Event Node Icon */}
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-sm">
        {amount ? (
          isDebit ? (
            <ArrowUpRight className="h-4 w-4 text-destructive" aria-hidden="true" />
          ) : (
            <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          )
        ) : eventType.toLowerCase().includes("message") || eventType.toLowerCase().includes("call") ? (
          <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        ) : (
          <CircleDot className="h-4 w-4 text-primary" aria-hidden="true" />
        )}
      </div>

      {/* Content Card */}
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-border/80">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {eventType}
            </span>
            {counterparty && (
              <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                to: {counterparty}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <time>{formattedDate}</time>
          </div>
        </div>

        <p className="text-sm text-foreground leading-relaxed">{description}</p>

        {amount && (
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-xs">
            <span className="text-muted-foreground">Financial Impact:</span>
            <span
              className={cn(
                "font-mono font-bold text-sm",
                isDebit ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {isDebit ? "-" : "+"} {currency} {amount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
