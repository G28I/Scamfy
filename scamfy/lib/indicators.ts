import { IndicatorType } from "@prisma/client";

export { IndicatorType };

export interface IndicatorValidationResult {
  valid: boolean;
  normalizedValue: string;
  error?: string;
}

const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
const PHONE_INDIAN_REGEX = /^[6-9]\d{9}$/;

/**
 * Normalizes an indicator value based on its IndicatorType for consistent deduplication (REP-03).
 */
export function normalizeIndicator(type: IndicatorType, value: string): string {
  const trimmed = value.trim();

  switch (type) {
    case IndicatorType.UPI_ID:
      return trimmed.toLowerCase();

    case IndicatorType.PHONE: {
      // Remove all non-digits
      const digits = trimmed.replace(/\D/g, "");
      // Handle +91 or 91 country code prefix if 12 digits starting with 91
      if (digits.length === 12 && digits.startsWith("91")) {
        return digits.slice(2);
      }
      // Handle leading 0 if 11 digits
      if (digits.length === 11 && digits.startsWith("0")) {
        return digits.slice(1);
      }
      return digits;
    }

    case IndicatorType.DOMAIN: {
      let candidate = trimmed.toLowerCase();
      if (!candidate.startsWith("http://") && !candidate.startsWith("https://")) {
        candidate = `http://${candidate}`;
      }
      try {
        const url = new URL(candidate);
        let host = url.hostname.toLowerCase();
        if (host.startsWith("www.")) {
          host = host.slice(4);
        }
        return host;
      } catch {
        return trimmed.toLowerCase().replace(/^www\./, "");
      }
    }

    case IndicatorType.HANDLE: {
      let handle = trimmed.toLowerCase();
      if (handle.startsWith("@")) {
        handle = handle.slice(1);
      }
      return handle;
    }

    case IndicatorType.BANK_ACC: {
      // Collapse spaces and uppercase IFSC/alpha components
      return trimmed.toUpperCase().replace(/[\s-]+/g, " ");
    }

    case IndicatorType.SCRIPT:
    default:
      return trimmed.toLowerCase().replace(/\s+/g, " ");
  }
}

/**
 * Validates indicator syntax and returns validation result with normalized value (REP-01).
 */
export function validateIndicator(type: IndicatorType, value: string): IndicatorValidationResult {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    return { valid: false, normalizedValue: "", error: "Indicator value cannot be empty." };
  }

  const normalized = normalizeIndicator(type, value);

  switch (type) {
    case IndicatorType.UPI_ID:
      if (!UPI_REGEX.test(normalized)) {
        return {
          valid: false,
          normalizedValue: normalized,
          error: "Invalid UPI ID format. Must be in username@bank format (e.g., user@okhdfc).",
        };
      }
      break;

    case IndicatorType.PHONE:
      if (!PHONE_INDIAN_REGEX.test(normalized)) {
        return {
          valid: false,
          normalizedValue: normalized,
          error: "Invalid Indian phone number. Must be a 10-digit mobile number starting with 6, 7, 8, or 9.",
        };
      }
      break;

    case IndicatorType.DOMAIN:
      if (normalized.length < 3 || !normalized.includes(".")) {
        return {
          valid: false,
          normalizedValue: normalized,
          error: "Invalid domain name format (e.g., scam-portal.xyz or bit.ly).",
        };
      }
      break;

    case IndicatorType.HANDLE:
      if (normalized.length < 2 || normalized.length > 64) {
        return {
          valid: false,
          normalizedValue: normalized,
          error: "Handle must be between 2 and 64 characters.",
        };
      }
      break;

    case IndicatorType.BANK_ACC:
      if (normalized.length < 6 || normalized.length > 64) {
        return {
          valid: false,
          normalizedValue: normalized,
          error: "Bank account / IFSC details must be at least 6 characters.",
        };
      }
      break;

    case IndicatorType.SCRIPT:
      if (normalized.length < 10) {
        return {
          valid: false,
          normalizedValue: normalized,
          error: "Scam script / phrase snippet must be at least 10 characters long.",
        };
      }
      break;
  }

  return { valid: true, normalizedValue: normalized };
}
