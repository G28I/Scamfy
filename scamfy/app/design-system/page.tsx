"use client";

import * as React from "react";
import {
  ShieldAlert,
  Moon,
  Sun,
  Search,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";

import { RiskBadge, type RiskLevel } from "@/components/domain/risk-badge";
import { UrgencyBanner } from "@/components/domain/urgency-banner";
import { IndicatorTag } from "@/components/domain/indicator-tag";
import { ConfidenceMeter } from "@/components/domain/confidence-meter";
import { TimelineItem } from "@/components/domain/timeline-item";
import { EvidenceDropzone } from "@/components/domain/evidence-dropzone";
import { StateFeedback } from "@/components/domain/state-feedback";

export default function DesignSystemPage() {
  const [isDark, setIsDark] = React.useState(true);
  const [feedbackState, setFeedbackState] = React.useState<"idle" | "loading" | "empty" | "error" | "partial">("idle");
  const [loadingMode, setLoadingMode] = React.useState<"spinner" | "skeleton">("spinner");

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark");
    }
  };

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Top Banner & Mode Toggle */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Scamfy Design System</h1>
              <p className="text-xs text-muted-foreground">Authoritative UI Primitives & Interaction Specs (Phase 4)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              leftIcon={isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            >
              {isDark ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-12 px-6 py-8">
        {/* Section 1: Emergency & Urgency Banners */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h2 className="text-xl font-bold tracking-tight">1. Emergency Guidance & Urgency Banner (`UX-02`)</h2>
            <p className="text-sm text-muted-foreground">
              Prominent, accessible emergency triage alerting victims of active financial fraud with 1930 hot dial.
            </p>
          </div>

          <UrgencyBanner
            title="CRITICAL: Money-Mule / Unauthorized Transfer Detected"
            description="If you have already sent money or transferred funds under pressure, immediately dial the National Cyber Crime Helpline 1930 to request transaction freezing with your bank."
            show1930CallToAction={true}
            actionLabel="View Golden-Hour Checklist"
            onActionClick={() => alert("Checklist opened (Presentation only)")}
          />
        </section>

        {/* Section 2: Scamfy 5 Risk Tiers */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h2 className="text-xl font-bold tracking-tight">2. Scam Risk Tiers (Color-Blind Safe Visual Language)</h2>
            <p className="text-sm text-muted-foreground">
              Risk states pair color with explicit text labels, distinct iconography, and geometric badges. Never color alone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(["SAFE", "CAUTION", "SUSPICIOUS", "HIGH_RISK", "CRITICAL"] as RiskLevel[]).map((level) => (
              <Card key={level} className="flex flex-col items-center justify-center p-4 text-center space-y-3">
                <RiskBadge level={level} size="lg" showPulse={level === "CRITICAL"} />
                <p className="text-xs text-muted-foreground">Tier: {level}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 3: Domain Components */}
        <section className="space-y-6">
          <div className="border-b border-border pb-2">
            <h2 className="text-xl font-bold tracking-tight">3. Scamfy Domain Interaction Primitives</h2>
            <p className="text-sm text-muted-foreground">
              Domain-specific presentation components: Indicator tags, confidence meters, timeline items, and evidence dropzones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Extracted Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Machine-Readable Indicator Tags</CardTitle>
                <CardDescription>Monospaced indicators with 1-click clipboard copy and accessible ARIA live feedback.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2.5">
                <IndicatorTag type="UPI_ID" value="paytmqr28100505@paytm" />
                <IndicatorTag type="PHONE" value="+91 98765 43210" />
                <IndicatorTag type="DOMAIN" value="https://sbi-rewards-redeem-bonus.xyz" />
                <IndicatorTag type="HANDLE" value="@tele_easy_earn_official" />
                <IndicatorTag type="BANK_ACC" value="SBIN0001234 - 987654321098" />
                <IndicatorTag type="SCRIPT" value="TASK-EARN-COMMISSION-V2" />
              </CardContent>
            </Card>

            {/* Confidence Meter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Analysis Confidence Meter</CardTitle>
                <CardDescription>Calibrated signal strength indicator clearly separated from risk severity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ConfidenceMeter level="high" signalCount={5} />
                <ConfidenceMeter level="medium" signalCount={2} />
                <ConfidenceMeter level="low" signalCount={1} />
              </CardContent>
            </Card>
          </div>

          {/* Timeline & Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Victim Incident Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Victim Incident Timeline (`CASE-02`)</CardTitle>
                <CardDescription>Chronological interaction and financial transfer records.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <TimelineItem
                    timestamp="2026-09-25 14:30"
                    eventType="Telegram Initial Contact"
                    description="Victim contacted with offer for daily YouTube video rating tasks offering ₹3,000/day."
                    counterparty="@task_hr_manager"
                    isDebit={false}
                    isFirst={true}
                  />
                  <TimelineItem
                    timestamp="2026-09-25 16:15"
                    eventType="UPI Security Deposit"
                    description="Instructed to deposit refundable security amount to unlock 'VIP Task 4'."
                    counterparty="fastpay@okaxis"
                    amount="5,000.00"
                    isDebit={true}
                  />
                  <TimelineItem
                    timestamp="2026-09-25 18:00"
                    eventType="Mule Transfer Request"
                    description="Instructed to receive ₹50,000 from third party and forward ₹45,000 to crypto merchant UPI."
                    counterparty="unknown_mule@ybl"
                    isDebit={true}
                    isLast={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Evidence Dropzone */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evidence File Dropzone</CardTitle>
                <CardDescription>Drag-and-drop zone with client-side file validation UI states.</CardDescription>
              </CardHeader>
              <CardContent>
                <EvidenceDropzone
                  onFilesSelected={(files) => console.log("Files attached:", files)}
                  maxSizeBytes={5 * 1024 * 1024}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 4: State Feedback (UX-05) */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h2 className="text-xl font-bold tracking-tight">4. Standardized State Feedback (`UX-05`)</h2>
            <p className="text-sm text-muted-foreground">
              Unified loading, empty, partial, and error states with clear user recovery paths.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Button
              variant={feedbackState === "idle" ? "default" : "outline"}
              size="sm"
              onClick={() => setFeedbackState("idle")}
            >
              Idle State
            </Button>
            <Button
              variant={feedbackState === "loading" ? "default" : "outline"}
              size="sm"
              onClick={() => setFeedbackState("loading")}
            >
              Loading State
            </Button>
            <Button
              variant={feedbackState === "empty" ? "default" : "outline"}
              size="sm"
              onClick={() => setFeedbackState("empty")}
            >
              Empty State
            </Button>
            <Button
              variant={feedbackState === "error" ? "default" : "outline"}
              size="sm"
              onClick={() => setFeedbackState("error")}
            >
              Error State
            </Button>
            <Button
              variant={feedbackState === "partial" ? "default" : "outline"}
              size="sm"
              onClick={() => setFeedbackState("partial")}
            >
              Partial State
            </Button>

            {feedbackState === "loading" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLoadingMode((m) => (m === "spinner" ? "skeleton" : "spinner"))}
                className="ml-auto"
              >
                Switch loading mode (current: {loadingMode})
              </Button>
            )}
          </div>

          <Card className="p-4">
            <StateFeedback
              state={feedbackState}
              loadingMode={loadingMode}
              onRetry={() => alert("Retry callback executed successfully")}
            >
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-6 text-center text-sm font-medium text-emerald-800 dark:text-emerald-300">
                ✅ Analysis Results Ready (Idle content loaded normally).
              </div>
            </StateFeedback>
          </Card>
        </section>

        {/* Section 5: Core UI Primitives */}
        <section className="space-y-6">
          <div className="border-b border-border pb-2">
            <h2 className="text-xl font-bold tracking-tight">5. Core Accessible UI Primitives (`components/ui/`)</h2>
            <p className="text-sm text-muted-foreground">
              Accessible buttons, inputs, dialog modals, tabs, accordions, badges, alerts, skeletons, and tooltips.
            </p>
          </div>

          {/* Badges and Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Badges & Variants</CardTitle>
                <CardDescription>Semantic status indicators with light and dark mode styling.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success">Verified</Badge>
                <Badge variant="warning">Pending Review</Badge>
                <Badge variant="destructive">Blocked</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Alerts</CardTitle>
                <CardDescription>Informational, warning, and emergency banners.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert variant="info">
                  <AlertTitle>Informational Note</AlertTitle>
                  <AlertDescription>Scam checks run in memory without storing plain personal data.</AlertDescription>
                </Alert>
                <Alert variant="warning">
                  <AlertTitle>Unregistered Entity</AlertTitle>
                  <AlertDescription>This domain was registered less than 7 days ago.</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Button Variants & Sizes (`UX-03`, `UX-04`)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button variant="default">Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="emergency">1930 Emergency</Button>
              <Button variant="default" isLoading>Loading</Button>
              <Button variant="default" disabled>Disabled</Button>
            </CardContent>
          </Card>

          {/* Inputs & Textarea */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Form Controls & Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Suspicious UPI ID or Phone"
                  placeholder="e.g. 9876543210@ybl"
                  leftIcon={<Search className="h-4 w-4" />}
                  helperText="Enter a phone number, UPI handle, or website URL"
                />
                <Input
                  label="Malicious Domain Input"
                  placeholder="Invalid input state"
                  defaultValue="http://malicious-link.tk"
                  error="High-risk malicious domain pattern matched"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scam Message Input (Textarea)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste suspicious SMS, WhatsApp message, or job offer text..."
                  maxLength={500}
                  showCharCount={true}
                  helperText="Input text is analyzed server-side and never stored with identifying personal information."
                />
              </CardContent>
            </Card>
          </div>

          {/* Dialogs, Tabs, Accordions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Modal Dialog */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Accessible Dialog Modal</CardTitle>
                <CardDescription>Focus trapping and Escape key support.</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Risk Details Modal</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mule Account Warning Details</DialogTitle>
                      <DialogDescription>
                        This payment instruction matches a known money-mule pattern where accounts receive and forward illegal proceeds.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg bg-muted p-4 text-xs space-y-2 font-mono">
                      <div>Pattern ID: MP-MULE-FORWARD-2026</div>
                      <div>Action: Immediate Bank Helpline Contact</div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Dismiss</Button>
                      </DialogClose>
                      <Button variant="emergency">Proceed with Caution</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Keyboard-Navigable Tabs</CardTitle>
                <CardDescription>Arrow key navigation (`UX-03`).</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signals">
                  <TabsList className="w-full">
                    <TabsTrigger value="signals" className="flex-1">Signals</TabsTrigger>
                    <TabsTrigger value="entities" className="flex-1">Entities</TabsTrigger>
                    <TabsTrigger value="rules" className="flex-1">Rules</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signals" className="text-xs text-muted-foreground pt-2">
                    3 high-risk urgency signals detected in message copy.
                  </TabsContent>
                  <TabsContent value="entities" className="text-xs text-muted-foreground pt-2">
                    Extracted 1 UPI ID, 1 Phone Number, 1 Telegram handle.
                  </TabsContent>
                  <TabsContent value="rules" className="text-xs text-muted-foreground pt-2">
                    Matched rule `RULE_PART_TIME_JOB_COMMISSION`.
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Accordion */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Accessible Accordion</CardTitle>
                <CardDescription>Collapsible explanation panels.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xs font-semibold">What is a Money Mule?</AccordionTrigger>
                    <AccordionContent>
                      A money mule is someone who transfers illegal money on behalf of others, often recruited under the guise of work-from-home or commission jobs.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-xs font-semibold">Is 1930 a Free Helpline?</AccordionTrigger>
                    <AccordionContent>
                      Yes, 1930 is the toll-free Citizen Financial Cyber Fraud Reporting System helpline operated by the Ministry of Home Affairs.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Skeletons, Tooltips, Empty State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Loading Skeleton & Tooltip</CardTitle>
                <CardDescription>Visual placeholders and contextual tooltips.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <LoadingSpinner size="sm" />
                  <span className="text-xs text-muted-foreground">Streaming Nemotron NIM token output...</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground">
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Inference telemetry is tracked for model quality.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Empty State Primitive</CardTitle>
                <CardDescription>Standardized zero-state component.</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No Incident Reports"
                  description="You have not filed any suspicious numbers or phishing links yet."
                  action={{
                    label: "Report New Indicator",
                    onClick: () => alert("Report flow initiated"),
                  }}
                />
              </CardContent>
              <CardFooter className="justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
                <span>Phase 4 Design System</span>
                <span>WCAG 2.1 AA Compliant</span>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
