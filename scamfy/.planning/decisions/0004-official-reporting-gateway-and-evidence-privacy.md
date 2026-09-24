# ADR-0004: Official Reporting Gateway and Strict Evidence Privacy

- **Status**: Accepted
- **Date**: 2026-09-23
- **Deciders**: Scamfy Architecture Team

## Context
Victims of fraud often face severe stress and need rapid, authoritative guidance. However, false reports, doxxing, and premature claims of "filing official complaints" can cause severe harm.

## Decision
1. **Source-Backed Official Routes**: Surface authoritative reporting paths (e.g. Indian National Cyber Crime Helpline 1930 and cybercrime.gov.in) with deep linking and guided submissions.
2. **No Fabricated APIs**: Scamfy will not pretend to have direct government API integrations unless an official, authorized machine-to-machine interface exists.
3. **Explicit User Authorization**: Consequential submissions or exports must be explicitly inspected and authorized by the user.
4. **Evidence Vault Privacy**: Victim evidence files are private by default, stored in object storage with short-lived pre-signed URLs. They are never exposed to public community searches.

## Consequences
- High victim trust and compliance with privacy regulations.
- Clear distinction between Scamfy's triage assistance and law enforcement action.
