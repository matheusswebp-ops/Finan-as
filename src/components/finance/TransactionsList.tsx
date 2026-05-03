import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { TransactionActions } from "@/components/finance/TransactionActions";
import { MarkPaidButton } from "@/components/finance/MarkPaidButton";
import type { Category } from "@/types/database";
import type { TxWithRelations } from "@/lib/queries/transactions";
import { capitalize } from "@/lib/format";

export function TransactionsList({
  txs,
  categories,
  emptyMessage = "Nenhum lançamento por aqui ainda.",
  /** Quando true, exibe botão de check em cada linha com status "previsto". */
  showQuickPay = true,
}: {
  txs: TxWithRelations[];
  categories: Category[];
  emptyMessage?: string;
  showQuickPay?: boolean;
}) {
  if (txs.length === 0) {
    return (
      <Card className="py-16 text-center text-fg-muted">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-surface-2 border border-border-strong grid place-items-center mb-3">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-primary">
            <path
              d="M3 12h6l3-7 3 14 3-7h3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm">{emptyMessage}</p>
        <p className="text-xs text-fg-muted mt-1">
          Toque no <span className="text-primary font-medium">+</span> para começar.
        </p>
      </Card>
    );
  }

  const groups = new Map<string, TxWithRelations[]>();
  for (const t of txs) {
    const list = groups.get(t.occurred_on) ?? [];
    list.push(t);
    groups.set(t.occurred_on, list);
  }

  return (
    <div className="space-y-4">
      {Array.from(groups.entries()).map(([day, list]) => (
        <Card key={day} className="space-y-1 !p-3 sm:!p-4">
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-border">
            <p className="text-xs uppercase tracking-[0.18em] text-fg-muted font-semibold">
              {capitalize(format(parseISO(day), "EEEE, dd 'de' MMM", { locale: ptBR }))}
            </p>
            <p className="text-xs text-fg-muted tabular-nums">
              {list.length} {list.length === 1 ? "lançamento" : "lançamentos"}
            </p>
          </div>
          <div className="divide-y divide-border">
            {list.map((tx) => {
              const isForecast = tx.status === "forecast";
              const verb = tx.kind === "expense" ? "Vence em" : "Recebe em";
              const absoluteDate = format(parseISO(tx.occurred_on), "dd/MM/yyyy");
              return (
                <div key={tx.id} className="group flex items-center gap-2 pr-1">
                  <div className="flex-1 min-w-0">
                    <TransactionRow
                      description={tx.description}
                      occurredOn={tx.occurred_on}
                      amountCents={tx.amount_cents}
                      kind={tx.kind as "expense" | "income"}
                      category={tx.category}
                      member={tx.member}
                      dateLabel={isForecast ? `${verb} ${absoluteDate}` : undefined}
                      rightSlot={
                        isForecast ? (
                          <span className="text-[10px] uppercase tracking-wider text-warning bg-warning-soft px-1.5 py-0.5 rounded-md font-semibold">
                            {tx.kind === "expense" ? "A pagar" : "A receber"}
                          </span>
                        ) : null
                      }
                    />
                  </div>
                  {showQuickPay && isForecast && (
                    <MarkPaidButton id={tx.id} kind={tx.kind as "expense" | "income"} />
                  )}
                  <TransactionActions tx={tx} categories={categories} />
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
