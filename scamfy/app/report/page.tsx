import type { Metadata } from "next";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { ShieldAlert, ExternalLink, PhoneCall, CheckCircle, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Official Cybercrime Reporting Guide",
  description:
    "Official Indian cybercrime reporting procedures for 1930 National Helpline, cybercrime.gov.in, bank grievance officers, and police FIR filing.",
};

export default function ReportPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="border-b border-border/80 pb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
              <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
              <span>Official Law Enforcement Gateway</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Official Cybercrime Reporting Guide
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Step-by-step guidance on lodging official cyber fraud complaints with Indian authorities, freezing fraudulent UPI transactions, and filing formal FIRs.
            </p>
          </div>

          {/* Golden Hour Emergency Alert */}
          <div className="rounded-2xl border border-red-300 dark:border-red-900/80 bg-red-50/70 dark:bg-red-950/30 p-6 sm:p-7 space-y-3.5">
            <div className="flex items-center gap-2.5 text-red-950 dark:text-red-200 font-bold text-base">
              <PhoneCall className="h-5 w-5 text-red-600 shrink-0" />
              <span>The &quot;Golden Hour&quot; Rule: Act Within 2–4 Hours</span>
            </div>
            <p className="text-xs sm:text-sm text-red-950/90 dark:text-red-300/90 leading-relaxed">
              If money was transferred under fraud or coercion, calling the National Cyber Crime Helpline at <strong>1930</strong> immediately alerts law enforcement and the Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS), which may help authorities attempt to stop further transfers before funds are withdrawn.
            </p>
            <div className="pt-2">
              <a
                href="tel:1930"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 shadow-sm transition-colors"
              >
                <PhoneCall className="h-4 w-4" />
                Call 1930 Helpline Now
              </a>
            </div>
          </div>

          {/* Official Portals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* National Portal */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Portal 01</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-bold text-foreground">National Cyber Crime Reporting Portal</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Official Ministry of Home Affairs portal to lodge formal cybercrime complaints (financial fraud, digital arrest extortion, identity theft).
              </p>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>Visit cybercrime.gov.in</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Sanchar Saathi */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Portal 02</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Chakshu — Sanchar Saathi</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Department of Telecommunications portal to report suspicious fraud calls, SMS messages, and WhatsApp fraud numbers for telecom blocking.
              </p>
              <a
                href="https://sancharsaathi.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>Visit sancharsaathi.gov.in</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Essential Checklist */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Evidence Required When Filing Official Complaints
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Bank account statement / transaction UTR number</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Suspect UPI VPA or bank account details</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Screenshots of WhatsApp / Telegram chats</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Call logs and phone numbers of the suspect</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
