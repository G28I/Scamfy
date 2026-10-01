# Phase 8: Money-Mule Protection & Transfer Warnings — Research

- **Phase**: 08
- **Milestone**: Milestone 2 (Slice 2 - Community Intel & Mule Shield)
- **Status**: Research Complete 🔬
- **Target Deliverable**: Comprehensive money-mule detection engine, interruptive pre-transfer warnings, legal liability education, and a guided preservation workflow for already-received funds.

---

## 1. Domain & Threat Landscape: Money-Mule Operations in India

In cyber-financial fraud in India, "money mules" (often unwitting college students, job seekers, or gig workers) are recruited to receive illicit funds into their personal savings or current bank accounts and transfer/forward them elsewhere.

### Primary Mule Recruitment Archetypes:
1. **Part-Time Salary / Task Commission Forwarding**:
   - Scammer recruits student as "payment assistant", "finance intern", or "crypto P2P merchant".
   - Instructs victim to receive funds (e.g., ₹25,000–₹1,00,000) from diverse UPI IDs, keep a 5–10% commission, and transfer the remaining 90–95% to another UPI ID, bank account, or convert into crypto (USDT) / gift cards.
2. **Bank Account / UPI Handle Rental (P2P Arbitrage)**:
   - Scammer offers daily/weekly rental fees (e.g., "₹5,000/day for your current account / UPI handle") for "gaming payouts" or "crypto P2P arbitrage".
   - The victim surrenders account access or operates it under the scammer's direction.
3. **Accidental / Overpayment Reversal Lure**:
   - Scammer sends money (or fake SMS credit alert) to victim and calls claiming: *"I sent ₹50,000 to your UPI by mistake. Please send back ₹45,000 to this other number and keep ₹5,000 for your trouble."*
   - Forwarding these funds connects the victim's account directly to a fraud chain.
4. **Campus Cash Withdrawal Rings**:
   - Student asked to withdraw cash from ATM using funds received in their account and hand cash to an agent.

---

## 2. Legal & Financial Realities in India (`MULE-02`, `UX-02`)

1. **Accomplice Liability**: Under the Prevention of Money Laundering Act (PMLA), IPC Section 420 (Cheating), and IT Act Section 66D, providing your bank account or UPI ID to receive and forward proceeds of crime makes the account holder legally liable as a co-conspirator/mule.
2. **Section 102 CrPC Liens & Freezes**: Cyber crime police units automatically issue debit freezes on the entire transaction chain. An unwitting student whose account touched stolen money will have their account frozen, PAN flagged, and credit history impaired.
3. **Safe Action Priority**:
   - **DO NOT transfer or forward any part of the funds.**
   - **DO NOT withdraw or spend the money.**
   - **Immediately issue a written notice to your bank's nodal officer.**
   - **Preserve digital evidence and lodge an informational report on 1930 / cybercrime.gov.in.**

---

## 3. Detection Strategy & Rule Patterns (`MULE-01`)

### Deterministic Rule Engine Extensions (`backend/app/core/evaluator.py`):
1. `RULE-MONEY-MULE-FORWARDING`:
   - Matches keywords: `receive in (your) account`, `transfer (to|back|remaining)`, `keep (commission|percent|share|rs)`, `forward funds`, `send to other upi`.
   - Severity: `CRITICAL`.
   - Category: `MONEY_MULE_RECRUITMENT`.
2. `RULE-ACCOUNT-RENTAL-P2P`:
   - Matches keywords: `rent your (bank|current|savings|upi) account`, `account for crypto p2p`, `daily rent for account`, `provide corporate account`.
   - Severity: `CRITICAL`.
   - Category: `MONEY_MULE_RECRUITMENT`.
3. `RULE-OVERPAYMENT-REVERSAL-MULE`:
   - Matches keywords: `sent by mistake`, `transfer back to different (number|upi|account)`, `refund excess amount to`, `keep extra money`.
   - Severity: `CRITICAL`.
   - Category: `MONEY_MULE_RECRUITMENT`.

---

## 4. Guided Workflow for Received Funds (`MULE-03`)

When a user indicates that money has already arrived in their account:
1. **Step 1: Immediate Freeze & No-Action Rule**:
   - Explain why spending or returning the money to the scammer is dangerous.
2. **Step 2: Formal Bank Notification**:
   - Provide a formal written communication template for the branch manager / nodal fraud officer.
   - Include fields: Account number, UTR/Transaction reference, Date/Time, Amount, and request for a specific debit lien/hold.
3. **Step 3: Evidence Capture & Preservation**:
   - Structured checklist: Full chat export, sender phone numbers, transaction SMS alerts, account statements, scammer's UPI/bank instructions.
4. **Step 4: Official Helpline / Record Handoff**:
   - Clear instructions to call 1930 / visit cybercrime.gov.in as an unwitting account target.

---

## 5. UI/UX Architecture (`UX-02`, `UX-03`, `UX-04`, `UX-05`)

1. **`MuleWarningModal` / `PreTransferWarningBanner`**:
   - Interruptive alert when risk includes `MONEY_MULE_RECRUITMENT` or high transfer risk.
   - Prominent "Emergency Money-Mule Warning" banner with shield/alert visual styling.
   - Action buttons: "I haven't sent money yet (View Safe Steps)", "Money already received (Guided Recovery)".
2. **`MuleReceivedFundsGuide`**:
   - Step-by-step interactive wizard with copyable bank notice templates and evidence checklist.
   - Full keyboard operability and WCAG AA contrast.
