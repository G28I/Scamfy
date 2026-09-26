"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IndicatorType } from "@prisma/client";
import { validateIndicator } from "@/lib/indicators";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export interface ReportIndicatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultIndicatorType?: IndicatorType;
  defaultIndicatorValue?: string;
}

const CATEGORIES = [
  { value: "UPI_REVERSE_PAYMENT_FRAUD", label: "UPI PIN Reverse Payment Lure" },
  { value: "UTILITY_ELECTRICITY_FRAUD", label: "Utility / Electricity Cutoff Threat" },
  { value: "IMPERSONATION_POLICE_EXTORTION", label: "Digital Arrest & Police Impersonation" },
  { value: "TASK_COMMISSION_FRAUD", label: "Part-Time Task & Telegram Job Scam" },
  { value: "BANK_KYC_PHISHING", label: "Bank KYC & PAN Card Blocking Phishing" },
  { value: "PREDATORY_LOAN_FRAUD", label: "Predatory Instant Loan APK Trap" },
  { value: "INVESTMENT_STOCK_FRAUD", label: "WhatsApp VIP Stock / Crypto Signal Group" },
  { value: "SUSPICIOUS_COMMUNICATION", label: "Other Suspicious Communication" },
];

export function ReportIndicatorDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultIndicatorType = IndicatorType.UPI_ID,
  defaultIndicatorValue = "",
}: ReportIndicatorDialogProps) {
  const [indicatorType, setIndicatorType] = React.useState<IndicatorType>(defaultIndicatorType);
  const [indicatorValue, setIndicatorValue] = React.useState(defaultIndicatorValue);
  const [category, setCategory] = React.useState(CATEGORIES[0]!.value);
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setIndicatorType(defaultIndicatorType);
      setIndicatorValue(defaultIndicatorValue);
      setError(null);
      setSuccessMessage(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateIndicator(indicatorType, indicatorValue);
    if (!validation.valid) {
      setError(validation.error || "Invalid indicator value.");
      return;
    }

    if (description.trim().length < 5) {
      setError("Please provide a brief description of at least 5 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indicatorType,
          indicatorValue: validation.normalizedValue,
          category,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit report.");
      }

      setSuccessMessage("Indicator report submitted! It is now queued for moderator review.");
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        onOpenChange(false);
      }, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <DialogTitle>Report Suspicious Indicator</DialogTitle>
          </div>
          <DialogDescription>
            Contribute to Scamfy community threat intelligence (REP-01). All submissions are verified by moderators before publication.
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4 text-emerald-800 dark:text-emerald-200 flex items-start gap-3 my-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-destructive flex items-start gap-2 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="indicator-type" className="text-xs font-semibold text-foreground">
                Indicator Type
              </label>
              <select
                id="indicator-type"
                value={indicatorType}
                onChange={(e) => setIndicatorType(e.target.value as IndicatorType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={IndicatorType.UPI_ID}>UPI VPA ID (e.g. user@bank)</option>
                <option value={IndicatorType.PHONE}>Phone Number (10-digit Indian Mobile)</option>
                <option value={IndicatorType.DOMAIN}>Phishing Website / Domain</option>
                <option value={IndicatorType.HANDLE}>Social Media Handle (Telegram, WhatsApp)</option>
                <option value={IndicatorType.BANK_ACC}>Bank Account / IFSC</option>
                <option value={IndicatorType.SCRIPT}>Scam Script / Extortion Phrase</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="indicator-value" className="text-xs font-semibold text-foreground">
                Indicator Identifier Value
              </label>
              <input
                id="indicator-value"
                type="text"
                value={indicatorValue}
                onChange={(e) => setIndicatorValue(e.target.value)}
                placeholder={getPlaceholderForType(indicatorType)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="scam-category" className="text-xs font-semibold text-foreground">
                Scam Category
              </label>
              <select
                id="scam-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="report-description" className="text-xs font-semibold text-foreground">
                Incident Context / Description
              </label>
              <textarea
                id="report-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how this identifier was used (e.g., claimed power disconnection via SMS, demanded UPI PIN for cashback)..."
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Public Safety Notice: </span>
              Submissions are vetted by moderators to prevent false accusations. Indicators are displayed strictly as technical threat patterns and do not constitute formal legal determinations (AI-05, OOS-04).
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Indicator"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getPlaceholderForType(type: IndicatorType): string {
  switch (type) {
    case IndicatorType.UPI_ID:
      return "billdesk@okhdfcbank";
    case IndicatorType.PHONE:
      return "9876543210";
    case IndicatorType.DOMAIN:
      return "sbi-kyc-update.xyz";
    case IndicatorType.HANDLE:
      return "@vip_telegram_tasks";
    case IndicatorType.BANK_ACC:
      return "SBIN0001234 502812345678";
    case IndicatorType.SCRIPT:
      return "Dear consumer your electricity will be disconnected tonight...";
  }
}
