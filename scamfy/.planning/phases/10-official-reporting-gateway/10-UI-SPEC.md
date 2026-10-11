# Phase 10: Official Reporting Gateway & 1930 Route — UI Design Contract

## 1. Visual Hierarchy & Design System Authority

This specification defines the UI layout, component hierarchy, accessibility rules, color tokens, and motion behaviors for Phase 10 screens, strictly adhering to `DESIGN.md`, `docs/design/motion-design.md`, and Scamfy's existing token system.

---

## 2. Screens & Interactive Surfaces

### Screen 1: Official Reporting Gateway Hub (`/report`)
- **Header**:
  - Badge: `ShieldAlert` with text `"Official Law Enforcement Gateway"`.
  - Level-1 Heading: `"Official Cybercrime Reporting Gateway"`.
  - Subtitle: `"Step-by-step guidance on lodging official cyber fraud complaints with Indian authorities, freezing fraudulent UPI transactions, and filing formal FIRs."`
- **Top Pinned Urgency Banner (Emergency State)**:
  - Rendered when transfer is recent ($\le 2-4$ hours) or active loss is flagged.
  - Border: `border-red-500/30`, Background: `bg-red-500/10 dark:bg-red-950/40`, Text: `text-red-950 dark:text-red-200`.
  - Icon: `PhoneCall` (red, with ambient pulse beacon).
  - Copy: `"The Golden Hour Rule: Call 1930 within 2–4 hours of an unauthorized transfer to alert CFCFRMS for an immediate inter-bank freeze."`
  - Action: Direct call button (`tel:1930`) + `"Open Golden Hour Guide"` button.
- **Reporting Channels Directory (Grid / Cards)**:
  - 5 structured channel cards:
    1. National Cyber Crime Reporting Portal & Helpline (`1930` / `cybercrime.gov.in`)
    2. Chakshu — Sanchar Saathi (`sancharsaathi.gov.in`)
    3. RBI Sachet Portal (`sachet.rbi.org.in`)
    4. SEBI SCORES Portal (`scores.sebi.gov.in`)
    5. Banking Ombudsman & NPCI Grievance Desk (`cms.rbi.org.in`)
  - Each card details: Jurisdiction, Accepted Identifiers (Badge tags), Operating Hours, and `"Start Guided Report"` / `"Visit Official Portal"` triggers.
- **Identifier Router Section**:
  - Interactive selector: `"What do you need to report?"` (Phone Number / WhatsApp, UPI ID / Bank Account, Phishing Link / Domain, Unlicensed Loan App, Fake Investment / Stock Tip).
  - Dynamically highlights the corresponding official authority card with smooth border transition (`border-primary/60 ring-2 ring-primary/20`).

### Screen 2: Factual Complaint Payload Builder & Authorization Modal
- **Intake Form**:
  - Fields: Incident Date & Time, Estimated Financial Loss (INR), Payment Mode (UPI / IMPS / Card / Crypto), Suspect Identifiers (auto-populated from triage if navigated from scam check), Platform Used (Telegram / WhatsApp / Instagram / Web), and Factual Description.
- **Payload Review Panel**:
  - Clean, monospace or formatted pre-view card showing the exact generated text.
  - Header: `"Formal Incident Narrative (Review Before Authorization)"`.
  - Tone: Objective, factual, non-defamatory, cleanly attributes statements to user evidence.
- **Explicit Authorization Gate (`OFF-04`)**:
  - Checkbox: `"I confirm that this narrative contains truthful, factual information based on my personal experience, and I authorize Scamfy to format and prepare this payload for official submission."`
  - Buttons:
    - `"Authorize & Open Official Portal"` (Primary, enabled only when checkbox checked)
    - `"Download Complaint Dossier (.txt)"` (Secondary, generates `.txt` file)
    - `"Copy All to Clipboard"` (Secondary with tactile copy check feedback)

### Screen 3: Persistent Hybrid Handoff Drawer (`ReportingHandoffDrawer`)
- **Structure**:
  - Accessible Radix Dialog / Sheet or persistent bottom/right drawer that remains dockable while user visits the government website in an adjacent tab.
  - Header: Agency Logo/Name + `"Official Portal Submission Helper"`.
  - Field Copier Stack:
    - `"Suspect UPI / Account"` &rarr; [Copy]
    - `"Transaction Ref / UTR"` &rarr; [Copy]
    - `"Suspect Phone / Handle"` &rarr; [Copy]
    - `"Factual Incident Narrative"` &rarr; [Copy]
  - Copy Feedback: Changes to `Check` icon with `"Copied to clipboard"` tooltip for 2000ms.
  - Official Deep Link: Prominent button `"Open cybercrime.gov.in (New Tab)"` with `ExternalLink` icon.

### Screen 4: Golden-Hour Emergency Intercept Modal (`GoldenHourModal`)
- **Trigger**: Detected financial transfer $\le 4$ hours old or active extortion threat.
- **Presentation**: High-urgency alert dialog (`role="alertdialog"`, accessible title and description).
- **Theme**: Ambient red pulse glow (`box-shadow: 0 0 24px rgba(220, 38, 38, 0.25)`).
- **Core Elements**:
  - Heading: `"Urgent: Initiate Golden-Hour Inter-Bank Freeze"`
  - Call Action: High-contrast button `"Call 1930 Now (National Cyber Crime Helpline)"` (`tel:1930`).
  - Bulleted 3-Step Protocol:
    1. Call 1930 and state transaction UTR / bank account number to trigger CFCFRMS.
    2. Contact your bank's 24x7 emergency helpline to lodge a debit freeze request.
    3. Note down the acknowledgment SMS ticket number.
  - Dismiss: `"I have already notified my bank / 1930"` (Secondary text button).

### Screen 5: Official Reference Tracker Section (`ComplaintReferenceTracker`)
- **Inputs**: Agency, Reference Number, Date Lodged, Status dropdown, Notes.
- **Card View**: Displays saved references with status badges (`LODGED` in amber, `UNDER_INVESTIGATION` in blue, `FUNDS_FROZEN` in emerald, `CLOSED` in muted).
- **Quick Action**: Copy Reference Number, Edit Status, Delete Record.

---

## 3. Motion & Micro-Interaction Guidelines
- Adhere strictly to `docs/design/motion-design.md`:
  - Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for container entrances (300ms fade-in).
  - Button presses: `active:scale-[0.99] duration-100 ease-out`.
  - Copy buttons: 150ms checkmark transition.
  - Reduced Motion: Suppress drawer slide and modal pulse under `@media (prefers-reduced-motion: reduce)`, retaining static opacity fades.

---

## 4. Accessibility & Contrast Standards
- **Contrast**: Text contrast meets WCAG AA ($\ge 4.5:1$ for normal text, $\ge 3:1$ for large text).
- **Keyboard Navigation**: Full Tab/Shift+Tab focus trap in modals and drawers. Escape key closes drawers/modals safely.
- **Screen Reader Announcements**: Live region (`aria-live="polite"`) announces copy-to-clipboard events and reference saving.
- **Non-Color Reliance**: Status tags include visible icon + label (`CheckCircle` for Frozen, `Clock` for Under Investigation, `AlertTriangle` for Lodged).
