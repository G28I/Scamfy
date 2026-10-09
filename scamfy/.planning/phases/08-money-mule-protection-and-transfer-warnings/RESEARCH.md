# Phase 8: Money-Mule Protection & Transfer Warnings — Research

- **Phase**: 08
- **Milestone**: Milestone 2 (Slice 2 - Community Intel & Mule Shield)
- **Status**: Research Complete & Expanded 🔬
- **Target Deliverable**: Comprehensive money-mule detection engine covering student-specific recruitment vectors, contextual multi-signal detection, interruptive pre-transfer warnings, non-dogmatic legal liability education, and a guided preservation workflow for already-received funds.

---

## 1. Domain & Threat Landscape: Student-Targeted Money-Mule Operations in India

In cyber-financial fraud in India, "money mules" (predominantly college students, young job seekers, and unemployed youth) are recruited as financial infrastructure to receive illicit funds into personal savings or current accounts and layer/forward them to criminal networks.

### Observed Real-World Incident Case Studies:
1. **Delhi Government-Scholarship Mule Ring (Sept 2026)**:
   - Facilitators recruited college students under the guise of government scholarship processing.
   - Students were paid a 10% commission to arrange peer bank accounts and route fraud proceeds through campus networks.
2. **Goa Loan Assistance Mule Syndicate (Sept 2026)**:
   - 60+ individuals recruited under the pretext of loan sanction assistance.
   - Bank passbooks, ATM cards, and blank signed cheques were collected and handed over to international fraud rings.
3. **Bengaluru Campus Laundering Case (Feb 2026)**:
   - A 19-year-old engineering student surrendered account credentials to acquaintances, resulting in ₹7 crore being laundered through his personal account in 48 hours.
4. **Rajasthan Telegram Instrument Harvesting Network (Sept 2026)**:
   - Facilitators procured bank accounts, ATM cards, registered SIM kits, and passbooks via Telegram and WhatsApp groups for crypto P2P layering and gaming payouts.

---

## 2. Six Student-Specific Recruitment Families

MULE-01 extends deterministic detection across six core student recruitment vectors:

| Family | Pattern Identifier | Core Detection Mechanism | Severity |
| :--- | :--- | :--- | :--- |
| **A. Loan Assistance & Fake Bank DSA** | `RULE-MULE-LOAN-ASSISTANCE-PRETEXT` | Pretext of loan approval/disbursement coupled with requests for blank signed cheques, debit cards, passbooks, or third-party fund routing. | `CRITICAL` |
| **B. Fake Scholarships & Job Arranging** | `RULE-MULE-SCHOLARSHIP-JOB-COMMISSION` | Scholarship, stipend, or part-time job offers requiring personal account routing of client payments or recruiting peer accounts for commission. | `CRITICAL` |
| **C. Instrument & Credential Harvesting** | `RULE-MULE-BANKING-INSTRUMENT-CAPTURE` | Direct demands for blank signed cheques, ATM cards/PINs, passbook kits, SIM cards, NetBanking passwords, or OTP forwarding. | `CRITICAL` |
| **D. Deceptive Risk Minimization** | `RULE-MULE-INTERMEDIARY-REASSURANCE` | Deceptive reassurances ("only an intermediary", "harmless", "no risk", "not responsible") combined with account use or fund movement instructions. | `CRITICAL` |
| **E. Corporate Proxy Account Creation** | `RULE-MULE-CORPORATE-ACCOUNT-CREATION` | Solicitations to open a bank account in the student's name for external companies/clients to operate in exchange for rent or commission. | `CRITICAL` |
| **F. Campus / Messaging Account Rental** | `RULE-ACCOUNT-RENTAL-P2P` | Account/UPI rental or procuring offers circulated on Telegram, WhatsApp, Instagram, or campus groups for daily rent or arbitrage fees. | `CRITICAL` |

---

## 3. Contextual Multi-Signal Detection Architecture

Rather than relying on flat, isolated keyword regexes, Scamfy structures mule detection across four correlated evidence dimensions:

```
[ Opportunity Context ]
        ↓ (Job / Scholarship / Loan Assistance / Corporate Proxy)
[ Account or Instrument Request ]
        ↓ (Cheque / Debit Card / PIN / OTP / Account Open / Account Rental)
[ Incentive or Risk Minimization ]
        ↓ (Commission % / Daily Rent / "Only an intermediary" / "No risk")
[ Fund Movement Instruction ]
        ↓ (Receive & Forward / USDT Conversion / Reversal Trap)
[ High-Priority Money-Mule Risk Classification ]
```

### Flexible Dimension Hierarchy:
1. **Full Recruitment Funnel**: Co-occurrence of all dimensions indicates an active, coordinated mule recruitment scheme (`CRITICAL`).
2. **High-Risk Partial Funnels**:
   - Loan assistance + blank signed cheques / debit cards → Immediate `CRITICAL` instrument-harvesting warning.
   - Account rental + daily commission on messaging platforms → Immediate `CRITICAL` rental warning.
3. **Standalone Dangerous Credential Requests**: Explicit surrender demands for OTPs, NetBanking credentials, or blank signed cheques independently warrant immediate `CRITICAL` warnings even in isolation.

---

## 4. Legal & Regulatory Realities in India (`MULE-02`, `UX-02`)

All guidance and educational alerts adhere strictly to verified primary sources:
1. **Primary Regulatory & Law Enforcement Sources**:
   - **National Cyber Crime Reporting Portal** ([cybercrime.gov.in](https://www.cybercrime.gov.in/))
   - **Indian Cyber Crime Coordination Centre (I4C)**: Citizen Financial Cyber Fraud Helpline (1930) and National Cybercrime Threat Analytics Unit.
   - **Reserve Bank of India (RBI) Circular on Operation of accounts – 'Money Mules'**: [DBOD.AML.BC.No.65/14.01.001/2010-11](https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=6136) (dated 7 December 2010), directing banks on monitoring unusual account usage, fictitious recruitment lures, and money-mule operations.
   - **Reserve Bank of India (RBI) Master Direction – Know Your Customer (KYC) Direction, 2016**: [RBI/DBR/2015-16/18 Master Direction DBR.AML.BC.No.81/14.01.001/2015-16](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=11566) (updated as on 14 August 2025, governing ongoing transaction monitoring, customer due diligence, and suspicious transaction reporting to FIU-IND).
2. **Neutral, Non-Dogmatic Legal Framing**:
   - Replaced categorical claims of automatic criminal guilt with neutral, legally accurate statements: *"Allowing your account to route unsolicited funds risks immediate bank debit holds, account freezes under cybercrime investigations, and potential inquiry as an unwitting accomplice."*
   - Explicitly clarified that Scamfy triage is an automated advisory assessment and does not constitute a judicial, regulatory, or criminal determination of guilt (`AI-05`, `OOS-03`).
3. **Safe Action Priority**:
   - **DO NOT transfer or forward any part of the funds.**
   - **DO NOT touch, withdraw, or spend received funds.**
   - **Issue a formal written notice to the bank branch manager / nodal officer requesting a voluntary debit hold.**
   - **Preserve digital evidence and lodge an informational report on 1930 / cybercrime.gov.in.**

---

## 5. False-Positive Safeguards (Negative Control Suite)

To prevent legitimate financial communications from triggering false alarms, Scamfy enforces explicit negative test controls:
1. **Monthly Salary Notifications**: Corporate payroll credits with payslip links.
2. **Expense Reimbursements**: Approved travel/client business expense payouts.
3. **Routine Family Transfers**: Parental remittances for hostel, mess fees, or books.
4. **Genuine Scholarship Disbursements**: Direct government scholarship credits from registered ministry accounts.
5. **Legitimate Bank Loan Sanction**: Verified branch sanction letters requesting physical branch document verification without credential surrender.
6. **Ordinary Internship Offers**: Standard offer letters detailing stipends without account-routing instructions.
7. **Routine P2P & Bill Splitting**: Friends settling dinner expenses or sharing utility bills.
