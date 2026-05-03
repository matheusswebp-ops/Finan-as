import type { Metadata } from "next";
import { listTransactions, totalsForList, type TxKindFilter } from "@/lib/queries/transactions";
import { getCategories } from "@/lib/queries/categories";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/finance/PageHeader";
import { MonthSelector } from "@/components/finance/MonthSelector";
import { CustomRangePopover } from "@/components/finance/CustomRangePopover";
import { TransactionsFilters } from "@/components/finance/TransactionsFilters";
import { TransactionsList } from "@/components/finance/TransactionsList";
import { SummaryCards } from "@/components/finance/SummaryCards";

export const metadata: Metadata = { title: "Registro" };
export const dynamic = "force-dynamic";

export default async function RegistrosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const month = sp.month;
  const from = sp.from;
  const to = sp.to;
  const kind = (sp.kind as TxKindFilter) ?? "all";
  const categoryId = sp.category;
  const search = sp.q;

  const filterArgs = from && to
    ? { from, to, kind, categoryId, search }
    : { month, kind, categoryId, search };

  const [txs, categories] = await Promise.all([
    listTransactions(filterArgs),
    getCategories(),
  ]);
  const totals = totalsForList(txs);

  return (
    <div>
      <PageHeader
        eyebrow="Extrato"
        title="Registros"
        description="Toda a movimentação do casal em um lugar: entradas, saídas e parcelamentos."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <MonthSelector />
            <CustomRangePopover />
          </div>
        }
      />
      <SummaryCards {...totals} />

      <Card className="mb-5 !p-4">
        <TransactionsFilters categories={categories} showKind />
      </Card>

      <TransactionsList
        txs={txs}
        categories={categories}
        emptyMessage="Sem lançamentos para os filtros selecionados."
      />
    </div>
  );
}
