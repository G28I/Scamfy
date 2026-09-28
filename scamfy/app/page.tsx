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
  HelpCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { ScamCheckForm } from "@/components/domain/scam-check-form";
import { ScamCheckResult } from "@/components/domain/scam-check-result";
import { StateFeedback } from "@/components/domain/state-feedback";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AnalysisResultDto } from "@/app/api/check/route";
import { trackEvent } from "@/lib/analytics";

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = React.useState<AnalysisResultDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [lastSubmittedText, setLastSubmittedText] = React.useState("");

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastSubmittedText(text);
    trackEvent("scam_check_started");

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
        trackEvent("error_occurred", { category: "scam_check", status_code: response.status });
        throw new Error(data.message || "Failed to analyze message.");
      }

      trackEvent("scam_check_completed", {
        risk_level: data.risk_level || "UNKNOWN",
        is_emergency: !!data.is_emergency,
        indicator_count: Array.isArray(data.extracted_indicators) ? data.extracted_indicators.length : 0,
      });

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
        <section className="bg-gradient-to-b from-muted/30 to-background py-10 sm:py-16">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Hero Text */}
            <div className="text-center space-y-3.5">
              <div className="inline-flex items-center gap-2">
                <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold gap-1.5 bg-card">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Open Cyber Fraud Triage &bull; India</span>
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] max-w-3xl mx-auto">
                Verify suspicious messages, links &amp; payment requests in seconds.
              </h1>

              <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                Paste suspicious WhatsApp messages, UPI payment demands, electricity disconnection notices, or Telegram job offers. Scamfy extracts payment VPAs, evaluates social engineering traps, and provides verified safety steps.
              </p>
            </div>

            {/* Command-Center Scam Check Card using Shadcn Card */}
            <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-5 sm:p-8">
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
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* 2. What Scamfy Inspects (4 Key Pillars with Shadcn Cards) */}
        <section className="py-14 sm:py-18 bg-muted/10">
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
              <Card className="hover:border-primary/40 transition-colors shadow-xs">
                <CardHeader className="p-5 space-y-3 pb-0">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-foreground">
                    <CreditCard className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-bold">Payment &amp; UPI Signals</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                  <CardDescription className="text-xs leading-relaxed">
                    Extracts UPI VPAs, bank account numbers, and detects deceptive QR &ldquo;receive PIN&rdquo; payment collect traps.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40 transition-colors shadow-xs">
                <CardHeader className="p-5 space-y-3 pb-0">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-foreground">
                    <Zap className="size-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-sm font-bold">Pressure &amp; Extortion</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                  <CardDescription className="text-xs leading-relaxed">
                    Identifies artificial deadlines, power disconnection threats, and digital arrest police impersonation.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40 transition-colors shadow-xs">
                <CardHeader className="p-5 space-y-3 pb-0">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-foreground">
                    <FileSearch className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-sm font-bold">Phishing URLs &amp; APKs</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                  <CardDescription className="text-xs leading-relaxed">
                    Evaluates obfuscated domain links, fake bank KYC forms, and predatory instant-loan APK install links.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40 transition-colors shadow-xs">
                <CardHeader className="p-5 space-y-3 pb-0">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-foreground">
                    <Briefcase className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-sm font-bold">Task &amp; Job Fraud</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                  <CardDescription className="text-xs leading-relaxed">
                    Catches Telegram prepaid investment schemes, fake YouTube video rating jobs, and recruitment advances.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator />

        {/* 3. How Defensive Triage Works (3 Steps) */}
        <section className="py-14 sm:py-18">
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
              <Card className="shadow-xs">
                <CardContent className="p-6 space-y-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                    1
                  </span>
                  <h3 className="font-bold text-base text-foreground">1. Check</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Paste suspicious communications into the triage engine. Analysis runs securely without tracking your identity.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xs">
                <CardContent className="p-6 space-y-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                    2
                  </span>
                  <h3 className="font-bold text-base text-foreground">2. Understand</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Receive an explainable security breakdown: extracted VPAs, recognized psychological coercion tactics, and risk rating.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xs">
                <CardContent className="p-6 space-y-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                    3
                  </span>
                  <h3 className="font-bold text-base text-foreground">3. Take Action</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Follow prioritized defensive instructions: block numbers, report indicators to the community, or call helpline 1930.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator />

        {/* 4. Common Cyber Fraud Scams in India */}
        <section className="py-14 sm:py-18 bg-muted/10">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Prevalent Cyber Fraud Scams in India
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                  Recognize the core mechanics behind common scams actively targeting Indian students and citizens.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="font-bold shrink-0">
                <Link href="/intel" className="inline-flex items-center gap-1.5">
                  <span>Browse Threat Intel Directory</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="hover:border-primary/40 transition-colors shadow-xs">
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-foreground">
                        <Zap className="size-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <CardTitle className="text-sm font-bold">Electricity Bill Disconnection</CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                      Urgency Trap
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-1">
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                    Fake SMS alerts claiming your electricity supply will be cut at 9:30 PM due to unpaid dues. Demands calling an unofficial personal mobile number or installing remote-screen-share APKs.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40 transition-colors shadow-xs">
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-foreground">
                        <CreditCard className="size-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <CardTitle className="text-sm font-bold">UPI PIN Reverse Collect</CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                      UPI Fraud
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-1">
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                    Fraudsters promise festival cashbacks or refunds, sending a QR code and instructing you to enter your UPI PIN. Crucial rule: <strong>UPI PIN is required ONLY to SEND money, never to receive it.</strong>
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40 transition-colors shadow-xs">
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-foreground">
                        <Briefcase className="size-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-sm font-bold">Part-Time Task &amp; Review Scam</CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                      Prepaid Trap
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-1">
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                    Offers ₹3,000–₹5,000 daily for liking YouTube videos or rating Google maps. Early small payouts build trust before demanding large prepaid deposit tiers that cannot be withdrawn.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40 transition-colors shadow-xs">
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-foreground">
                        <Building2 className="size-4 text-red-600 dark:text-red-400" />
                      </div>
                      <CardTitle className="text-sm font-bold">Digital Arrest Extortion</CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                      Impersonation
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-1">
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                    Fraudsters impersonate CBI, Police, or Customs officers claiming illegal parcels or drug trafficking linked to your Aadhaar. They demand video interrogation and fund transfers to &ldquo;safety accounts&rdquo;.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator />

        {/* 5. Interactive Scam Defense FAQ (Shadcn Accordion) */}
        <section className="py-14 sm:py-18">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1 text-xs font-semibold gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-primary" />
                  <span>Defense Knowledge Base</span>
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Frequently Asked Defensive Questions
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                Essential cyber safety rules every Indian digital citizen should know.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-bold text-left">
                  Do I ever need to enter my UPI PIN to receive money?
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <strong>Never.</strong> Entering your UPI PIN authorizes money leaving your account. Receiving payments via UPI, Google Pay, PhonePe, or Paytm never requires scanning a QR code or typing your 4-digit or 6-digit PIN. If someone tells you to enter your PIN to &ldquo;claim cashback&rdquo; or &ldquo;receive funds&rdquo;, it is 100% a scam.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm font-bold text-left">
                  What is a &ldquo;Digital Arrest&rdquo; and does Indian Law permit it?
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <strong>Digital arrest does not exist in Indian Law.</strong> Neither the CBI, ED, Narcotics Control Bureau (NCB), nor State Police conduct arrests or judicial interrogations over Skype, WhatsApp, or Zoom video calls. Law enforcement officers will never demand that you transfer money into &ldquo;safe verification bank accounts&rdquo;.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm font-bold text-left">
                  What should I do if I already sent money or shared my OTP?
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Immediately call the <strong>National Cyber Crime Helpline at 1930</strong> (within the first 2-3 hours &mdash; the golden hour) to request a lien/freeze on the recipient account, block your ATM/credit cards and netbanking access with your bank, and file an official complaint on <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary underline">cybercrime.gov.in</a>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm font-bold text-left">
                  How does Scamfy protect my privacy when I check a message?
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Scamfy is engineered with privacy-by-design (SEC-01). Messages are triaged ephemerally in memory to extract indicators and evaluate threat heuristics. Raw message text is never indexed publicly, sold, or shared with third parties.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <Separator />

        {/* 6. Emergency 1930 & Official Reporting Banner (Shadcn Alert) */}
        <section className="py-12 bg-muted/10">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Alert variant="destructive" className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <PhoneCall className="h-5 w-5 text-destructive shrink-0" />
                  <AlertTitle className="text-lg font-extrabold text-foreground">
                    Active Financial Loss Emergency?
                  </AlertTitle>
                </div>
                <AlertDescription className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                  If you have already sent money or shared banking credentials in a scam, immediately call the <strong>National Cyber Crime Helpline at 1930</strong> or register a complaint on the official portal.
                </AlertDescription>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                <Button asChild variant="destructive" size="lg" className="font-bold w-full sm:w-auto shadow-md">
                  <a href="tel:1930">
                    <PhoneCall className="h-4 w-4" />
                    <span>Call 1930 Now</span>
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-bold w-full sm:w-auto">
                  <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">
                    <span>cybercrime.gov.in</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </Alert>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

