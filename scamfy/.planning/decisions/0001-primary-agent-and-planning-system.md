# ADR-0001: Primary Agent and Planning System

- **Status**: Accepted
- **Date**: 2026-09-23
- **Deciders**: Scamfy Architecture Team

## Context
Scamfy requires rigorous, auditable development with high test coverage, verifiable phases, and clean architectural separation. We need a consistent agentic workflow and planning methodology.

## Decision
1. **Coding Environment**: Google Antigravity is the primary AI development environment.
2. **Planning & Lifecycle System**: GSD (Get Stuff Done) Core is adopted as the canonical planning framework.
3. **Exclusion**: The "Ralph Loop" is deliberately excluded. Autonomous coding loops must operate strictly within GSD Core phase boundaries.

## Consequences
- All project phases, plans, execution records, and verifications will be tracked in `.planning/`.
- Every phase requires an explicit plan, implementation checklist, and verification evidence before milestone completion.
