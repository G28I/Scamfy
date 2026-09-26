import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { Shield, Lock, Eye, Database, Server, RefreshCw, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Scamfy Cyber Defense",
  description:
    "Learn how Scamfy handles scam check inputs, community threat reports, extracted indicators, and user data with transparent privacy safeguards.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 26, 2026";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="border-b border-border pb-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Shield className="h-3.5 w-3.5" />
              <span>Data Protection &amp; Transparency</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: <time dateTime="2026-09-26">{lastUpdated}</time>
            </p>
          </div>

          {/* Quick Summary Callout */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Core Privacy Commitments</span>
            </div>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>
                <strong>Anonymous Checks:</strong> You can triage suspicious text messages without creating an account.
              </li>
              <li>
                <strong>Community Privacy:</strong> Public threat intelligence directories strictly strip private reporter user IDs, emails, and internal moderator notes.
              </li>
              <li>
                <strong>No Commercial Resale:</strong> We do not sell, rent, or monetize your submitted check data or personal information.
              </li>
            </ul>
          </div>

          {/* Table of Contents */}
          <nav aria-label="Table of Contents" className="rounded-lg bg-muted/30 border border-border/60 p-4 text-xs space-y-2">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
              Contents
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
              <a href="#information-we-collect" className="hover:text-foreground hover:underline">
                1. Information We Collect
              </a>
              <a href="#how-we-analyze" className="hover:text-foreground hover:underline">
                2. How We Analyze Messages &amp; Indicators
              </a>
              <a href="#community-reports" className="hover:text-foreground hover:underline">
                3. Community Intelligence &amp; Reporting
              </a>
              <a href="#public-vs-private" className="hover:text-foreground hover:underline">
                4. Public vs. Private Data Segregation
              </a>
              <a href="#storage-security" className="hover:text-foreground hover:underline">
                5. Storage, Security &amp; Audit Logs
              </a>
              <a href="#data-retention" className="hover:text-foreground hover:underline">
                6. Data Retention &amp; User Rights
              </a>
              <a href="#third-party-services" className="hover:text-foreground hover:underline">
                7. Third-Party Services
              </a>
              <a href="#contact" className="hover:text-foreground hover:underline">
                8. Contact Information
              </a>
            </div>
          </nav>

          {/* Policy Sections */}
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section id="information-we-collect" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Eye className="h-5 w-5 text-primary" />
                1. Information We Collect
              </h2>
              <p>
                Scamfy is designed with data minimization in mind. We collect only information necessary to assess cyber fraud risk, protect consumers, and maintain service availability:
              </p>
              <div className="space-y-3 pl-2">
                <h3 className="text-base font-semibold text-foreground">A. Submitted Scam Check Text</h3>
                <p>
                  When you submit text (such as an SMS message, WhatsApp copy, or job proposal) to our check tool, our analysis engine parses the raw text to detect fraudulent keywords, psychological urgency signals, and structured payment/contact identifiers.
                </p>

                <h3 className="text-base font-semibold text-foreground">B. Extracted Cyber Threat Indicators</h3>
                <p>
                  Our parsing pipeline extracts technical indicators including UPI Virtual Payment Addresses (VPAs), Indian mobile numbers (+91), suspicious domain URLs, Telegram/WhatsApp handles, and bank account numbers.
                </p>

                <h3 className="text-base font-semibold text-foreground">C. User Account Information (Optional)</h3>
                <p>
                  If you sign in using our authentication service, we receive your account identifier and email address to manage your report history and victim assistance cases. Account creation is not required for basic scam checks.
                </p>

                <h3 className="text-base font-semibold text-foreground">D. Technical &amp; Rate-Limiting Data</h3>
                <p>
                  To prevent abuse and DDoS attacks, we maintain temporary in-memory rate-limiting counters mapped to incoming IP addresses. IP addresses are periodically evicted and are not sold or tracked across third-party websites.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="how-we-analyze" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Server className="h-5 w-5 text-primary" />
                2. How We Analyze Messages &amp; Indicators
              </h2>
              <p>
                When you request a scam check, your input is processed through a dual-engine architecture:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  <strong>Deterministic Heuristic Evaluator:</strong> Applies mathematical pattern rules, known scam taxonomy matching (e.g. electricity cutoff notices, digital arrest extortion), and regular expression extractors.
                </li>
                <li>
                  <strong>AI Analysis Inference:</strong> Evaluates psychological coercion tactics and contextual deception using dedicated AI inference (such as NVIDIA Nemotron NIM).
                </li>
              </ul>
              <p>
                Analysis results are informational triage aids. Scamfy does not make judicial determinations or legal verdicts.
              </p>
            </section>

            {/* Section 3 */}
            <section id="community-reports" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Database className="h-5 w-5 text-primary" />
                3. Community Intelligence &amp; Reporting
              </h2>
              <p>
                When community members submit suspicious indicators through our reporting dialogue:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  Indicators are normalized and grouped by unique type and value (e.g. UPI VPA or domain) to track aggregate frequency.
                </li>
                <li>
                  Submissions remain classified as <strong>Unverified Community Reports</strong> until explicitly reviewed and verified by human moderators.
                </li>
                <li>
                  Volume accumulation alone never automatically upgrades an indicator to verified status.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="public-vs-private" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Lock className="h-5 w-5 text-primary" />
                4. Public vs. Private Data Segregation
              </h2>
              <p>
                We enforce strict structural boundaries between public intelligence and private user records:
              </p>
              <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-foreground block mb-1">Public Threat Intelligence (/intel):</span>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Normalized indicator type &amp; value</li>
                      <li>Scam category &amp; threat severity tier</li>
                      <li>Verification status tag</li>
                      <li>Aggregated report counts and timestamps</li>
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-foreground block mb-1">Strictly Private (Excluded from Public View):</span>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Reporter user ID &amp; email addresses</li>
                      <li>Internal moderator reasoning notes</li>
                      <li>Raw submission personal narratives</li>
                      <li>Client network IP records</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="storage-security" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Shield className="h-5 w-5 text-primary" />
                5. Storage, Security &amp; Audit Logs
              </h2>
              <p>
                Our systems employ modern defensive security safeguards:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  <strong>Encrypted Transmission:</strong> All data is transmitted over TLS/HTTPS with strict transport security.
                </li>
                <li>
                  <strong>Immutable Audit Logging:</strong> Moderation decisions (approvals, dismissals, merges) generate append-only audit events protected by database trigger rules against alteration.
                </li>
                <li>
                  <strong>Role-Based Access Control:</strong> Administrative and moderation operations require authorized role verification.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="data-retention" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                6. Data Retention &amp; User Rights
              </h2>
              <p>
                We retain threat intelligence signatures as long as relevant to protect the public from active scam campaigns. Users have the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Request access to their personal account records and report history.</li>
                <li>Request correction or deletion of user-submitted reports where applicable.</li>
                <li>Report false-positive indicators for moderator review and dismissal.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="third-party-services" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Server className="h-5 w-5 text-primary" />
                7. Third-Party Services &amp; Children&apos;s Privacy
              </h2>
              <p>
                Scamfy utilizes authentication infrastructure (such as Clerk) for secure user sessions. We do not integrate commercial ad trackers or data brokers.
              </p>
              <p>
                Scamfy is not directed toward children under the age of 13. If you believe a minor has provided personal information without consent, please contact us for prompt removal.
              </p>
            </section>

            {/* Section 8 */}
            <section id="contact" className="space-y-4 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Mail className="h-5 w-5 text-primary" />
                8. Contact &amp; Privacy Inquiries
              </h2>
              <p>
                For questions regarding this policy, data subject requests, or false-positive dispute submissions, please contact our team:
              </p>
              <div className="rounded-lg border border-border bg-card p-4 space-y-1 text-xs">
                <p className="font-semibold text-foreground">Scamfy Privacy Office</p>
                <p className="text-muted-foreground font-mono">
                  Email: <span className="text-foreground">[privacy@scamfy.org]</span>
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
              <Link href="/terms" className="hover:text-foreground hover:underline">
                Terms &amp; Conditions
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
