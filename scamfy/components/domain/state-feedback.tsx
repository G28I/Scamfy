import * as React from "react";
import { AlertCircle, RefreshCw, HelpCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type FeedbackState = "idle" | "loading" | "empty" | "error" | "partial";

export interface StateFeedbackProps extends React.HTMLAttributes<HTMLDivElement> {
  state: FeedbackState;
  loadingMode?: "spinner" | "skeleton";
  loadingText?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  errorMessage?: string;
  partialMessage?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export function StateFeedback({
  state,
  loadingMode = "spinner",
  loadingText = "Analyzing scam indicators and signals...",
  emptyTitle = "No Signals Detected",
  emptyDescription = "No suspicious entities or fraudulent patterns were identified in the provided input.",
  errorMessage = "An unexpected error occurred while communicating with the analysis pipeline.",
  partialMessage = "Analysis completed with partial signals. Some external verification checks were unavailable.",
  onRetry,
  children,
  className,
  ...props
}: StateFeedbackProps) {
  if (state === "idle" || (state === "partial" && !partialMessage)) {
    return <>{children}</>;
  }

  if (state === "loading") {
    if (loadingMode === "skeleton") {
      return (
        <div className={cn("w-full space-y-4 py-4", className)} role="status" aria-label={loadingText} {...props}>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <span className="sr-only">{loadingText}</span>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center",
          className
        )}
        role="status"
        aria-label={loadingText}
        {...props}
      >
        <LoadingSpinner size="lg" className="mb-4 text-primary" />
        <p className="text-sm font-medium text-foreground">{loadingText}</p>
        <p className="mt-1 text-xs text-muted-foreground">Evaluating pattern taxonomy and safety signatures</p>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center",
          className
        )}
        role="status"
        {...props}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
          <HelpCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h4 className="text-base font-semibold text-foreground mb-1">{emptyTitle}</h4>
        <p className="text-sm text-muted-foreground max-w-sm mb-4 leading-relaxed">
          {emptyDescription}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Run New Check
          </Button>
        )}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center",
          className
        )}
        role="alert"
        aria-live="assertive"
        {...props}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h4 className="text-base font-bold text-destructive mb-1">Analysis Interrupted</h4>
        <p className="text-sm text-muted-foreground max-w-md mb-5 leading-relaxed">{errorMessage}</p>
        {onRetry && (
          <Button variant="destructive" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Retry Analysis
          </Button>
        )}
      </div>
    );
  }

  if (state === "partial") {
    return (
      <div className={cn("w-full space-y-4", className)} {...props}>
        <div
          className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
          role="status"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{partialMessage}</span>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
