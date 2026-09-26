"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Briefcase,
  CreditCard,
  Building2,
  ExternalLink,
  PhoneCall,
  ArrowRight,
  FileSearch,
} from "lucide-react";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { ScamCheckForm } from "@/components/domain/scam-check-form";
import { ScamCheckResult } from "@/components/domain/scam-check-result";
import { StateFeedback } from "@/components/domain/state-feedback";
import type { AnalysisResultDto } from "@/app/api/check/route";

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = React.useState<AnalysisResultDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [lastSubmittedText, setLastSubmittedText] = React.useState("");

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastSubmittedText(text);

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze message.");
      }

      setAnalysisResult(data as AnalysisResultDto);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected network error occurred.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMessage(null);
    setLastSubmittedText("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1">
        {/* 1. Hero & Triage Section */}
        <section className="border-b border-border/60 bg-gradient-to-b from-muted/30 to-background py-10 sm:py-16">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Hero Text */}
            <div className="text-center space-y-3.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-semibold text-foreground shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Open Cyber Fraud Triage &bull; India</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] max-w-3xl mx-auto">
                Verify suspicious messages, links &amp; payment requests in seconds.
              </h1>

              <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                Paste suspicious WhatsApp messages, UPI payment demands, electricity disconnection notices, or Telegram job offers. Scamfy extracts payment VPAs, evaluates social engineering traps, and provides verified safety steps.
              </p>
            </div>

            {/* Command-Center Scam Check Card */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm">
              {errorMessage && (
                <div className="mb-6">
                  <StateFeedback
                    state="error"
                    errorMessage={errorMessage}
                    onRetry={() => handleAnalyze(lastSubmittedText)}
                  />
                </div>
              )}

              {analysisResult ? (
                <ScamCheckResult result={analysisResult} onReset={handleReset} />
              ) : (
                <ScamCheckForm onAnalyze={handleAnalyze} isLoading={isLoading} />
              )}
            </div>
          </div>
        </section>

        {/* 2. What Scamfy Inspects (4 Key Pillars) */}
        <section className="py-14 sm:py-18 border-b border-border/60 bg-muted/10">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                What Scamfy Inspects
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                Comprehensive hybrid inspection combining deterministic indicator extraction with contextual AI threat models.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-card p-5 space-y-2.5 shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Payment &amp; UPI Signals</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Extracts UPI VPAs, bank account numbers, and detects deceptive QR &ldquo;receive PIN&rdquo; payment collect traps.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-2.5 shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Pressure &amp; Extortion</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Identifies artificial deadlines, power disconnection threats, and digital arrest police impersonation.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-2.5 shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                  <FileSearch className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Phishing URLs &amp; APKs</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Evaluates obfuscated domain links, fake bank KYC forms, and predatory instant-loan APK install links.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-2.5 shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Task &amp; Job Fraud</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Catches Telegram prepaid investment schemes, fake YouTube video rating jobs, and recruitment advances.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. How Defensive Triage Works (3 Steps) */}
        <section className="py-14 sm:py-18 border-b border-border/60">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                How Scamfy Works
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                A structured three-step defensive workflow to protect citizens before financial loss occurs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border bg-card p-6 space-y-3 relative shadow-xs">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                  1
                </span>
                <h3 className="font-bold text-base text-foreground">1. Check</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Paste suspicious communications into the triage engine. Analysis runs securely without tracking your identity.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-3 relative shadow-xs">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                  2
                </span>
                <h3 className="font-bold text-base text-foreground">2. Understand</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Receive an explainable security breakdown: extracted VPAs, recognized psychological coercion tactics, and risk rating.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-3 relative shadow-xs">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                  3
                </span>
                <h3 className="font-bold text-base text-foreground">3. Take Action</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Follow prioritized defensive instructions: block numbers, report indicators to the community, or call helpline 1930.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Common Cyber Fraud Scams in India */}
        <section className="py-14 sm:py-18 border-b border-border/60 bg-muted/10">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Prevalent Cyber Fraud Modus Operandi
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                  Recognize the core mechanics behind common scams actively targeting Indian students and citizens.
                </p>
              </div>
              <Link
                href="/intel"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline shrink-0"
              >
                <span>Browse Threat Intel Directory</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-primary/40 transition-colors shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                      <Zap className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">Electricity Bill Disconnection</h3>
                  </div>
                  <span className="rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 uppercase">
                    Urgency Trap
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fake SMS alerts claiming your electricity supply will be cut at 9:30 PM due to unpaid dues. Demands calling an unofficial personal mobile number or installing remote-screen-share APKs.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-primary/40 transition-colors shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">UPI PIN Reverse Collect</h3>
                  </div>
                  <span className="rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 uppercase">
                    UPI Fraud
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fraudsters promise festival cashbacks or refunds, sending a QR code and instructing you to enter your UPI PIN. Crucial rule: <strong>UPI PIN is required ONLY to SEND money, never to receive it.</strong>
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-primary/40 transition-colors shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">Part-Time Task &amp; Review Scam</h3>
                  </div>
                  <span className="rounded bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 uppercase">
                    Prepaid Trap
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Offers ₹3,000–₹5,000 daily for liking YouTube videos or rating Google maps. Early small payouts build trust before demanding large prepaid deposit tiers that cannot be withdrawn.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-primary/40 transition-colors shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">Digital Arrest Extortion</h3>
                  </div>
                  <span className="rounded bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 uppercase">
                    Impersonation
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fraudsters impersonate CBI, Police, or Customs officers claiming illegal parcels or drug trafficking linked to your Aadhaar. They demand video interrogation and fund transfers to &ldquo;safety accounts&rdquo;.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Emergency 1930 & Official Reporting Banner */}
        <section className="py-12 bg-card border-b border-border/60">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-red-300 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <PhoneCall className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-extrabold text-foreground">
                    Active Financial Loss Emergency?
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                  If you have already sent money or shared banking credentials in a scam, immediately call the <strong>National Cyber Crime Helpline at 1930</strong> or register a complaint on the official portal.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                <a
                  href="tel:1930"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-colors"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Call 1930 Now</span>
                </a>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                >
                  <span>cybercrime.gov.in</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
