# Scamfy — Project Specification & Context

## Executive Summary

**Scamfy** is a student-first fraud-prevention and victim-support platform. It helps users assess suspicious job offers, investment claims, loan offers, payment requests, and money-transfer requests before they act; explains concrete risk signals; and, when an incident has already occurred, helps preserve evidence and reach the appropriate official reporting channel.

> **Core Value Proposition:**
> *Before money moves, help the user understand the risk. After money moves, help the user act quickly, preserve evidence, and reach the correct official channel.*

Scamfy is **not** a police department, bank, regulatory authority, court of law, legal service, or guaranteed money-recovery service. It does **not** make legal determinations of guilt or innocence.

---

## Target Users & Stakeholders

1. **Students**: Individuals encountering part-time job/internship offers, task scams, fake investments, predatory digital loans, money-mule requests, and payment fraud across messaging platforms and social media.
2. **Victims / Affected Account Holders**: People who have lost money, received tainted funds, or had bank/UPI accounts frozen and need rapid structured guidance, timeline organization, and official routing.
3. **Colleges & Student Organizations**: Institutions seeking privacy-safe aggregate intelligence on scam patterns circulating among their student population.
4. **Moderators & Administrators**: Authorized operators reviewing community reports, verifying pattern indicators, handling abuse, and curating official reporting directories.

---

## Architecture & System Boundary

Scamfy is engineered as a **modular monolith** with clean trust boundaries:

- **Frontend**: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend (Trust Boundary)**: Python + FastAPI, Pydantic v2 schemas.
- **Persistence**: PostgreSQL via SQLAlchemy ORM.
- **Private Evidence Vault**: Cloudflare R2 / S3-compatible signed URLs (metadata and access controls in PostgreSQL).
- **Authentication**: Clerk.
- **AI Inference**: NVIDIA API / NIM hosting NVIDIA Nemotron models.
- **Testing**: Pytest (backend/unit/contract) + Playwright (end-to-end browser flows).
- **Deployment**: Vercel (Frontend), Railway / Render (FastAPI Backend & DB).

### Layered Analysis Pipeline
1. **Input Normalization**: Strips evasive unicode, formatting tricks, obfuscations.
2. **Entity Extraction**: Regex and deterministic parsers extract URLs, phone numbers, UPI IDs, bank details, telegram handles, monetary values.
3. **Deterministic Rule Engine**: High-confidence red flags (upfront fee for job, guaranteed astronomical returns, OTP/PIN requests, APK downloads).
4. **Scam Pattern & Intelligence Match**: Matches extracted indicators against vetted community database.
5. **NVIDIA Nemotron Analysis**: Contextual, linguistic, and nuanced threat evaluation returning structured JSON.
6. **Risk Aggregation & Action Matrix**: Synthesizes rule outputs and model analysis into clear, explainable findings and immediate concrete actions.

---

## Core Principles & Constraints

1. **AI is Advisory, Not Authoritative**: The model explains, summarizes, and classifies. Deterministic rules run independently. Risk scores retain supporting evidence and provenance.
2. **Explain the Warning**: No opaque risk scores. Every risk label must expose concrete red flags and plain-language reasoning.
3. **Official-Source First**: Reporting guidance follows authoritative mechanisms (e.g. Indian Cyber Crime 1930 / cybercrime.gov.in). Never invent fake APIs or claim filings Scamfy didn't perform.
4. **Evidence Over Accusation**: Community reports track technical indicators (handles, URLs, phone numbers, scripts) without enabling public doxxing or vigilantism.
5. **Data Minimization & Privacy**: Anonymous basic checks without forced login. Sensitive case evidence encrypted and role-protected.
6. **No Ralph Loop / No Groq**: Coding environment strictly Antigravity with GSD Core methodology; AI provider is NVIDIA NIM / Nemotron.

---

## Scope & Phasing Overview

The roadmap spans 13 structured phases:
- **Phases 1–4 (Foundation)**: Safety boundaries & threat model, project structure & GSD workflow, core data model & migrations, design system & accessibility tokens.
- **Phases 5–6 (Slice 1 - Core Scam Check)**: Input & analysis slice, deterministic risk engine + Nemotron integration.
- **Phases 7–8 (Slice 2 - Community Intel & Mule Protection)**: Pattern database & community reporting, money-mule detection & transfer risk warnings.
- **Phases 9–10 (Slice 3 - Financial Traps & Official Gateway)**: Loan & high-return trap analyzer, official reporting gateway with 1930 emergency flow.
- **Phase 11 (Slice 4 - Victim Support)**: Victim Case Center & evidence timeline.
- **Phase 12 (Hardening)**: Security, privacy, moderation, and production hardening.
- **Phase 13 (Pilot & Release)**: Pilot evaluation, benchmark metrics, analytics, and deployment.
