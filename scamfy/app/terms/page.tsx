import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { Scale, AlertTriangle, ShieldAlert, FileText, Ban, CheckCircle, Mail, PhoneCall } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions — Scamfy Cyber Defense",
  description:
    "Terms of service, usage guidelines, safety limitations, and legal disclaimers for the Scamfy cyber fraud triage platform.",
};

export default function TermsPage() {
  const lastUpdated = "September 26, 2026";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="border-b border-border pb-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Scale className="h-3.5 w-3.5" />
              <span>Platform Terms &amp; Legal Notices</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Terms &amp; Conditions
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: <time dateTime="2026-09-26">{lastUpdated}</time>
            </p>
          </div>

          {/* Critical Disclaimer Banner */}
          <div className="rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <span>Essential Safety &amp; Informational Scope Notice</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-300/90 leading-relaxed">
              Scamfy is an automated educational triage system powered by deterministic pattern matching and AI inference. <strong>Scamfy is not a law enforcement agency, court of law, or regulatory body.</strong> Risk scores and indicator summaries do not constitute legal determinations of guilt, criminal verdicts, or authoritative proof.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200 pt-1">
              <PhoneCall className="h-3.5 w-3.5 text-red-600" />
              <span>
                If you have suffered an active financial fraud loss, immediately call the National Cyber Crime Helpline at <strong>1930</strong> or register an FIR at <strong>cybercrime.gov.in</strong>.
              </span>
            </div>
          </div>

          {/* Table of Contents */}
          <nav aria-label="Table of Contents" className="rounded-lg bg-muted/30 border border-border/60 p-4 text-xs space-y-2">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
              Sections
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
              <a href="#acceptance-of-terms" className="hover:text-foreground hover:underline">
                1. Acceptance of Terms
              </a>
              <a href="#description-of-service" className="hover:text-foreground hover:underline">
                2. Description of Service &amp; Scope
              </a>
              <a href="#no-legal-authority" className="hover:text-foreground hover:underline">
                3. Informational Triage &amp; No Legal Authority
              </a>
              <a href="#user-responsibilities" className="hover:text-foreground hover:underline">
                4. User Responsibilities &amp; Acceptable Use
              </a>
              <a href="#community-reporting-rules" className="hover:text-foreground hover:underline">
                5. Community Reporting &amp; Moderation
              </a>
              <a href="#intellectual-property" className="hover:text-foreground hover:underline">
                6. Intellectual Property &amp; Open Signals
              </a>
              <a href="#disclaimer-of-warranties" className="hover:text-foreground hover:underline">
                7. Disclaimer of Warranties
              </a>
              <a href="#limitation-of-liability" className="hover:text-foreground hover:underline">
                8. Limitation of Liability
              </a>
              <a href="#governing-law" className="hover:text-foreground hover:underline">
                9. Governing Law &amp; Dispute Resolution
              </a>
              <a href="#contact" className="hover:text-foreground hover:underline">
                10. Contact &amp; Notices
              </a>
            </div>
          </nav>

          {/* Terms Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section id="acceptance-of-terms" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <FileText className="h-5 w-5 text-primary" />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Scamfy (the &quot;Platform&quot;), including our web tools, public intelligence directories, and reporting interfaces, you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, you must discontinue use of the platform immediately.
              </p>
            </section>

            {/* Section 2 */}
            <section id="description-of-service" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                2. Description of Service &amp; Scope
              </h2>
              <p>
                Scamfy provides defensive digital literacy utilities designed to help students, consumers, and community members in India identify social engineering deception:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  <strong>Scam Check Analysis:</strong> Automated analysis of user-submitted text messages to extract potential payment identifiers, categorize scam types, and assess threat likelihood.
                </li>
                <li>
                  <strong>Community Threat Intelligence:</strong> A curated directory of crowd-sourced threat indicators (VPAs, phone numbers, phishing URLs) categorized by moderation tier.
                </li>
                <li>
                  <strong>Incident Guidance:</strong> Contextual educational checklists outlining immediate defensive steps when encountering suspicious interactions.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="no-legal-authority" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                3. Informational Triage &amp; No Legal or Emergency Authority
              </h2>
              <p>
                Scamfy&apos;s output is purely algorithmic and informational. You explicitly acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>No Judicial Determination:</strong> Scamfy does not make legal accusations, issue warrants, or legally adjudicate individuals or entities as fraudsters or criminals.
                </li>
                <li>
                  <strong>Possibility of Errors:</strong> Analysis heuristics and AI models may yield false positives, false negatives, or incomplete evaluations. You must exercise independent judgment and verify communications through official bank or organization channels.
                </li>
                <li>
                  <strong>Not Emergency Response:</strong> Submitting information to Scamfy does not notify the police or constitute an official crime report. For official action, you must file directly with law enforcement.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="user-responsibilities" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Ban className="h-5 w-5 text-primary" />
                4. User Responsibilities &amp; Prohibited Misuse
              </h2>
              <p>
                You agree to use Scamfy solely for lawful defense and informational purposes. You must NOT:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>Vigilantism &amp; Harassment:</strong> Use extracted indicators or community data to dox, harass, defame, or physically pursue individuals.
                </li>
                <li>
                  <strong>Malicious False Reporting:</strong> Submit fabricated, retaliatory, or deceptive community reports targeting legitimate individuals or businesses.
                </li>
                <li>
                  <strong>System Abuse &amp; Scraping:</strong> Execute automated scrapers, rate-limit circumvention tools, or denial-of-service attacks against our APIs.
                </li>
                <li>
                  <strong>Sensitive PII Submissions:</strong> Submit sensitive personal passwords, Aadhaar biometric data, payment card CVVs, or full credit card numbers into the text check box.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="community-reporting-rules" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Scale className="h-5 w-5 text-primary" />
                5. Community Reporting &amp; Moderation
              </h2>
              <p>
                To safeguard community integrity and prevent weaponization of reports:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  Community submissions remain <strong>Unverified Community Reports</strong> until independently reviewed and verified by platform moderators.
                </li>
                <li>
                  Moderators maintain sole discretion to verify, reject, dismiss, or merge community submissions.
                </li>
                <li>
                  Disputed or falsely flagged indicators may be appealed by contacting our moderation team.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="intellectual-property" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <FileText className="h-5 w-5 text-primary" />
                6. Intellectual Property &amp; Open Signals
              </h2>
              <p>
                The Scamfy codebase, design tokens, and user interface are protected under applicable intellectual property rights. By submitting threat indicators to the platform, you grant Scamfy a perpetual, royalty-free license to normalize, aggregate, and publish the technical threat indicators for defensive cybersecurity purposes.
              </p>
            </section>

            {/* Section 7 */}
            <section id="disclaimer-of-warranties" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                7. Disclaimer of Warranties
              </h2>
              <p className="uppercase text-xs font-semibold text-foreground/80 tracking-wide">
                THE PLATFORM AND ALL RISK ASSESSMENTS ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR ACCURACY.
              </p>
            </section>

            {/* Section 8 */}
            <section id="limitation-of-liability" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Scale className="h-5 w-5 text-primary" />
                8. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, Scamfy, its contributors, moderators, and maintainers shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of your access to or reliance on risk assessments, community reports, or platform downtime.
              </p>
            </section>

            {/* Section 9 */}
            <section id="governing-law" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <FileText className="h-5 w-5 text-primary" />
                9. Governing Law &amp; Dispute Resolution
              </h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of <span className="font-mono text-foreground">[Jurisdiction / Applicable Law Placeholder]</span>, without regard to conflict of law provisions.
              </p>
            </section>

            {/* Section 10 */}
            <section id="contact" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Mail className="h-5 w-5 text-primary" />
                10. Contact &amp; Legal Notices
              </h2>
              <p>
                For legal inquiries, dispute notifications, or terms questions, please reach out to:
              </p>
              <div className="rounded-lg border border-border bg-card p-4 space-y-1 text-xs">
                <p className="font-semibold text-foreground">Scamfy Legal &amp; Compliance</p>
                <p className="text-muted-foreground font-mono">
                  Email: <span className="text-foreground">[legal@scamfy.org]</span>
                </p>
                <p className="text-muted-foreground">
                  Open Cyber Threat Intelligence &amp; Triage Initiative
                </p>
              </div>
            </section>
          </div>

          {/* Bottom Back Links */}
          <div className="border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground hover:underline font-medium">
              &larr; Return to Scam Check
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-foreground hover:underline">
                Privacy Policy
              </Link>
              <Link href="/intel" className="hover:text-foreground hover:underline">
                Threat Intel Directory
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
