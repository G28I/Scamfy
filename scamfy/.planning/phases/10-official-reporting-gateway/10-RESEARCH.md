# Phase 10: Official Reporting Gateway & 1930 Route — Research & Technical Foundations (Revised)

## 1. Authoritative Research on Indian Fraud Reporting Frameworks

Authoritative research conducted on Indian cyber financial crime reporting frameworks, statutory guidelines, and government citizen portals (current and verified as of October 11, 2026):

---

### 1.1 National Cyber Crime Reporting Portal & 1930 Helpline (I4C / MHA)
- **Governing Body**: Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs (MHA).
- **Helpline**: `1930` (formerly 155260, operational 24x7 across all States and Union Territories).
- **Official Portal**: `https://cybercrime.gov.in/` (Checked: October 11, 2026).
- **Backbone System**: **Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS)**.
- **System Capabilities vs. Caller Guarantees**:
  - *How CFCFRMS Works*: When a victim dials 1930, the call center operator logs transaction details (victim's account number, transaction UTR number, suspected beneficiary account/UPI ID, debit timestamp). The CFCFRMS immediately disseminates automated API alerts across the banking and payment ecosystem (RBI-regulated banks, payment aggregators, wallet providers, merchant platforms).
  - *Inter-Bank Hold Action*: Receiving banks attempt to place a temporary lien or debit hold on the suspect account if the stolen funds have not yet been withdrawn via ATM, transferred via P2P chains, or converted to crypto.
  - *Why "Rapid Response" Matters*: While prompt reporting (within the first few hours) materially increases the likelihood that funds remain in intermediary accounts before multi-hop laundering occurs, **it is NOT a statutory cutoff, eligibility threshold, or guarantee**.
  - *Procedural Follow-Up Context*: The 1930 telephone intake generates an acknowledgment SMS containing a reference ticket ID. The victim is instructed to log in to `cybercrime.gov.in` using this acknowledgment reference to formalize the complaint and upload transaction documentation. This is an operational case-formalization instruction given following the intake call, **not a universal 24-hour statutory deadline for all types of cybercrime**.
- **API Availability**: **Zero public or authenticated citizen submission APIs exist**. All filings require direct user interaction via `cybercrime.gov.in` or the 1930 telephone queue.
- **Integration Approach**: Direct deep linking, `tel:1930` dialer, persistent Hybrid Drawer copy-paste helper, and formatted incident narrative dossier.

---

### 1.2 Chakshu — Sanchar Saathi (Department of Telecommunications)
- **Governing Body**: Department of Telecommunications (DoT), Ministry of Communications.
- **Official Portal**: `https://sancharsaathi.gov.in/sfc/` (Checked: October 11, 2026).
- **Purpose**: Citizen reporting of suspected fraudulent communication received via phone calls, SMS messages, or WhatsApp (e.g. fake KYC update requests, courier extortion threats, digital arrest warnings, impersonation).
- **Scope & Limitations (Crucial Routing Distinction)**:
  - Chakshu triggers telecom carrier intelligence, bulk SIM investigations, and potential mobile number disconnection / IMEI blacklisting.
  - **Does NOT handle financial recovery, transaction holds, or legal FIRs**.
  - *Routing Rule*: If money has actually been transferred, the incident **MUST NOT** be routed exclusively to Chakshu. The primary route is ALWAYS 1930 / Cybercrime Portal / Bank Fraud Desk. Chakshu is presented only as a secondary telecom-blocking option.

---

### 1.3 Reserve Bank of India Sachet Portal (RBI)
- **Governing Body**: Reserve Bank of India.
- **Official Portal**: `https://sachet.rbi.org.in/` (Checked: October 11, 2026).
- **Statutory Purpose**: Intelligence gathering under the Banning of Unregulated Deposit Schemes Act (BUDS Act, 2019) and Reserve Bank of India Act, 1934.
- **Scope of Action**:
  - Investigates unauthorized deposit collection by unregistered entities, unregistered Digital Lending Apps (DLAs), and illegal collective investment syndicates.
  - Complaints are routed to State Level Coordination Committees (SLCCs) comprising state police, RBI, SEBI, and Registrar of Companies (ROC).
- **API Availability**: **Zero external submission APIs**.
- **Integration Approach**: Deep links to Sachet complaint forms, accompanied by NBFC registration verification tools.

---

### 1.4 Securities and Exchange Board of India (SEBI SCORES 2.0 & Market Intelligence Portal)
- **Governing Body**: Securities and Exchange Board of India.
- **Official Portals**:
  1. **SEBI SCORES 2.0**: `https://scores.sebi.gov.in/` (Checked: October 11, 2026).
  2. **SEBI SCORES FAQ**: `https://scores.sebi.gov.in/faqs` (Checked: October 11, 2026).
  3. **SEBI Market Intelligence (MI) Portal**: `https://miportal.sebi.gov.in/` (Checked: October 11, 2026).
  4. **SEBI Recognised Entities Search**: `https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognised=yes` (Checked: October 11, 2026).
- **Scope Distinction & Verification (Review Correction B & Provenance)**:
  - **SEBI SCORES 2.0**: Designed **exclusively** for complaints against listed companies and SEBI-registered intermediaries (registered stock brokers, depository participants, mutual funds, registered research analysts). SCORES requires selecting a registered entity and provides two-tier complaint tracking.
  - **SEBI Market Intelligence (MI) Portal**: Specifically established for citizens to submit confidential intelligence, tips, or information on **suspected violations of securities laws, unregistered advisors, fraudulent Telegram/WhatsApp VIP stock channels, pump-and-dump schemes, and fake institutional IPO allocations**.
    - *Crucial Procedural Limitation*: Information submitted on the MI Portal is processed internally for regulatory surveillance and enforcement. Complainants **do not receive an individual complaint tracking number or formal acknowledgment**, nor does the MI Portal act as an individual dispute-redressal or fund-recovery system.
  - *Routing Rule for Investment Scams*:
    - Registered entity grievances &rarr; Direct to **SEBI SCORES 2.0**.
    - Unregistered syndicates & fake investment groups with financial loss &rarr; Primary route is **1930 / National Cyber Crime Reporting Portal** (cyber financial fraud), with a secondary regulatory tip link to the **SEBI Market Intelligence Portal**.

---

### 1.5 Banking Redressal & Reserve Bank - Integrated Ombudsman Scheme, 2026
- **Governing Body**: Reserve Bank of India.
- **Official Portal**: `https://cms.rbi.org.in/` (Complaint Management System, Checked: October 11, 2026).
- **Official Contact Centre Helpline**: `14448` (24x7 toll-free).
- **Statutory Frameworks Verified Directly**:

#### 1. RBI Circular *RBI/2017-18/15* (Customer Protection – Limiting Liability of Customers in Unauthorised Electronic Banking Transactions)
- **Official Source URL**: `https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11040&Mode=0` (Circular DBR.No.Leg.BC.78/09.07.005/2017-18, Checked: October 11, 2026).
- **Tripartite Liability Framework**:
  1. *Zero Customer Liability — Bank Contributory Deficiency*:
     - Applies where the unauthorized transaction occurs due to contributory fraud, negligence, or deficiency on the part of the bank (irrespective of whether or not the transaction is reported by the customer).
  2. *Zero Customer Liability — Third-Party Breach*:
     - Applies where the deficiency lies neither with the bank nor with the customer, but lies elsewhere in the system, **provided the customer notifies the bank within three working days of receiving the communication from the bank** regarding the unauthorized transaction.
     - *Timing Rule*: The 3-working-day window starts strictly from **receipt of the bank's alert/communication**, NOT from when the fraud occurred or an external communication was received.
     - *Delayed Reporting in Third-Party Breach*: Reporting within 4 to 7 working days caps customer liability (₹5,000 for basic savings/BSBD accounts, ₹10,000 for other savings/overdraft/credit cards with limit up to ₹5 lakh, ₹25,000 for credit cards with limit > ₹5 lakh). Beyond 7 working days, liability is determined by the bank's board-approved policy.
  3. *Customer Negligence — Shared Payment Credentials*:
     - In cases where the loss is due to negligence by a customer, such as **where the customer has shared payment credentials (OTP, PIN, passwords, card details)**, the **customer bears the entire loss until the customer reports the unauthorized transaction to the bank**.
     - Any loss occurring *after* reporting the unauthorized transaction is borne by the bank.
     - *Product Rule*: Scamfy **must never** promise zero liability, reimbursement, or compensation where payment credentials were voluntarily shared.

#### 2. Reserve Bank - Integrated Ombudsman Scheme, 2026 (RB-IOS, 2026)
- **Effective Date**: **July 1, 2026** (supersedes the earlier 2021 framework).
- **Official Scheme Document**: `https://rbidocs.rbi.org.in/rdocs/content/pdfs/SCHEME16012026_A.pdf` (Checked: October 11, 2026).
- **Official FAQ**: `https://old.rbi.org.in/commonman/english/scripts/faqs.aspx?id=3407` (Checked: October 11, 2026).
- **Filing Prerequisites & Conditions**:
  1. *Mandatory Prior Bank Complaint*: The customer must first file a formal written complaint with the Regulated Entity (RE) and allow the RE the applicable statutory/regulatory response window.
  2. *Applicable Response Period*: The applicable response period for the RE may be the period specified by RBI, NPCI, or card-network guidelines (if any), or 30 days, **whichever is longer**. Thirty days is therefore not presented as a universal unconditional deadline across all payment and dispute types.
  3. *Permitted Escalation Grounds*: The customer may escalate to the RBI Ombudsman only if:
     - The complaint is rejected wholly or in part by the RE; OR
     - The RE fails to reply within the applicable response period (specified guideline timeline or 30 days, whichever is longer); OR
     - The customer is not satisfied with the reply/resolution provided by the RE.
  4. *90-Day Limitation Period (RB-IOS 2026 Rule)*:
     - Under the 2026 scheme, the complaint to the Ombudsman must be filed **within 90 days** from:
       - The date on which the applicable response period for the RE to respond expires; OR
       - The date of the last communication/reply received from the RE regarding the grievance;
       **whichever is later**, subject to all RB-IOS 2026 eligibility conditions.
  5. *Underlying Limitation & Exclusions*:
     - The original complaint to the RE must have been made within the applicable limitation period under the Limitation Act, 1963 for the specific claim, without presuming an automatic universal three-year period across all banking disputes.
     - Complaints already adjudicated by a court, tribunal, arbitrator, or under other statutory authorities are excluded.
  6. *Transition Rule*:
     - Complaints received before July 1, 2026, appeals under the 2021 scheme, and related awards continue to be governed by the provisions of the Reserve Bank - Integrated Ombudsman Scheme, 2021.
  7. *UI & Product Fencing*:
     - Scamfy **must not hard-code oversimplified legal timing advice** into the UI. The interface provides structured guidance, outlines the 4 operational phases, links directly to `https://cms.rbi.org.in/`, and explicitly informs victims that eligibility and response windows depend on applicable payment network rules, circulars, and bank communication timelines.

---

## 2. Technical Design Decisions & Data Contracts

### 2.1 Prisma Data Model (`schema.prisma`) — Strictly Data-Minimized
```prisma
model OfficialComplaintReference {
  id                  String   @id @default(uuid())
  userId              String?  @map("user_id")
  agency              String   // CYBERCRIME_1930, CHAKSHU_DOT, RBI_SACHET, SEBI_SCORES, SEBI_MI_PORTAL, BANK_GRIEVANCE
  referenceNumber     String   @map("reference_number") // Acknowledgment SMS ticket or portal ACK
  filingDate          DateTime @default(now()) @map("filing_date")
  status              String   @default("LODGED") // LODGED, UNDER_INVESTIGATION, FUNDS_FROZEN, CLOSED
  followUpDate        DateTime? @map("follow_up_date")
  notes               String?  // User-entered follow-up note (sanitized, max 500 chars)
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  user                User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([referenceNumber])
  @@map("official_complaint_references")
}
```
*Privacy Note*: Full complaint narratives, screenshots, and financial credentials are intentionally excluded from persistence. Anonymous users store this identical schema in browser `localStorage`.

### 2.2 Factual Complaint Narrative Structure & Provenance
The complaint payload adheres to the following pure structure:
1. **Provenance Header**:
   - `Document Type`: Factual Cybercrime Complaint Narrative
   - `Compiled For`: Citizen Submission on cybercrime.gov.in / Bank Fraud Dispute
   - `Generated At`: ISO Timestamp
2. **Incident Facts (User-Supplied)**:
   - Approximate Date & Time, Estimated Total Loss Amount (INR), Mode of Payment (UPI / IMPS / Card).
3. **Suspect Identifiers (Technical Indicators)**:
   - Extracted Phone Numbers, Social Handles, Destination Accounts / VPA, Domain Names.
4. **Chronological Interaction Summary**:
   - Objective, factual sequence of events cleanly distinguishing victim statements from technical detections. Zero unverified accusations.
5. **Preserved Evidence Inventory**:
   - Checklist of relevant documentation (Transaction SMS, Bank Statement PDF, Chat Export).
