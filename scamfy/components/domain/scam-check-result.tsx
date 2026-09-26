"use client";

import * as React from "react";
import {
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  FileSearch,
  Brain,
  HelpCircle,
  Zap,
} from "lucide-react";
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
      ...(result.synthesis_summary ? [`Executive Summary:`, result.synthesis_summary, ``] : []),
      `Recommended Actions:`,
      ...result.action_recommendations.map((r, i) => ` ${i + 1}. ${r}`),
      ``,
      `Detected Signals (${result.signals.length}):`,
      ...result.signals.map((s) => ` - [${s.severity}] ${s.name}: "${s.evidence}"`),
      ``,
      ...(result.psychological_tactics && result.psychological_tactics.length > 0
        ? [`Psychological Pressure Tactics:`, ...result.psychological_tactics.map((t) => ` * ${t}`), ``]
        : []),
      `Verified by Scamfy Hybrid Triage Engine (https://scamfy.org)`,
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

  const isAiAssisted = Boolean(result.model_metadata?.ai_assisted);
  const modelSlug = (result.model_metadata?.model_slug as string) || "Rule Engine v2";

  return (
    <div className={cn("w-full space-y-6 animate-in fade-in-50 duration-300", className)} {...props}>
      {/* 1. Emergency 1930 Headline Alert (UX-02) */}
      {isEmergency && (
        <UrgencyBanner
          title="Critical Scam Threat Detected"
          description="High-urgency financial extortion or UPI payment collect trap detected. Do NOT share your UPI PIN, OTP, or approve payment requests. If you have already lost money, call the National Cyber Crime Helpline 1930 immediately."
          show1930CallToAction
          helplineNumber="1930"
          actionLabel="Official Cybercrime Portal"
          onActionClick={() => window.open("https://cybercrime.gov.in", "_blank")}
        />
      )}

      {isHighRisk && !isEmergency && (
        <UrgencyBanner
          title="High-Risk Fraud Pattern Identified"
          description="High likelihood of deceptive recruitment, part-time task fraud, or credential harvesting. Do not pay advance fees or deposit money."
          show1930CallToAction={false}
          officialPortalUrl="https://cybercrime.gov.in"
        />
      )}

      {/* 2. Structured Security Report Container */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Report Top Header */}
        <div className="border-b border-border bg-muted/20 px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge level={result.overall_risk} size="lg" showPulse={isEmergency} />
                <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-mono font-medium text-muted-foreground">
                  ID: {result.id.slice(0, 8)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <Brain className="h-3 w-3 text-primary" />
                  <span>{isAiAssisted ? "Nemotron-70B Assisting" : "Rule Engine v2"}</span>
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                {formatCategoryTitle(result.primary_category)}
              </h3>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <ConfidenceMeter
                level={result.confidence}
                signalCount={result.signals.length}
                explanation={
                  isAiAssisted
                    ? "Confidence determined by deterministic red-flag pattern matches and AI linguistic evaluation."
                    : "Confidence determined by deterministic red-flag pattern matches."
                }
              />
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          {/* 3. Executive Analysis Summary */}
          {result.synthesis_summary && (
            <div className="rounded-xl border border-border/80 bg-background p-4 sm:p-5 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Brain className="h-4 w-4 text-primary" />
                <span>Executive Analysis &amp; Assessment</span>
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {result.synthesis_summary}
              </p>
            </div>
          )}

          {/* 4. Action Protocol (Step 1, Step 2, Step 3) */}
          <div
            className={cn(
              "rounded-xl border p-5 space-y-3.5",
              isEmergency
                ? "border-red-300 bg-red-50/50 dark:border-red-900/60 dark:bg-red-950/20"
                : isHighRisk
                  ? "border-amber-300 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20"
                  : isSafe
                    ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20"
                    : "border-blue-300 bg-blue-50/50 dark:border-blue-900/60 dark:bg-blue-950/20"
            )}
          >
            <div className="flex items-center justify-between">
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
                <span>Immediate Defensive Action Protocol (UX-01)</span>
              </h4>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Priority Steps
              </span>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-foreground">
              {result.action_recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/90 p-3 shadow-xs"
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isEmergency
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                        : isHighRisk
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium pt-0.5">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Detected Psychological Pressure Tactics */}
          {result.psychological_tactics && result.psychological_tactics.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Detected Psychological Pressure Tactics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.psychological_tactics.map((tactic, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{tactic}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 6. Extracted Identifiers & Evidence (DET-03) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-primary" />
                <span>Extracted Technical Indicators ({totalEntitiesCount})</span>
              </h4>
              <span className="text-[11px] text-muted-foreground font-mono">
                Click indicator to copy
              </span>
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
              <p className="text-xs text-muted-foreground italic bg-muted/30 rounded-lg p-3.5 border border-border/40">
                No direct payment VPAs, contact phone numbers, or external URLs were identified in this message text.
              </p>
            )}
          </div>

          {/* 7. Detected Threat Signals Breakdown (DET-04) */}
          {result.signals.length > 0 && (
            <div className="space-y-3 pt-1">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Triggered Threat Signals ({result.signals.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="rounded-xl border border-border bg-card p-3.5 space-y-2 transition-colors hover:border-primary/40 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                        {signal.name}
                      </span>
                      <RiskBadge level={signal.severity} size="sm" showIcon={false} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {signal.description}
                    </p>
                    {signal.evidence && (
                      <div className="rounded-md bg-muted/60 px-2.5 py-1 text-[11px] font-mono text-muted-foreground break-all">
                        <span className="font-semibold text-foreground">Matched text: </span>
                        <span>&ldquo;{signal.evidence}&rdquo;</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Missing Evidence & Uncertainty Notice (DET-05) */}
          {result.missing_evidence && result.missing_evidence.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <HelpCircle className="h-4 w-4 text-blue-500" />
                <span>Missing Corroborating Context (DET-05)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground leading-relaxed">
                {result.missing_evidence.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 9. Analysis Transparency Notice */}
          <div className="rounded-lg bg-muted/20 border border-border/60 p-3.5 text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Analysis Provenance: </span>
            <span>Engine model: {modelSlug}. Automated educational risk analysis; does not constitute a judicial, criminal, or regulatory determination (AI-05, OOS-03).</span>
          </div>

          {/* 10. Action Footer */}
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
              className="w-full sm:w-auto font-medium"
            >
              {copiedSummary ? "Triage Summary Copied!" : "Copy Triage Summary"}
            </Button>

            {onReset && (
              <Button
                variant="default"
                size="sm"
                onClick={onReset}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                className="w-full sm:w-auto font-bold"
              >
                Analyze Another Message
              </Button>
            )}
          </div>
        </div>
      </div>
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
