import type { Metadata } from "next";
import Link from "next/link";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/finance/PageHeader";
import { MonthRangeNav } from "@/components/finance/MonthRangeNav";
import { CopyPreviousMonthButton } from "@/components/finance/CopyPreviousMonthButton";
import { TransactionsList } from "@/components/finance/TransactionsList";
import { CategoryBreakdownPanel } from "../despesas/CategoryBreakdownPanel";
import { listTransactions, totalsForList } from "@/lib/queries/transactions";
import { getCategories } from "@/lib/queries/categories";
import { getCategoryBreakdown, getCategoryBreakdownForecast } from "@/lib/queries/balance";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Entradas" };
export const dynamic = "force-dynamic";

type Tab = "received" | "due" | "fixed" | "categories";

export default async function EntradasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const tab: Tab = (sp.tab as Tab) ?? "received";

  const today = new Date();
  const from = sp.from ?? format(startOfMonth(today), "yyyy-MM-dd");
  const to = sp.to ?? format(endOfMonth(today), "yyyy-MM-dd");

  const [received, due, fixed, categories, breakdownPaid, breakdownForecast] =
    await Promise.all([
      listTransactions({ kind: "income", status: "realized", from, to }),
      listTransactions({ kind: "income", status: "forecast", from, to }),
      listTransactions({ kind: "income", isRecurring: true, from, to }),
      getCategories(),
      getCategoryBreakdown("income", from, to),
      getCategoryBreakdownForecast("income", from, to),
    ]);

  const totals =
    tab === "received"
      ? totalsForList(received)
      : tab === "due"
        ? totalsForList(due)
        : tab === "fixed"
          ? totalsForList(fixed)
          : null;

  return (
    <div>
      <PageHeader
        eyebrow="Receitas"
        title="Entradas"
        description="Acompanhe o que já foi recebido, o que ainda está por receber e a distribuição por categoria."
        actions={<CopyPreviousMonthButton kind="income" referenceIso={from} />}
      />

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <TabLink current={tab} value="received" label="Recebido" />
        <TabLink current={tab} value="due" label="A Receber" />
        <TabLink current={tab} value="fixed" label="Fixos" />
        <TabLink current={tab} value="categories" label="Detalhes por Categoria" />
      </div>

      <Card className="mb-5 !p-4 flex flex-wrap items-center justify-between gap-3">
        <MonthRangeNav />
        {totals && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-fg-muted font-semibold">
              {tab === "received"
                ? "Total recebido"
                : tab === "due"
                  ? "Total a receber"
                  : "Total fixo do período"}
            </p>
            <p
              className={cn(
                "font-display text-2xl font-semibold tabular-nums",
                tab === "received" ? "text-success" : "text-warning"
              )}
            >
              {formatBRL(totals.income)}
            </p>
          </div>
        )}
      </Card>

      {tab === "received" && (
        <TransactionsList
          txs={received}
          categories={categories}
          emptyMessage="Nenhuma entrada recebida no período."
        />
      )}

      {tab === "due" && (
        <TransactionsList
          txs={due}
          categories={categories}
          emptyMessage="Nenhuma entrada em aberto no período."
        />
      )}

      {tab === "fixed" && (
        <TransactionsList
          txs={fixed}
          categories={categories}
          emptyMessage="Nenhuma entrada fixa no período. Marque uma entrada como fixa no formulário (toggle “Lançamento fixo”) e ela aparece aqui."
        />
      )}

      {tab === "categories" && (
        <CategoryBreakdownPanel
          breakdownPaid={breakdownPaid}
          breakdownForecast={breakdownForecast}
          fromIso={from}
          toIso={to}
          kind="income"
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
      href={`/entradas?tab=${value}`}
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
