"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  /** Value in cents (integer). */
  value: number;
  onChange: (cents: number) => void;
  variant?: "default" | "hero";
}

/** Currency-formatted input that emits integer cents. */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, variant = "default", className, ...props }, ref) => {
    const display = React.useMemo(() => formatCents(value), [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      const cents = digits ? parseInt(digits, 10) : 0;
      onChange(cents);
    };

    return (
      <div className={cn("relative flex items-center", variant === "hero" && "")}>
        <span
          className={cn(
            "absolute left-4 select-none pointer-events-none text-fg-muted",
            variant === "hero" && "left-0 text-2xl text-fg-muted"
          )}
        >
          R$
        </span>
        <input
          ref={ref}
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          className={cn(
            variant === "default" &&
              "h-11 w-full rounded-xl bg-surface-2 border border-border pl-10 pr-4 text-sm tabular-nums focus:border-primary/50 focus:bg-surface focus:outline-none transition-colors",
            variant === "hero" &&
              "w-full bg-transparent border-0 pl-10 pr-0 font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight tabular-nums focus:outline-none placeholder:text-fg-muted",
            className
          )}
          placeholder={variant === "hero" ? "0,00" : "0,00"}
          {...props}
        />
      </div>
    );
  }
);
MoneyInput.displayName = "MoneyInput";

function formatCents(cents: number): string {
  if (!cents) return "";
  const abs = Math.abs(cents);
  const reais = Math.floor(abs / 100);
  const change = (abs % 100).toString().padStart(2, "0");
  const formattedReais = reais.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formattedReais},${change}`;
}
