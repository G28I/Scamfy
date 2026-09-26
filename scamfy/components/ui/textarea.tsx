import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      helperText,
      maxLength,
      showCharCount = false,
      id,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    const [uncontrolledLength, setUncontrolledLength] = React.useState<number>(() => {
      if (typeof defaultValue === "string") return defaultValue.length;
      return 0;
    });

    const isControlled = typeof value !== "undefined";
    const currentLength = isControlled
      ? typeof value === "string"
        ? value.length
        : String(value ?? "").length
      : uncontrolledLength;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) {
        setUncontrolledLength(e.target.value.length);
      }
      onChange?.(e);
    };

    return (
      <div className="w-full">
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />
        <div className="mt-1 flex items-center justify-between gap-2 text-xs">
          {error ? (
            <p id={errorId} className="font-medium text-destructive" role="alert">
              {error}
            </p>
          ) : helperText ? (
            <p id={helperId} className="text-muted-foreground">
              {helperText}
            </p>
          ) : (
            <span />
          )}
          {showCharCount && maxLength && (
            <span className="text-muted-foreground" aria-live="polite">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
