import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const alertVariants = cva(
  "relative w-full rounded-xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        info: "bg-blue-50/50 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
        success:
          "bg-emerald-50/50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400",
        warning:
          "bg-amber-50/50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/30 dark:border-destructive/40 [&>svg]:text-destructive",
        emergency:
          "bg-risk-critical-bg text-risk-critical-text border-risk-critical-border font-medium shadow-md [&>svg]:text-risk-critical-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}

const defaultIcons = {
  default: <Info className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  destructive: <AlertCircle className="h-4 w-4" />,
  emergency: <ShieldAlert className="h-4 w-4" />,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", icon, children, ...props }, ref) => {
    const chosenIcon = icon !== undefined ? icon : defaultIcons[variant || "default"];
    const isUrgent = variant === "destructive" || variant === "emergency" || variant === "warning";

    return (
      <div
        ref={ref}
        role={isUrgent ? "alert" : "status"}
        aria-live={isUrgent ? "assertive" : "polite"}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {chosenIcon}
        <div>{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

export const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed text-muted-foreground", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";
