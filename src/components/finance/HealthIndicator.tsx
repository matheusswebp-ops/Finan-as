import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type HealthLevel = "good" | "watch" | "alert";

export function calcHealth(income: number, expense: number): HealthLevel {
  if (income === 0 && expense === 0) return "good";
  const ratio = expense / Math.max(1, income);
  if (income === 0 && expense > 0) return "alert";
  if (ratio < 0.7) return "good";
  if (ratio < 1) return "watch";
  return "alert";
}

export function HealthIndicator({
  level,
  className,
}: {
  level: HealthLevel;
  className?: string;
}) {
  const config = {
    good: {
      Icon: CheckCircle2,
      label: "Saudável",
      tone: "bg-success-soft text-success border-success/30",
      hint: "Você gastou menos do que recebeu este mês.",
    },
    watch: {
      Icon: AlertTriangle,
      label: "Atenção",
      tone: "bg-warning-soft text-warning border-warning/30",
      hint: "Suas saídas se aproximam das entradas.",
    },
    alert: {
      Icon: AlertCircle,
      label: "Crítico",
      tone: "bg-danger-soft text-danger border-danger/30",
      hint: "Suas saídas ultrapassaram as entradas.",
    },
  }[level];

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 flex items-start gap-3",
        config.tone,
        className
      )}
    >
      <config.Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="space-y-0.5 min-w-0">
        <p className="text-sm font-semibold leading-none">{config.label}</p>
        <p className="text-xs leading-snug opacity-90">{config.hint}</p>
      </div>
    </div>
  );
}
