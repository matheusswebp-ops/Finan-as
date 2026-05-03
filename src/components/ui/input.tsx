import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", startIcon, endIcon, ...props }, ref) => {
    if (startIcon || endIcon) {
      return (
        <div className={cn("relative flex items-center", className)}>
          {startIcon && (
            <span className="absolute left-3.5 text-fg-muted pointer-events-none flex items-center">
              {startIcon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "h-11 w-full rounded-xl bg-surface-2 border border-border px-4 text-sm placeholder:text-fg-muted text-fg",
              "transition-colors focus:border-primary/50 focus:bg-surface focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              startIcon && "pl-10",
              endIcon && "pr-10"
            )}
            {...props}
          />
          {endIcon && (
            <span className="absolute right-3.5 text-fg-muted flex items-center">
              {endIcon}
            </span>
          )}
        </div>
      );
    }
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-11 w-full rounded-xl bg-surface-2 border border-border px-4 text-sm placeholder:text-fg-muted text-fg",
          "transition-colors focus:border-primary/50 focus:bg-surface focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
