import * as React from "react";
import { type LucideIcon, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    leftIcon?: React.ReactNode;
  };
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = HelpCircle,
  title,
  description,
  action,
  children,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center",
        className
      )}
      role="status"
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h4 className="text-base font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          leftIcon={action.leftIcon}
        >
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
