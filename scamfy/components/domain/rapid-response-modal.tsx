"use client";

import * as React from "react";
import {
  PhoneCall,
  Building2,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  Clock,
  FileCheck,
  Info,
  Copy,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface RapidResponseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transactionUtr?: string;
  elapsedHours?: number;
  financialLossAmount?: number;
  bankName?: string;
}

/**
 * Rapid-Response Financial Fraud Protocol Modal (OFF-02, UX-02, UX-03).
 *
 * Provides prompt, accessible emergency intervention directives when unauthorized
 * transactions or active financial fraud losses are reported.
 *
 * Strict regulatory & ethical guardrails:
 * - Direct click-to-dial `tel:1930` for National Cyber Crime Helpline.
 * - Explicit instructions to contact victim's own bank via physical card/app credentials only.
 * - Never treats 4 hours as an eligibility cutoff (older transfers remain fully eligible).
 * - Clear disclosure: CFCFRMS facilitates inter-bank alerts and attempted holds, but cannot guarantee fund freezing or recovery.
 * - Discloses that portal intake or 1930 call does not equal automatic complaint registration or an FIR.
 * - Discloses that Scamfy does not submit complaints or contact banks on the victim's behalf.
 */
export function RapidResponseModal({
  isOpen,
  onOpenChange,
  transactionUtr,
  elapsedHours,
  financialLossAmount,
  bankName,
}: RapidResponseModalProps) {
  const [copiedUtr, setCopiedUtr] = React.useState(false);

  const handleCopyUtr = async () => {
    if (!transactionUtr) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(transactionUtr);
        setCopiedUtr(true);
        setTimeout(() => setCopiedUtr(false), 2000);
      }
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const isWithinEarlyWindow = elapsedHours !== undefined && elapsedHours <= 4;
  const isOlderTransaction = elapsedHours !== undefined && elapsedHours > 4;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        role="alertdialog"
        aria-describedby="rapid-response-description"
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border-red-500/40 bg-background/95 backdrop-blur-md shadow-2xl p-6"
      >
        <DialogHeader className="space-y-3 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="destructive"
              className="bg-red-600 hover:bg-red-600 text-white font-semibold uppercase tracking-wider px-3 py-1 flex items-center gap-1.5"
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Emergency Fraud Action
            </Badge>

            {financialLossAmount !== undefined && financialLossAmount > 0 && (
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                Reported Loss: ₹{financialLossAmount.toLocaleString("en-IN")}
              </span>
            )}

            {elapsedHours !== undefined && (
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {elapsedHours}h since incident
              </span>
            )}
          </div>

          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-600 shrink-0" aria-hidden="true" />
            Urgent: Initiate Inter-Bank Fraud Notification
          </DialogTitle>

          <DialogDescription
            id="rapid-response-description"
            className="text-sm text-muted-foreground leading-relaxed pt-1"
          >
            If unauthorized funds were debited from your account or you transferred money to a
            fraudulent party, take immediate defensive action. Rapid notification enables
            inter-bank alerts across recipient accounts through national banking networks.
          </DialogDescription>
        </DialogHeader>

        {/* Recency & Eligibility Context Card */}
        <div
          className={cn(
            "rounded-lg border p-3.5 space-y-1.5 text-left text-xs",
            isWithinEarlyWindow
              ? "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-200"
              : "border-blue-500/30 bg-blue-500/5 text-blue-950 dark:text-blue-200"
          )}
        >
          <div className="flex items-center gap-1.5 font-bold">
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            {isWithinEarlyWindow
              ? "Early Reporting Window Active"
              : isOlderTransaction
                ? "Immediate Reporting Remains Essential & Eligible"
                : "Timely Reporting Guidance"}
          </div>
          <p className="leading-relaxed text-muted-foreground dark:text-muted-foreground">
            {isWithinEarlyWindow ? (
              <>
                Reporting within the initial hours maximizes the likelihood of recipient banks
                attempting debit holds before scammers withdraw cash at ATMs or cascade funds to
                secondary mule accounts.
              </>
            ) : isOlderTransaction ? (
              <>
                Four hours is not an eligibility cutoff. Even if time has elapsed, you should still
                report the incident to 1930 and immediately notify your bank. Acting promptly may
                help limit further loss, but freezing or recovering funds is not guaranteed.
              </>
            ) : (
              <>
                Prompt notification maximizes the probability of inter-bank holds before funds are
                transferred further. All incidents remain fully eligible for reporting regardless of
                elapsed time.
              </>
            )}
          </p>
        </div>

        {/* 4-Step Rapid-Response Action Protocol */}
        <div className="space-y-3.5 text-left">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Mandatory 4-Step Defensive Protocol
          </h3>

          {/* Step 1: Call 1930 Helpline */}
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-2.5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white font-bold text-xs shrink-0">
                  1
                </span>
                <span className="font-bold text-sm text-foreground">
                  Call National Cyber Crime Helpline (1930)
                </span>
              </div>
              <a
                href="tel:1930"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 min-h-[44px] min-w-[140px]"
                aria-label="Call National Cyber Crime Helpline at 1930"
              >
                <PhoneCall
                  className="h-4 w-4 animate-pulse motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <span>Call 1930 Now</span>
              </a>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Operating 24x7 under the Ministry of Home Affairs (MHA/I4C). Calling 1930 triggers the
              <strong> Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS)</strong>,
              transmitting instant transaction alerts to beneficiary banks and payment gateways.
            </p>
          </div>

          {/* Step 2: Contact Own Bank Immediately */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0">
                2
              </span>
              <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                Contact Your Bank Fraud Desk Immediately {bankName ? `(${bankName})` : ""}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Notify your bank’s 24x7 emergency fraud helpline right away. Request an immediate
              debit freeze / stop-payment on the affected transaction and account.
            </p>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-amber-950 dark:text-amber-200 space-y-1">
              <div className="font-semibold flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Use Only Verified Bank Contact Numbers
              </div>
              <p className="leading-relaxed text-muted-foreground">
                Dial only the official phone number printed on the back of your physical debit/credit
                card, passbook, or inside your official banking mobile app. Never call numbers found on
                search engine advertisements, as scammers routinely publish fake helplines.
              </p>
            </div>

            {transactionUtr && (
              <div className="flex items-center justify-between gap-2 p-2 rounded bg-muted/60 border border-border text-xs">
                <span className="font-mono text-muted-foreground truncate">
                  UTR / Ref: <strong>{transactionUtr}</strong>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUtr}
                  className="h-7 px-2 text-xs flex items-center gap-1 shrink-0"
                  aria-label="Copy UTR number"
                >
                  {copiedUtr ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy UTR</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Step 3: Formalize Cybercrime Complaint */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0">
                  3
                </span>
                <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  Formalize on National Cyber Crime Portal
                </span>
              </div>
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline px-2.5 py-1.5 rounded border border-border hover:bg-muted min-h-[36px]"
              >
                <span>cybercrime.gov.in</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              After calling 1930, you will receive an SMS containing an acknowledgment ticket
              reference number. Visit the portal and follow the intake instructions associated with
              your reference to formalize your reporting record.
            </p>
          </div>

          {/* Step 4: Preserve Key Records */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0">
                4
              </span>
              <span className="font-bold text-sm text-foreground">
                Preserve All Incident Records & Communications
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Preserve all debit SMS notifications, transaction receipts (with UTR), bank statements,
              scammer phone numbers/UPI handles, and chat exports. Keep the 1930 acknowledgment SMS
              safe. Never delete messages or wipe device logs.
            </p>
          </div>
        </div>

        {/* Explicit Non-Guarantee & System Boundaries Disclosure */}
        <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2 text-left">
          <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
            <Info className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            Important Disclosures & Procedural Boundaries
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>
              <strong>No Fund Recovery Guarantee:</strong> Calling 1930 and contacting your bank
              facilitates inter-bank alerts and attempted holds via CFCFRMS. However, neither CFCFRMS
              nor Scamfy can guarantee that funds will be frozen, preserved, or recovered. Success
              depends entirely on whether funds remain in recipient accounts.
            </li>
            <li>
              <strong>No Automatic FIR / Formal Filing:</strong> Calling 1930 or visiting the portal
              does not automatically mean a formal complaint has been fully registered or that an FIR
              has been lodged. Official police intake and formal complaint processing follow official
              portal steps.
            </li>
            <li>
              <strong>Scamfy Role:</strong> Scamfy provides guidance and does not submit complaints,
              contact financial institutions, or initiate holds on your behalf.
            </li>
          </ul>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto font-medium"
          >
            I Have Notified My Bank / 1930 — Close
          </Button>

          <Button asChild variant="emergency" className="w-full sm:w-auto">
            <a href="tel:1930" aria-label="Call 1930 Helpline">
              <PhoneCall className="h-4 w-4 mr-2" aria-hidden="true" />
              Call 1930 Helpline
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export interface RapidResponseBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  onOpenModal?: () => void;
  elapsedHours?: number;
  helplineNumber?: string;
  officialPortalUrl?: string;
}

/**
 * Rapid-Response Financial Fraud Urgency Banner (OFF-02, UX-02).
 *
 * Prominent, high-urgency pinned banner rendered when financial loss or unauthorized
 * transfers are detected in triage flows.
 */
export function RapidResponseBanner({
  onOpenModal,
  elapsedHours,
  helplineNumber = "1930",
  officialPortalUrl = "https://cybercrime.gov.in/",
  className,
  ...props
}: RapidResponseBannerProps) {
  const isOlderTransaction = elapsedHours !== undefined && elapsedHours > 4;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "relative w-full rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-950 dark:border-red-800/80 dark:bg-red-950/60 dark:text-red-100 shadow-md",
        className
      )}
      {...props}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm mt-0.5">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-red-900 dark:text-red-100">
                Unauthorized Transfer / Financial Loss Action Protocol
              </span>
              <Badge
                variant="destructive"
                className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider py-0 px-2"
              >
                Immediate Action
              </Badge>
            </div>
            <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed max-w-2xl">
              Call the National Cyber Crime Helpline at <strong>{helplineNumber}</strong> to trigger
              CFCFRMS inter-bank alerts and immediately notify your bank’s 24x7 fraud desk using the
              number on your card or banking app.
              {isOlderTransaction && (
                <span className="block mt-0.5 font-medium">
                  Older transfers remain fully eligible and essential for investigation.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
          <a
            href={`tel:${helplineNumber}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 min-h-[44px] min-w-[130px]"
            aria-label={`Call National Cyber Crime Helpline ${helplineNumber}`}
          >
            <PhoneCall
              className="h-4 w-4 animate-pulse motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span>Call {helplineNumber}</span>
          </a>

          {onOpenModal && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenModal}
              className="border-red-300 bg-background/80 text-red-900 hover:bg-red-100 dark:border-red-700 dark:text-red-100 dark:hover:bg-red-900/50 min-h-[44px]"
            >
              Open Full Protocol
            </Button>
          )}

          {officialPortalUrl && (
            <a
              href={officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 dark:text-red-300 hover:underline px-2 py-1 min-h-[36px]"
            >
              <span>Portal</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
