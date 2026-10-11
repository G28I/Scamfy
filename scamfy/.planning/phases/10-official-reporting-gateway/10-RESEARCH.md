# Phase 10: Official Reporting Gateway & 1930 Route — Research & Technical Foundations (Revised)

## 1. Authoritative Research on Indian Fraud Reporting Frameworks

Authoritative research conducted on Indian cyber financial crime reporting frameworks, statutory guidelines, and government citizen portals (current and verified as of October 2026):

---

### 1.1 National Cyber Crime Reporting Portal & 1930 Helpline (I4C / MHA)
- **Governing Body**: Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs (MHA).
- **Helpline**: `1930` (formerly 155260, operational 24x7 across all States and Union Territories).
- **Official Portal**: `https://cybercrime.gov.in/` (Checked: October 2026).
- **Backbone System**: **Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS)**.
- **System Capabilities vs. Caller Guarantees**:
  - *How CFCFRMS Works*: When a victim dials 1930, the call center operator logs transaction details (victim's account number, transaction UTR number, suspected beneficiary account/UPI ID, debit timestamp). The CFCFRMS immediately disseminates automated API alerts across the banking and payment ecosystem (RBI-regulated banks, payment aggregators, wallet providers, merchant platforms).
  - *Inter-Bank Hold Action*: Receiving banks attempt to place a temporary lien or debit hold on the suspect account if the stolen funds have not yet been withdrawn via ATM, transferred via P2P chains, or converted to crypto.
  - *Why "Rapid Response" Matters*: While prompt reporting (within the first few hours) materially increases the likelihood that funds remain in intermediary accounts before multi-hop laundering occurs, **it is NOT a statutory cutoff, eligibility threshold, or guarantee**.
  - *Procedural Mandate*: The 1930 call generates an acknowledgment SMS containing a reference ID. The victim must log in to `cybercrime.gov.in` within 24 hours using this acknowledgment to complete formal complaint registration and upload supporting transaction evidence.
- **API Availability**: **Zero public or authenticated citizen submission APIs exist**. All filings require direct user interaction via `cybercrime.gov.in` or the 1930 telephone queue.
- **Integration Approach**: Direct deep linking, `tel:1930` dialer, persistent Hybrid Drawer copy-paste helper, and formatted incident narrative dossier.

---

### 1.2 Chakshu — Sanchar Saathi (Department of Telecommunications)
- **Governing Body**: Department of Telecommunications (DoT), Ministry of Communications.
- **Official Portal**: `https://sancharsaathi.gov.in/sfc/` (Checked: October 2026).
- **Purpose**: Citizen reporting of suspected fraudulent communication received via phone calls, SMS messages, or WhatsApp (e.g. fake KYC update requests, courier extortion threats, digital arrest warnings, impersonation).
- **Scope & Limitations (Crucial Routing Distinction)**:
  - Chakshu triggers telecom carrier intelligence, bulk SIM investigations, and potential mobile number disconnection / IMEI blacklisting.
  - **Does NOT handle financial recovery, transaction holds, or legal FIRs**.
  - *Routing Rule*: If money has actually been transferred, the incident **MUST NOT** be routed exclusively to Chakshu. The primary route is ALWAYS 1930 / Cybercrime Portal / Bank Fraud Desk. Chakshu is presented only as a secondary telecom-blocking option.

---

### 1.3 Reserve Bank of India Sachet Portal (RBI)
- **Governing Body**: Reserve Bank of India.
- **Official Portal**: `https://sachet.rbi.org.in/` (Checked: October 2026).
- **Statutory Purpose**: Intelligence gathering under the Banning of Unregulated Deposit Schemes Act (BUDS Act, 2019) and Reserve Bank of India Act, 1934.
- **Scope of Action**:
  - Investigates unauthorized deposit collection by unregistered entities, unregistered Digital Lending Apps (DLAs), and illegal collective investment syndicates.
  - Complaints are routed to State Level Coordination Committees (SLCCs) comprising state police, RBI, SEBI, and Registrar of Companies (ROC).
- **API Availability**: **Zero external submission APIs**.
- **Integration Approach**: Deep links to Sachet complaint forms, accompanied by NBFC registration verification tools.

---

### 1.4 Securities and Exchange Board of India (SEBI SCORES 2.0 & Unregistered Routing)
- **Governing Body**: Securities and Exchange Board of India.
- **Official Portals**:
  - Registered Entities: `https://scores.sebi.gov.in/` (Checked: October 2026).
  - Suspected Unregistered Entities / Tips: `https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognised=yes`
- **Scope Distinction (Review Correction B)**:
  - **SEBI SCORES 2.0**: Designed *only* for complaints against listed companies and SEBI-registered intermediaries (registered stock brokers, depository participants, mutual funds, registered research analysts).
  - **Unregistered Investment Traps**: Most student-targeted investment scams (fake WhatsApp/Telegram VIP stock groups, guaranteed daily crypto pools, fake institutional IPO allotments) are operated by **unregistered syndicates**. These entities cannot be redressed through SCORES because they are not regulated by SEBI.
  - *Routing Rule*: Suspected unregistered syndicates are routed to the **National Cyber Crime Reporting Portal (1930)** as cyber financial fraud, with a secondary tip route to SEBI's unregistered entity vigilance portal.

---

### 1.5 Banking Redressal & RBI Integrated Ombudsman Framework
- **Governing Body**: Reserve Bank of India.
- **Official Portal**: `https://cms.rbi.org.in/` (Complaint Management System).
- **Regulatory Frameworks Verified**:
  1. **RBI Circular *RBI/2017-18/15* (Limiting Liability of Customers in Unauthorised Electronic Banking Transactions)**:
     - Defines conditions under which customer liability is capped:
       - *Zero Liability*: When fraud occurs due to bank negligence/deficiency, or third-party breach where customer reports within 3 working days of receiving bank alert.
       - *Limited Liability*: Reporting within 4 to 7 working days caps customer liability according to transaction value and account type (₹5,000 to ₹25,000).
       - *Beyond 7 Working Days*: Customer liability is determined as per bank board-approved policy.
     - *Crucial Limitation*: This 3-working-day period relates specifically to **customer liability limitation disputes with the bank**, NOT a general police reporting deadline.
  2. **Reserve Bank - Integrated Ombudsman Scheme (RB-IOS)**:
     - Governs escalation when a bank fails to resolve a customer grievance.
     - **Pre-Conditions for Escalation**:
       - The customer must first submit a formal complaint to the Regulated Entity (bank/NBFC/payment participant).
       - The customer can escalate to the RBI Ombudsman *only if*:
         1. The bank rejects the complaint; OR
         2. The bank fails to reply within 30 days of receipt; OR
         3. The customer is dissatisfied with the bank's resolution.
       - Complaints must be filed within one year from receiving the bank's final reply.

---

## 2. Technical Design Decisions & Data Contracts

### 2.1 Prisma Data Model (`schema.prisma`) — Strictly Data-Minimized
```prisma
model OfficialComplaintReference {
  id                  String   @id @default(uuid())
  userId              String?  @map("user_id")
  agency              String   // CYBERCRIME_1930, CHAKSHU_DOT, RBI_SACHET, SEBI_SCORES, BANK_GRIEVANCE
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
