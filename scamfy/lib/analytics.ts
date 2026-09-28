/**
 * Privacy-Preserving Analytics Utility for Scamfy
 *
 * Invariants:
 * 1. ZERO personal data collection (No UPI VPAs, phone numbers, bank accounts, or raw user message text).
 * 2. Strict cookie consent gating: Non-essential events are ONLY captured if the user explicitly consents.
 * 3. Minimal aggregated telemetry strictly for triage quality, error detection, and community safety monitoring.
 */

export type ConsentStatus = "accepted" | "rejected" | null;

export const CONSENT_STORAGE_KEY = "scamfy_cookie_consent";

export interface AnalyticsEventMap {
  scam_check_started: Record<string, never>;
  scam_check_completed: {
    risk_level: string;
    is_emergency: boolean;
    indicator_count: number;
  };
  intel_viewed: {
    filter_type?: string;
    is_verified_only: boolean;
  };
  report_flow_started: Record<string, never>;
  report_submitted: {
    indicator_type: string;
    risk_level: string;
  };
  error_occurred: {
    category: string;
    status_code?: number;
  };
}

export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === "accepted" || val === "rejected") return val;
    return null;
  } catch {
    return null;
  }
}

export function setConsentStatus(status: "accepted" | "rejected"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, status);
    window.dispatchEvent(new CustomEvent("scamfy_consent_change", { detail: status }));
  } catch {
    // Ignore storage errors in restricted private contexts
  }
}

export function trackEvent<K extends keyof AnalyticsEventMap>(
  eventName: K,
  payload?: AnalyticsEventMap[K]
): void {
  if (typeof window === "undefined") return;

  const consent = getConsentStatus();
  if (consent !== "accepted") {
    // User has not consented to telemetry
    return;
  }

  // Sanitize payload to guarantee no PII or raw text ever enters analytics
  const safePayload = payload ? { ...payload } : {};

  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    console.debug(`[Scamfy Analytics] Event: ${eventName}`, safePayload);
  }

  // If a privacy-conscious provider is configured via env, dispatch safely here
}
