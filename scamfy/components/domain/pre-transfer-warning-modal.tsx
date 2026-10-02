"use client";

import * as React from "react";
import {
  AlertOctagon,
  ShieldAlert,
  Ban,
  Lock,
  PhoneOff,
  ArrowRight,
  HelpCircle,
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
import type { AnalysisResultDto } from "@/app/api/check/route";

export interface PreTransferWarningModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  result?: AnalysisResultDto | null;
  onOpenReceivedFundsGuide?: () => void;
}

/**
 * Pre-Transfer Warning Modal Component (MULE-02, UX-02, UX-03, UX-04).
 *
 * Provides an interruptive, high-urgency security modal when an analysis indicates
 * a money-mule recruitment pattern, account rental solicitation, or unauthorized third-party fund routing.
 *
 * @param props - Component properties controlling dialog open state and action handlers
 * @returns React JSX element rendering the pre-transfer warning modal
 */
export function PreTransferWarningModal({
  isOpen,
  onOpenChange,
  result,
  onOpenReceivedFundsGuide,
}: PreTransferWarningModalProps) {
  const categoryName = result?.primary_category?.replace(/_/g, " ") || "MONEY MULE SOLICITATION";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border-rose-500/40 bg-background/95 backdrop-blur-md shadow-2xl p-6"
        aria-describedby="pre-transfer-warning-description"
      >
        <DialogHeader className="space-y-3 text-left">
          <div className="flex items-center gap-2">
            <Badge
              variant="destructive"
              className="bg-rose-600 hover:bg-rose-600 text-white font-semibold uppercase tracking-wider px-3 py-1 flex items-center gap-1.5"
            >
              <AlertOctagon className="h-4 w-4" />
              High Urgency Transfer Warning
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              Category: {categoryName}
            </span>
          </div>

          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-rose-500 shrink-0" />
            Stop: Do Not Transfer or Forward Any Funds
          </DialogTitle>

          <DialogDescription
            id="pre-transfer-warning-description"
            className="text-sm text-muted-foreground leading-relaxed pt-1"
          >
            This message exhibits patterns of a <strong>money-mule recruitment</strong> or{" "}
            <strong>unauthorized third-party fund routing scheme</strong>. Allowing your bank
            account or UPI ID to receive and forward third-party funds exposes you to severe legal
            and financial consequences under Indian banking and criminal law.
          </DialogDescription>
        </DialogHeader>

        {/* Legal and Regulatory Realities Card */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2 text-left">
          <div className="flex items-center gap-2 font-semibold text-amber-500 text-sm">
            <HelpCircle className="h-4 w-4" />
            Legal & Banking Consequences
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In India, account holders are legally and financially responsible for all transactions
            passing through their accounts. If stolen or defrauded funds route through your account,
            banks and cybercrime police units routinely place <strong>temporary debit holds / account freezes</strong>,
            and account holders can be investigated as accomplices to financial fraud.
          </p>
        </div>

        {/* Three Immediate Safe Action Directives */}
        <div className="space-y-3 text-left">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Mandatory Immediate Safe Actions
          </h4>

          <div className="grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-lg border border-border/80 bg-card p-3 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-rose-500 font-bold text-xs">
                <Ban className="h-4 w-4 shrink-0" />
                1. DO NOT SEND
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                Never transfer money to another account, UPI ID, or convert to crypto/cash.
              </p>
            </div>

            <div className="rounded-lg border border-border/80 bg-card p-3 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                <Lock className="h-4 w-4 shrink-0" />
                2. DO NOT TOUCH
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                If money was already credited, do NOT spend or withdraw it. Keep it intact.
              </p>
            </div>

            <div className="rounded-lg border border-border/80 bg-card p-3 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-blue-500 font-bold text-xs">
                <PhoneOff className="h-4 w-4 shrink-0" />
                3. REFUSE & BLOCK
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                Cut off communication immediately and do not share any OTPs or NetBanking access.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto font-medium"
          >
            I Understand — Close Warning
          </Button>

          {onOpenReceivedFundsGuide && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onOpenChange(false);
                onOpenReceivedFundsGuide();
              }}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center justify-center gap-2"
            >
              <span>Money Already Received? (Guide)</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
