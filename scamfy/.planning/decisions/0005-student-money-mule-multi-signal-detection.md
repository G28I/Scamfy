# ADR-0005: Contextual Multi-Signal Detection for Student Money-Mule Recruitment

- **Status**: Accepted
- **Date**: 2026-10-09
- **Deciders**: Scamfy Architecture & Security Team

## Context
Money-mule recruitment targeting students and young adults across India operates through distinct multi-step social engineering lures (fake scholarships, loan assistance / DSA impersonation, campus account rental, corporate proxy accounts, and blank instrument harvesting). A flat regex approach leads to either false alarms on benign financial messages (e.g. salary notifications, loan sanction letters) or missed compound lures where recruitment pretexts are separated across sentence boundaries.

## Decision
1. **Multi-Signal Contextual Model**:
   - Deconstruct money-mule detection into four correlated evidence dimensions:
     - `Opportunity Context`: Job, scholarship, loan assistance, DSA, corporate proxy role.
     - `Account / Instrument Request`: Personal account routing, account opening, account rental/procuring, blank cheques, ATM cards/PINs, passbooks, SIM cards, OTP forwarding, NetBanking credentials.
     - `Incentive / Deceptive Reassurance`: Commission percentages, daily rent, "only an intermediary", "harmless", "no risk".
     - `Fund Movement`: Receiving third-party funds and forwarding/transferring, USDT conversion, or refunding excess money.
2. **Contextual Evaluation & Severity Tiers**:
   - Compound Funnel (Context + Request + Incentive/Routing) → `CRITICAL` `MONEY_MULE_RECRUITMENT` risk.
   - High-Risk Partial Funnel (Loan pretext + Blank cheque / Debit card) → `CRITICAL` `RULE-MULE-LOAN-ASSISTANCE-PRETEXT`.
   - Standalone Dangerous Credential Harvesting (Blank cheques, ATM PINs, OTP forwarding, NetBanking login demands) → Immediate `CRITICAL` `RULE-MULE-BANKING-INSTRUMENT-CAPTURE`.
3. **Negative Control Verification**:
   - Explicit negative test fixtures for corporate payroll credits, business expense reimbursements, family remittances, genuine government scholarship disbursements, verified lender branch sanction letters, and standard internship offers.
4. **Non-Dogmatic Legal Framing**:
   - Triage guidance explains potential debit liens, investigative inquiry, and RBI/cybercrime freeze protocols without asserting criminal guilt or guaranteeing fund recovery.

## Consequences
- High precision and recall against real-world Indian student mule syndicates without false-positive regression on legitimate banking transactions.
- Traceable, auditable rule IDs explainable to users.
