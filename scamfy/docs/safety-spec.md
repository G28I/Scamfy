# Scamfy — Safety Boundaries & Legal Posture Specification

## 1. Executive Safety Principles

Scamfy is an automated fraud-prevention, risk-explanation, and evidence-organization platform focused on protecting students and young adults from financial cyber fraud and predatory schemes.

> **Core Platform Mantra:**
> *Before money moves, help the user understand the risk. After money moves, help the user act quickly, preserve evidence, and reach the correct official channel.*

---

## 2. Invariant Product & Legal Trust Boundaries

Scamfy operates under four strictly defined trust layers:

```mermaid
graph TD
    Layer1["1. User Submission (Untrusted Signal)"] --> Layer2["2. Deterministic Rule & Indicator Matching (High Precision)"]
    Layer2 --> Layer3["3. AI Contextual Analysis - NVIDIA Nemotron (Advisory Synthesis)"]
    Layer3 --> Layer4["4. Official Regulatory & Authority Records (Authoritative Ground Truth)"]
```

### Trust Boundary Definitions
1. **User Submissions & Community Reports**:
   - Treated strictly as unverified indicators, hypotheses, and user-provided evidence.
   - User submissions are **never** treated as proven factual claims or criminal convictions against named entities or phone numbers.
2. **Deterministic Rules & Signatures**:
   - Programmatic rules (e.g. UPI PIN requested to receive funds, upfront fee for data-entry job, APK download links) execute independently of AI inference.
3. **AI Inference (NVIDIA Nemotron via NIM)**:
   - Evaluates linguistic manipulation, contextual deception, and high-risk anomalies.
   - **Advisory Invariant**: AI output is purely advisory guidance and decision-support. AI output is never represented as legal advice or law enforcement findings.
4. **Official Channels & Regulatory Registries**:
   - Official routing (e.g., Indian Cyber Crime Helpline 1930 / `cybercrime.gov.in`, RBI regulated entity lists) is the sole source of official authority.

---

## 3. Explicit Non-Goals & Out-of-Scope Constraints (OOS Invariants)

Scamfy strictly enforces the following non-goals across product interfaces and backend logic:

- **OOS-01 — No Direct Banking or UPI Control**: Scamfy shall never request credentials, API tokens, or direct write/debit access to user bank accounts, credit cards, or UPI apps.
- **OOS-02 — No Recovery Guarantees**: Scamfy shall never promise, advertise, or imply guaranteed recovery or refund of stolen funds.
- **OOS-03 — No Automated Legal Judgments**: Scamfy does not decide legal guilt, innocence, or statutory liability.
- **OOS-04 — No Public Doxxing or Vigilantism**: Scamfy shall never publish unverified private personal data, defamatory feeds, or public blacklists of individual private citizens.
- **OOS-05 — No Fabricated Government APIs**: Scamfy will not spoof or fabricate automated complaint submission APIs where official machine-to-machine integrations do not exist; it uses guided copy-paste workflows and deep links.
- **OOS-06 — No Social Networking Feeds**: Scamfy is a focused security utility; social vanity metrics (likes, follows, public chat rooms) are excluded.

---

## 4. Mandatory Legal & Advisory Disclaimers

### Universal Banner Copy
Every scan result, report export, and case summary must include the standard disclaimer:

> **Notice:** *Scamfy provides automated risk analysis and educational guidance based on detected patterns. It does not provide legal advice, financial advice, or official criminal determinations. If you have transferred money in an active scam, immediately dial **1930** or report to **cybercrime.gov.in**.*

### Emergency Golden-Hour Rule (1930 Priority)
When the user indicates that a financial transfer has occurred within the past 24 hours:
1. Normal UI is superseded by the **Emergency Action Banner**.
2. Direct action instructions are displayed immediately:
   - **Call 1930** immediately to alert beneficiary banks.
   - Lodge an official complaint on **cybercrime.gov.in** with transaction UTR/RRN numbers.
   - Inform the issuing bank's fraud desk to freeze the associated account/card.
3. The platform transitions into **Evidence Preservation Mode** to collect screenshots, receipts, and timestamps.
