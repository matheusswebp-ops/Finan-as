"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!bg-surface !border !border-border-strong !text-fg !rounded-2xl !shadow-2xl !backdrop-blur-xl",
          title: "!font-medium",
          description: "!text-fg-muted",
          actionButton: "!bg-primary !text-primary-fg",
          cancelButton: "!bg-surface-2 !text-fg-muted",
          success: "[&_svg]:!text-success",
          error: "[&_svg]:!text-danger",
        },
      }}
      {...props}
    />
  );
}
