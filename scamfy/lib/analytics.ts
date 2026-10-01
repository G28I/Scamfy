/**
 * Privacy-Preserving Telemetry & Client Event Utility for Scamfy
 *
 * Invariants:
 * 1. ZERO personal data collection (No UPI VPAs, phone numbers, bank accounts, or raw user message text).
 * 2. Strict cookie consent gating: Non-essential events are ONLY captured if the user explicitly consents.
 * 3. Minimal aggregated telemetry strictly for triage quality, error detection, and local developer inspection.
 * 4. Production does not dispatch to commercial third-party trackers, ad brokers, or unconfigured destinations.
 */

export type ConsentStatus = "accepted" | "rejected" | null;

export const CONSENT_STORAGE_KEY = "scamfy_cookie_consent";

let inMemoryConsent: ConsentStatus = null;

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

/**
 * Retrieves the current cookie consent status from localStorage or memory.
 *
 * @returns ConsentStatus ('accepted', 'rejected', or null if undecided)
 */
export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === "accepted" || val === "rejected") {
      inMemoryConsent = val;
      return val;
    }
    if (val === null) {
      inMemoryConsent = null;
      return null;
    }
    return null;
  } catch {
    return inMemoryConsent;
  }
}

/**
 * Stores the user's consent choice and dispatches a change event across the application.
 *
 * @param status - The chosen consent status ('accepted' | 'rejected')
 */
export function setConsentStatus(status: "accepted" | "rejected"): void {
  inMemoryConsent = status;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, status);
  } catch {
    // Best-effort storage in private browsing modes
  }
  window.dispatchEvent(new CustomEvent("scamfy_consent_change", { detail: status }));
}

/**
 * Sanitizes event payloads to ensure zero PII or raw message text is logged.
 *
 * @param eventName - The name of the analytics event
 * @param payload - The typed payload for the event
 * @returns Sanitized key-value object containing only non-sensitive metrics
 */
function sanitizePayload<K extends keyof AnalyticsEventMap>(
  eventName: K,
  payload?: AnalyticsEventMap[K]
): Record<string, string | number | boolean> {
  if (!payload || typeof payload !== "object") return {};

  const safe: Record<string, string | number | boolean> = {};

  switch (eventName) {
    case "scam_check_completed": {
      const p = payload as AnalyticsEventMap["scam_check_completed"];
      if (typeof p.risk_level === "string") safe.risk_level = p.risk_level;
      if (typeof p.is_emergency === "boolean") safe.is_emergency = p.is_emergency;
      if (typeof p.indicator_count === "number") safe.indicator_count = p.indicator_count;
      break;
    }
    case "intel_viewed": {
      const p = payload as AnalyticsEventMap["intel_viewed"];
      if (typeof p.filter_type === "string") safe.filter_type = p.filter_type;
      if (typeof p.is_verified_only === "boolean") safe.is_verified_only = p.is_verified_only;
      break;
    }
    case "report_submitted": {
      const p = payload as AnalyticsEventMap["report_submitted"];
      if (typeof p.indicator_type === "string") safe.indicator_type = p.indicator_type;
      if (typeof p.risk_level === "string") safe.risk_level = p.risk_level;
      break;
    }
    case "error_occurred": {
      const p = payload as AnalyticsEventMap["error_occurred"];
      if (typeof p.category === "string") safe.category = p.category;
      if (typeof p.status_code === "number") safe.status_code = p.status_code;
      break;
    }
    default:
      break;
  }

  return safe;
}

/**
 * Tracks a privacy-preserving client telemetry event if user consent has been granted.
 *
 * @param eventName - Name of the event to record
 * @param payload - Optional sanitized data payload
 */
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

  const safePayload = sanitizePayload(eventName, payload);

  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    console.debug(`[Scamfy Analytics] Event: ${eventName}`, safePayload);
  }
}
