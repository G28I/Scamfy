import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { Button } from "@/components/ui/button";
import { FolderLock, ShieldCheck, FileText, Lock, PlusCircle, PhoneCall } from "lucide-react";

export const metadata: Metadata = {
  title: "Victim Case Center",
  description:
    "Private incident timeline and evidence organizer to help fraud victims document cyber extortion and UPI scams before filing official police reports.",
};

export default function CasesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="border-b border-border/80 pb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
              <FolderLock className="h-3.5 w-3.5 text-primary" />
              <span>Private Victim Incident Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Victim Case Center
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Organize digital evidence, chat screenshots, payment transaction IDs, and timestamps into an organized case docket before submitting official reports to the National Cyber Crime Portal.
            </p>
          </div>

          {/* Privacy & Confidentiality Notice */}
          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-950 dark:text-emerald-300 font-bold text-sm">
              <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zero-Leakage Private Evidence Storage</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed">
              Victim case dockets are strictly isolated to your authenticated account. Case details, financial amounts, and evidence attachments are never published to public threat directories or indexed by search engines.
            </p>
          </div>

          {/* Empty Case Vault State / Action Area */}
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 sm:p-14 text-center space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted border border-border text-muted-foreground">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-foreground">No Open Victim Dockets</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You currently do not have any saved fraud investigations. You can triage incoming messages immediately or start a new case docket.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild size="default" className="font-bold gap-2">
                <Link href="/">
                  <PlusCircle className="h-4 w-4" />
                  Analyze Suspicious Message
                </Link>
              </Button>
              <Button asChild variant="outline" size="default" className="font-semibold gap-2">
                <Link href="/intel">
                  <ShieldCheck className="h-4 w-4" />
                  Search Known Threat Intel
                </Link>
              </Button>
            </div>
          </div>

          {/* Helpline Callout */}
          <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                <PhoneCall className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-red-950 dark:text-red-200 block">Financial Fraud Emergency Helpline</span>
                <span className="text-red-900/80 dark:text-red-300/80">
                  If money was debited from your bank account within the last 24 hours, call <strong>1930</strong> immediately to request transaction freezing.
                </span>
              </div>
            </div>
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shrink-0 shadow-xs"
            >
              Call 1930 Now
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
