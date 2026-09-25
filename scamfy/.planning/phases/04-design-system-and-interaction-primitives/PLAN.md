# Phase 4: Design System & Interaction Primitives — Plan

- **Phase**: 04
- **Milestone**: Milestone 0 (Foundation)
- **Status**: Complete ✅
- **Goal**: Implement Scamfy's complete frontend design system, semantic design tokens (dark/light mode, risk levels, status indicators), accessible core UI primitives, and domain-specific interaction components with full keyboard navigability and WCAG 2.1 AA compliance.
- **Requirements Covered**: `UX-03`, `UX-04`, `UX-05` (Foundational support for `UX-01`, `UX-02`, `DET-04`, `MULE-02`, `CASE-02`)
- **Required Skill Workflow**:
  1. **Stage A**: `ui-ux-pro-max` (Design intelligence, token taxonomy, typography, spacing, risk visual language)
  2. **Stage B**: `frontend-design` (Charley-baba/antigravity-skills) + `shadcn` (accessible primitives)
  3. **Stage C**: `web-design-guidelines` (Comprehensive post-implementation audit)
  4. **Stage D**: Audit remediation & bug fixing
  5. **Stage E**: 6-gate canonical verification & test suite execution
- **Scope Fences**: Zero backend business logic, zero database mutations, zero Nemotron NIM inference, zero R2 storage uploads, zero 1930 reporting gateway integrations. All components are reusable, typed presentation/interaction primitives.

---

## Detailed Task Breakdown

### Task 1: Design Tokens, CSS Variables & Tailwind v4 Theme Foundation (Stage A)
- **Skill Usage**: `ui-ux-pro-max`
- **Action**:
  - Install required UI component libraries and testing packages in `package.json`:
    - Dependencies: `lucide-react`, `class-variance-authority`, `@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `@radix-ui/react-accordion`, `@radix-ui/react-tooltip`, `@radix-ui/react-slot`.
    - DevDependencies: `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `jsdom`.
  - Configure `app/globals.css` with Tailwind CSS v4 `@theme` block and CSS custom properties:
    - Surfaces: background, foreground, card, popover, border, input, ring.
    - Dark & light mode variables with high contrast (>= 4.5:1 text).
    - 5 Risk Tiers: `SAFE` (Emerald), `CAUTION` (Amber), `SUSPICIOUS` (Orange), `HIGH_RISK` (Rose), `CRITICAL` (Crimson / 1930 Alert) with background, border, text, and glow variables.
    - Typography pairings: UI Sans + Monospace for indicators.
    - Keyframe animations with `@media (prefers-reduced-motion: reduce)` fallbacks.
  - Create `lib/utils.ts` with type-safe `cn()` helper.
- **Verification**: `npm run build` and `npm run typecheck` validate Tailwind v4 theme integration.

### Task 2: Core Accessible UI Primitives (`components/ui/`) (Stage B)
- **Skill Usage**: `frontend-design` (Charley-baba) + `shadcn`
- **Action**:
  - Implement 12 core accessible primitives in `components/ui/`:
    1. `button.tsx`: Multi-variant (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `emergency`), loading spinner, keyboard focus rings (`UX-03`, `UX-04`).
    2. `input.tsx`: Text input with `error`, `helperText`, `aria-invalid`, `aria-describedby`.
    3. `textarea.tsx`: Multi-line text input with character counter support and accessible error binding.
    4. `card.tsx`: Composable `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` with `interactive` and `glass` variants.
    5. `badge.tsx`: Multi-variant status badge with semantic color mappings.
    6. `dialog.tsx`: Accessible modal dialog using `@radix-ui/react-dialog` with focus trap, backdrop blur, and Escape key dismissal (`UX-03`).
    7. `alert.tsx`: Banner alert with informational, warning, destructive, and emergency styling (`role="alert"` / `role="status"`).
    8. `tabs.tsx`: Accessible tab panels using `@radix-ui/react-tabs` with keyboard arrow navigation.
    9. `accordion.tsx`: Collapsible accordion using `@radix-ui/react-accordion`.
    10. `tooltip.tsx`: Keyboard and hover accessible tooltips using `@radix-ui/react-tooltip`.
    11. `skeleton.tsx` & `loading-spinner.tsx`: Shimmer loading states respecting reduced-motion (`UX-05`).
    12. `empty-state.tsx`: Standardized empty view with icon, title, description, and action button (`UX-05`).
- **Verification**: `npm run typecheck` and `npm run lint` pass cleanly with zero errors.

### Task 3: Scamfy Domain Interaction Primitives (`components/domain/`) (Stage B)
- **Skill Usage**: `frontend-design` (Charley-baba)
- **Action**:
  - Implement 7 domain-specific interaction components in `components/domain/`:
    1. `risk-badge.tsx`: Renders all 5 risk tiers (`SAFE`, `CAUTION`, `SUSPICIOUS`, `HIGH_RISK`, `CRITICAL`) with distinct icons (`ShieldCheck`, `Info`, `AlertTriangle`, `AlertOctagon`, `AlertCircle`), text labels, and color-blind safe styling.
    2. `urgency-banner.tsx`: Presentation alert for emergency cyber fraud guidance with 1930 helpline hotline CTA (`tel:1930`) driven by props (`UX-02`). No backend reporting integrations.
    3. `indicator-tag.tsx`: Displays indicators (`UPI_ID`, `PHONE`, `DOMAIN`, `HANDLE`, `BANK_ACC`, `SCRIPT`) with monospace styling, 1-click clipboard copy, and `aria-live` screen reader feedback.
    4. `confidence-meter.tsx`: Calibrated meter for *Analysis Confidence* / *Signal Confidence*. Strictly separated from risk severity and does not assert legal certainty.
    5. `timeline-item.tsx`: Chronological victim incident timeline card with counterparty, amount, and timestamp formatting (`CASE-02`).
    6. `evidence-dropzone.tsx`: Drag-and-drop file upload zone with client-side format/size validation UI states. No R2 storage or backend writes.
    7. `state-feedback.tsx`: Unified component for `loading`, `empty`, `error` (with retry action), and `partial` states fulfilling `UX-05`.
- **Verification**: `npm run typecheck` confirms strict TypeScript typing across all domain components.

### Task 4: Interactive Showcase Page & Automated Behavior Tests
- **Action**:
  - Build interactive showcase page at `app/design-system/page.tsx`:
    - Demonstrates all tokens, typography, spacing, and buttons.
    - Demonstrates all 12 core UI primitives and 7 domain components.
    - Demonstrates all 5 risk tiers with distinct icons, shapes, and colors.
    - Demonstrates dark/light mode toggle and responsive viewport layouts.
  - Author automated component & behavior tests in `components/__tests__/`:
    - `button.test.tsx`: Click handling, loading state, disabled state, focus ring.
    - `dialog.test.tsx`: Focus trapping, Escape key closing, open/close events (`UX-03`).
    - `tabs.test.tsx`: Arrow key navigation between tab triggers (`UX-03`).
    - `risk-badge.test.tsx`: Renders all 5 risk levels with distinct iconography and labels (`UX-04`).
    - `indicator-tag.test.tsx`: Clipboard copy action and visual/ARIA live confirmation.
    - `confidence-meter.test.tsx`: Analysis confidence levels rendering.
    - `evidence-dropzone.test.tsx`: Drag events and validation error state rendering.
    - `state-feedback.test.tsx`: Loading skeleton, empty state, and retry callback execution (`UX-05`).
- **Verification**: `npm run test:run` passes all component tests.

### Task 5: Web Design Guidelines Audit & Remediation (Stage C & D)
- **Skill Usage**: `web-design-guidelines`
- **Action**:
  - Perform structured audit against Web Interface Guidelines:
    - WCAG AA contrast ratio validation on all text and border tokens.
    - Full keyboard navigation pass on Dialogs, Tabs, Accordions, Dropzones, and Buttons.
    - Focus visible rings and screen-reader accessibility announcements.
    - Touch target sizing (>= 44x44px) and responsive layout integrity.
    - Reduced motion verification for spinners, pulses, and dialog animations.
  - Fix any findings or discrepancies identified during the audit.
- **Verification**: All audit checklist items pass without regressions.

---

## Canonical Verification Gates (Definition of Done)

| Gate | Verification Command | Passing Criteria |
| :--- | :--- | :--- |
| **Gate 1: Frontend Type Safety** | `npm run typecheck` | Zero TypeScript compiler errors (`tsc --noEmit`) across all UI and domain components. |
| **Gate 2: Frontend Linting** | `npm run lint` | Zero ESLint warnings or errors (`eslint .`). |
| **Gate 3: Frontend Unit & Component Tests** | `npm run test:run` | All Vitest component, accessibility, and integration tests pass cleanly. |
| **Gate 4: Frontend Production Build** | `npm run build` | Next.js production build (`next build`) compiles cleanly including `/design-system`. |
| **Gate 5: Backend Lint & Format** | `ruff check backend/`<br>`ruff format --check backend/` | Stateless FastAPI backend remains compliant with Ruff lint and formatting. |
| **Gate 6: Backend Pytest Suite** | `pytest backend/tests` | FastAPI test suite passes cleanly. |
| **Canonical Local Suite** | `scripts/verify.ps1` (Win)<br>`scripts/verify.sh` (POSIX) | Full 6-gate pipeline passes in a single command. |
| **Web Design Guidelines Audit** | Visual & Accessibility Review | Passed audit across keyboard, contrast, focus, ARIA, and touch targets. |
| **Showcase Page Integrity** | `/design-system` | Renders all design tokens, UI primitives, domain components, and risk tiers. |
| **Scope Fence Integrity** | Codebase Inspection | Zero backend business logic, zero database mutations, zero AI calls added in Phase 4. |
