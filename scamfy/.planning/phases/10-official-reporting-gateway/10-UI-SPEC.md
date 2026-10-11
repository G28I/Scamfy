# Phase 10: Official Reporting Gateway & 1930 Route — UI Design Contract (Revised)

## 1. Visual Hierarchy & Design System Authority

This specification defines the UI layout, component hierarchy, accessibility rules, color tokens, and motion behaviors for Phase 10 screens, strictly adhering to `DESIGN.md`, `docs/design/motion-design.md`, and Scamfy's existing token system.

---

## 2. Screens & Interactive Surfaces

### Screen 1: Official Reporting Gateway Hub (`/report`)
- **Header**:
  - Badge: `ShieldAlert` with text `"Official Law Enforcement Gateway"`.
  - Level-1 Heading: `"Official Cybercrime Reporting Gateway"`.
  - Subtitle: `"Step-by-step guidance on lodging official cyber fraud complaints with Indian authorities, freezing fraudulent UPI transactions, and filing formal FIRs."`
- **Rapid-Response Urgency Banner (Financial Fraud / Recent Transfer)**:
  - Rendered when financial loss or unauthorized transfers are reported.
  - Border: `border-red-500/30`, Background: `bg-red-500/10 dark:bg-red-950/40`, Text: `text-red-950 dark:text-red-200`.
  - Icon: `PhoneCall` (red, with measured ambient pulse beacon).
  - Copy: `"Rapid-Response Financial Fraud Protocol: Prompt reporting to 1930 and your bank's 24x7 fraud desk alerts CFCFRMS to attempt inter-bank transaction holds. Available 24x7 across India."`
  - Action: Direct call button (`tel:1930`) + `"Open Urgent Response Protocol"` button.
  - *Accessibility Note*: Never hidden or disabled due to transaction age.
- **Context-Aware Directory & Identifier Router**:
  - Interactive multi-factor selector:
    - `"What happened?"` &rarr; (a) Unauthorized money transfer / Financial loss, (b) Suspicious call/SMS/WhatsApp, (c) Unlicensed loan app harassment, (d) Fake stock tip / investment scheme, (e) Phishing link / account compromise.
  - Dynamically highlights primary recommended agency card with smooth ring animation (`border-primary/60 ring-2 ring-primary/20`) and displays a concise *Why this route?* explanation box.
  - Surfaces secondary/alternative reporting options below primary card.

### Screen 2: Factual Complaint Payload Builder & Authorization Modal (`ComplaintPayloadModal`)
- **Intake Form**:
  - Clean input fields: Incident Date & Time, Estimated Financial Loss (INR), Payment Mode (UPI / IMPS / Card / Other), Suspect Identifiers, Platform Used (Telegram / WhatsApp / Instagram / Web), and Factual Description.
- **Factual Narrative Preview Panel**:
  - Pre-formatted review card showing exact generated text.
  - Header: `"Formal Incident Narrative (Review Before Authorization)"`.
  - Clear Provenance Badges:
    - `User-Reported Facts` (Blue badge)
    - `Extracted Identifiers` (Emerald badge)
    - `Verified Regulatory Notes` (Neutral badge)
  - Tone: Objective, factual, non-defamatory, cleanly attributes statements to user evidence.
- **Distinct Action Triggers (Addressing Correction E)**:
  - Copy individual fields or full text: `"Copy Narrative to Clipboard"` (Tactile checkmark feedback for 2000ms).
  - Download file: `"Download Complaint Dossier (.txt)"` (Generates client-side `.txt` file).
  - Outbound link: `"Open Official Portal (External)"` (`target="_blank" rel="noopener noreferrer"`).
- **Prominent Submission Status Notice**:
  - Prominent alert box (`role="status"`):
    > *"Notice: Scamfy prepares and formats this factual narrative for your convenience. Opening the government portal or copying text does NOT submit a report. You must paste or attach this information and submit your complaint directly on the official portal."*

### Screen 3: Persistent Hybrid Submission Drawer (`ReportingHandoffDrawer`)
- **Structure**:
  - Accessible Radix Dialog / Sheet that remains dockable while user visits the government website in an adjacent tab.
  - Header: Agency Logo/Name + `"Official Portal Submission Helper"`.
  - Field Copier Stack:
    - `"Suspect UPI / Account"` &rarr; [Copy]
    - `"Transaction Ref / UTR"` &rarr; [Copy]
    - `"Suspect Phone / Handle"` &rarr; [Copy]
    - `"Factual Incident Narrative"` &rarr; [Copy]
  - Copy Feedback: Changes to `Check` icon with `"Copied to clipboard"` announcement (`aria-live="polite"`).
  - Official Deep Link: Prominent button `"Open Official Portal (New Tab)"` with `ExternalLink` icon.
  - Interactive Progress Checklist: Allows user to check off fields as they paste them into the government form.

### Screen 4: Rapid-Response Financial Fraud Modal (`RapidResponseModal`)
- **Trigger**: Detected financial transfer or active extortion threat.
- **Presentation**: High-urgency alert dialog (`role="alertdialog"`, accessible title and description).
- **Core Elements**:
  - Heading: `"Urgent: Initiate Inter-Bank Fraud Notification"`
  - Call Action: High-contrast button `"Call 1930 Now (National Cyber Crime Helpline)"` (`tel:1930`).
  - Bulleted 3-Step Protocol:
    1. Call 1930 and provide transaction UTR / bank account number to trigger CFCFRMS.
    2. Contact your bank's 24x7 emergency fraud helpline to lodge an immediate debit freeze request.
    3. Note down the 1930 acknowledgment SMS ticket number for formal registration within 24 hours on `cybercrime.gov.in`.
  - Non-Guarantee Advisory: *"CFCFRMS alerts beneficiary banks to attempt transaction holds; individual recovery depends on fund availability in recipient accounts."*
  - Dismiss: `"I have already notified my bank / 1930"` (Secondary text button).

### Screen 5: Complaint Reference Tracker (`ComplaintReferenceTracker`)
- **Data-Minimized Form**: Agency dropdown, Reference Number input, Filing Date picker, Status dropdown (`LODGED`, `UNDER_INVESTIGATION`, `FUNDS_FROZEN`, `CLOSED`), Follow-up Notes.
- **Card View**: Displays saved references with status badges and quick-copy triggers.
- **Privacy Controls**:
  - Anonymous storage warning: *"Stored locally on this device. Will be cleared if browser history/cache is purged."*
  - One-click deletion: `"Clear Stored Reference"` button with confirmation prompt.

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
