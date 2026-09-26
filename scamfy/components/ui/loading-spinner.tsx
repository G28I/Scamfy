import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg" | "xl";
  label?: string;
  role?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  default: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function LoadingSpinner({
  size = "default",
  label = "Loading...",
  role = "status",
  className,
  ...props
}: LoadingSpinnerProps) {
  const isDecorative = role === "presentation" || props["aria-hidden"] === true;

  return (
    <div
      role={role || undefined}
      aria-label={!isDecorative && label ? label : undefined}
      className={cn("flex flex-col items-center justify-center gap-2", className)}
      {...props}
    >
      <Loader2
        aria-hidden="true"
        className={cn(
          "animate-spin text-primary motion-reduce:animate-none",
          sizeMap[size]
        )}
      />
      {!isDecorative && label && <span className="sr-only">{label}</span>}
    </div>
  );
}
