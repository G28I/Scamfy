import type { Metadata } from "next";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { LoanTrapAnalyzer } from "@/components/domain/loan-trap-analyzer";
import { Calculator, AlertTriangle, ShieldCheck, Scale, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Predatory Loan & High-Yield Trap Analyzer | Scamfy",
  description:
    "Dissect hidden upfront deductions, calculate true annualized borrowing APRs, expose unsustainable high-yield Ponzi traps, and verify RBI regulatory compliance under Indian digital lending directives.",
};

/**
 * Standalone Loan & High-Return Trap Analyzer Page.
 * Provides public calculators, educational loan APR dissectors, Ponzi anomaly checks, and RBI verification checklists.
 *
 * @returns React JSX element rendering the loan and yield analyzer page
 */
export default function LoanAnalyzerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="border-b border-border/80 pb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
              <Calculator className="h-3.5 w-3.5 text-primary" />
              <span>Financial Trap Intelligence &amp; Regulatory Shield</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Predatory Loan &amp; High-Yield Trap Analyzer
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Illegal 7-day lending apps and high-yield Ponzi syndicates trap borrowers and students with
              obscured fee structures and false promises. Calculate estimated simple borrowing rates (APR), expose
              unsustainable yields, and verify RBI registration before sharing personal documents.
            </p>
          </div>

          {/* Educational Threat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-border hover:border-rose-500/40 bg-card p-5 space-y-2.5 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <h3>The 7-Day Loan Trap</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Offers advertised as &quot;instant cash without CIBIL&quot; that deduct 30%–50% upfront as processing fees
                and demand full repayment in 6 to 7 days, resulting in effective APRs exceeding 2,000%–3,500% p.a.
              </p>
            </div>

            <div className="rounded-xl border border-border hover:border-amber-500/40 bg-card p-5 space-y-2.5 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                <Scale className="h-4 w-4" />
                <h3>Advance-Fee Approval Scams</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fake approval notices under government schemes (PM Mudra, PMEGP) demanding upfront payments
                for &quot;file charges&quot;, &quot;insurance fees&quot;, or &quot;GST deposits&quot; before loan disbursal.
              </p>
            </div>

            <div className="rounded-xl border border-border hover:border-emerald-500/40 bg-card p-5 space-y-2.5 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                <ShieldCheck className="h-4 w-4" />
                <h3>RBI Digital Lending Rules</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct account-to-account lending, mandatory Key Fact Statements (KFS) with all-inclusive APRs,
                statutory cooling-off exit windows, and zero mobile contact book or gallery access permissions.
              </p>
            </div>
          </div>

          {/* Main Interactive Tool Component */}
          <section aria-label="Interactive Loan and Yield Calculator Tool">
            <LoanTrapAnalyzer />
          </section>

          {/* Educational RBI Regulatory Information */}
          <div className="rounded-xl border border-border bg-muted/20 p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-bold text-foreground">
                Official Regulatory Resources &amp; Complaint Channels
              </h2>
              <span className="text-xs text-muted-foreground font-mono">RBI / SEBI / NCRP</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs text-muted-foreground">
              <div className="p-3.5 rounded-lg border border-border/70 bg-card space-y-1">
                <strong className="text-foreground block">RBI Sachet Portal</strong>
                <p className="leading-relaxed">
                  Search unverified lending entities and lodge complaints against unregistered digital loan applications.
                </p>
                <a
                  href="https://sachet.rbi.org.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-semibold pt-1"
                >
                  <span>Open sachet.rbi.org.in</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="p-3.5 rounded-lg border border-border/70 bg-card space-y-1">
                <strong className="text-foreground block">National Cybercrime Portal (1930)</strong>
                <p className="leading-relaxed">
                  Lodge immediate extortion and photo harassment complaints against predatory recovery agents.
                </p>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-semibold pt-1"
                >
                  <span>Open cybercrime.gov.in (Dial 1930)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
