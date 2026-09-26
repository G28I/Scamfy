"use client";

import * as React from "react";
import {
  ShieldCheck,
  XCircle,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  FileText,
  Clock,
  UserCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndicatorTag } from "@/components/domain/indicator-tag";
import { RiskBadge } from "@/components/domain/risk-badge";
import { type IndicatorType } from "@prisma/client";

export interface ModerationReportItem {
  id: string;
  reporterUserId: string;
  reporterEmail: string;
  patternId: string | null;
  indicatorType: IndicatorType;
  indicatorValue: string;
  category: string;
  description: string;
  status: string;
  moderatorNotes: string | null;
  createdAt: string;
  pattern: {
    id: string;
    reportCount: number;
    riskLevel: string;
    verificationStatus: string;
  } | null;
}

export function ModerationQueue() {
  const [reports, setReports] = React.useState<ModerationReportItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("PENDING");
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const fetchReports = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reports?status=${statusFilter}`, {
        headers: { "x-user-role": "moderator" },
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/admin/reports?status=${statusFilter}`, {
          headers: { "x-user-role": "moderator" },
        });
        if (!ignore && res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
        }
      } catch {
        if (!ignore) setReports([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [statusFilter]);

  const handleAction = async (reportId: string, action: "APPROVE" | "REJECT" | "DISMISS") => {
    setProcessingId(reportId);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "moderator",
          "x-user-id": "moderator_admin_1",
        },
        body: JSON.stringify({
          reportId,
          action,
          moderatorNotes: `Action ${action} executed by moderator`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to execute moderation action.");
      }

      setFeedback({ type: "success", text: data.message });
      fetchReports();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Moderation action failed.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <span>Community Intelligence Moderation Queue (REP-05)</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review user submissions and elevate confirmed threat patterns to MODERATOR_VERIFIED.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {st}
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={() => fetchReports()} aria-label="Refresh queue">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-lg p-3 text-xs flex items-center gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-200"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-xl border border-border bg-card/60 animate-pulse p-4" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card className="border-border p-8 text-center space-y-2">
          <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />
          <CardTitle className="text-base">Moderation Queue Clear</CardTitle>
          <p className="text-xs text-muted-foreground">
            No community reports matching &ldquo;{statusFilter}&rdquo; status.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <IndicatorTag type={report.indicatorType} value={report.indicatorValue} />
                    <span className="text-xs font-semibold text-foreground">
                      {report.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Status: <strong>{report.status}</strong>
                    </span>
                    {report.pattern && (
                      <RiskBadge level={report.pattern.riskLevel as never} size="sm" showIcon={false} />
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                <p className="text-xs text-foreground bg-muted/30 rounded-lg p-3 leading-relaxed">
                  <span className="font-semibold">Context: </span>
                  {report.description}
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-2 border-t border-border/40 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Submitted: {new Date(report.createdAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Reports for Pattern: {report.pattern?.reportCount || 1}
                    </span>
                  </div>

                  {report.status === "PENDING" && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        disabled={processingId === report.id}
                        onClick={() => handleAction(report.id, "APPROVE")}
                        leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Approve & Verify
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={processingId === report.id}
                        onClick={() => handleAction(report.id, "REJECT")}
                        leftIcon={<XCircle className="h-3.5 w-3.5" />}
                      >
                        Reject
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={processingId === report.id}
                        onClick={() => handleAction(report.id, "DISMISS")}
                        leftIcon={<AlertTriangle className="h-3.5 w-3.5" />}
                      >
                        Dismiss Pattern
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
