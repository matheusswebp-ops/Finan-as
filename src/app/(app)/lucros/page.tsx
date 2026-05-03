import type { Metadata } from "next";
import { ArrowDown, ArrowUp, Minus, Sparkles } from "lucide-react";
import { format, parse, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/finance/PageHeader";
import { ProfitsChart } from "@/components/charts/ProfitsChart";
import { GenerateAutoButton, NewProfitButton, ProfitRowActions } from "./ProfitActions";
import { YearSelect } from "./YearSelect";
import { ProfitRangePopover } from "./ProfitRangePopover";
import { listProfits } from "@/lib/queries/profits";
import { capitalize, formatBRL } from "@/lib/format";

export const metadata: Metadata = { title: "Lucros" };
export const dynamic = "force-dynamic";

export default async function LucrosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const fromIso = sp.from ?? null;
  const toIso = sp.to ?? null;
  // Range custom tem prioridade sobre filtro de ano.
  const yearFilter = !fromIso && !toIso && sp.year ? Number(sp.year) : null;

  const all = await listProfits();
  const filtered = (() => {
    if (fromIso && toIso) {
      return all.filter(
        (p) => p.month >= fromIso.slice(0, 10) && p.month <= toIso.slice(0, 10)
      );
    }
    if (yearFilter) {
      return all.filter(
        (p) => parse(p.month, "yyyy-MM-dd", new Date()).getFullYear() === yearFilter
      );
    }
    return all;
  })();

  // Sort ascending for chart
  const chartData = [...filtered]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((p) => ({
      label: format(parse(p.month, "yyyy-MM-dd", new Date()), "MMM/yy", { locale: ptBR }),
      net: p.net_cents,
      income: p.income_cents,
      expense: p.expense_cents,
    }));

  const years = Array.from(
    new Set(all.map((p) => parse(p.month, "yyyy-MM-dd", new Date()).getFullYear()))
  ).sort((a, b) => b - a);

  const totalNet = filtered.reduce((s, p) => s + p.net_cents, 0);
  const positiveMonths = filtered.filter((p) => p.net_cents > 0).length;
  const negativeMonths = filtered.filter((p) => p.net_cents < 0).length;

  const currentMonthIso = format(startOfMonth(new Date()), "yyyy-MM-dd");

  return (
    <div>
      <PageHeader
        eyebrow="Banco de lucros"
        title="Lucros"
        description="Acompanhe o lucro líquido mês a mês e a evolução do casal."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <GenerateAutoButton monthIso={currentMonthIso} />
            <NewProfitButton />
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <Card interactive className="!p-4 sm:!p-5 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-fg-muted">Total de lucro</p>
            <ProfitRangePopover fromIso={fromIso} toIso={toIso} />
          </div>
          <p
            className={`font-display text-xl sm:text-2xl font-medium tabular-nums ${
              totalNet < 0 ? "text-danger" : ""
            }`}
          >
            {formatBRL(totalNet)}
          </p>
        </Card>
        <Card interactive className="!p-4 sm:!p-5 space-y-1">
          <p className="text-xs text-fg-muted">Meses no positivo</p>
          <p className="font-display text-xl sm:text-2xl font-medium tabular-nums text-success">
            {positiveMonths.toString().padStart(2, "0")}
          </p>
        </Card>
        <Card interactive className="!p-4 sm:!p-5 space-y-1">
          <p className="text-xs text-fg-muted">Meses no negativo</p>
          <p className="font-display text-xl sm:text-2xl font-medium tabular-nums text-danger">
            {negativeMonths.toString().padStart(2, "0")}
          </p>
        </Card>
        <Card interactive className="!p-4 sm:!p-5 space-y-1">
          <p className="text-xs text-fg-muted">Filtro de ano</p>
          <YearSelect years={years} current={yearFilter} />
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-fg-muted font-semibold mb-1">
            Evolução
          </p>
          <h3 className="font-display text-lg font-semibold mb-3">Lucro mês a mês</h3>
          <ProfitsChart data={chartData} />
        </Card>
      )}

      <Card>
        <h3 className="font-display text-lg font-semibold mb-3">Histórico</h3>
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-fg-muted">
              Nenhum lucro registrado ainda. Use o botão acima para gerar do mês atual ou registrar manualmente.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((p) => {
              const Icon =
                p.vsPrevious == null
                  ? Minus
                  : p.vsPrevious > 0
                    ? ArrowUp
                    : p.vsPrevious < 0
                      ? ArrowDown
                      : Minus;
              const tone =
                p.vsPrevious == null
                  ? "text-fg-muted"
                  : p.vsPrevious > 0
                    ? "text-success"
                    : p.vsPrevious < 0
                      ? "text-danger"
                      : "text-fg-muted";
              return (
                <li
                  key={p.id}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.2fr_1fr_1fr_auto_auto] items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-display text-sm sm:text-base font-semibold capitalize">
                      {format(parse(p.month, "yyyy-MM-dd", new Date()), "MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-fg-muted">
                      Receitas {formatBRL(p.income_cents)} · Despesas {formatBRL(p.expense_cents)}
                    </p>
                  </div>
                  <p
                    className={`hidden sm:block text-sm tabular-nums font-medium ${
                      p.net_cents < 0 ? "text-danger" : "text-success"
                    }`}
                  >
                    {formatBRL(p.net_cents)}
                  </p>
                  <p className="hidden sm:flex text-xs text-fg-muted items-center gap-1.5">
                    {p.is_auto && <Badge variant="primary">automático</Badge>}
                    {!p.is_auto && <Badge variant="default">manual</Badge>}
                  </p>
                  <div className={`inline-flex items-center gap-1 text-xs tabular-nums ${tone}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {p.vsPrevious != null
                      ? formatBRL(Math.abs(p.vsPrevious))
                      : "primeiro mês"}
                  </div>
                  <div className="text-right sm:hidden">
                    <p
                      className={`text-sm tabular-nums font-medium ${
                        p.net_cents < 0 ? "text-danger" : "text-success"
                      }`}
                    >
                      {formatBRL(p.net_cents)}
                    </p>
                  </div>
                  <ProfitRowActions profit={p} />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <p className="sr-only">
        <Sparkles aria-hidden /> {capitalize(format(new Date(), "MMMM yyyy", { locale: ptBR }))}
      </p>
    </div>
  );
}
