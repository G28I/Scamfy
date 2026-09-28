"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getConsentStatus, setConsentStatus, type ConsentStatus } from "@/lib/analytics";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("scamfy_consent_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("scamfy_consent_change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): ConsentStatus {
  return getConsentStatus();
}

function getServerSnapshot(): ConsentStatus {
  return "accepted"; // Default to hidden on server snapshot to avoid layout flash
}

export function CookieConsent() {
  const consent = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const [hasRendered, setHasRendered] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHasRendered(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!hasRendered || consent !== null) {
    return null;
  }

  const handleAccept = () => {
    setConsentStatus("accepted");
  };

  const handleReject = () => {
    setConsentStatus("rejected");
  };

  return (
    <aside
      role="region"
      aria-label="Privacy & Cookie Preferences"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Content Description */}
        <div className="flex items-start gap-3.5 max-w-2xl">
          <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Privacy &amp; Cookie Consent</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                Zero PII Telemetry
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Scamfy operates with strict privacy defaults and uses essential browser storage solely for rate limiting, security sessions, and theme preferences. We do not use third-party advertising trackers, profiling cookies, or sell user data. Read our{" "}
              <Link href="/privacy" className="text-foreground underline hover:text-primary font-medium">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="text-foreground underline hover:text-primary font-medium">
                Terms
              </Link>.
            </p>
          </div>
        </div>

        {/* Action Buttons: Non-dark-pattern equal prominence */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-1 md:pt-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReject}
            className="flex-1 md:flex-none text-xs font-semibold"
          >
            Essential Only
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleAccept}
            className="flex-1 md:flex-none text-xs font-bold"
          >
            Accept Telemetry
          </Button>
          <button
            type="button"
            onClick={handleReject}
            aria-label="Dismiss and use essential cookies only"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
