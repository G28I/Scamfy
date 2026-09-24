# Scamfy Planning Foundation

This folder is the pre-implementation planning record for Scamfy. It is intentionally separate from application code so the project's reasoning can be reviewed by a new developer, recruiter, mentor, or interviewer without reading the source first.

## Documents

- `PROJECT-DEFINITION.md` — problem, users, vision, boundaries, success measures, and product principles.
- `PRD.md` — product requirements, user journeys, MVP scope, safety behavior, and acceptance-level expectations.
- `REQUIREMENTS.md` — traceable requirement IDs that GSD can use as the acceptance baseline.
- `ARCHITECTURE-PRINCIPLES.md` — technology and system-design principles, including the AI, risk, reporting, privacy, and evidence architecture.

## How this connects to GSD Core

These files are the planning foundation. Once reviewed, use the PRD as the seed document for GSD Core's project initialization so GSD can create the canonical `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, and research artifacts.

Recommended Antigravity command after the foundation is reviewed:

```text
/gsd-new-project --auto @planning/foundation/GSD-SEED.md
```

The generated `.planning/` directory becomes the living execution record. Keep this foundation folder committed as the human-readable design history rather than replacing it with generated planning artifacts.

## Important rule

No application code should be written from this foundation alone. GSD must turn the approved requirements into phases and plans, and each phase must be implemented and verified before it is considered complete.
