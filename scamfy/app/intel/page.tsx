"use client";

import * as React from "react";
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  Calendar,
  RotateCcw,
  Info,
  Radio,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { RiskBadge } from "@/components/domain/risk-badge";
import { IndicatorTag } from "@/components/domain/indicator-tag";
import { ReportIndicatorDialog } from "@/components/domain/report-indicator-dialog";
import { IndicatorType, type RiskLevel, type VerificationStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface PatternItem {
  id: string;
  indicatorType: IndicatorType;
  indicatorValue: string;
  category: string;
  riskLevel: RiskLevel;
  verificationStatus: VerificationStatus;
  reportCount: number;
  firstReportedAt: string;
  lastReportedAt: string;
}

export default function IntelPage() {
  const [activeTab, setActiveTab] = React.useState<"verified" | "community">("verified");
  const [selectedType, setSelectedType] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [patterns, setPatterns] = React.useState<PatternItem[]>([]);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [reportModalOpen, setReportModalOpen] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const fetchPatterns = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("tier", activeTab);
      if (selectedType !== "ALL") {
        params.set("indicatorType", selectedType);
      }
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const res = await fetch(`/api/patterns?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPatterns(data.patterns || []);
        setTotalCount(data.total || 0);
      } else {
        setPatterns([]);
        setTotalCount(0);
      }
    } catch {
      setPatterns([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedType, searchQuery]);

  React.useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const params = new URLSearchParams();
        params.set("tier", activeTab);
        if (selectedType !== "ALL") {
          params.set("indicatorType", selectedType);
        }
        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }

        const res = await fetch(`/api/patterns?${params.toString()}`);
        if (!ignore) {
          if (res.ok) {
            const data = await res.json();
            setPatterns(data.patterns || []);
            setTotalCount(data.total || 0);
          } else {
            setPatterns([]);
            setTotalCount(0);
          }
        }
      } catch {
        if (!ignore) {
          setPatterns([]);
          setTotalCount(0);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [activeTab, selectedType, searchQuery]);

  const handleCopyValue = async (id: string, value: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-8">
          {/* 1. Threat Intel Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/80 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
                <Radio className="h-3.5 w-3.5 text-primary" />
                <span>Defensive Threat Intelligence Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                Community Scam Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Explore crowd-sourced threat indicators, fake customer care numbers, phishing domains, and known UPI payment handles reported across India.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="default"
                onClick={() => setReportModalOpen(true)}
                leftIcon={<PlusCircle className="h-4 w-4" />}
                className="font-bold shadow-md"
              >
                Report Suspicious Indicator
              </Button>
            </div>
          </div>

          {/* 2. Verification Tier Tabs (REP-04) */}
          <div className="space-y-4">
            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("verified");
                  setLoading(true);
                }}
                className={cn(
                  "flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer",
                  activeTab === "verified"
                    ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Verified Pattern Signatures</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("community");
                  setLoading(true);
                }}
                className={cn(
                  "flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer",
                  activeTab === "community"
                    ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/20 dark:bg-amber-950/10"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Unverified Community Reports</span>
              </button>
            </div>

            {/* Strict Tier Disclosure Callouts */}
            {activeTab === "verified" ? (
              <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 p-4 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3 shadow-xs">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Verified Threat Pattern Signatures</p>
                  <p className="leading-relaxed opacity-90">
                    All indicators in this view have undergone human moderator triage and cross-verification. Indicators reflect crowd-sourced technical signals and do not constitute a legal or judicial determination (AI-05).
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Unverified Community Submissions</p>
                  <p className="leading-relaxed opacity-90">
                    These indicators were reported by community users and are queued for moderator verification. They are NOT confirmed threat signatures and must not be treated as authoritative findings.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Search Bar & Filter Strip */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card border border-border p-3 rounded-xl shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search indicator, VPA, phone, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap font-medium pr-1">Type:</span>
              {["ALL", "UPI_ID", "PHONE", "DOMAIN", "HANDLE", "BANK_ACC", "SCRIPT"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer select-none",
                    selectedType === type
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {type === "ALL" ? "All" : type.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Threat Indicators Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-44 rounded-2xl border border-border bg-card/60 animate-pulse p-6" />
              ))}
            </div>
          ) : patterns.length === 0 ? (
            <Card className="border-border p-10 text-center space-y-4">
              <Info className="h-10 w-10 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No Threat Patterns Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchQuery
                    ? `No indicators matching "${searchQuery}". Try a different keyword or reset filters.`
                    : "No indicators currently listed in this category."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("ALL");
                }}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Reset Filters
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>Showing <strong>{patterns.length}</strong> of <strong>{totalCount}</strong> indicators</span>
                <span className="font-mono text-[11px]">Tier: {activeTab.toUpperCase()}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patterns.map((item) => {
                  const isVerified = item.verificationStatus === "MODERATOR_VERIFIED";
                  const isCopied = copiedId === item.id;

                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        "border hover:shadow-md transition-all rounded-xl overflow-hidden",
                        isVerified
                          ? "border-border hover:border-emerald-500/40"
                          : "border-amber-200 dark:border-amber-900/40 hover:border-amber-500/50"
                      )}
                    >
                      <CardHeader className="pb-3 border-b border-border/50 bg-muted/15">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <IndicatorTag type={item.indicatorType} value={item.indicatorValue} />
                              <button
                                type="button"
                                onClick={() => handleCopyValue(item.id, item.indicatorValue)}
                                className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="Copy indicator value"
                              >
                                {isCopied ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs font-bold text-foreground truncate">
                              {formatCategoryLabel(item.category)}
                            </p>
                          </div>
                          <RiskBadge level={item.riskLevel} size="sm" showIcon={false} />
                        </div>
                      </CardHeader>

                      <CardContent className="pt-4 space-y-3 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Verified Pattern Signature
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-bold">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Unverified Community Report
                              </span>
                            )}
                          </span>

                          <span className="font-mono font-semibold rounded bg-muted px-2 py-0.5 text-[11px]">
                            {item.reportCount} {item.reportCount === 1 ? "report" : "reports"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 border-t border-border/40 pt-2.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last seen: {new Date(item.lastReportedAt).toLocaleDateString()}
                          </span>
                          <span>First reported: {new Date(item.firstReportedAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Report Indicator Dialog */}
          <ReportIndicatorDialog
            open={reportModalOpen}
            onOpenChange={setReportModalOpen}
            onSuccess={() => fetchPatterns()}
          />

          {/* 6. Footer Transparency Notice */}
          <div className="rounded-xl bg-muted/30 border border-border/60 p-5 text-xs text-muted-foreground leading-relaxed text-center space-y-1">
            <p className="font-bold text-foreground">
              Anti-Vigilantism &amp; Defensive Threat Intelligence Notice (AI-05, OOS-04)
            </p>
            <p className="max-w-3xl mx-auto">
              Scamfy Community Intelligence functions strictly as an educational cyber safety utility. Indicators represent crowd-sourced technical signals and do not constitute formal criminal accusations, judicial verdicts, or public blacklists of individuals.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function formatCategoryLabel(cat: string): string {
  switch (cat) {
    case "UPI_REVERSE_PAYMENT_FRAUD":
      return "UPI PIN Reverse Fraud";
    case "UTILITY_ELECTRICITY_FRAUD":
      return "Utility Cutoff Extortion";
    case "IMPERSONATION_POLICE_EXTORTION":
      return "Digital Arrest Extortion";
    case "TASK_COMMISSION_FRAUD":
      return "Part-Time Task Scam";
    case "BANK_KYC_PHISHING":
      return "Bank KYC Phishing";
    case "PREDATORY_LOAN_FRAUD":
      return "Predatory Loan Trap";
    case "INVESTMENT_STOCK_FRAUD":
      return "VIP Stock Signal Group";
    default:
      return cat.replace(/_/g, " ");
  }
}
