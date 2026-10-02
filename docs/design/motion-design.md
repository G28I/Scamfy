# Scamfy Motion Design Specification

**Creative Theme**: *The Tactical Cyber Defense Terminal*  
**Visitor Mode**: **Operate + Persuade** (Fast, authoritative fraud triage where motion serves feedback, hierarchy, state continuity, and cognitive focus without gratuitous delay).

---

## 1. Principles of Motion

1. **Purpose Over Spectacle**: Motion in Scamfy must communicate feedback, hierarchy, state continuity, or crisis urgency. Decoration without functional intent is prohibited.
2. **Restrained Authority**: Scamfy is designed for users who may be under intense financial distress, extortion, or active fraud pressure. Animations must remain calm, professional, and confidence-inspiring—never playful, bouncy, or frantic.
3. **Composite-Only Properties**: Transitions strictly prioritize `opacity`, `transform`, and `border-color` running on GPU compositor threads. Never animate layout-driving properties (`width`, `height`, `margin`, `top`, `left`) without an explicit, documented architectural justification.
4. **Intentional Reduced Motion**: Comply with `prefers-reduced-motion` by suppressing large spatial movement and looping pulses while retaining essential 150ms opacity/color state transitions for accessibility.

---

## 2. Timing & Easing Curves

| Category | Typical Duration | Easing Curve | Use Case |
|---|---|---|---|
| **Immediate Feedback** | `100ms` | `ease-out` (`active:scale-[0.99]`) | Button presses, tactile touch confirmation |
| **State Feedback** | `150ms–200ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Preset selection highlight, copy feedback, checkbox toggle |
| **Container Transitions** | `300ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Input form &rarr; triage report crossfade, modal entrances |
| **Emergency Risk Pulse** | `2000ms loop` | `ease-in-out` | Ambient beacon on Critical/Emergency risk badges |

---

## 3. Key Interactive Motion Surfaces

### 3.1 Input Canvas & Preset Selection
- **Preset Click**: Triggers a restrained 800ms border/ring highlight (`border-primary/60 ring-2 ring-primary/20`) and smoothly scrolls into viewport focus on viewports $< 768\text{px}$.
- **Screen Reader Support**: An `aria-live="polite"` live region announces `"Preset message loaded into input canvas."` to ensure non-visual parity.

### 3.2 Threat Triage Result Arrival
- **Hierarchy Inversion**: In High-Risk and Critical states, the Immediate Defensive Action Protocol renders at the top of the report to prioritize immediate safety over diagnostic details.
- **Crossfade**: The analysis results enter with a clean 300ms fade-in (`animate-in fade-in-50 duration-300`).

### 3.3 Emergency & Money-Mule Alerts
- **Beacon Glow**: Critical alert headers utilize a measured ambient pulse (`box-shadow: 0 0 20px rgba(220, 38, 38, 0.25)`).
- **Interactive Guides**: Collapsible emergency wizards slide smoothly from top (`slide-in-from-top-4 duration-300`).

---

## 4. Accessibility & Reduced Motion Protocol

```css
@media (prefers-reduced-motion: reduce) {
  /* Suppress spatial translations and infinite loops while preserving state visibility */
  *,
  ::before,
  ::after {
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```
State changes (such as copy confirmations, risk tier colors, and form focus rings) maintain a subtle 150ms fade to provide essential feedback without disorienting vestibular systems.
