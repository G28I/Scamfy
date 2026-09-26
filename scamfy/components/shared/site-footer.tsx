import * as React from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink, Lock } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/20 py-8 text-xs text-muted-foreground mt-auto">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Tier: Disclaimers & Emergency Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Scamfy is an educational cybersecurity triage utility. It does not replace official police reporting.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              aria-label="National Cyber Crime Reporting Portal (opens in a new tab)"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span>•</span>
            <a
              href="tel:1930"
              className="font-bold text-red-600 dark:text-red-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              aria-label="Call Cyber Crime Helpline 1930"
            >
              Call 1930
            </a>
          </div>
        </div>

        {/* Bottom Tier: Navigation Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
            <Link
              href="/"
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Scam Check
            </Link>
            <Link
              href="/intel"
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Threat Intelligence
            </Link>
            <Link
              href="/cases"
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Victim Cases
            </Link>
            <Link
              href="/privacy"
              className="font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Terms &amp; Conditions
            </Link>
          </div>

          <p className="text-center sm:text-right text-[11px] text-muted-foreground/80 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>&copy; {new Date().getFullYear()} Scamfy Project. Open Community Cyber Defense.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
