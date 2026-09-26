"use client";

import * as React from "react";
import {
  ShieldCheck,
  Zap,
  Briefcase,
  CreditCard,
  Building2,
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

      {/* Main Container */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Hero Section */}
          <div className="text-center space-y-3 pt-2 sm:pt-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>India&apos;s Student &amp; Community Fraud Triage</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Instant Scam Check &amp; Threat Triage
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Paste suspicious WhatsApp messages, UPI payment prompts, SMS disconnection notices, or task job offers.
              Scamfy extracts payment VPAs, detects scam patterns, and gives you verified safety actions.
            </p>
          </div>

          {/* Form / Results Container */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-8 shadow-sm">
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

          {/* Educational Threat Cards */}
          <div className="space-y-4 pt-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Common Cyber Fraud Scams in India
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Understand the mechanics behind prevalent scams targeting students and citizens.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200">
                    <Zap className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Electricity Bill Cutoff</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fake SMS claiming your power will be cut tonight at 9:30 PM. Asking you to call a personal mobile number or install a remote-control APK.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">UPI PIN Reverse Collect</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fraudsters claiming you won cashback or refund, requesting you to enter your UPI PIN. Remember: PIN is required ONLY to SEND money.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Part-Time Task Scam</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Offers ₹3,000 daily for liking YouTube videos or Google reviews on Telegram. Early small payouts lead to demands for large prepaid deposits.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-200">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Digital Arrest Extortion</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Impersonators claiming police or CBI warrants for illegal parcels. Threatening video interrogation and demanding fund transfer for verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
