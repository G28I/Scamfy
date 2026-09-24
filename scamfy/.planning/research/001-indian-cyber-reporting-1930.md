# Domain Research 001: Indian Cyber Crime Reporting System & 1930 Protocol

- **Topic**: Official Cyber-Financial Fraud Reporting Routes in India
- **Date**: 2026-09-23
- **Sources**: I4C (Indian Cyber Crime Coordination Centre), MHA (Ministry of Home Affairs), cybercrime.gov.in

## Executive Summary
For cyber-enabled financial fraud in India, time is the critical factor. The Indian government operates the Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS), accessible via helpline **1930** and the National Cyber Crime Reporting Portal (**cybercrime.gov.in**).

## Golden Hours & Process
1. **Immediate Call (1930)**: Within the first 2–4 hours ("Golden Hour"), calling 1930 triggers automated alerts across victim bank, intermediary payment gateways, and beneficiary banks to freeze stolen funds in transit.
2. **Online Portal Filing**: A structured complaint must be formally lodged on `cybercrime.gov.in` within 24 hours to generate an official acknowledgment number.
3. **Required Information for Filing**:
   - Victim Bank Account & UPI Details
   - Suspect Account / UPI ID / Phone / Wallet ID
   - Transaction Reference Number (UTR / RRN)
   - Date & Time of Transaction
   - Screenshots of Payment & Chat History

## Scamfy Integration Strategy
- Surface **1930 Dial Action** as top priority when financial loss has just occurred.
- Provide a guided complaint generator that formats transaction IDs, suspect handles, and timeline into copy-pasteable fields for `cybercrime.gov.in`.
- Store the official Cyber Crime Acknowledgment / Complaint Number in the user's Case Center for tracking.
