"use client";

import * as React from "react";
import { ShieldCheck, Sparkles, Trash2, Lock } from "lucide-react";
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
    label: "⚡ Electricity Cutoff",
    text: "Dear consumer, your electricity power will be disconnected tonight by 9:30 PM due to previous month unpaid bill. Call our electricity officer at 9876543210 immediately to avoid power cutoff.",
  },
  {
    id: "upi-pin",
    label: "💳 UPI PIN Cashback",
    text: "Congratulations! You have won Rs. 5,000 festival cashback reward. Scan this QR code and enter your UPI PIN to accept payment in your bank account.",
  },
  {
    id: "part-time",
    label: "💼 Part-Time Task",
    text: "Work from home part time job! Earn Rs 2,500 - 5,000 daily by liking YouTube videos and rating Google maps. Join our Telegram group @task_earning to receive daily payouts.",
  },
  {
    id: "digital-arrest",
    label: "👮 Digital Arrest / Police",
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

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full space-y-4", className)}
      {...props}
    >
      {/* Sample Presets */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Try sample scam messages:</span>
          </span>
          {text.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
              aria-label="Clear text input"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectPreset(preset.text)}
              className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 select-none cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea Input */}
      <div className="space-y-1.5">
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
          placeholder="Paste suspicious SMS, WhatsApp message, email, job offer, or UPI payment demand here..."
          className="min-h-[140px] text-sm leading-relaxed"
          aria-label="Suspicious message text for scam analysis"
        />
      </div>

      {/* Footer Controls & Submit */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          <span>Anonymous & private (SEC-01). Never published or indexed.</span>
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          leftIcon={<ShieldCheck className="h-4 w-4" />}
          className="w-full sm:w-auto font-semibold px-6 shadow-md"
        >
          {isLoading ? "Analyzing Threat Signals..." : "Analyze Message"}
        </Button>
      </div>
    </form>
  );
}
