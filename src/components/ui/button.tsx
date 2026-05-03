"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-tight transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-fg shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.6)] hover:brightness-110 hover:shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.7)]",
        secondary:
          "bg-surface-2 text-fg border border-border hover:bg-surface-3 hover:border-border-strong",
        outline:
          "border border-border-strong bg-transparent text-fg hover:bg-white/[0.04] hover:border-primary/40",
        ghost:
          "bg-transparent text-fg hover:bg-white/[0.06]",
        soft:
          "bg-primary-soft text-primary hover:bg-primary/20",
        destructive:
          "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
        link:
          "text-primary underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-9 px-3.5 text-sm rounded-lg",
        md: "h-11 px-5 text-sm rounded-xl",
        lg: "h-12 px-6 text-base rounded-2xl",
        xl: "h-14 px-7 text-base rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
