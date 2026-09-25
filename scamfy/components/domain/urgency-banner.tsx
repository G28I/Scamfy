import * as React from "react";
import { PhoneCall, ShieldAlert, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface UrgencyBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  show1930CallToAction?: boolean;
  helplineNumber?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  officialPortalUrl?: string;
}

export function UrgencyBanner({
  title,
  description,
  show1930CallToAction = true,
  helplineNumber = "1930",
  actionLabel,
  onActionClick,
  officialPortalUrl = "https://cybercrime.gov.in",
  className,
  ...props
}: UrgencyBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "relative w-full rounded-xl border border-red-300 bg-red-50 p-4 text-red-950 dark:border-red-800/80 dark:bg-red-950/70 dark:text-red-100 shadow-md",
        className
      )}
      {...props}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm mt-0.5">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-base font-bold tracking-tight text-red-900 dark:text-red-100 flex items-center gap-2">
              <span>{title}</span>
            </h4>
            <p className="mt-1 text-sm text-red-800 dark:text-red-200 leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
          {show1930CallToAction && (
            <a
              href={`tel:${helplineNumber}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 min-h-[44px] min-w-[140px]"
              aria-label={`Call National Cyber Crime Helpline ${helplineNumber}`}
            >
              <PhoneCall className="h-4 w-4 animate-bounce motion-reduce:animate-none" />
              <span>Call {helplineNumber} Helpline</span>
            </a>
          )}

          {actionLabel && onActionClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onActionClick}
              className="border-red-300 text-red-900 hover:bg-red-100 dark:border-red-700 dark:text-red-100 dark:hover:bg-red-900/50"
            >
              {actionLabel}
            </Button>
          )}

          {officialPortalUrl && (
            <a
              href={officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-300 hover:underline px-2 py-1"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
