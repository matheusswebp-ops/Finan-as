"use client";

import { CATEGORY_COLORS } from "@/lib/colors";
import { cn } from "@/lib/utils";

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "h-8 w-8 rounded-full transition-all",
            value === c
              ? "ring-2 ring-offset-2 ring-offset-surface scale-110"
              : "ring-1 ring-white/10 hover:scale-105"
          )}
          style={{ background: `hsl(var(--${c}))` }}
          aria-label={`Cor ${c}`}
        />
      ))}
    </div>
  );
}
