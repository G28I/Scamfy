import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { Shield, Lock, Eye, Database, Server, RefreshCw, Mail, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Scamfy Cyber Defense",
  description:
    "Learn how Scamfy handles scam check inputs, community threat reports, extracted indicators, and user data with transparent privacy safeguards.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 26, 2026";

  const sections = [
    { id: "information-we-collect", title: "1. Information We Collect" },
    { id: "how-we-analyze", title: "2. How We Analyze Messages" },
    { id: "community-reports", title: "3. Community Intelligence" },
    { id: "public-vs-private", title: "4. Public vs. Private Data" },
    { id: "storage-security", title: "5. Storage & Audit Logs" },
    { id: "data-retention", title: "6. Retention & User Rights" },
    { id: "third-party-services", title: "7. Third-Party Services" },
    { id: "contact", title: "8. Privacy Inquiries" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="border-b border-border/80 pb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Data Protection &amp; Transparency Statement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Published &bull; Last updated on <time dateTime="2026-09-26" className="font-semibold text-foreground">{lastUpdated}</time>
            </p>
          </div>

          {/* Quick Summary Card */}
          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2.5 text-emerald-950 dark:text-emerald-300 font-bold text-sm">
              <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Core Privacy &amp; Data Principles</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm text-emerald-900/90 dark:text-emerald-200/90">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-background/80 p-3.5 space-y-1">
                <span className="font-bold text-foreground block">1. 100% Anonymous Checks</span>
                <p className="text-xs text-muted-foreground">You can triage messages and VPAs without signing up or disclosing personal identity.</p>
              </div>
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-background/80 p-3.5 space-y-1">
                <span className="font-bold text-foreground block">2. Privacy in Intel Feeds</span>
                <p className="text-xs text-muted-foreground">Public directories strictly strip reporter user IDs, personal narratives, and emails.</p>
              </div>
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-background/80 p-3.5 space-y-1">
                <span className="font-bold text-foreground block">3. Zero Data Resale</span>
                <p className="text-xs text-muted-foreground">We never sell, broker, or monetize your submitted checks to advertisers or third parties.</p>
              </div>
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

            {/* Content Sections */}
            <div className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-muted-foreground">
              {/* Section 1 */}
              <section id="information-we-collect" className="space-y-4 pt-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <Eye className="h-5 w-5 text-primary" />
                  1. Information We Collect
                </h2>
                <p>
                  Scamfy operates with strict data minimization. We collect only information strictly necessary to triage cyber threats, detect social engineering fraud, and maintain platform security:
                </p>
                <div className="space-y-4 pl-1">
                  <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-foreground">A. Submitted Scam Check Text</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      When you submit text (such as an SMS, WhatsApp copy, or job offer) to our check tool, our dual analysis engine parses the text to identify deceptive keywords, urgency triggers, and payment/contact identifiers.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-foreground">B. Extracted Cyber Threat Indicators</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our parsing pipeline extracts technical indicators including UPI Virtual Payment Addresses (VPAs), Indian mobile numbers (+91), suspicious domain URLs, Telegram handles, and bank account numbers.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-foreground">C. Optional User Account Details</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      If you sign in using our authentication service, we receive your account identifier and email address to manage your report history and victim assistance cases. Account creation is never required for general scam checks.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-foreground">D. Technical Rate-Limiting Metrics</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      To prevent abuse, we maintain temporary in-memory rate-limiting counters mapped to incoming IP addresses. IP records are periodically evicted and are not tracked across third-party websites.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section id="how-we-analyze" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <Server className="h-5 w-5 text-primary" />
                  2. How We Analyze Messages &amp; Indicators
                </h2>
                <p>
                  When you submit a check, your input is evaluated through a dual-engine architecture:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                    <span className="font-bold text-xs text-foreground uppercase tracking-wider">Deterministic Evaluator</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Applies mathematical pattern rules, known scam taxonomy matching (e.g. electricity cutoff notices, digital arrest extortion), and regex extractors.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                    <span className="font-bold text-xs text-foreground uppercase tracking-wider">AI Threat Inference</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Evaluates psychological coercion tactics and contextual deception using dedicated AI models (NVIDIA Nemotron NIM).
                    </p>
                  </div>
                </div>
                <p className="text-xs italic bg-muted/20 p-3 rounded-lg border border-border/40">
                  Scamfy analysis results are educational triage aids. Scamfy does not make judicial determinations or legal verdicts (AI-05, OOS-03).
                </p>
              </section>

              {/* Section 3 */}
              <section id="community-reports" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <Database className="h-5 w-5 text-primary" />
                  3. Community Intelligence &amp; Reporting
                </h2>
                <p>
                  When community members submit suspicious indicators through our reporting dialogue:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                  <li>Indicators are normalized and grouped by composite type and value (e.g. UPI VPA or domain) to track aggregate frequency.</li>
                  <li>Submissions remain classified as <strong>Unverified Community Reports</strong> until explicitly reviewed and verified by human moderators.</li>
                  <li>Volume accumulation alone never automatically upgrades an indicator to verified status.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section id="public-vs-private" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <Lock className="h-5 w-5 text-primary" />
                  4. Public vs. Private Data Segregation
                </h2>
                <p>
                  We enforce strict structural boundaries between public threat intelligence and private user records:
                </p>
                <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <span className="font-bold text-foreground block text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Public Threat Intel (/intel)
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Normalized indicator type &amp; value</li>
                        <li>Scam category &amp; threat severity tier</li>
                        <li>Verification status tag</li>
                        <li>Aggregated report counts and timestamps</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <span className="font-bold text-foreground block text-xs uppercase tracking-wider text-red-700 dark:text-red-400">
                        Strictly Private (Never Exposed)
                      </span>
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
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <Shield className="h-5 w-5 text-primary" />
                  5. Storage, Security &amp; Audit Logs
                </h2>
                <p>
                  Our infrastructure employs defensive security safeguards:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                  <li><strong>Encrypted Transmission:</strong> All data is transmitted over TLS/HTTPS with strict transport security.</li>
                  <li><strong>Immutable Audit Logging:</strong> Moderation decisions generate append-only audit events protected by database trigger rules prohibiting updates or deletion (SEC-06).</li>
                  <li><strong>Role-Based Access Control:</strong> Moderation operations require authorized role verification.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section id="data-retention" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  6. Data Retention &amp; User Rights
                </h2>
                <p>
                  We retain threat signatures as long as relevant to protect the public from active fraud campaigns. Users maintain the right to:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-xs sm:text-sm">
                  <li>Request access to their personal account records and report history.</li>
                  <li>Request correction or deletion of user-submitted reports where applicable.</li>
                  <li>Report false-positive indicators for moderator review and dismissal.</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section id="third-party-services" className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
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
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
                  <Mail className="h-5 w-5 text-primary" />
                  8. Contact &amp; Privacy Inquiries
                </h2>
                <p>
                  For questions regarding this policy, data subject requests, or false-positive dispute submissions, please reach out to our privacy office:
                </p>
                <div className="rounded-xl border border-border bg-card p-5 space-y-1.5 text-xs">
                  <p className="font-bold text-foreground">Scamfy Privacy Office</p>
                  <p className="text-muted-foreground font-mono">
                    Email: <span className="text-foreground font-semibold">[privacy@scamfy.org]</span>
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
