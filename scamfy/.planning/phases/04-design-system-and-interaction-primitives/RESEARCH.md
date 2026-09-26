# Phase 4: Design System & Interaction Primitives — Research

- **Phase**: 04
- **Milestone**: Milestone 0 (Foundation)
- **Status**: Complete ✅

---

## 1. Antigravity Design Skills & Pipeline Architecture

Scamfy leverages four installed skills in a strict four-stage sequential pipeline:

```
[Stage A: ui-ux-pro-max] 
        ↓ (Design decisions, typography, risk tokens, layout hierarchy)
[Stage B: frontend-design (Charley-baba) + shadcn Primitives] 
        ↓ (Component implementation, visual polish, distinctive styling)
[Stage C: web-design-guidelines Audit] 
        ↓ (Automated & manual accessibility/UX compliance evaluation)
[Stage D: Remediation & Verification]
```

### Stage Responsibilities:
1. **`ui-ux-pro-max` (Design Intelligence)**:
   - Evaluates Scamfy's domain persona: high-stress victim support, student financial safety, cyber-fraud education.
   - Formulates typography pairing (e.g., Plus Jakarta Sans / Inter display paired with JetBrains Mono / Geist Mono for technical hashes and UPI IDs).
   - Establishes strict 8px/4px spacing scale, elevation surfaces, and calm security palette.
2. **`frontend-design` (Charley-baba/antigravity-skills)**:
   - Crafts authentic, memorable Next.js 16 / React 19 component implementations.
   - Implements glassmorphism, responsive CSS grid layouts, smooth micro-interactions, and visual polish without generic AI aesthetics.
3. **`shadcn` (Accessible Primitives)**:
   - Provides battle-tested, unstyled Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `@radix-ui/react-accordion`, `@radix-ui/react-tooltip`, `@radix-ui/react-slot`) ensuring bulletproof focus trapping, keyboard handling, and ARIA roles.
4. **`web-design-guidelines` (Review & Audit Gate)**:
   - Post-implementation auditing tool used to verify WCAG 2.1 AA contrast, touch target sizes (>= 44x44px), focus rings, semantic tags, and screen reader announcements before finalizing Phase 4.

---

## 2. Design Tokens & Visual Language

### A. Semantic Color Palette (`app/globals.css`)
Tailwind CSS v4 CSS-first `@theme` variables:

```css
:root {
  /* Surfaces */
  --background: #f8fafc;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --border: #e2e8f0;
  --input: #94a3b8;
  --ring: #2563eb;

  /* Primary / Accents */
  --primary: #0f172a;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --accent: #f1f5f9;
  --accent-foreground: #0f172a;

  /* Risk Tiers (Light Mode: >= 4.5:1 text contrast) */
  --risk-safe-bg: #ecfdf5;
  --risk-safe-border: #a7f3d0;
  --risk-safe-text: #065f46;
  --risk-safe-glow: rgba(16, 185, 129, 0.15);

  --risk-caution-bg: #fffbeb;
  --risk-caution-border: #fde68a;
  --risk-caution-text: #92400e;
  --risk-caution-glow: rgba(245, 158, 11, 0.15);

  --risk-suspicious-bg: #fff7ed;
  --risk-suspicious-border: #fed7aa;
  --risk-suspicious-text: #9a3412;
  --risk-suspicious-glow: rgba(249, 115, 22, 0.15);

  --risk-high-bg: #fff1f2;
  --risk-high-border: #fecdd3;
  --risk-high-text: #9f1239;
  --risk-high-glow: rgba(225, 29, 72, 0.15);

  --risk-critical-bg: #450a0a;
  --risk-critical-border: #dc2626;
  --risk-critical-text: #fef2f2;
  --risk-critical-glow: rgba(220, 38, 38, 0.3);
}

.dark {
  /* Surfaces */
  --background: #080c14;
  --foreground: #f8fafc;
  --card: #0f172a;
  --card-foreground: #f8fafc;
  --popover: #0f172a;
  --popover-foreground: #f8fafc;
  --border: #1e293b;
  --input: #475569;
  --ring: #3b82f6;

  /* Primary / Accents */
  --primary: #f8fafc;
  --primary-foreground: #0f172a;
  --secondary: #1e293b;
  --secondary-foreground: #f8fafc;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --accent: #1e293b;
  --accent-foreground: #f8fafc;

  /* Risk Tiers (Dark Mode: luminous accents with deep containers) */
  --risk-safe-bg: #06241b;
  --risk-safe-border: #065f46;
  --risk-safe-text: #34d399;
  --risk-safe-glow: rgba(16, 185, 129, 0.2);

  --risk-caution-bg: #291804;
  --risk-caution-border: #78350f;
  --risk-caution-text: #fbbf24;
  --risk-caution-glow: rgba(245, 158, 11, 0.2);

  --risk-suspicious-bg: #2d1306;
  --risk-suspicious-border: #7c2d12;
  --risk-suspicious-text: #fb923c;
  --risk-suspicious-glow: rgba(249, 115, 22, 0.2);

  --risk-high-bg: #2e0813;
  --risk-high-border: #881337;
  --risk-high-text: #fb7185;
  --risk-high-glow: rgba(225, 29, 72, 0.25);

  --risk-critical-bg: #450a0a;
  --risk-critical-border: #ef4444;
  --risk-critical-text: #fee2e2;
  --risk-critical-glow: rgba(239, 68, 68, 0.4);
}
```

### B. Accessibility & Color-Blind Safety
- Every risk state incorporates a mandatory **text label** + **distinct icon** + **visual badge shape**.
- No status or severity is conveyed solely through hue.
- All text and border colors meet WCAG 2.1 AA minimum contrast standards (4.5:1 for body copy; 3:1 for UI borders/large text).

---

## 3. Detailed Component Contracts & APIs

### A. Core UI Primitives (`components/ui/`)

1. **`Button`** (`components/ui/button.tsx`):
   - Props: `variant` (`"default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "emergency"`), `size` (`"sm" | "default" | "lg" | "icon"`), `isLoading?: boolean`, `leftIcon?: ReactNode`, `rightIcon?: ReactNode`, standard HTML button props.
   - Accessibility: Visible high-contrast focus ring (`focus-visible:ring-2 focus-visible:ring-offset-2`), `aria-busy` and disabled when `isLoading` is true.
2. **`Input` & `Textarea`** (`components/ui/input.tsx`, `components/ui/textarea.tsx`):
   - Props: Standard HTML props with `error?: string`, `helperText?: string`.
   - Accessibility: Associates error text via `aria-describedby` and sets `aria-invalid={true}` when `error` is present.
3. **`Card`** (`components/ui/card.tsx`):
   - Composable: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
   - Variants: `default`, `interactive` (subtle hover lift and border highlight), `glass` (subtle backdrop blur), `elevated`.
4. **`Badge`** (`components/ui/badge.tsx`):
   - Props: `variant` (`"default" | "secondary" | "destructive" | "outline" | "success" | "warning"`), `size` (`"sm" | "default"`).
5. **`Dialog`** (`components/ui/dialog.tsx`):
   - Composed from `@radix-ui/react-dialog` (`Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`).
   - Accessible backdrop blur, Escape key dismissal, initial focus restoration, and focus trap.
6. **`Alert`** (`components/ui/alert.tsx`):
   - Props: `variant` (`"default" | "info" | "success" | "warning" | "destructive" | "emergency"`), `title?: string`, `icon?: ReactNode`.
   - Accessibility: Sets `role="alert"` (for warnings/errors) or `role="status"` (for info/success).
7. **`Tabs`** (`components/ui/tabs.tsx`):
   - Composed from `@radix-ui/react-tabs` (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`) with full arrow-key keyboard navigation.
8. **`Accordion`** (`components/ui/accordion.tsx`):
   - Composed from `@radix-ui/react-accordion` with animated collapsible panels and keyboard navigation.
9. **`Tooltip`** (`components/ui/tooltip.tsx`):
   - Composed from `@radix-ui/react-tooltip` with keyboard focus triggers and screen reader friendly descriptions.
10. **`Skeleton` & `LoadingSpinner`** (`components/ui/skeleton.tsx`, `components/ui/loading-spinner.tsx`):
    - Shimmer loading placeholders respecting `prefers-reduced-motion`.
11. **`EmptyState`** (`components/ui/empty-state.tsx`):
    - Props: `icon: LucideIcon`, `title: string`, `description: string`, `action?: { label: string; onClick: () => void }`.

### B. Scamfy Domain Interaction Primitives (`components/domain/`)

1. **`RiskBadge`** (`components/domain/risk-badge.tsx`):
   - Props: `level: "SAFE" | "CAUTION" | "SUSPICIOUS" | "HIGH_RISK" | "CRITICAL"`, `size?: "sm" | "md" | "lg"`, `showIcon?: boolean`, `pulse?: boolean`.
   - Icon Mapping: `SAFE` -> `ShieldCheck`, `CAUTION` -> `Info`, `SUSPICIOUS` -> `AlertTriangle`, `HIGH_RISK` -> `AlertOctagon`, `CRITICAL` -> `AlertCircle`.
   - Behavior: Pulse animation is subtle and disabled under `prefers-reduced-motion`.
2. **`UrgencyBanner`** (`components/domain/urgency-banner.tsx`):
   - Props: `title: string`, `description: string`, `show1930CallToAction?: boolean`, `helplineNumber?: string` (defaults to `"1930"`), `onActionClick?: () => void`, `actionLabel?: string`.
   - Strict Boundary: Presentation only. No live external API reporting or backend submission logic.
3. **`IndicatorTag`** (`components/domain/indicator-tag.tsx`):
   - Props: `type: "UPI_ID" | "PHONE" | "DOMAIN" | "HANDLE" | "BANK_ACC" | "SCRIPT"`, `value: string`, `copyable?: boolean`, `label?: string`.
   - Behavior: Monospace formatting (`font-mono`), truncation for long strings with full tooltip, 1-click clipboard copy with temporary visual checkmark and `aria-live="polite"` screen-reader announcement.
4. **`ConfidenceMeter`** (`components/domain/confidence-meter.tsx`):
   - Props: `level: "low" | "medium" | "high"`, `score?: number` (0 to 1), `label?: string` (default: `"Analysis Confidence"`), `signalCount?: number`.
   - Strict Semantics: Explicitly labeled as *Analysis Confidence* or *Signal Confidence*. Never represents legal truth or investigative authority.
5. **`TimelineItem`** (`components/domain/timeline-item.tsx`):
   - Props: `timestamp: Date | string`, `eventType: string`, `description: string`, `amount?: number | string`, `counterparty?: string`, `isFirst?: boolean`, `isLast?: boolean`.
   - Visual: Vertical connection line, event icon, formatted currency badge (INR), and counterparty badge.
6. **`EvidenceDropzone`** (`components/domain/evidence-dropzone.tsx`):
   - Props: `onFilesSelected?: (files: File[]) => void`, `acceptedFileTypes?: string[]`, `maxSizeBytes?: number`, `isUploading?: boolean`, `uploadProgress?: number`, `error?: string`, `disabled?: boolean`.
   - Strict Boundary: Pure UI presentation handling drag events, file picking, and client-side format/size validation alerts. No R2 storage or backend writes.
7. **`StateFeedback`** (`components/domain/state-feedback.tsx`):
   - Props: `state: "idle" | "loading" | "empty" | "error" | "partial"`, `loadingText?: string`, `emptyTitle?: string`, `emptyDescription?: string`, `errorMessage?: string`, `onRetry?: () => void`.
   - Fulfills `UX-05` by providing standardized state transitions with recovery actions.

---

## 3. Testing Strategy & Accessibility Auditing

### Automated Tests (Vitest + React Testing Library)
- Located in `components/__tests__/`:
  - `button.test.tsx`: Click handlers, loading spinner, disabled state, keyboard focus.
  - `dialog.test.tsx`: Open, close, Escape dismissal, focus trapping (`UX-03`).
  - `tabs.test.tsx`: Arrow key navigation between tabs, active panel switching (`UX-03`).
  - `risk-badge.test.tsx`: Renders all 5 risk tiers with distinct text and icons (`UX-04`).
  - `indicator-tag.test.tsx`: Clipboard copy interaction and ARIA live confirmation.
  - `confidence-meter.test.tsx`: Renders confidence tiers without misleading probability claims.
  - `evidence-dropzone.test.tsx`: File selection simulation, dragover state, format validation error.
  - `state-feedback.test.tsx`: Renders loading skeleton, empty state, and triggers retry on error (`UX-05`).

### Web Design Guidelines Audit Checklist (Stage C & D)
1. **Keyboard Accessibility**: All interactive elements reachable via `Tab`, triggerable via `Enter`/`Space`.
2. **Focus Indicators**: 2px high-contrast outline on all focused elements.
3. **Contrast Ratios**: Verified >= 4.5:1 on normal text, >= 3:1 on large text/icons in light and dark modes.
4. **Touch Targets**: All clickable targets >= 44x44px for touch/mobile devices.
5. **Reduced Motion**: All animations wrapped in `@media (prefers-reduced-motion: reduce)`.
6. **ARIA Semantics**: `role="alert"`, `aria-invalid`, `aria-describedby`, and `aria-live` implemented properly.
