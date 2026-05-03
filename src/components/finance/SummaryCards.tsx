import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";

export function SummaryCards({
  income,
  expense,
  balance,
  count,
}: {
  income: number;
  expense: number;
  balance: number;
  count: number;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
      <Card interactive className="!p-4 sm:!p-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-success-soft text-success">
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <p className="text-xs text-fg-muted">Entradas</p>
        </div>
        <p className="font-display text-xl sm:text-2xl font-medium tabular-nums">
          {formatBRL(income)}
        </p>
      </Card>

      <Card interactive className="!p-4 sm:!p-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-danger-soft text-danger">
            <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <p className="text-xs text-fg-muted">Saídas</p>
        </div>
        <p className="font-display text-xl sm:text-2xl font-medium tabular-nums">
          {formatBRL(expense)}
        </p>
      </Card>

      <Card interactive className="!p-4 sm:!p-5 space-y-2 col-span-2 lg:col-span-1">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary-soft text-primary">
            <Wallet className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <p className="text-xs text-fg-muted">Saldo</p>
        </div>
        <p
          className={`font-display text-xl sm:text-2xl font-medium tabular-nums ${
            balance < 0 ? "text-danger" : ""
          }`}
        >
          {formatBRL(balance)}
        </p>
      </Card>

      <Card interactive className="!p-4 sm:!p-5 space-y-2 col-span-2 lg:col-span-1">
        <p className="text-xs text-fg-muted">Lançamentos</p>
        <p className="font-display text-xl sm:text-2xl font-medium tabular-nums">
          {count.toString().padStart(2, "0")}
        </p>
      </Card>
    </div>
  );
}
