import type { Metadata } from "next";
import Link from "next/link";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/finance/PageHeader";
import { MonthRangeNav } from "@/components/finance/MonthRangeNav";
import { CopyPreviousMonthButton } from "@/components/finance/CopyPreviousMonthButton";
import { TransactionsList } from "@/components/finance/TransactionsList";
import { CategoryBreakdownPanel } from "./CategoryBreakdownPanel";
import { listTransactions, totalsForList } from "@/lib/queries/transactions";
import { getCategories } from "@/lib/queries/categories";
import { getCategoryBreakdown, getCategoryBreakdownForecast } from "@/lib/queries/balance";
import { brazilToday } from "@/lib/tz";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Despesas" };
export const dynamic = "force-dynamic";

type Tab = "paid" | "due" | "fixed" | "categories";

export default async function DespesasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const tab: Tab = (sp.tab as Tab) ?? "paid";

  const today = parseISO(brazilToday());
  const from = sp.from ?? format(startOfMonth(today), "yyyy-MM-dd");
  const to = sp.to ?? format(endOfMonth(today), "yyyy-MM-dd");

  const [paid, due, fixed, categories, breakdownPaid, breakdownForecast] =
    await Promise.all([
      listTransactions({ kind: "expense", status: "realized", from, to }),
      listTransactions({ kind: "expense", status: "forecast", from, to }),
      listTransactions({ kind: "expense", isRecurring: true, from, to }),
      getCategories(),
      getCategoryBreakdown("expense", from, to),
      getCategoryBreakdownForecast("expense", from, to),
    ]);

  const totalPago = totalsForList(paid).expense;
  const totalAPagar = totalsForList(due).expense;

  const totals =
    tab === "paid"
      ? totalsForList(paid)
      : tab === "due"
        ? totalsForList(due)
        : tab === "fixed"
          ? totalsForList(fixed)
          : null;

  return (
    <div>
      <PageHeader
        eyebrow="Saídas"
        title="Despesas"
        description="Acompanhe o que já foi pago, o que ainda está por vencer e a distribuição por categoria."
        actions={<CopyPreviousMonthButton kind="expense" referenceIso={from} />}
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card className="!p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-fg-muted font-semibold truncate">
            Pago
          </p>
          <p className="font-display text-lg sm:text-2xl font-semibold tabular-nums truncate">
            {formatBRL(totalPago)}
          </p>
        </Card>
        <Card className="!p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-fg-muted font-semibold truncate">
            A pagar
          </p>
          <p className="font-display text-lg sm:text-2xl font-semibold tabular-nums text-warning truncate">
            {formatBRL(totalAPagar)}
          </p>
        </Card>
        <Card className="!p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-fg-muted font-semibold truncate">
            Total
          </p>
          <p className="font-display text-lg sm:text-2xl font-semibold tabular-nums text-danger truncate">
            {formatBRL(totalPago + totalAPagar)}
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <TabLink current={tab} value="paid" label="Pago" />
        <TabLink current={tab} value="due" label="A Pagar" />
        <TabLink current={tab} value="fixed" label="Fixos" />
        <TabLink current={tab} value="categories" label="Detalhes por Categoria" />
      </div>

      <Card className="mb-5 !p-4 flex flex-wrap items-center justify-between gap-3">
        <MonthRangeNav />
        {totals && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-fg-muted font-semibold">
              {tab === "paid"
                ? "Total pago"
                : tab === "due"
                  ? "Total a pagar"
                  : "Total fixo do período"}
            </p>
            <p
              className={cn(
                "font-display text-2xl font-semibold tabular-nums",
                tab === "due" && "text-warning"
              )}
            >
              {formatBRL(totals.expense)}
            </p>
          </div>
        )}
      </Card>

      {tab === "paid" && (
        <TransactionsList
          txs={paid}
          categories={categories}
          emptyMessage="Nenhuma despesa paga no período."
        />
      )}

      {tab === "due" && (
        <TransactionsList
          txs={due}
          categories={categories}
          emptyMessage="Nenhuma despesa em aberto no período."
        />
      )}

      {tab === "fixed" && (
        <TransactionsList
          txs={fixed}
          categories={categories}
          emptyMessage="Nenhuma despesa fixa no período. Marque uma despesa como fixa no formulário (toggle 'Lançamento fixo') e ela aparece aqui."
        />
      )}

      {tab === "categories" && (
        <CategoryBreakdownPanel
          breakdownPaid={breakdownPaid}
          breakdownForecast={breakdownForecast}
          fromIso={from}
          toIso={to}
          kind="expense"
        />
      )}
    </div>
  );
}

function TabLink({
  current,
  value,
  label,
}: {
  current: Tab;
  value: Tab;
  label: string;
}) {
  const active = current === value;
  return (
    <Link
      href={`/despesas?tab=${value}`}
      scroll={false}
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-surface-2 border border-border-strong text-fg shadow-[0_2px_12px_-4px_hsl(var(--primary)/0.4)]"
          : "border border-transparent text-fg-muted hover:text-fg hover:bg-white/[0.04]"
      )}
    >
      {label}
    </Link>
  );
}
