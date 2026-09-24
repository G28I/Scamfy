# ADR-0002: Technology Stack and Modular Monolith Architecture

- **Status**: Accepted
- **Date**: 2026-09-23
- **Deciders**: Scamfy Architecture Team

## Context
Scamfy needs high velocity, strict type safety, explainable validation, responsive modern UI, and robust backend data isolation. Microservices introduce premature operational complexity.

## Decision
1. **Architecture**: Modular monolith with FastAPI as the trusted backend boundary.
2. **Frontend**: Next.js App Router with TypeScript, Tailwind CSS, and shadcn/ui.
3. **Backend**: Python with FastAPI, Pydantic v2 validation schemas, SQLAlchemy ORM.
4. **Database**: PostgreSQL for persistent structured data.
5. **Private Storage**: Cloudflare R2 / S3-compatible bucket for evidence files via pre-signed URLs.
6. **Authentication**: Clerk for identity management.
7. **Testing**: Pytest for backend unit/contract tests; Playwright for browser E2E tests.

## Consequences
- Fast developer iteration without cross-service latency.
- Clear separation between public client-side UI and trusted server-side AI/storage operations.
