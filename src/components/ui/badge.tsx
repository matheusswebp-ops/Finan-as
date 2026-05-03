import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight",
  {
    variants: {
      variant: {
        default:
          "bg-surface-2 border-border text-fg",
        primary:
          "bg-primary-soft border-primary/30 text-primary",
        success:
          "bg-success-soft border-success/30 text-success",
        danger:
          "bg-danger-soft border-danger/30 text-danger",
        warning:
          "bg-warning-soft border-warning/30 text-warning",
        outline:
          "bg-transparent border-border-strong text-fg-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
