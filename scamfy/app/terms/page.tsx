import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { Scale, AlertTriangle, ShieldAlert, FileText, Ban, CheckCircle, Mail, PhoneCall, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions — Scamfy Cyber Defense",
  description:
    "Terms of service, usage guidelines, safety limitations, and legal disclaimers for the Scamfy cyber fraud triage platform.",
};

export default function TermsPage() {
  const lastUpdated = "September 26, 2026";

  const sections = [
    { id: "acceptance-of-terms", title: "1. Acceptance of Terms" },
    { id: "description-of-service", title: "2. Description & Scope" },
    { id: "no-legal-authority", title: "3. No Legal Authority" },
    { id: "user-responsibilities", title: "4. User Responsibilities" },
    { id: "community-reporting-rules", title: "5. Community Reporting" },
    { id: "intellectual-property", title: "6. Intellectual Property" },
    { id: "disclaimer-of-warranties", title: "7. Warranty Disclaimer" },
    { id: "limitation-of-liability", title: "8. Liability Limitation" },
    { id: "governing-law", title: "9. Governing Law" },
    { id: "contact", title: "10. Contact & Notices" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="border-b border-border/80 pb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
              <Scale className="h-3.5 w-3.5 text-primary" />
              <span>Platform Terms &amp; Legal Notices</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Published &bull; Last updated on <time dateTime="2026-09-26" className="font-semibold text-foreground">{lastUpdated}</time>
            </p>
          </div>

          {/* Critical Disclaimer Banner */}
          <div className="rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 p-6 sm:p-7 space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2.5 text-amber-950 dark:text-amber-200 font-bold text-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <span>Essential Safety &amp; Informational Scope Notice</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950/90 dark:text-amber-300/90 leading-relaxed">
              Scamfy is an automated educational triage system combining deterministic pattern matching and AI inference. <strong>Scamfy is not a law enforcement agency, judicial authority, or court of law.</strong> Risk scores and indicator summaries do not constitute legal accusations, criminal verdicts, or authoritative proof.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200 pt-1">
              <PhoneCall className="h-4 w-4 text-red-600" />
              <span>
                Active financial loss emergency? Call the National Cyber Crime Helpline at <strong>1930</strong> or file at <strong>cybercrime.gov.in</strong>.
              </span>
            </div>
          </div>

          {/* Main Layout: Sticky Sidebar Navigation + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Sidebar Table of Contents */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <span className="font-bold text-foreground text-xs uppercase tracking-wider block border-b border-border/50 pb-2">
                Document Index
              </span>
              <nav aria-label="Table of Contents" className="space-y-1 text-xs">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium"
                  >
                    <span>{sec.title}</span>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                  </a>
                ))}
              </nav>
            </aside>

            {/* Terms Content Sections */}
            <div className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-muted-foreground">
              {/* Section 1 */}
              <section id="acceptance-of-terms" className="space-y-4 pt-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <FileText className="h-5 w-5 text-primary" />
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using Scamfy (the &quot;Platform&quot;), including our web tools, public intelligence directories, and reporting interfaces, you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, you must discontinue use of the platform immediately.
                </p>
              </section>

              {/* Section 2 */}
              <section id="description-of-service" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  2. Description of Service &amp; Scope
                </h2>
                <p>
                  Scamfy provides defensive digital literacy utilities designed to help students, consumers, and community members identify social engineering deception:
                </p>
                <div className="space-y-3 pl-1">
                  <div className="rounded-xl border border-border bg-card p-4 space-y-1">
                    <span className="font-bold text-xs text-foreground uppercase tracking-wider">Scam Check Analysis</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">Automated parsing of user-submitted text to detect payment VPAs, categorize scam types, and evaluate threat likelihood.</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 space-y-1">
                    <span className="font-bold text-xs text-foreground uppercase tracking-wider">Community Threat Intelligence</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">Curated repository of crowd-sourced threat indicators (VPAs, phone numbers, phishing URLs) categorized by moderation tier.</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 space-y-1">
                    <span className="font-bold text-xs text-foreground uppercase tracking-wider">Defensive Guidance Checklists</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">Immediate actionable instructions outlining defensive steps when encountering suspicious interactions.</p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section id="no-legal-authority" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  3. Informational Triage &amp; No Legal or Emergency Authority
                </h2>
                <p>
                  Scamfy&apos;s output is purely algorithmic and informational. You explicitly acknowledge and agree that:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 text-xs sm:text-sm">
                  <li><strong>No Judicial Determination:</strong> Scamfy does not make legal accusations, issue warrants, or legally adjudicate individuals or entities as fraudsters or criminals (AI-05, OOS-03).</li>
                  <li><strong>Possibility of Errors:</strong> Analysis heuristics and AI models may yield false positives, false negatives, or incomplete evaluations. You must independently verify communications through official bank or organization channels.</li>
                  <li><strong>Not Emergency Response:</strong> Submitting information to Scamfy does not notify the police or constitute an official crime report. For official action, you must file directly with law enforcement.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section id="user-responsibilities" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <Ban className="h-5 w-5 text-primary" />
                  4. User Responsibilities &amp; Prohibited Misuse
                </h2>
                <p>
                  You agree to use Scamfy solely for lawful defense and informational purposes. You must NOT:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 text-xs sm:text-sm">
                  <li><strong>Vigilantism &amp; Harassment:</strong> Use extracted indicators or community data to dox, harass, defame, or physically pursue individuals.</li>
                  <li><strong>Malicious False Reporting:</strong> Submit fabricated, retaliatory, or deceptive community reports targeting legitimate individuals or businesses.</li>
                  <li><strong>System Abuse &amp; Scraping:</strong> Execute automated scrapers, rate-limit circumvention tools, or denial-of-service attacks against our APIs.</li>
                  <li><strong>Sensitive PII Submissions:</strong> Submit sensitive personal passwords, Aadhaar biometric data, payment card CVVs, or full credit card numbers into the text check box.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id="community-reporting-rules" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <Scale className="h-5 w-5 text-primary" />
                  5. Community Reporting &amp; Moderation
                </h2>
                <p>
                  To safeguard community integrity and prevent weaponization of reports:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                  <li>Community submissions remain <strong>Unverified Community Reports</strong> until independently reviewed and verified by platform moderators.</li>
                  <li>Moderators maintain sole discretion to verify, reject, dismiss, or merge community submissions.</li>
                  <li>Disputed or falsely flagged indicators may be appealed by contacting our moderation team.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section id="intellectual-property" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <FileText className="h-5 w-5 text-primary" />
                  6. Intellectual Property &amp; Open Signals
                </h2>
                <p>
                  The Scamfy codebase, design tokens, and user interface are protected under applicable intellectual property rights. By submitting threat indicators to the platform, you grant Scamfy a perpetual, royalty-free license to normalize, aggregate, and publish the technical threat indicators for defensive cybersecurity purposes.
                </p>
              </section>

              {/* Section 7 */}
              <section id="disclaimer-of-warranties" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  7. Disclaimer of Warranties
                </h2>
                <p className="uppercase text-xs font-semibold text-foreground/80 tracking-wide bg-muted/30 p-4 rounded-xl border border-border/40 leading-relaxed">
                  THE PLATFORM AND ALL RISK ASSESSMENTS ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR ACCURACY.
                </p>
              </section>

              {/* Section 8 */}
              <section id="limitation-of-liability" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <Scale className="h-5 w-5 text-primary" />
                  8. Limitation of Liability
                </h2>
                <p>
                  To the maximum extent permitted by applicable law, Scamfy, its contributors, moderators, and maintainers shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of your access to or reliance on risk assessments, community reports, or platform downtime.
                </p>
              </section>

              {/* Section 9 */}
              <section id="governing-law" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <FileText className="h-5 w-5 text-primary" />
                  9. Governing Law &amp; Dispute Resolution
                </h2>
                <p>
                  These Terms shall be governed and construed in accordance with the laws of <span className="font-mono text-foreground font-semibold">[Jurisdiction / Applicable Law Placeholder]</span>, without regard to conflict of law provisions.
                </p>
              </section>

              {/* Section 10 */}
              <section id="contact" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <Mail className="h-5 w-5 text-primary" />
                  10. Contact &amp; Legal Notices
                </h2>
                <p>
                  For legal inquiries, dispute notifications, or terms questions, please reach out to our legal office:
                </p>
                <div className="rounded-xl border border-border bg-card p-5 space-y-1.5 text-xs">
                  <p className="font-bold text-foreground">Scamfy Legal &amp; Compliance</p>
                  <p className="text-muted-foreground font-mono">
                    Email: <span className="text-foreground font-semibold">[legal@scamfy.org]</span>
                  </p>
                  <p className="text-muted-foreground">
                    Open Cyber Threat Intelligence &amp; Triage Initiative
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="border-t border-border/80 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground hover:underline font-bold text-primary">
              &larr; Return to Scam Check
            </Link>
            <div className="flex items-center gap-4 font-medium">
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
