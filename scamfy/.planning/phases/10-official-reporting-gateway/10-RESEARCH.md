# Phase 10: Official Reporting Gateway & 1930 Route — Research & Technical Foundations

## 1. Official Reporting Infrastructure in India

Authoritative research conducted on Indian cyber financial crime reporting frameworks and government citizen portals (current as of October 2026):

---

### 1.1 National Cyber Crime Reporting Portal & 1930 Helpline (I4C / MHA)
- **Governing Body**: Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs (MHA).
- **Helpline**: `1930` (formerly 155260).
- **Portal**: `https://cybercrime.gov.in/`
- **System**: **Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS)**.
- **Workflow & Capabilities**:
  1. **Golden Hour Intervention**: When a citizen reports a financial cyber fraud to 1930 within the first 2–4 hours of the incident, a ticket is immediately generated in the CFCFRMS.
  2. **Inter-Bank Communication**: The system automatically transmits debit alerts to the victim's bank, payment aggregators, intermediary wallets, and the beneficiary bank.
  3. **Lien Marking / Temporary Hold**: If the recipient account still holds the funds, banks place a temporary lien on the defrauded amount to prevent cash ATM withdrawal or P2P transfer.
  4. **Formal Complaint Lodging**: The 1930 call triggers an SMS acknowledgment containing a Reference ID, with a mandate for the victim to complete formal registration on `cybercrime.gov.in` within 24 hours.
- **API Availability**: **Zero public or authenticated citizen submission APIs exist**. All filings must occur directly through the portal UI or the 1930 phone queue.
- **Integration Strategy**: Direct deep linking (`https://cybercrime.gov.in/Webform/Crime_AuthoLogin.aspx`), 1930 click-to-dial (`tel:1930`), guided field copy-paste helper, and formatted incident narrative dossier.

---

### 1.2 Chakshu — Sanchar Saathi (Department of Telecommunications)
- **Governing Body**: Department of Telecommunications (DoT), Ministry of Communications.
- **Portal**: `https://sancharsaathi.gov.in/sfc/`
- **Purpose**: Citizen reporting of suspected fraud communications received via phone calls, SMS messages, or WhatsApp.
- **Scope of Action**:
  - Investigates suspected spam/fraud senders, bulk SIM fraud, and fraudulent calling line identification (CLI).
  - Can initiate telecom-level blacklisting and re-verification of suspect SIM numbers under DoT directives.
  - Does **not** handle bank fund recovery or legal FIRs (victims losing money are directed to 1930).
- **API Availability**: **No public REST API**.
- **Integration Strategy**: Deep linking to Chakshu intake with identifier auto-selection guidance for phone numbers and SMS sender headers.

---

### 1.3 RBI Sachet Portal (Reserve Bank of India)
- **Governing Body**: Reserve Bank of India (RBI).
- **Portal**: `https://sachet.rbi.org.in/`
- **Purpose**: Gathering intelligence on unauthorized deposit-taking entities, unlicensed Digital Lending Apps (DLAs), and illegal financial schemes.
- **Scope of Action**:
  - Relays complaints to state-level Level Coordination Committees (SLCCs) and respective financial regulators (RBI, SEBI, MCA, IRDAI).
  - Alerts citizens to entities not registered as authorized Non-Banking Financial Companies (NBFCs) or banks.
- **API Availability**: **No public third-party submission API**.
- **Integration Strategy**: Deep links, guided NBFC license checklist verification, and complaint narrative preparation.

---

### 1.4 SEBI SCORES 2.0 (Securities and Exchange Board of India)
- **Governing Body**: Securities and Exchange Board of India (SEBI).
- **Portal**: `https://scores.sebi.gov.in/`
- **Purpose**: Redressal of complaints against listed companies and SEBI-registered market intermediaries (unauthorized stock brokers, portfolio managers, fake IPO allotment syndicates, VIP stock tip channels).
- **API Availability**: **No public external citizen submission API**.
- **Integration Strategy**: Deep links to SCORES complaint lodging, guided advisor registration check against SEBI registry.

---

### 1.5 Banking Ombudsman (CMS) & NPCI Grievance
- **Governing Body**: Reserve Bank of India (Complaint Management System) & National Payments Corporation of India.
- **Portals**: `https://cms.rbi.org.in/` and `https://www.npci.org.in/what-we-do/upi/dispute-redressal-mechanism`
- **Purpose**: Redressal for customer liability disputes under RBI Circular *RBI/2017-18/15 DBR.No.Leg.BC.78/09.07.005/2017-18* (Customer Protection – Limiting Liability of Customers in Unauthorised Electronic Banking Transactions).
- **Zero Liability Rule**: Zero liability applies when fraud is reported within 3 working days and occurs due to bank deficiency or third-party breach without customer fault (e.g. sharing OTP/PIN).

---

## 2. Technical Design Decisions & Data Contracts

### 2.1 Prisma Data Model (`schema.prisma`)
```prisma
model OfficialComplaintReference {
  id                  String   @id @default(uuid())
  userId              String?  @map("user_id")
  anonymousSessionId  String?  @map("anonymous_session_id")
  agency              String   // CYBERCRIME_1930, CHAKSHU_DOT, RBI_SACHET, SEBI_SCORES, BANK_GRIEVANCE
  referenceNumber     String   @map("reference_number")
  incidentDate        DateTime? @map("incident_date")
  filingDate          DateTime @default(now()) @map("filing_date")
  status              String   @default("LODGED") // LODGED, UNDER_INVESTIGATION, FUNDS_FROZEN, CLOSED
  policeStation       String?  @map("police_station")
  notes               String?
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  user                User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([referenceNumber])
  @@map("official_complaint_references")
}
```

### 2.2 Factual Complaint Payload Structure
The complaint narrative generator adheres to the following pure structure:
1. **Header**: Incident Classification & Primary Fraud Pattern.
2. **Timeline of Transactions**: Date, Time, Amount, Payment Gateway / UPI UTR, Source Bank, Destination Account / VPA.
3. **Suspect Profiles**: Phone Numbers, Social Media Handles, Domains / URLs, Application Names.
4. **Factual Narrative**: Plain statement of interaction sequence without unverified adjectives or defamatory claims.
5. **Preserved Evidence Inventory**: Screenshots, SMS messages, bank debit alerts, call logs.
