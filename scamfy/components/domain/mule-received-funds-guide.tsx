"use client";

import * as React from "react";
import {
  ShieldAlert,
  Snowflake,
  FileText,
  ClipboardList,
  PhoneCall,
  Copy,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { generateBankLienNoticeTemplate, type BankNoticeDetails } from "@/lib/mule";
import { cn } from "@/lib/utils";

export interface MuleReceivedFundsGuideProps extends React.HTMLAttributes<HTMLDivElement> {
  onComplete?: () => void;
}

/**
 * Step-by-Step Emergency Protocol Wizard for Handling Unsolicited Received Funds (MULE-03, UX-02, UX-05).
 *
 * Guides users through immediate fund freezing, formal bank nodal notification generation,
 * digital evidence preservation, and official 1930 / cybercrime.gov.in reporting.
 *
 * @param props - HTML div element properties and optional onComplete callback
 * @returns React JSX element rendering the guided recovery wizard
 */
export function MuleReceivedFundsGuide({
  className,
  onComplete,
  ...props
}: MuleReceivedFundsGuideProps) {
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [copiedNotice, setCopiedNotice] = React.useState(false);

  // Form state for bank notice generator
  const [formData, setFormData] = React.useState<BankNoticeDetails>({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    transactionRefOrUtr: "",
    transactionDate: new Date().toISOString().split("T")[0] || "",
    amount: "",
    senderIdentifier: "",
    communicationChannel: "WhatsApp / Telegram",
  });

  // Checklist state for evidence preservation
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({
    chatExport: false,
    screenshots: false,
    smsAlert: false,
    bankStatement: false,
    timelineNotes: false,
  });

  const toggleChecklist = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (field: keyof BankNoticeDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generatedNoticeText = React.useMemo(() => {
    return generateBankLienNoticeTemplate(formData);
  }, [formData]);

  const handleCopyNotice = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(generatedNoticeText);
        setCopiedNotice(true);
        setTimeout(() => setCopiedNotice(false), 2500);
      }
    } catch {
      setCopiedNotice(false);
    }
  };

  const steps = [
    { id: 1, title: "1. Freeze Funds", icon: Snowflake },
    { id: 2, title: "2. Bank Notice", icon: FileText },
    { id: 3, title: "3. Evidence Checklist", icon: ClipboardList },
    { id: 4, title: "4. Official Report", icon: PhoneCall },
  ];

  return (
    <Card className={cn("border-border shadow-xl bg-card overflow-hidden", className)} {...props}>
      <CardHeader className="bg-muted/40 border-b border-border/80 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-rose-600 hover:bg-rose-600 text-white font-semibold">
              Emergency Protocol
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              Step {currentStep} of 4
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 text-amber-500" />
            <span>Unsolicited Inward Credit Guidance</span>
          </div>
        </div>

        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pt-1">
          Received Unsolicited Money? Safe Action Protocol
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          Follow these 4 steps to protect yourself from money-mule liability, notify your bank,
          and preserve evidence before account restrictions are placed.
        </CardDescription>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2 pt-3">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id as 1 | 2 | 3 | 4)}
                className={cn(
                  "flex items-center justify-center sm:justify-start gap-1.5 p-2 rounded-md border text-xs font-medium transition-all text-left",
                  isActive
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                    : isCompleted
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="hidden sm:inline">{s.title}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* STEP 1: IMMEDIATE FREEZE */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-base">
              <Snowflake className="h-5 w-5" />
              <h3>Step 1: Immediate Fund Isolation & Freeze Protocol</h3>
            </div>

            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Do NOT touch, spend, or forward any part of the received money under any circumstances.
              </p>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                <li>
                  <strong className="text-foreground">Do NOT send money back:</strong> Even if the caller claims it was an accidental transfer, sending funds to a different UPI/account connects you to a money-laundering layering chain.
                </li>
                <li>
                  <strong className="text-foreground">Do NOT withdraw cash:</strong> Withdrawing the money at an ATM makes you the cash extraction endpoint for the fraud network.
                </li>
                <li>
                  <strong className="text-foreground">Do NOT buy crypto or gift cards:</strong> Scammers frequently demand conversion to USDT or vouchers to eliminate trace evidence.
                </li>
                <li>
                  <strong className="text-foreground">Leave the balance intact:</strong> Keeping the funds untouched in your account proves your status as a bona fide customer when bank nodal officers review the incident.
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-border p-4 bg-muted/30 text-xs text-muted-foreground space-y-1.5">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                What if the scammer threatens you?
              </h4>
              <p>
                Scammers often threaten police complaints or legal action if you do not immediately forward the money. Do NOT panic. Legitimate bank reversals happen through official inter-bank dispute mechanisms, never via personal peer-to-peer transfers.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: BANK NOTICE GENERATOR */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <FileText className="h-5 w-5" />
              <h3>Step 2: Formal Bank Notification & Voluntary Debit Hold Generator</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Fill in your transaction details below to generate a standardized written notice to your bank manager and nodal fraud officer requesting a voluntary debit hold on the specific disputed amount.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="account-holder-name" className="text-xs font-semibold text-foreground block mb-1">
                  Account Holder Name
                </label>
                <input
                  id="account-holder-name"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="bank-name" className="text-xs font-semibold text-foreground block mb-1">
                  Bank Name
                </label>
                <input
                  id="bank-name"
                  type="text"
                  placeholder="e.g. State Bank of India / HDFC Bank"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="account-number" className="text-xs font-semibold text-foreground block mb-1">
                  Account Number
                </label>
                <input
                  id="account-number"
                  type="text"
                  placeholder="e.g. 30012345678"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="disputed-amount" className="text-xs font-semibold text-foreground block mb-1">
                  Disputed Amount (₹)
                </label>
                <input
                  id="disputed-amount"
                  type="text"
                  placeholder="e.g. 45,000"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="transaction-ref-or-utr" className="text-xs font-semibold text-foreground block mb-1">
                  Transaction UTR / Reference No.
                </label>
                <input
                  id="transaction-ref-or-utr"
                  type="text"
                  placeholder="e.g. UPI/429183928193 or IMPS-..."
                  value={formData.transactionRefOrUtr}
                  onChange={(e) => handleInputChange("transactionRefOrUtr", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="sender-identifier" className="text-xs font-semibold text-foreground block mb-1">
                  Sender Handle / Number (if known)
                </label>
                <input
                  id="sender-identifier"
                  type="text"
                  placeholder="e.g. fraudster@okhdfcbank / +919876543210"
                  value={formData.senderIdentifier}
                  onChange={(e) => handleInputChange("senderIdentifier", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Live Generated Letter Box */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Generated Written Notice Template
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyNotice}
                  className="h-7 text-xs flex items-center gap-1"
                >
                  {copiedNotice ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Letter</span>
                    </>
                  )}
                </Button>
              </div>

              <pre className="p-3.5 rounded-lg border border-border bg-muted/40 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {generatedNoticeText}
              </pre>
            </div>
          </div>
        )}

        {/* STEP 3: EVIDENCE CHECKLIST */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <ClipboardList className="h-5 w-5" />
              <h3>Step 3: Digital Evidence Preservation Checklist</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Before blocking or leaving groups, preserve these critical records. They establish that you did not solicit the funds and were targeted as an unwitting mule.
            </p>

            <div className="space-y-2.5">
              {[
                {
                  id: "chatExport",
                  title: "Export Full Chat History",
                  desc: "Export complete WhatsApp / Telegram chats including media without deleting any messages.",
                },
                {
                  id: "screenshots",
                  title: "Screenshot Phone Numbers & User Profiles",
                  desc: "Capture profile pages showing phone numbers, handles, and transaction instructions.",
                },
                {
                  id: "smsAlert",
                  title: "Save Inward Credit SMS Alerts",
                  desc: "Keep the exact bank credit SMS showing sender header (e.g. AX-HDFCBK), amount, and UTR.",
                },
                {
                  id: "bankStatement",
                  title: "Download Bank Account Statement (PDF)",
                  desc: "Obtain official PDF statement highlighting the inward credit line item.",
                },
                {
                  id: "timelineNotes",
                  title: "Write Down a Factual Timeline",
                  desc: "Note exact timestamps: when contacted, what was offered, when funds arrived, and when you notified the bank.",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-left",
                    checkedItems[item.id]
                      ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                      : "border-border/70 bg-card hover:bg-muted/20"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checkedItems[item.id])}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-semibold text-foreground">{item.title}</h5>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: OFFICIAL REPORTING HANDOFF */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-base">
              <PhoneCall className="h-5 w-5" />
              <h3>Step 4: Official Helpline & Cyber Crime Portal Handoff</h3>
            </div>

            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Lodge an Informational Complaint Before Account Freezes Occur
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When cybercrime police receive a complaint from the original victim, they issue automated debit hold instructions down the transaction chain. Filing a proactive informational complaint on <strong>cybercrime.gov.in</strong> or calling <strong>1930</strong> establishes on record that you are an unwitting target cooperating fully.
              </p>

              <div className="grid gap-3 sm:grid-cols-2 pt-1">
                <a
                  href="tel:1930"
                  className="flex items-center justify-between p-3 rounded-md border border-border bg-card hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs text-muted-foreground">National Cyber Helpline</span>
                    <div className="text-base font-bold text-foreground">Dial 1930</div>
                  </div>
                  <PhoneCall className="h-5 w-5 text-emerald-500" />
                </a>

                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-md border border-border bg-card hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs text-muted-foreground">National Portal</span>
                    <div className="text-sm font-bold text-foreground">cybercrime.gov.in</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-primary" />
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-1 text-left">
              <strong>Scamfy Compliance Note:</strong> Scamfy does not automate government portal submissions or guarantee reversal. Official complaints must be filed directly by the account holder through official channels.
            </div>
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="bg-muted/20 p-4 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4)}
          className="flex items-center gap-1 text-xs"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Step
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            size="sm"
            onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1) as 1 | 2 | 3 | 4)}
            className="flex items-center gap-1 text-xs font-semibold"
          >
            Next Step
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={() => onComplete?.()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1"
          >
            <CheckCircle2 className="h-4 w-4" />
            Protocol Completed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
