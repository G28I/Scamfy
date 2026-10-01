---
name: Scamfy Design System
description: High-precision cyber fraud triage & open threat defense interface for India
colors:
  primary: "#0f172a"
  primary-dark: "#f8fafc"
  background: "#f8fafc"
  background-dark: "#080c14"
  card: "#ffffff"
  card-dark: "#0f172a"
  border: "#e2e8f0"
  border-dark: "#1e293b"
  muted: "#f1f5f9"
  muted-dark: "#1e293b"
  muted-foreground: "#64748b"
  muted-foreground-dark: "#94a3b8"
  ring: "#2563eb"
  ring-dark: "#3b82f6"
  risk-safe: "#065f46"
  risk-safe-dark: "#34d399"
  risk-caution: "#92400e"
  risk-caution-dark: "#fbbf24"
  risk-suspicious: "#9a3412"
  risk-suspicious-dark: "#fb923c"
  risk-high: "#9f1239"
  risk-high-dark: "#fb7185"
  risk-critical: "#dc2626"
  risk-critical-dark: "#ef4444"
typography:
  display:
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.25rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-destructive:
    backgroundColor: "{colors.risk-critical}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  badge-risk-critical:
    backgroundColor: "rgba(220, 38, 38, 0.15)"
    textColor: "{colors.risk-critical}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  card-container:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: Scamfy

## Overview

**Creative North Star: "The Tactical Cyber Defense Terminal"**

Scamfy is an authoritative, high-precision cybersecurity defense interface built for immediate fraud triage in India. The interface evokes the calm, decisive clarity of a command terminal: dark-mode-first aesthetic with deep obsidian surfaces (`#080c14`), tactical wireframe borders (`#1e293b`), crisp monospace telemetry accents, and luminous threat signals.

The system communicates urgent security information without panic or sensationalism. Visual hierarchy is instant and unambiguous: dangerous fraud indicators (UPI traps, money-mule demands, digital arrest extortion) ignite high-contrast red alerts, while verified defensive protocols offer steady, step-by-step guidance.

**Key Characteristics:**
- **Tactical Authority:** Clean structure, crisp borders, dark-surfaced command cards, and structured signal breakdowns.
- **Immediate Threat Clarity:** Strict 5-tier chromatic risk taxonomy engineered for instant recognition and zero cognitive ambiguity.
- **High-Density Legibility:** Geist Sans for reading comprehension paired with Geist Mono for technical hashes, VPAs, and timestamps.
- **Full WCAG AA Accessibility:** Measured contrast ratios $\ge 4.5:1$ across all risk tiers and interactive states in both light and dark themes.

## Colors

Scamfy employs a dual-theme palette anchored by deep obsidian slates and calibrated semantic risk tiers.

### Primary
- **Deep Slate / Titanium White** (`#0f172a` in Light, `#f8fafc` in Dark): Used for primary interactive triggers, active navigation tabs, and bold headlines.

### Neutral
- **Terminal Obsidian Background** (`#080c14` Dark, `#f8fafc` Light): Base surface providing deep ambient contrast.
- **Card Surface** (`#0f172a` Dark, `#ffffff` Light): Elevated container surface for threat analysis panels and form canvases.
- **Tactical Wireframe Border** (`#1e293b` Dark, `#e2e8f0` Light): Crisp structural separation across panels and cards.
- **Muted Telemetry** (`#94a3b8` Dark, `#64748b` Light): Secondary explanations, metadata, and timestamps.

### Risk Taxonomy Tiers
- **Safe Tier (Emerald)** (`#34d399` text / `#06241b` bg in Dark; `#065f46` text / `#ecfdf5` bg in Light): Verified legitimate entities, zero fraud indicators.
- **Caution Tier (Amber)** (`#fbbf24` text / `#291804` bg in Dark; `#92400e` text / `#fffbeb` bg in Light): Unverified promotional patterns, missing technical verification.
- **Suspicious Tier (Orange)** (`#fb923c` text / `#2d1306` bg in Dark; `#9a3412` text / `#fff7ed` bg in Light): Moderate social engineering tactics, generic shorteners, unverified UPI IDs.
- **High Risk Tier (Rose)** (`#fb7185` text / `#2e0813` bg in Dark; `#9f1239` text / `#fff1f2` bg in Light): Prepaid task deposits, phishing APKs, impersonation extortion.
- **Critical Risk Tier (Crimson)** (`#ef4444` border / `#450a0a` bg in Dark; `#dc2626` text / `#fef2f2` bg in Light): Money-mule recruitment, account rental, active UPI PIN collect traps, digital arrest demands.

### Named Rules
**The Rarity of Red Rule.** Crimson and rose tones are strictly reserved for high-risk threat classification, emergency warnings, and 1930 helpline banners. Decorative or non-critical UI elements must never use red hues.

**The Contrast Floor Rule.** Every text and badge pairing across all 5 risk tiers must maintain $\ge 4.5:1$ contrast against its container background.

## Typography

**Display & Body Font:** Geist Sans (`var(--font-geist-sans)`, with system fallbacks `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)  
**Technical/Telemetry Font:** Geist Mono (`var(--font-geist-mono)`, with fallback `ui-monospace, SFMono-Regular, monospace`)

**Character:** Modern, Swiss-engineered technical precision. Crisp geometry at display scale with high legibility at dense body sizes.

### Hierarchy
- **Display** (800 weight, `clamp(2rem, 5vw, 3.25rem)`, line-height 1.15): Hero headline and primary value proposition.
- **Headline** (800 weight, `clamp(1.5rem, 3.5vw, 2.25rem)`, line-height 1.2): Section headers and major tool titles.
- **Title** (700 weight, `1.125rem`, line-height 1.3): Card headers, modal headlines, and alert titles.
- **Body** (400 weight, `0.875rem`, line-height 1.6): Narrative explanations, guidance copy, max line length `65–75ch`.
- **Label / Telemetry** (600 weight, `0.75rem`, letter-spacing `0.05em`, uppercase): Indicator badges, category chips, timestamps, and UTR codes.

### Named Rules
**The Telemetry Mono Rule.** All machine-extracted entities (UPI VPAs, phone numbers, transaction hashes, UTR codes, dates) must render in `Geist Mono` with uppercase tracking.

## Layout

Scamfy uses a structured 12-column responsive spatial grid with a maximum content constraint of `1152px` (`max-w-6xl`) for discovery directories and `896px` (`max-w-4xl`) for focused command cards:

- **Mobile Viewports (< 640px):** Single-column stacked layout, full-width touch targets ($\ge 44\text{px}$), compact step counters, and collapsible mobile drawer.
- **Tablet Viewports (640px–1024px):** 2-column card grids, condensed horizontal toolbars.
- **Desktop Viewports (> 1024px):** Multi-column telemetry grids, sticky table-of-contents sidebars, and side-by-side analysis panes.
- **Spacing Rhythm:** Standard 8px scale steps (4px, 8px, 16px, 24px, 32px, 48px).

## Elevation & Depth

Scamfy relies on tactile tonal layering rather than heavy drop shadows. Surfaces feel machined and flush, illuminated only by state-driven glow accents.

### Shadow & Glow Vocabulary
- **Resting Surface:** `1px solid var(--border)` with zero ambient shadow.
- **Elevated Card (`shadow-sm`):** `0 1px 2px 0 rgba(0, 0, 0, 0.05)` for floating cards.
- **Modal Overlay (`shadow-2xl`):** `0 25px 50px -12px rgba(0, 0, 0, 0.5)` with `backdrop-blur-md` background.
- **Critical Risk Glow:** `box-shadow: 0 0 20px rgba(220, 38, 38, 0.25)` highlighting urgent transfer warning containers.

### Named Rules
**The State-Driven Glow Rule.** Atmospheric glows are active only on critical alerts, focus states, or glowing status beacons. Resting neutral components remain clean and shadowless.

## Shapes

- **Base Radius:** `8px` (`rounded-md`) for buttons, inputs, and interactive chips.
- **Container Radius:** `16px` (`rounded-xl`) to `24px` (`rounded-2xl`) for major cards, modals, and emergency banners.
- **Pill Badges:** `9999px` (`rounded-full`) for status indicators and risk badges.
- **Borders:** Crisp `1px` continuous border strokes (`border-border`) framing every card and division.

## Components

### Buttons
- **Primary:** High-contrast solid fill (`#0f172a` / `#f8fafc`), `8px` radius, `10px 20px` padding, uppercase or bold title case, active scale `0.99`.
- **Destructive:** Solid `#dc2626` / `#ef4444` crimson fill with white bold text, reserved for emergency actions and pre-transfer warnings.
- **Outline:** `1px solid var(--border)` transparent background with `hover:bg-muted` state.
- **Ghost:** Borderless with subtle hover fill for secondary actions.

### Risk Badge
- **Style:** Pill-shaped (`rounded-full`) container with semantic risk background, matching border, glowing dot indicator, and high-contrast text.
- **Variants:** `SAFE`, `CAUTION`, `SUSPICIOUS`, `HIGH_RISK`, `CRITICAL`.

### Cards & Panels
- **Corner Style:** `16px` radius (`rounded-xl`) with `1px solid var(--border)` stroke.
- **Background:** `var(--card)` with crisp padding (`20px` to `24px`).
- **Header:** Title + Category Badge + Description hierarchy.

### Input Canvas
- **Style:** Multi-line text canvas framed by a technical header bar showing character counter, clipboard paste button, and format indicators.
- **Focus:** `ring-2 ring-primary` with smooth transition.

### Pre-Transfer Warning Modal
- **Trigger:** Automatic interrupt on detection of money-mule or P2P rental patterns.
- **Layout:** High-urgency crimson header, three immediate action directives (**DO NOT SEND**, **DO NOT TOUCH**, **REFUSE & BLOCK**), and direct routing to the received-funds recovery guide.
- **Accessibility:** `max-h-[90vh] overflow-y-auto`, keyboard focus trap, and `Escape` key dismissal.

## Do's and Don'ts

### Do:
- **Do** use the 5-tier semantic color tokens strictly according to evaluated threat severity.
- **Do** render all technical indicators (UPI VPAs, numbers, UTRs, timestamps) in `Geist Mono`.
- **Do** place emergency helpline (1930) and cybercrime.gov.in links in high-visibility alert containers.
- **Do** maintain a minimum touch target of $44\text{px}$ on all mobile interactive elements.
- **Do** preserve the 3 core directives on money-mule screens (**DO NOT SEND**, **DO NOT TOUCH**, **REFUSE & BLOCK**).

### Don't:
- **Don't** use red or crimson accents for decorative, non-threat UI elements.
- **Don't** use low-contrast text that fails WCAG AA ($< 4.5:1$).
- **Don't** display unverified community reports with verified authority badges.
- **Don't** use heavy drop shadows on resting cards; rely on clean border strokes and tonal layering.
- **Don't** create competing or manipulative primary CTAs on public landing pages.
