# Phase 9: Loan & High-Return Trap Analyzer — Research & Technical Investigation

- **Phase**: 09
- **Milestone**: Milestone 3 (Slice 3 - Financial Trap Engine & Regulatory Verification)
- **Status**: Complete 🔬
- **Requirements Covered**: `LOAN-01`, `LOAN-02`, `LOAN-03`, `DET-04`, `DET-05`, `UX-01`, `UX-03`, `UX-04`, `UX-05`
- **Scope Fences**: Zero direct bank account manipulation (`OOS-01`), zero recovery guarantees (`OOS-02`), zero judicial declarations (`OOS-03`, `AI-05`), zero undocumented external government API fabrications (`OOS-05`).

---

## 1. Regulatory Context & Real-World Modus Operandi

### 1.1 Predatory Digital Loan Apps ("7-Day Loan Trap")
In India, predatory digital lending apps (often operating without an RBI-registered NBFC backing or using rented NBFC licenses) prey heavily on college students, daily wage earners, and financially distressed individuals.

**Core Modus Operandi:**
1. **Upfront Deductions & Net Disbursement Trick**:
   - The user applies for ₹5,000 or ₹10,000.
   - The app immediately deducts 30%–45% as "processing fee", "GST", or "convenience charge" upfront.
   - The borrower receives only ₹3,000–₹3,500 in their bank account.
2. **Hyper-Short Tenure**:
   - Stated tenure is advertised as 90 or 180 days, but post-disbursement the repayment deadline is set to **6 to 7 days**.
3. **Explosive Implied APR**:
   - The user must repay the full ₹5,000 in 7 days after receiving ₹3,000.
   - Net interest/fee for 7 days: ₹2,000 on a ₹3,000 principal = **66.67% per week**.
   - Implied Annual Percentage Rate (APR):
     $$\text{APR} = \left(\frac{\text{Total Repayment} - \text{Net Disbursed}}{\text{Net Disbursed}}\right) \times \left(\frac{365}{\text{Tenure in Days}}\right) \times 100$$
     $$\text{APR} = \left(\frac{5000 - 3000}{3000}\right) \times \left(\frac{365}{7}\right) \times 100 \approx 3,476\% \text{ per annum!}$$
4. **Intrusive Permissions & Blackmail Extortion**:
   - During app installation, users are forced to grant `READ_CONTACTS`, `READ_SMS`, `CAMERA`, and `READ_MEDIA_IMAGES` permissions.
   - On day 5 or 6, recovery agents begin threatening to send morphed obscene images to family members and college professors extracted from the contact list.

### 1.2 RBI Digital Lending Guidelines (2022–2023)
The Reserve Bank of India (RBI) circular on Digital Lending (*RBI/2022-23/111 DOR.CRE.REC.66/21.07.001/2022-23*) establishes non-negotiable rules for legitimate digital lenders:
1. **Direct Account-to-Account Flow**: Loan disbursement and repayment must execute directly between the borrower's bank account and the Regulated Entity (RE/NBFC/Bank) without any third-party pass-through or pool account.
2. **Key Fact Statement (KFS)**: Lenders MUST provide a standardized KFS to the borrower before loan execution, explicitly stating the **Annual Percentage Rate (APR)**, total cost of loan, fee breakdown, and recovery mechanism.
3. **No Unbridled Mobile Permissions**: Lending apps cannot access mobile phone resources such as contacts list, call logs, camera, or media files (only one-time camera access for KYC with explicit consent is permitted).
4. **Cooling-off / Look-up Period**: Borrowers must be given a cooling-off period to exit the loan without penalty by paying the principal and proportionate APR.
5. **Registered NBFC Association**: Digital Lending Apps (DLAs) and Lending Service Providers (LSPs) must be publicly listed on the website of the partnering RBI-regulated NBFC/Bank.

### 1.3 High-Yield Investment & Ponzi Traps
Predatory high-yield investment programs (HYIPs) targeting students commonly promise high or daily returns (e.g., 2% to 5% daily, 100% monthly) disguised as AI crypto trading bots, algorithmic forex pools, or task-based VIP investment tiers.
- **Legal Framework (BUDS Act, 2019)**: The Banning of Unregulated Deposit Schemes Act, 2019 prohibits unregulated deposit-taking entities from soliciting or accepting public deposits without regulatory registration. The BUDS Act establishes statutory illegality for unregistered deposit-taking activities, but does not define numeric interest rate caps or percentage thresholds.
- **Scamfy Product Risk Heuristics (24% and 50%)**: Scamfy applies internal empirical heuristics (24% p.a. as an unregulated scheme anomaly threshold and 50% p.a. as an extreme yield risk threshold) based on prevailing capital market returns. These thresholds are entirely product-level risk signals rather than statutory limits, designed to prompt users to verify regulatory registration and disclosures under the BUDS Act framework.

---

## 2. Mathematical Modeling & Formulas

Scamfy's calculator implements pure, deterministic, auditable financial formulas (`LOAN-01`, `LOAN-02`):

### 2.1 Loan Metrics
- **Stated Principal ($P$)**: Face value of loan.
- **Upfront Deductions ($D$)**: Processing fees, platform charges, insurance, service tax deducted before disbursement.
- **Net Disbursed Amount ($N$)**:
  $$N = P - D$$
- **Total Repayment Amount ($R$)**: Stated principal + interest + mandatory repayment fees.
- **Tenure in Days ($T$)**: Duration until full repayment is due.
- **Total Borrowing Cost ($C$)**:
  $$C = R - N$$
- **Effective Flat Rate for Tenure**:
  $$\text{Rate}_{\text{period}} = \frac{R - N}{N} \times 100$$
- **Simple Annualized Borrowing Cost Rate (Estimated Simple APR)**:
  $$\text{APR}_{\text{simple}} = \left(\frac{R - N}{N}\right) \times \left(\frac{365}{T}\right) \times 100$$
- **Compounded Effective Annual Rate (EAR)**:
  $$\text{EAR} = \left[\left(1 + \frac{R - N}{N}\right)^{\frac{365}{T}} - 1\right] \times 100$$
  *(Capped at $10^{12}$ to guard against numeric overflow).*
- **Scamfy Product Risk Heuristics**:
  - Implied simple APR $\ge 36\%$ p.a. flags **High-Cost Credit**.
  - Implied simple APR $\ge 100\%$ p.a. or short tenure ($\le 15$ days) with heavy deductions ($\ge 15\%$) flags **Predatory Lending Trap**.
  - *Note*: Single-repayment borrowing cost formulas estimate simple APR; installment-based amortized loans produce different effective APRs.

### 2.2 Investment Yield Metrics
- **Promised Return ($R_p$)**: e.g., 3% daily, 20% weekly, 200% yearly.
- **Annualized Return ($\text{APY}$)**:
  - Daily rate $r_d$: $\text{APY}_{\text{simple}} = r_d \times 365$
  - Compounded daily: $\text{APY}_{\text{comp}} = (1 + r_d)^{365} - 1$
- **Benchmark Comparisons**:
  - RBI Policy Repo Rate: 5.50% p.a. (effective Oct 7, 2026 monetary policy decision; Reserve Bank of India).
  - Commercial Bank 1-Year Fixed Deposit: ~7.0% p.a.
  - Nifty 50 Index Historical 10-Year Rolling CAGR: ~12.5% p.a. (historical equity market benchmark; not guaranteed or directly equivalent to fixed-income rates).
  - Mutual Fund Equity Top Tier: ~15.0% p.a.
  - Promised Yield $\ge 24.0\%$ p.a.: **Unregulated Yield Anomaly Warning** (Scamfy product heuristic).
  - Promised Yield $\ge 50.0\%$ p.a. or Daily Payouts ($>0.1\%$/day): **Extreme Yield Risk (Ponzi / HYIP Indicator)**.

---

## 3. Regulatory Verification Checklist (`LOAN-03`)

Legitimate vs. Predatory Lending Indicators backed by authoritative RBI regulations and market standards:

| Indicator | Regulated NBFC / Bank Practice | High-Risk / Predatory Indicator |
| :--- | :--- | :--- |
| **Key Fact Statement (KFS)** | Delivered prior to agreement stating all-inclusive APR and fee breakdown | Absent or omitted from offer details |
| **Loan Tenure** | Standard multi-month or annual consumer credit amortizations | Ultra-short (6–7 days) repayment deadlines |
| **Upfront Fee Deduction** | Nominal processing fees (1%–3%) transparently disclosed | Heavy deductions (>20%–50%) shrinking disbursed credit |
| **App Permissions** | Minimal required permissions (camera KYC with consent only) | Demands broad access to contact list, SMS, and photo gallery |
| **Disbursement Account** | Directly from Regulated Entity's bank account | Routed via third-party personal UPI VPAs or unverified wallets |
| **Repayment Channel** | Official bank virtual account / designated payment gateway | Personal UPI VPAs (e.g. `agent123@upi`), WhatsApp QR codes |
| **Registry Verification** | Publicly listed on RBI's Registered NBFCs directory or partner list | Unlisted on RBI Sachet portal (`sachet.rbi.org.in`) |

---

## 4. Architecture & Technical Decision Record

1. **Deterministic Calculation Core (`lib/loan-calculator.ts` & `backend/app/core/financial.py`)**:
   - Pure, zero-dependency mathematical functions for estimated simple APR, upfront fee percentage, daily rate, and investment APY.
   - Enforces strict TypeScript and Python typing with comprehensive boundary testing (zero division guards, negative tenure checks, finite EAR caps).
2. **Evaluator Expansion (`backend/app/core/evaluator.py`)**:
   - Add deterministic detection rules:
     - `RULE-LOAN-7DAY-TENURE`: Detects 7-day/weekly loan traps with hyper-short turnaround (HIGH_RISK).
     - `RULE-LOAN-UPFRONT-DEDUCTION`: Detects heavy upfront processing/service fee deductions (HIGH_RISK).
     - `RULE-LOAN-CONTACT-HARVEST-BLACKMAIL`: Detects threats of contacting friends/family or leaking phonebook (CRITICAL).
     - `RULE-LOAN-ADVANCE-FEE-APPROVAL`: Detects demands for upfront file charge, security deposit, or insurance before sanctioning loan (CRITICAL).
     - `RULE-YIELD-GUARANTEED-DAILY-RETURN`: Detects guaranteed high daily/weekly returns or crypto doubling lures (HIGH_RISK).
3. **Interactive UI (`components/domain/loan-trap-analyzer.tsx` & `/loan-analyzer` route)**:
   - Tabbed interface supporting:
     - **Tab 1: Instant Loan Cost & APR Dissector**: Interactive sliders for loan amount, deduction, repayment, and tenure with live APR badge, breakdown cards, and heuristic alert thresholds.
     - **Tab 2: High-Yield / Ponzi Reality Checker**: Investment return calculator highlighting annual equivalents and comparing against official benchmarks (RBI Repo, Mutual Funds).
     - **Tab 3: RBI NBFC & Sachet Verification Checklist**: Step-by-step guidance to verify loan app validity on RBI Sachet portal (`sachet.rbi.org.in`) and verify KFS compliance.
