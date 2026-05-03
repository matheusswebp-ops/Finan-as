import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercentDelta } from "@/lib/format";

export type Direction = "up-good" | "down-good" | "neutral";

export function MoneyDelta({
  delta,
  direction = "up-good",
  className,
}: {
  delta: number | null;
  direction?: Direction;
  className?: string;
}) {
  if (delta == null) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-fg-muted", className)}>
        <Minus className="h-3 w-3" />
        <span>sem dado</span>
      </span>
    );
  }

  const positive = delta > 0;
  const negative = delta < 0;
  const isGood =
    direction === "neutral"
      ? null
      : direction === "up-good"
        ? positive
        : negative;

  const tone =
    isGood === null
      ? "text-fg-muted"
      : isGood
        ? "text-success"
        : delta === 0
          ? "text-fg-muted"
          : "text-danger";

  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium tabular-nums rounded-full px-2 py-0.5",
        tone === "text-success" && "bg-success-soft",
        tone === "text-danger" && "bg-danger-soft",
        tone,
        className
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {formatPercentDelta(delta)}
    </span>
  );
}
