"use client";

import * as React from "react";
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  Calendar,
  Layers,
  RotateCcw,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const [loading, setLoading] = React.useState(true);
  const [reportModalOpen, setReportModalOpen] = React.useState(false);

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
      } else {
        setPatterns([]);
      }
    } catch {
      setPatterns([]);
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
          } else {
            setPatterns([]);
          }
        }
      } catch {
        if (!ignore) setPatterns([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [activeTab, selectedType, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Community Scam Intelligence
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Vetted threat patterns, phishing domains, and active fraudulent indicators reported across India.
          </p>
        </div>

        <Button
          variant="default"
          onClick={() => setReportModalOpen(true)}
          leftIcon={<PlusCircle className="h-4 w-4" />}
          className="self-start md:self-auto shadow-sm"
        >
          Report Suspicious Indicator
        </Button>
      </div>

      {/* 2. Verification Tier Tabs (REP-04) */}
      <div className="space-y-4">
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("verified")}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors",
              activeTab === "verified"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Verified Pattern Signatures</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("community")}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors",
              activeTab === "community"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Unverified Community Reports</span>
          </button>
        </div>

        {/* Tier Disclosure Banners */}
        {activeTab === "verified" ? (
          <div className="rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 p-3.5 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Verified Intelligence: </strong> All indicators in this view have undergone human moderator triage and cross-verification. Automated indicators do not constitute a legal determination (AI-05).
            </span>
          </div>
        ) : (
          <div className="rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Unverified Community Submissions: </strong> These indicators were submitted by community users and are queued for moderator review. They are not yet verified threat signatures.
            </span>
          </div>
        )}
      </div>

      {/* 3. Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search indicator, domain, or handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Type:</span>
          {["ALL", "UPI_ID", "PHONE", "DOMAIN", "HANDLE", "BANK_ACC", "SCRIPT"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap",
                selectedType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {type === "ALL" ? "All Types" : type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Threat Indicators Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-40 rounded-xl border border-border bg-card/60 animate-pulse p-5" />
          ))}
        </div>
      ) : patterns.length === 0 ? (
        <Card className="border-border p-8 text-center space-y-3">
          <Info className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No Threat Patterns Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No indicators matching "${searchQuery}". Try a different search term or filter.`
              : "No indicators currently listed in this category."}
          </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((item) => (
            <Card key={item.id} className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <IndicatorTag type={item.indicatorType} value={item.indicatorValue} />
                    <p className="text-xs font-semibold text-foreground pt-1">
                      {formatCategoryLabel(item.category)}
                    </p>
                  </div>
                  <RiskBadge level={item.riskLevel} size="sm" showIcon={false} />
                </div>
              </CardHeader>

              <CardContent className="pt-3.5 space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {item.verificationStatus === "MODERATOR_VERIFIED" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified Pattern Signature
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Unverified Community Report
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-muted-foreground font-semibold">
                    {item.reportCount} {item.reportCount === 1 ? "report" : "reports"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 border-t border-border/40 pt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last seen: {new Date(item.lastReportedAt).toLocaleDateString()}
                  </span>
                  <span>First reported: {new Date(item.firstReportedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 5. Report Indicator Dialog */}
      <ReportIndicatorDialog
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        onSuccess={() => fetchPatterns()}
      />

      {/* 6. Footer Transparency Notice */}
      <div className="rounded-lg bg-muted/20 border border-border/50 p-4 text-xs text-muted-foreground leading-relaxed text-center">
        <strong>Transparency & Legal Notice: </strong> Scamfy Community Intelligence operates as an open defensive cybersecurity repository. Indicators reflect crowd-sourced technical signals and human moderator verification; they do not constitute formal criminal or legal adjudications (AI-05, OOS-04).
      </div>
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
