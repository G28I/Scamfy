"use client";

import * as React from "react";
import {
  Calculator,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ExternalLink,
  Scale,
  Percent,
  CheckCircle2,
  FileCheck,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  calculateLoanMetrics,
  calculateYieldMetrics,
  OFFICIAL_BENCHMARKS,
  type LoanInputParams,
  type YieldInputParams,
} from "@/lib/loan-calculator";
import { cn } from "@/lib/utils";

export interface LoanTrapAnalyzerProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultTab?: "loan" | "yield" | "rbi-checklist";
  initialLoanPrincipal?: number;
  initialTenureDays?: number;
}

const LOAN_PRESETS = [
  {
    id: "7day-trap",
    label: "7-Day Chinese Loan App",
    badge: "Predatory",
    params: {
      statedPrincipal: 5000,
      upfrontDeduction: 1500,
      totalRepayment: 5000,
      tenureDays: 7,
    },
  },
  {
    id: "advance-fee",
    label: "Mudra Advance-Fee Scam",
    badge: "Scam",
    params: {
      statedPrincipal: 100000,
      upfrontDeduction: 0,
      totalRepayment: 100000,
      tenureDays: 30,
    },
  },
  {
    id: "fair-nbfe",
    label: "Regulated NBFC Personal Loan",
    badge: "Fair",
    params: {
      statedPrincipal: 100000,
      upfrontDeduction: 2000,
      totalRepayment: 112000,
      tenureDays: 365,
    },
  },
];

const YIELD_PRESETS = [
  {
    id: "daily-crypto",
    label: "AI Crypto Arbitrage (2%/day)",
    badge: "Ponzi",
    params: {
      investmentAmount: 10000,
      promisedReturnPercentage: 2,
      frequency: "daily" as const,
    },
  },
  {
    id: "vip-telegram",
    label: "VIP Stock Signal (30%/mo)",
    badge: "BUDS Act",
    params: {
      investmentAmount: 25000,
      promisedReturnPercentage: 30,
      frequency: "monthly" as const,
    },
  },
  {
    id: "index-fund",
    label: "Nifty 50 Index Fund (~12% p.a.)",
    badge: "Regulated",
    params: {
      investmentAmount: 50000,
      promisedReturnPercentage: 12,
      frequency: "annual" as const,
    },
  },
];

/**
 * Interactive Loan & High-Return Trap Analyzer (LOAN-01, LOAN-02, LOAN-03, UX-03, UX-04, UX-05).
 *
 * Provides real-time mathematical APR and borrowing cost breakdown for predatory digital loans,
 * annualized yield reality checks for Ponzi schemes, and authoritative RBI regulatory checklists.
 *
 * @param props - Component properties including initial tab and calculation defaults
 * @returns React JSX element rendering the financial trap calculator
 */
export function LoanTrapAnalyzer({
  defaultTab = "loan",
  initialLoanPrincipal = 5000,
  initialTenureDays = 7,
  className,
  ...props
}: LoanTrapAnalyzerProps) {
  const [activeTab, setActiveTab] = React.useState<string>(defaultTab);

  // Loan Tab State
  const [loanParams, setLoanParams] = React.useState<LoanInputParams>({
    statedPrincipal: initialLoanPrincipal,
    upfrontDeduction: 1500,
    totalRepayment: 5000,
    tenureDays: initialTenureDays,
  });

  // Yield Tab State
  const [yieldParams, setYieldParams] = React.useState<YieldInputParams>({
    investmentAmount: 10000,
    promisedReturnPercentage: 2,
    frequency: "daily",
  });

  // Checklist State
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({
    kfsReceived: false,
    directAccountDisbursal: false,
    noContactPermission: false,
    coolingOffPeriod: false,
    rbiSachetVerified: false,
  });

  const toggleChecklist = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const loanMetrics = React.useMemo(() => {
    return calculateLoanMetrics(loanParams);
  }, [loanParams]);

  const yieldMetrics = React.useMemo(() => {
    return calculateYieldMetrics(yieldParams);
  }, [yieldParams]);

  const handleLoanPreset = (preset: typeof LOAN_PRESETS[number]) => {
    setLoanParams(preset.params);
  };

  const handleYieldPreset = (preset: typeof YIELD_PRESETS[number]) => {
    setYieldParams(preset.params);
  };

  return (
    <Card className={cn("border-border shadow-xl bg-card overflow-hidden", className)} {...props}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <CardHeader className="bg-muted/30 border-b border-border/80 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-semibold">
                Financial Risk Intelligence
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">LOAN-01 • LOAN-02 • LOAN-03</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Scale className="h-3.5 w-3.5 text-amber-500" />
              <span>Deterministic Math Engine</span>
            </div>
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pt-1 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <span>Predatory Loan &amp; High-Yield Trap Analyzer</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Dissect hidden upfront deductions, calculate true annualized borrowing APRs, expose mathematically
            impossible Ponzi yields, and verify RBI regulatory compliance.
          </CardDescription>

          <div className="pt-3">
            <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1">
              <TabsTrigger value="loan" className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5" />
                <span>Instant Loan APR</span>
              </TabsTrigger>
              <TabsTrigger value="yield" className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>High-Yield / Ponzi</span>
              </TabsTrigger>
              <TabsTrigger value="rbi-checklist" className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>RBI Verification</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* TAB 1: LOAN APR DISSECTOR */}
          <TabsContent value="loan" className="m-0 space-y-6">
            {/* Quick Presets */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>Quick Scenario Presets:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {LOAN_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleLoanPreset(preset)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all hover:border-primary/50 hover:bg-muted/50",
                      loanParams.statedPrincipal === preset.params.statedPrincipal &&
                        loanParams.tenureDays === preset.params.tenureDays &&
                        loanParams.upfrontDeduction === preset.params.upfrontDeduction
                        ? "border-primary bg-primary/10 font-semibold"
                        : "border-border/80 bg-muted/20 text-muted-foreground"
                    )}
                  >
                    <span className="text-foreground truncate pr-2">{preset.label}</span>
                    <Badge
                      variant={
                        preset.badge === "Predatory" || preset.badge === "Scam"
                          ? "destructive"
                          : "outline"
                      }
                      className="text-[10px] px-1.5 py-0 uppercase"
                    >
                      {preset.badge}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Controls Grid */}
            <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-xl border border-border bg-muted/20">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="stated-principal" className="font-semibold text-foreground">
                    Stated Loan Principal (₹)
                  </label>
                  <span className="font-mono text-muted-foreground">
                    ₹{loanParams.statedPrincipal.toLocaleString()}
                  </span>
                </div>
                <input
                  id="stated-principal"
                  type="number"
                  min={1000}
                  max={1000000}
                  step={500}
                  value={loanParams.statedPrincipal || ""}
                  onChange={(e) =>
                    setLoanParams((prev) => ({
                      ...prev,
                      statedPrincipal: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Stated Loan Principal in Rupees"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="upfront-deduction" className="font-semibold text-foreground">
                    Upfront Deduction / Processing Fee (₹)
                  </label>
                  <span className="font-mono text-rose-500 font-semibold">
                    -₹{loanParams.upfrontDeduction.toLocaleString()} (
                    {loanMetrics.upfrontDeductionPercentage.toFixed(1)}%)
                  </span>
                </div>
                <input
                  id="upfront-deduction"
                  type="number"
                  min={0}
                  max={loanParams.statedPrincipal}
                  step={100}
                  value={loanParams.upfrontDeduction || ""}
                  onChange={(e) =>
                    setLoanParams((prev) => ({
                      ...prev,
                      upfrontDeduction: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Upfront Deduction Fee in Rupees"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="total-repayment" className="font-semibold text-foreground">
                    Total Repayment Amount (₹)
                  </label>
                  <span className="font-mono text-muted-foreground">
                    ₹{loanParams.totalRepayment.toLocaleString()}
                  </span>
                </div>
                <input
                  id="total-repayment"
                  type="number"
                  min={1000}
                  max={2000000}
                  step={500}
                  value={loanParams.totalRepayment || ""}
                  onChange={(e) =>
                    setLoanParams((prev) => ({
                      ...prev,
                      totalRepayment: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Total Repayment Amount in Rupees"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="tenure-days" className="font-semibold text-foreground">
                    Loan Tenure (Days)
                  </label>
                  <span className="font-mono text-muted-foreground">
                    {loanParams.tenureDays} Days {loanParams.tenureDays <= 7 ? "⚠️" : ""}
                  </span>
                </div>
                <input
                  id="tenure-days"
                  type="number"
                  min={1}
                  max={1825}
                  step={1}
                  value={loanParams.tenureDays || ""}
                  onChange={(e) =>
                    setLoanParams((prev) => ({
                      ...prev,
                      tenureDays: Math.max(1, Number(e.target.value) || 1),
                    }))
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Loan Tenure in Days"
                />
              </div>
            </div>

            {/* Real-Time Mathematical Results Output Card */}
            <div
              className={cn(
                "rounded-xl border p-4 sm:p-5 space-y-4 transition-all",
                loanMetrics.riskLevel === "PREDATORY"
                  ? "border-rose-500/50 bg-rose-500/5"
                  : loanMetrics.riskLevel === "HIGH_COST"
                  ? "border-amber-500/50 bg-amber-500/5"
                  : "border-emerald-500/40 bg-emerald-500/5"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Simple Annualized Borrowing Cost Rate (Estimated Simple APR)
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                    {loanMetrics.annualizedSimpleApr.toLocaleString()}%{" "}
                    <span className="text-xs font-normal text-muted-foreground font-sans">p.a.</span>
                  </div>
                </div>

                <Badge
                  variant={
                    loanMetrics.riskLevel === "PREDATORY"
                      ? "destructive"
                      : loanMetrics.riskLevel === "HIGH_COST"
                      ? "outline"
                      : "secondary"
                  }
                  className={cn(
                    "text-xs font-bold px-2.5 py-1 uppercase tracking-wide",
                    loanMetrics.riskLevel === "HIGH_COST" &&
                      "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10",
                    loanMetrics.riskLevel === "NORMAL" &&
                      "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {loanMetrics.riskLevel === "PREDATORY"
                    ? "🚨 PREDATORY LENDING TRAP"
                    : loanMetrics.riskLevel === "HIGH_COST"
                    ? "⚠️ HIGH-COST CREDIT"
                    : "✓ STANDARD MARKET RATE"}
                </Badge>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg border border-border/60 bg-background">
                  <span className="text-muted-foreground block text-[11px]">Net Cash Disbursed</span>
                  <span className="text-sm font-bold text-foreground font-mono">
                    ₹{loanMetrics.netDisbursed.toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-border/60 bg-background">
                  <span className="text-muted-foreground block text-[11px]">Total Extra Borrowing Cost</span>
                  <span className="text-sm font-bold text-rose-500 font-mono">
                    ₹{loanMetrics.totalBorrowingCost.toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-border/60 bg-background">
                  <span className="text-muted-foreground block text-[11px]">Period Flat Rate</span>
                  <span className="text-sm font-bold text-foreground font-mono">
                    {loanMetrics.periodInterestRatePercentage.toFixed(1)}% / {loanParams.tenureDays}d
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-border/60 bg-background">
                  <span className="text-muted-foreground block text-[11px]">Daily Interest Rate</span>
                  <span className="text-sm font-bold text-foreground font-mono">
                    {loanMetrics.dailyInterestRatePercentage.toFixed(2)}%/day
                  </span>
                </div>
              </div>

              {/* Warnings List */}
              {loanMetrics.flags.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                    <span>Identified Risk Flags:</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    {loanMetrics.flags.map((flag, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
                <strong>Analysis Summary:</strong> {loanMetrics.riskSummary}
                <span className="block text-[11px] text-muted-foreground/80 mt-1">
                  * Note: Calculated as simple annualized borrowing cost for single-repayment loans (net disbursed vs total repayment). Installment-based loans with periodic amortizations can produce a different effective APR.
                </span>
              </p>
            </div>
          </TabsContent>

          {/* TAB 2: HIGH-YIELD PONZI CHECKER */}
          <TabsContent value="yield" className="m-0 space-y-6">
            {/* Quick Presets */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>Investment Offer Presets:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {YIELD_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleYieldPreset(preset)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all hover:border-primary/50 hover:bg-muted/50",
                      yieldParams.promisedReturnPercentage === preset.params.promisedReturnPercentage &&
                        yieldParams.frequency === preset.params.frequency
                        ? "border-primary bg-primary/10 font-semibold"
                        : "border-border/80 bg-muted/20 text-muted-foreground"
                    )}
                  >
                    <span className="text-foreground truncate pr-2">{preset.label}</span>
                    <Badge
                      variant={preset.badge === "Ponzi" ? "destructive" : "outline"}
                      className="text-[10px] px-1.5 py-0 uppercase"
                    >
                      {preset.badge}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid gap-4 sm:grid-cols-3 p-4 rounded-xl border border-border bg-muted/20">
              <div className="space-y-1.5">
                <label htmlFor="investment-principal" className="text-xs font-semibold text-foreground block">
                  Investment Principal (₹)
                </label>
                <input
                  id="investment-principal"
                  type="number"
                  min={100}
                  step={1000}
                  value={yieldParams.investmentAmount || ""}
                  onChange={(e) =>
                    setYieldParams((prev) => ({
                      ...prev,
                      investmentAmount: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Investment Principal in Rupees"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="promised-return" className="text-xs font-semibold text-foreground block">
                  Promised Return (%)
                </label>
                <input
                  id="promised-return"
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={yieldParams.promisedReturnPercentage || ""}
                  onChange={(e) =>
                    setYieldParams((prev) => ({
                      ...prev,
                      promisedReturnPercentage: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Promised Return Percentage"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="payout-frequency" className="text-xs font-semibold text-foreground block">
                  Payout Interval
                </label>
                <select
                  id="payout-frequency"
                  value={yieldParams.frequency}
                  onChange={(e) =>
                    setYieldParams((prev) => ({
                      ...prev,
                      frequency: e.target.value as YieldInputParams["frequency"],
                    }))
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Payout Frequency"
                >
                  <option value="daily">Daily (% per day)</option>
                  <option value="weekly">Weekly (% per week)</option>
                  <option value="monthly">Monthly (% per month)</option>
                  <option value="annual">Annual (% per year)</option>
                </select>
              </div>
            </div>

            {/* Mathematical Yield Reality Check Output Card */}
            <div
              className={cn(
                "rounded-xl border p-4 sm:p-5 space-y-4 transition-all",
                yieldMetrics.riskLevel === "PONZI_TRAP"
                  ? "border-rose-500/50 bg-rose-500/5"
                  : yieldMetrics.riskLevel === "HIGH_RISK"
                  ? "border-amber-500/50 bg-amber-500/5"
                  : "border-emerald-500/40 bg-emerald-500/5"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Effective Annual Yield (Simple APY)
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                    {yieldMetrics.annualizedSimpleYieldPercentage.toLocaleString()}%{" "}
                    <span className="text-xs font-normal text-muted-foreground font-sans">p.a.</span>
                  </div>
                </div>

                <Badge
                  variant={yieldMetrics.riskLevel === "PONZI_TRAP" ? "destructive" : "outline"}
                  className={cn(
                    "text-xs font-bold px-2.5 py-1 uppercase tracking-wide",
                    yieldMetrics.riskLevel === "HIGH_RISK" &&
                      "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10",
                    yieldMetrics.riskLevel === "REASONABLE" &&
                      "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {yieldMetrics.riskLevel === "PONZI_TRAP"
                    ? "🚨 EXTREME YIELD RISK (PONZI / HYIP INDICATOR)"
                    : yieldMetrics.riskLevel === "HIGH_RISK"
                    ? "⚠️ UNREGULATED YIELD WARNING"
                    : "✓ STANDARD CAPITAL MARKET YIELD"}
                </Badge>
              </div>

              {/* Benchmark Comparisons */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold text-foreground">
                  Official Indian Regulatory &amp; Market Benchmarks:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg border border-border/70 bg-background space-y-0.5">
                    <span className="text-muted-foreground block text-[11px]">RBI Policy Repo Rate</span>
                    <span className="font-mono font-bold text-foreground">
                      {OFFICIAL_BENCHMARKS.rbiRepoRatePercentage}% p.a.
                    </span>
                    <span className="text-[10px] text-muted-foreground block">Oct 2026 Policy</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/70 bg-background space-y-0.5">
                    <span className="text-muted-foreground block text-[11px]">Bank Fixed Deposit</span>
                    <span className="font-mono font-bold text-foreground">
                      ~{OFFICIAL_BENCHMARKS.bankFixedDepositPercentage}% p.a.
                    </span>
                    <span className="text-[10px] text-muted-foreground block">1-Year Term Average</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/70 bg-background space-y-0.5">
                    <span className="text-muted-foreground block text-[11px]">Nifty 50 Historic CAGR</span>
                    <span className="font-mono font-bold text-foreground">
                      ~{OFFICIAL_BENCHMARKS.niftyHistoricalCagrPercentage}% p.a.
                    </span>
                    <span className="text-[10px] text-muted-foreground block">10-Yr Equity Rolling</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/70 bg-background space-y-0.5">
                    <span className="text-muted-foreground block text-[11px]">High-Yield Anomaly</span>
                    <span className="font-mono font-bold text-rose-500">
                      &gt;{OFFICIAL_BENCHMARKS.unregulatedHighYieldAnomalyThresholdPercentage}% p.a.
                    </span>
                    <span className="text-[10px] text-muted-foreground block">Product Risk Heuristic</span>
                  </div>
                </div>
              </div>

              {/* Warnings List */}
              {yieldMetrics.flags.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    {yieldMetrics.flags.map((flag, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
                <strong>Regulatory &amp; Market Notice:</strong> {yieldMetrics.riskSummary}
              </p>
            </div>
          </TabsContent>

          {/* TAB 3: RBI REGULATORY CHECKLIST */}
          <TabsContent value="rbi-checklist" className="m-0 space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <FileCheck className="h-5 w-5" />
              <h3>RBI Digital Lending Regulatory Compliance Checklist (LOAN-03)</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Under RBI Digital Lending Directives (2022–2023), every legitimate digital lending app (DLA)
              must satisfy these 5 statutory conditions. If any condition is violated, the loan app is likely illegal.
            </p>

            <div className="space-y-2.5">
              {[
                {
                  id: "kfsReceived",
                  title: "1. Key Fact Statement (KFS) Provided Before Loan Agreement",
                  desc: "The lender must deliver an unambiguous KFS stating the Annual Percentage Rate (APR), processing fees, recovery agent details, and cooling-off period.",
                },
                {
                  id: "directAccountDisbursal",
                  title: "2. Direct Bank-to-Bank Disbursal (No Third-Party VPAs)",
                  desc: "Funds must disburse directly from the Regulated Entity's (Bank/NBFC) bank account to the borrower's account without passing through unverified personal UPI handles.",
                },
                {
                  id: "noContactPermission",
                  title: "3. Zero Mobile Contact Book & Gallery Permission Demands",
                  desc: "RBI strictly prohibits lending apps from demanding access to mobile contacts, SMS logs, camera, or photos (only one-time camera KYC is permitted with consent).",
                },
                {
                  id: "coolingOffPeriod",
                  title: "4. Statutory Cooling-off / Look-up Exit Period",
                  desc: "Borrowers must be provided an explicit cooling-off window to exit the loan without penalty by returning principal and proportionate interest.",
                },
                {
                  id: "rbiSachetVerified",
                  title: "5. Listed on RBI Sachet Portal & Regulated NBFC Directory",
                  desc: "The lending service provider (LSP) and app name must be publicly listed on the partnering RBI-registered NBFC/Bank official website.",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors text-left",
                    checkedItems[item.id]
                      ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                      : "border-border/70 bg-card hover:bg-muted/30"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checkedItems[item.id])}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary mt-0.5"
                    aria-label={item.title}
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-semibold text-foreground">{item.title}</h5>
                      {checkedItems[item.id] && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* External Links Verification Box */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Lock className="h-4 w-4 text-emerald-500" />
                <span>Verify Lending Apps on Official Indian Portals</span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <a
                  href="https://sachet.rbi.org.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground">RBI Sachet Portal</span>
                    <div className="text-xs font-bold text-foreground">sachet.rbi.org.in</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-primary" />
                </a>

                <a
                  href="https://www.rbi.org.in/scripts/BS_NBFCList.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground">RBI Registered NBFC List</span>
                    <div className="text-xs font-bold text-foreground">rbi.org.in/NBFCList</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-primary" />
                </a>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
