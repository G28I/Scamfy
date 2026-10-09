import type { AnalysisResultDto, AnalysisSignalDto } from "@/app/api/check/route";

export interface BankNoticeDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  transactionRefOrUtr: string;
  transactionDate: string;
  amount: string;
  senderIdentifier?: string;
  communicationChannel?: string;
}

/**
 * Checks whether an analysis result indicates a money-mule pattern, account rental lure,
 * or high-risk unauthorized fund transfer instruction.
 *
 * @param result - Analysis result object from the threat triage engine
 * @returns True if money-mule or account rental risk is detected
 */
export function isMoneyMuleRisk(result: AnalysisResultDto | null | undefined): boolean {
  if (!result) return false;

  const category = (result.primary_category || "").toUpperCase();
  if (
    category === "MONEY_MULE_RECRUITMENT" ||
    category === "CAT_MONEY_MULE" ||
    category === "MULE_ACCOUNT_RECRUITMENT"
  ) {
    return true;
  }

  if (result.secondary_categories?.some((c) => {
    const uc = c.toUpperCase();
    return (
      uc === "MONEY_MULE_RECRUITMENT" ||
      uc === "CAT_MONEY_MULE" ||
      uc === "MULE_ACCOUNT_RECRUITMENT"
    );
  })) {
    return true;
  }

  return (result.signals || []).some((s) => {
    const sid = (s.id || "").toUpperCase();
    const sname = (s.name || "").toUpperCase();
    return (
      sid.includes("RULE-MONEY-MULE") ||
      sid.includes("RULE-MULE-") ||
      sid.includes("RULE-ACCOUNT-RENTAL") ||
      sid.includes("RULE-OVERPAYMENT-REVERSAL") ||
      sname.includes("MONEY MULE") ||
      sname.includes("MULE") ||
      sname.includes("ACCOUNT RENTAL") ||
      sname.includes("OVERPAYMENT & THIRD-PARTY")
    );
  });
}

/**
 * Filters and returns all analysis signals specific to money mule recruitment or account rental.
 *
 * @param result - Analysis result object
 * @returns Array of matching money-mule analysis signals
 */
export function getMuleSignals(result: AnalysisResultDto | null | undefined): AnalysisSignalDto[] {
  if (!result || !result.signals) return [];

  return result.signals.filter((s) => {
    const sid = (s.id || "").toUpperCase();
    const sname = (s.name || "").toUpperCase();
    return (
      sid.includes("RULE-MONEY-MULE") ||
      sid.includes("RULE-MULE-") ||
      sid.includes("RULE-ACCOUNT-RENTAL") ||
      sid.includes("RULE-OVERPAYMENT-REVERSAL") ||
      sname.includes("MONEY MULE") ||
      sname.includes("MULE") ||
      sname.includes("ACCOUNT RENTAL") ||
      sname.includes("OVERPAYMENT")
    );
  });
}

/**
 * Generates a formal, standardized written communication to the bank branch manager or nodal fraud officer.
 * Requests a voluntary temporary debit hold/lien on a specific unsolicited transaction amount per RBI fraud guidelines.
 *
 * @param details - Structured transaction and account details supplied by the user
 * @returns Formatted plain text template ready for email or written submission
 */
export function generateBankLienNoticeTemplate(details: BankNoticeDetails): string {
  const dateStr = details.transactionDate || new Date().toISOString().split("T")[0];
  const holderName = details.accountHolderName.trim() || "[Your Full Name]";
  const bank = details.bankName.trim() || "[Bank Name]";
  const accNo = details.accountNumber.trim() || "[Your Account Number]";
  const utr = details.transactionRefOrUtr.trim() || "[Transaction UTR / Ref Number]";
  const amt = details.amount.trim() || "[Amount in INR]";
  const sender = details.senderIdentifier?.trim() || "[Sender UPI ID / Account / Phone Number]";
  const channel = details.communicationChannel?.trim() || "[WhatsApp / Telegram / Call / SMS]";

  return `To,
The Branch Manager / Nodal Fraud Officer,
${bank}

Subject: Urgent Request for Voluntary Temporary Debit Hold on Disputed/Unsolicited Inward Credit (A/C: ${accNo})

Respected Sir / Madam,

I am writing to bring to your immediate attention an unsolicited and suspicious inward transaction credited to my savings/current account. I suspect this transaction may be associated with an unauthorized third-party scheme or cyber-financial fraud.

Transaction Details:
- Account Holder Name: ${holderName}
- Account Number: ${accNo}
- Date of Credit: ${dateStr}
- Disputed Transaction Amount: ₹${amt}
- Transaction UTR / Reference Number: ${utr}
- Purported Sender Identifier: ${sender}
- Channel of Solicitation: ${channel}

Circumstances:
I was contacted by an unverified third party who instructed me to receive these funds and forward/transfer them to third-party accounts or convert them. Recognizing this as a potential money-mule or illicit routing scheme, I have NOT touched, withdrawn, spent, or forwarded any part of these funds.

Requested Action:
1. Please place a voluntary temporary debit hold / lien strictly on the disputed amount of ₹${amt} in my account.
2. I request that the bank record this formal disclosure and coordinate with the remitting institution or relevant cyber-fraud reporting cells (NCRP / 1930) for lawful reversal to the rightful owner.
3. I confirm that I am willing to cooperate fully with the bank and law enforcement authorities to resolve this matter.

Attached: Copy of Bank Statement showing the credit, screenshots of communication and transfer instructions.

Yours sincerely,

${holderName}
Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
`;
}
