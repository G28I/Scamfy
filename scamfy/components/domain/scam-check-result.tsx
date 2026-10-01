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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RiskBadge } from "@/components/domain/risk-badge";
import { ConfidenceMeter } from "@/components/domain/confidence-meter";
import { IndicatorTag } from "@/components/domain/indicator-tag";
import { UrgencyBanner } from "@/components/domain/urgency-banner";
import { PreTransferWarningModal } from "@/components/domain/pre-transfer-warning-modal";
import { MuleReceivedFundsGuide } from "@/components/domain/mule-received-funds-guide";
import { isMoneyMuleRisk } from "@/lib/mule";
import type { AnalysisResultDto } from "@/app/api/check/route";
import { cn } from "@/lib/utils";

export interface ScamCheckResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: AnalysisResultDto;
  onReset?: () => void;
}

/**
 * Threat analysis result visualization component displaying risk severity, confidence score,
 * extracted entities, detected psychological tactics, and actionable security recommendations.
 *
 * @param props - Component properties containing the AnalysisResultDto and reset handler
 * @returns React JSX element rendering the triage result card
 */
export function ScamCheckResult({
  result,
  onReset,
  className,
  ...props
}: ScamCheckResultProps) {
  const [copiedSummary, setCopiedSummary] = React.useState(false);
  const isMuleThreat = React.useMemo(() => isMoneyMuleRisk(result), [result]);
  const [showMuleWarningModal, setShowMuleWarningModal] = React.useState(isMuleThreat);
  const [showReceivedFundsGuide, setShowReceivedFundsGuide] = React.useState(false);

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
      {/* 0. Pre-Transfer Warning Modal (MULE-02, UX-02) */}
      {isMuleThreat && (
        <PreTransferWarningModal
          isOpen={showMuleWarningModal}
          onOpenChange={setShowMuleWarningModal}
          result={result}
          onOpenReceivedFundsGuide={() => setShowReceivedFundsGuide(true)}
        />
      )}

      {/* 0.1 Dedicated Money-Mule Risk Banner */}
      {isMuleThreat && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-500 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Money-Mule / Account Rental Risk Detected</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              You are being asked to receive and forward funds or share your account credentials. Doing so risks immediate bank debit holds and investigation under cybercrime laws.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => setShowMuleWarningModal(true)}
              className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Pre-Transfer Warning
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowReceivedFundsGuide((prev) => !prev)}
              className="text-xs font-semibold border-rose-500/30 hover:bg-rose-500/10"
            >
              {showReceivedFundsGuide ? "Hide Received Funds Protocol" : "Received Unsolicited Money? (Guide)"}
            </Button>
          </div>
        </div>
      )}

      {/* 1. Emergency 1930 Headline Alert (UX-02) */}
      {isEmergency && !isMuleThreat && (
        <UrgencyBanner
          title="Critical Scam Threat Detected"
          description={
            result.primary_category === "UPI_REVERSE_PAYMENT_FRAUD"
              ? "High-urgency UPI payment collect trap detected. Do NOT enter your UPI PIN to receive funds. If money was deducted, call 1930 immediately."
              : result.primary_category === "IMPERSONATION_POLICE_EXTORTION"
              ? "Digital arrest / law-enforcement extortion detected. Police and CBI never interrogate via Skype or demand transfer to 'safe accounts'. Call 1930 immediately."
              : result.primary_category === "UTILITY_ELECTRICITY_FRAUD"
              ? "Urgent utility cutoff scam detected. Power companies never disconnect without formal notice or demand payment to personal numbers. Call 1930 immediately."
              : "High-urgency cyber fraud threat detected. Do NOT share OTPs, passwords, or approve payments. If you have already lost money, call the National Cyber Crime Helpline 1930 immediately."
          }
          show1930CallToAction
          helplineNumber="1930"
          actionLabel="Official Cybercrime Portal"
          onActionClick={() => window.open("https://cybercrime.gov.in", "_blank")}
        />
      )}

      {isHighRisk && !isEmergency && !isMuleThreat && (
        <UrgencyBanner
          title="High-Risk Fraud Pattern Identified"
          description={
            result.primary_category === "TASK_COMMISSION_FRAUD"
              ? "Deceptive recruitment or part-time task fraud detected. Never pay registration fees or deposit funds for promised review returns."
              : result.primary_category === "BANK_KYC_PHISHING"
              ? "Phishing attack targeting banking credentials and PAN/Aadhaar information. Do not click links or install remote access apps."
              : result.primary_category === "INVESTMENT_STOCK_FRAUD"
              ? "High-risk fraudulent investment or crypto trading scheme. Unregistered entities promising guaranteed profits are illegal."
              : "High likelihood of fraud detected for this indicator. Do not transfer funds, share personal documents, or install unverified applications."
          }
          show1930CallToAction={false}
          officialPortalUrl="https://cybercrime.gov.in"
        />
      )}

      {/* 2. Structured Security Report Container using Shadcn Card */}
      <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
        {/* Report Top Header */}
        <CardHeader className="border-b border-border bg-muted/20 px-5 py-4 space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge level={result.overall_risk} size="lg" showPulse={isEmergency} />
                <Badge variant="outline" className="font-mono text-[11px] font-medium text-muted-foreground">
                  ID: {result.id.slice(0, 8)}
                </Badge>
                <Badge variant="outline" className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Brain className="h-3 w-3 text-primary" />
                  <span>{isAiAssisted ? "Nemotron-70B Assisting" : "Rule Engine v2"}</span>
                </Badge>
              </div>
              <CardTitle className="text-xl font-extrabold text-foreground tracking-tight">
                {formatCategoryTitle(result.primary_category)}
              </CardTitle>
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
        </CardHeader>

        <CardContent className="p-5 sm:p-7 space-y-6">
          {/* Action Protocol Container Definition */}
          {(() => {
            const actionProtocolSection = (
              <div
                className={cn(
                  "rounded-xl border p-5 space-y-3.5",
                  isEmergency
                    ? "border-red-500/40 bg-red-500/5 dark:border-red-500/30 dark:bg-red-950/25"
                    : isHighRisk
                      ? "border-amber-500/40 bg-amber-500/5 dark:border-amber-500/30 dark:bg-amber-950/25"
                      : isSafe
                        ? "border-emerald-500/40 bg-emerald-500/5 dark:border-emerald-500/30 dark:bg-emerald-950/25"
                        : "border-blue-500/40 bg-blue-500/5 dark:border-blue-500/30 dark:bg-blue-950/25"
                )}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                    <ShieldCheck
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isEmergency
                          ? "text-red-600 dark:text-red-400"
                          : isHighRisk
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                      )}
                    />
                    <span>Immediate Defensive Action Protocol</span>
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider">
                    Priority Steps
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm text-foreground">
                  {result.action_recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-xs"
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
            );

            const executiveSummarySection = result.synthesis_summary ? (
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>Executive Analysis &amp; Assessment</span>
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {result.synthesis_summary}
                </p>
              </div>
            ) : null;

            {/* Invert hierarchy: Action Protocol first in emergency/high-risk states */}
            return isEmergency || isHighRisk ? (
              <>
                {actionProtocolSection}
                {executiveSummarySection}
              </>
            ) : (
              <>
                {executiveSummarySection}
                {actionProtocolSection}
              </>
            );
          })()}

          {/* 5. Detected Psychological Pressure Tactics */}
          {result.psychological_tactics && result.psychological_tactics.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Detected Psychological Pressure Tactics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.psychological_tactics.map((tactic, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-amber-300 bg-amber-50/80 px-3 py-1 text-xs font-semibold text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 gap-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{tactic}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 6. Extracted Identifiers & Evidence */}
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

          {/* 7. Detected Threat Signals Breakdown */}
          {result.signals.length > 0 && (
            <div className="space-y-3 pt-1">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Triggered Threat Signals ({result.signals.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.signals.map((signal) => (
                  <Card
                    key={signal.id}
                    className="p-3.5 space-y-2 transition-colors hover:border-primary/40 shadow-xs"
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
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 8. Missing Evidence & Uncertainty Notice */}
          {result.missing_evidence && result.missing_evidence.length > 0 && (
            <Alert className="border-border bg-muted/30">
              <HelpCircle className="h-4 w-4 text-blue-500 shrink-0" />
              <div>
                <AlertTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Missing Corroborating Context
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground leading-relaxed">
                    {result.missing_evidence.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </div>
            </Alert>
          )}

          <Separator />

          {/* 9. Analysis Transparency Notice */}
          <div className="rounded-lg bg-muted/20 border border-border/60 p-3.5 text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Analysis Provenance: </span>
            <span>Engine model: {modelSlug}. Automated educational risk analysis; does not constitute a judicial, criminal, or regulatory determination.</span>
          </div>
        </CardContent>

        {/* 10. Action Footer */}
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 pt-0 border-t border-border mt-2">
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
        </CardFooter>
      </Card>

      {/* 11. Collapsible/Expandable Received Funds Emergency Guide */}
      {isMuleThreat && showReceivedFundsGuide && (
        <div className="pt-2 animate-in fade-in-50 slide-in-from-top-4 duration-300">
          <MuleReceivedFundsGuide onComplete={() => setShowReceivedFundsGuide(false)} />
        </div>
      )}
    </div>
  );
}

function formatCategoryTitle(category: string): string {
  switch (category) {
    case "MONEY_MULE_RECRUITMENT":
    case "CAT_MONEY_MULE":
      return "Money-Mule Solicitation & Fund Routing Scheme";
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
