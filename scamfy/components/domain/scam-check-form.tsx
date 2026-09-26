"use client";

import * as React from "react";
import { ShieldCheck, Sparkles, Trash2, Lock, Clipboard, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ScamCheckFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onAnalyze: (text: string) => void | Promise<void>;
  isLoading?: boolean;
  initialText?: string;
}

export const SAMPLE_PRESETS = [
  {
    id: "electricity",
    label: "⚡ Electricity Cutoff Notice",
    badge: "Utility Fraud",
    text: "Dear consumer, your electricity power will be disconnected tonight by 9:30 PM due to previous month unpaid bill. Call our electricity officer at 9876543210 immediately to avoid power cutoff.",
  },
  {
    id: "upi-pin",
    label: "💳 Fake Cashback & QR Collect",
    badge: "UPI Fraud",
    text: "Congratulations! You have won Rs. 5,000 festival cashback reward. Scan this QR code and enter your UPI PIN to accept payment in your bank account.",
  },
  {
    id: "part-time",
    label: "💼 Telegram Task & YouTube Job",
    badge: "Job Scam",
    text: "Work from home part time job! Earn Rs 2,500 - 5,000 daily by liking YouTube videos and rating Google maps. Join our Telegram group @task_earning to receive daily payouts.",
  },
  {
    id: "digital-arrest",
    label: "🚨 Digital Arrest & CBI Extortion",
    badge: "Extortion",
    text: "Police Department & Narcotics Bureau Notice: An illegal parcel containing contraband has been intercepted under your Aadhaar ID. A digital arrest warrant is issued. Join WhatsApp video call immediately.",
  },
];

const MAX_CHARS = 5000;

export function ScamCheckForm({
  onAnalyze,
  isLoading = false,
  initialText = "",
  className,
  ...props
}: ScamCheckFormProps) {
  const [text, setText] = React.useState(initialText);
  const [inputError, setInputError] = React.useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setInputError(null);

    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 3) {
      setInputError("Please enter at least 3 characters of suspicious message text.");
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setInputError(`Message exceeds maximum limit of ${MAX_CHARS.toLocaleString()} characters.`);
      return;
    }

    onAnalyze(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPreset = (presetText: string) => {
    setText(presetText);
    setInputError(null);
  };

  const handleClear = () => {
    setText("");
    setInputError(null);
  };

  const handlePaste = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          setText(clipText);
          setInputError(null);
        }
      }
    } catch {
      // Clipboard read permission might not be granted
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full space-y-5", className)}
      {...props}
    >
      {/* 1. Quick Scenario Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5 text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Try sample Indian scam patterns:</span>
          </span>
          {text.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1.5 py-0.5"
              aria-label="Clear text input"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = text === preset.text;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectPreset(preset.text)}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/40 font-semibold shadow-xs"
                    : "border-border bg-card/80 text-muted-foreground hover:border-primary/40 hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <span className="font-medium text-foreground truncate pr-2">
                  {preset.label}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground shrink-0 uppercase">
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Input Canvas */}
      <div className="relative rounded-xl border border-border bg-background shadow-inner transition-focus">
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-3.5 py-2 text-xs text-muted-foreground">
          <span className="font-mono font-semibold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            <span>Message Content Canvas</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePaste}
              disabled={isLoading}
              className="inline-flex items-center gap-1 rounded bg-card border border-border px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Paste from clipboard"
            >
              <Clipboard className="h-3 w-3" />
              <span>Paste Clipboard</span>
            </button>
          </div>
        </div>

        <div className="p-1">
          <Textarea
            id="scam-check-input"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (inputError) setInputError(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            maxLength={MAX_CHARS}
            showCharCount
            error={inputError || undefined}
            placeholder="Paste suspicious SMS, WhatsApp message, Telegram job offer, electricity cutoff alert, or payment VPA here..."
            className="min-h-[160px] border-0 bg-transparent text-sm leading-relaxed focus-visible:ring-0 shadow-none resize-y"
            aria-label="Suspicious message text for scam analysis"
          />
        </div>
      </div>

      {/* 3. Footer Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          <span>
            <strong>100% Anonymous &amp; Private (SEC-01).</strong> Raw text is processed ephemerally and never indexed publicly.
          </span>
        </div>

        <div className="flex items-center gap-2 sm:self-end">
          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading}
            leftIcon={<ShieldCheck className="h-4 w-4" />}
            rightIcon={<CornerDownLeft className="h-3.5 w-3.5 opacity-60 hidden sm:inline-block" />}
            className="w-full sm:w-auto font-bold px-7 shadow-md transition-all active:scale-[0.99]"
          >
            {isLoading ? "Running Threat Heuristics..." : "Analyze Message"}
          </Button>
        </div>
      </div>
    </form>
  );
}
