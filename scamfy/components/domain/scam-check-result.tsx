"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  FileSearch,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/domain/risk-badge";
import { ConfidenceMeter } from "@/components/domain/confidence-meter";
import { IndicatorTag } from "@/components/domain/indicator-tag";
import { UrgencyBanner } from "@/components/domain/urgency-banner";
import type { AnalysisResultDto } from "@/app/api/check/route";
import { cn } from "@/lib/utils";

export interface ScamCheckResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: AnalysisResultDto;
  onReset?: () => void;
}

export function ScamCheckResult({
  result,
  onReset,
  className,
  ...props
}: ScamCheckResultProps) {
  const [copiedSummary, setCopiedSummary] = React.useState(false);

  const isEmergency = result.overall_risk === "CRITICAL";
  const isHighRisk = result.overall_risk === "HIGH_RISK";
  const isSafe = result.overall_risk === "SAFE";

  const totalEntitiesCount =
    result.extracted_entities.upi_ids.length +
    result.extracted_entities.phone_numbers.length +
    result.extracted_entities.urls.length +
    result.extracted_entities.emails.length +
    result.extracted_entities.bank_accounts.length +
    result.extracted_entities.amounts.length +
    result.extracted_entities.handles.length;

  const handleCopySummary = async () => {
    const lines = [
      `Scamfy Threat Triage Report`,
      `===========================`,
      `Risk Severity: ${result.overall_risk}`,
      `Confidence: ${result.confidence.toUpperCase()}`,
      `Category: ${result.primary_category}`,
      `Date: ${new Date(result.created_at).toLocaleString()}`,
      ``,
      `Recommended Actions:`,
      ...result.action_recommendations.map((r, i) => ` ${i + 1}. ${r}`),
      ``,
      `Detected Signals (${result.signals.length}):`,
      ...result.signals.map((s) => ` - [${s.severity}] ${s.name}: "${s.evidence}"`),
      ``,
      `Verified by Scamfy Triage Engine (https://scamfy.org)`,
    ];

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(lines.join("\n"));
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2500);
      }
    } catch {
      setCopiedSummary(false);
    }
  };

  return (
    <div className={cn("w-full space-y-6 animate-in fade-in-50 duration-300", className)} {...props}>
      {/* 1. Emergency Helpline Banner (UX-02) */}
      {isEmergency && (
        <UrgencyBanner
          title="Critical Scam Threat Detected"
          description="This message contains high-urgency financial extortion or payment traps. Do NOT enter your UPI PIN, click links, or transfer money. If you have already lost funds, call the National Cyber Crime Helpline 1930 immediately."
          show1930CallToAction
          helplineNumber="1930"
          actionLabel="Official Cybercrime Portal"
          onActionClick={() => window.open("https://cybercrime.gov.in", "_blank")}
        />
      )}

      {isHighRisk && !isEmergency && (
        <UrgencyBanner
          title="High-Risk Fraud Pattern Identified"
          description="High likelihood of scam recruitment, fake tasks, or phishing. Do NOT deposit any advance fees, share OTPs, or click unverified links."
          show1930CallToAction={false}
          officialPortalUrl="https://cybercrime.gov.in"
        />
      )}

      {/* 2. Main Analysis Overview Card */}
      <Card className="border-border shadow-md overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <RiskBadge level={result.overall_risk} size="lg" showPulse={isEmergency} />
                <span className="text-xs font-mono text-muted-foreground">
                  ID: {result.id.slice(0, 8)}…
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-foreground pt-1">
                {formatCategoryTitle(result.primary_category)}
              </CardTitle>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <ConfidenceMeter
                level={result.confidence}
                signalCount={result.signals.length}
                explanation="Confidence rating based on deterministic red-flag pattern matches."
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* 3. Recommended Action Guidance (UX-01) */}
          <div
            className={cn(
              "rounded-xl border p-4 sm:p-5 space-y-3",
              isEmergency
                ? "border-red-300 bg-red-50/60 dark:border-red-900/60 dark:bg-red-950/30"
                : isHighRisk
                  ? "border-amber-300 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/30"
                  : isSafe
                    ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/30"
                    : "border-blue-300 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/30"
            )}
          >
            <h4 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck
                className={cn(
                  "h-4 w-4 shrink-0",
                  isEmergency
                    ? "text-red-600"
                    : isHighRisk
                      ? "text-amber-600"
                      : "text-emerald-600"
                )}
              />
              <span>Recommended Next Actions (UX-01)</span>
            </h4>

            <ul className="space-y-2 text-xs sm:text-sm leading-relaxed text-foreground">
              {result.action_recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4 shrink-0 mt-0.5",
                      isEmergency
                        ? "text-red-600"
                        : isHighRisk
                          ? "text-amber-600"
                          : "text-emerald-600"
                    )}
                  />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Extracted Identifiers & Evidence (DET-03) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-primary" />
                <span>Extracted Identifiers ({totalEntitiesCount})</span>
              </h4>
              <span className="text-xs text-muted-foreground">Click to copy value</span>
            </div>

            {totalEntitiesCount > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {result.extracted_entities.upi_ids.map((upi, i) => (
                  <IndicatorTag key={`upi-${i}`} type="UPI_ID" value={upi} />
                ))}
                {result.extracted_entities.phone_numbers.map((phone, i) => (
                  <IndicatorTag key={`phone-${i}`} type="PHONE" value={phone} />
                ))}
                {result.extracted_entities.urls.map((url, i) => (
                  <IndicatorTag key={`url-${i}`} type="DOMAIN" value={url} />
                ))}
                {result.extracted_entities.emails.map((email, i) => (
                  <IndicatorTag key={`email-${i}`} type="HANDLE" value={email} />
                ))}
                {result.extracted_entities.bank_accounts.map((acc, i) => (
                  <IndicatorTag key={`acc-${i}`} type="BANK_ACC" value={acc} />
                ))}
                {result.extracted_entities.amounts.map((amount, i) => (
                  <IndicatorTag key={`amount-${i}`} type="AMOUNT" value={amount} />
                ))}
                {result.extracted_entities.handles.map((h, i) => (
                  <IndicatorTag key={`handle-${i}`} type="HANDLE" value={h} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic bg-muted/30 rounded-lg p-3">
                No direct payment VPAs, contact numbers, or phishing URLs were extracted from this message text.
              </p>
            )}
          </div>

          {/* 5. Detected Signals Breakdown (DET-04) */}
          {result.signals.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Detected Threat Signals ({result.signals.length})</span>
              </h4>

              <div className="space-y-2.5">
                {result.signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="rounded-lg border border-border bg-card p-3.5 space-y-1.5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-foreground">
                        {signal.name}
                      </span>
                      <RiskBadge level={signal.severity} size="sm" showIcon={false} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {signal.description}
                    </p>
                    {signal.evidence && (
                      <div className="rounded bg-muted/60 px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
                        <span className="font-semibold text-foreground">Matched text: </span>
                        <span>&ldquo;{signal.evidence}&rdquo;</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Footer Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              leftIcon={
                copiedSummary ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )
              }
            >
              {copiedSummary ? "Report Copied to Clipboard" : "Copy Triage Summary"}
            </Button>

            {onReset && (
              <Button
                variant="default"
                size="sm"
                onClick={onReset}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Analyze Another Message
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatCategoryTitle(category: string): string {
  switch (category) {
    case "UPI_REVERSE_PAYMENT_FRAUD":
      return "UPI PIN Reverse Payment Lure";
    case "UTILITY_ELECTRICITY_FRAUD":
      return "Utility / Electricity Cutoff Extortion";
    case "IMPERSONATION_POLICE_EXTORTION":
      return "Digital Arrest & Police Impersonation";
    case "TASK_COMMISSION_FRAUD":
      return "Part-Time Task & Telegram Job Scam";
    case "LOTTERY_KYC_PHISHING":
      return "Lottery Prize & Bank KYC Phishing";
    case "PREDATORY_LOAN_FRAUD":
      return "Predatory Instant Loan APK Trap";
    case "SUSPICIOUS_COMMUNICATION":
      return "Suspicious Communication / Obfuscated Link";
    case "INFORMATIONAL_OR_UNKNOWN":
      return "Standard / Informational Message";
    default:
      return category.replace(/_/g, " ");
  }
}
