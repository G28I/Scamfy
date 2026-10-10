"use client";

import * as React from "react";
import { ShieldAlert } from "lucide-react";

/**
 * SafetyDisclaimerTicker renders a prominent, continuously scrolling horizontal
 * safety disclaimer banner immediately beneath the main navigation header.
 *
 * It features:
 * - Seamless continuous news-ticker CSS translation across desktop, tablet, and mobile
 * - Pause-on-hover and pause-on-focus for effortless reading and link interaction
 * - Respects prefers-reduced-motion with static presentation
 * - Screen reader friendly structure (duplicates marked aria-hidden="true")
 * - WCAG AA compliant text contrast in both light and dark themes
 */
export function SafetyDisclaimerTicker() {
  return (
    <aside
      aria-label="Safety Disclaimer Notice"
      className="relative z-40 w-full overflow-hidden motion-reduce:overflow-visible border-b border-amber-500/25 bg-amber-500/10 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 select-none motion-reduce:select-text transition-colors"
    >
      <div className="w-full flex items-center motion-reduce:items-start h-9 sm:h-10 motion-reduce:h-auto motion-reduce:py-2 px-2 sm:px-4">
        {/* Left static badge */}
        <div className="z-10 flex items-center gap-1.5 shrink-0 bg-amber-500/20 dark:bg-amber-900/60 border border-amber-500/30 text-amber-950 dark:text-amber-200 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider shadow-xs mr-2 motion-reduce:mt-0.5">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Notice</span>
        </div>

        {/* Scrolling Ticker Track Container */}
        <div className="relative flex-1 overflow-hidden motion-reduce:overflow-visible">
          {/* Edge blur / gradient fade masks (hidden in reduced motion) */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-r from-amber-50/80 dark:from-[#080c14]/80 to-transparent z-[5] motion-reduce:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-l from-amber-50/80 dark:from-[#080c14]/80 to-transparent z-[5] motion-reduce:hidden" />

          <div className="animate-disclaimer-ticker flex whitespace-nowrap motion-reduce:whitespace-normal motion-reduce:flex-wrap will-change-transform">
            {/* Primary Track (Accessible to screen readers and keyboard navigation) */}
            <div data-testid="ticker-primary-track">
              <DisclaimerSegment />
            </div>

            {/* Duplicate Track for continuous seamless loop (Aria hidden and unfocusable to prevent double-announcements / keyboard traps) */}
            <div
              aria-hidden="true"
              data-testid="ticker-duplicate-track"
              className="motion-reduce:hidden"
            >
              <DisclaimerSegment isDuplicate />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * DisclaimerSegment contains the exact disclaimer text with highlight markers and official helpline links.
 */
function DisclaimerSegment({ isDuplicate = false }: { isDuplicate?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 text-xs sm:text-[13px] leading-none motion-reduce:leading-relaxed whitespace-nowrap motion-reduce:whitespace-normal">
      <span className="font-bold tracking-wide text-amber-900 dark:text-amber-300">
        SCAMFY SAFETY NOTICE:
      </span>
      <span className="text-amber-950/90 dark:text-amber-200/90">
        Scamfy highlights potential scam indicators; it cannot verify every claim or prove that a person or business is fraudulent. Results are for awareness and educational purposes only, not financial or legal advice. A low-risk result does not guarantee safety. Never share your OTP, UPI PIN, or password. Be cautious of requests for upfront payments to release loans, refunds, prizes, or recover lost money. Suspected cyber financial fraud in India? Call{" "}
        <a
          href="tel:1930"
          tabIndex={isDuplicate ? -1 : undefined}
          aria-hidden={isDuplicate ? true : undefined}
          className="font-bold underline text-amber-950 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-300 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-amber-500 rounded-xs"
        >
          1930
        </a>{" "}
        or report at{" "}
        <a
          href="https://www.cybercrime.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={isDuplicate ? -1 : undefined}
          aria-hidden={isDuplicate ? true : undefined}
          className="font-bold underline text-amber-950 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-300 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-amber-500 rounded-xs"
        >
          cybercrime.gov.in
        </a>
        .
      </span>
      <span
        className="text-amber-500/40 dark:text-amber-400/30 px-3 font-light motion-reduce:hidden"
        aria-hidden="true"
      >
        &bull;
      </span>
    </div>
  );
}
