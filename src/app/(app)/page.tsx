import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OverviewChart } from "@/components/charts/OverviewChart";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { PeriodSelector } from "@/components/finance/PeriodSelector";
import { QuickKindFilter } from "@/components/finance/QuickKindFilter";
import { WeeklyReport } from "@/components/finance/WeeklyReport";
import { MonthEndProfitBanner } from "@/components/finance/MonthEndProfitBanner";
import {
  getMonthlyHistory,
  getPeriodSummary,
  getRangeSummary,
  getRecentTransactions,
  getTodayByKind,
  type Period,
} from "@/lib/queries/balance";
import { getMonthGoals } from "@/lib/queries/goals";
import { capitalize, formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const customFrom = sp.from;
  const customTo = sp.to;
  const inCustom = !!(customFrom && customTo);
  const period: Period = (sp.period as Period) ?? "month";
  const todayFilter = sp.today as "income" | "expense" | null;

  const [summary, history, recent, todayItems, goals] = await Promise.all([
    inCustom
      ? getRangeSummary(customFrom!, customTo!, "month")
      : getPeriodSummary(period),
    getMonthlyHistory(6),
    todayFilter ? Promise.resolve([]) : getRecentTransactions(6),
    todayFilter ? getTodayByKind(todayFilter) : Promise.resolve([]),
    getMonthGoals(),
  ]);

  const periodLabel = inCustom
    ? `de ${format(parseISO(customFrom!), "dd/MM/yyyy")} a ${format(parseISO(customTo!), "dd/MM/yyyy")}`
    : period === "day"
      ? "do dia"
      : period === "week"
        ? "da semana"
        : capitalize(format(new Date(), "MMMM 'de' yyyy", { locale: ptBR }));

  // Saturday weekly report
  const today = new Date();
  const isSaturday = today.getDay() === 6;
  let weeklyReport: {
    weekLabel: string;
    income: number;
    expense: number;
    incomeGoal?: number;
    expenseGoal?: number;
  } | null = null;
  if (isSaturday) {
    const ws = startOfWeek(today, { weekStartsOn: 1 });
    const we = endOfWeek(today, { weekStartsOn: 1 });
    const weekly = await getPeriodSummary("week", today);
    const incomeGoal = goals.find(
      (g) => g.goal.goal_kind === "income" && g.goal.category_id === null
    );
    const expenseGoal = goals.find(
      (g) => g.goal.goal_kind === "expense" && g.goal.category_id === null
    );
    const proportion =
      (we.getTime() - ws.getTime()) /
      (endOfMonth(today).getTime() - startOfMonth(today).getTime() + 1);
    weeklyReport = {
      weekLabel: `semana de ${format(ws, "d", { locale: ptBR })} a ${format(we, "d 'de' MMM", { locale: ptBR })}`,
      income: weekly.income.realized,
      expense: weekly.expense.realized,
      incomeGoal: incomeGoal ? Math.round(incomeGoal.goal.limit_cents * proportion) : undefined,
      expenseGoal: expenseGoal ? Math.round(expenseGoal.goal.limit_cents * proportion) : undefined,
    };
  }

  // Month-end notification
  const isLastDayOfMonth =
    format(today, "yyyy-MM-dd") === format(endOfMonth(today), "yyyy-MM-dd");
  let monthEndNet: number | null = null;
  if (isLastDayOfMonth) {
    const monthSummary = await getPeriodSummary("month", today);
    monthEndNet = monthSummary.balance;
  }

  return (
    <div className="space-y-5 sm:space-y-6 stagger">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-fg-muted font-semibold">
            Acompanhamento {periodLabel.toLowerCase()}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-medium tracking-tight">
            Visão Geral
          </h1>
        </div>
        <PeriodSelector />
      </div>

      {monthEndNet != null && monthEndNet > 0 && (
        <MonthEndProfitBanner netCents={monthEndNet} />
      )}

      {weeklyReport && <WeeklyReport data={weeklyReport} />}

      {/* Cards: Entradas e Saídas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
        <Card interactive className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-success-soft text-success">
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <p className="font-display text-lg font-semibold">Entradas</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-fg-muted flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-success" />
                Realizado
              </p>
              <p className="font-display text-xl sm:text-2xl font-medium tabular-nums mt-1 truncate">
                {formatBRL(summary.income.realized)}
              </p>
            </div>
            <div>
              <p className="text-xs text-fg-muted flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-warning" />
                Previsão a receber
              </p>
              <p className="font-display text-xl sm:text-2xl font-medium tabular-nums text-fg-muted mt-1 truncate">
                {formatBRL(summary.income.forecast)}
              </p>
            </div>
          </div>
        </Card>

        <Card interactive className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-danger-soft text-danger">
              <ArrowDownRight className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <p className="font-display text-lg font-semibold">Saídas</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-fg-muted flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-success" />
                Realizado
              </p>
              <p className="font-display text-xl sm:text-2xl font-medium tabular-nums mt-1 truncate">
                {formatBRL(summary.expense.realized)}
              </p>
            </div>
            <div>
              <p className="text-xs text-fg-muted flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-warning" />
                Previsão a pagar
              </p>
              <p className="font-display text-xl sm:text-2xl font-medium tabular-nums text-fg-muted mt-1 truncate">
                {formatBRL(summary.expense.forecast)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Saldo realizado hero + chart */}
      {(() => {
        const projectedBalance =
          summary.income.realized +
          summary.income.forecast -
          (summary.expense.realized + summary.expense.forecast);
        const ProjIcon = projectedBalance < 0 ? TrendingDown : TrendingUp;
        return (
          <Card hero className="p-5 sm:p-8 overflow-hidden space-y-5 sm:space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-fg-muted font-semibold">
                  Saldo realizado
                </p>
                <h2 className="font-display text-[2.25rem] sm:text-5xl lg:text-6xl font-medium tracking-[-0.02em] tabular-nums leading-none break-words">
                  {formatBRL(summary.balance)}
                </h2>
                <p className="text-sm text-fg-muted">
                  Diferença entre entradas pagas e despesas pagas no período.
                </p>

                <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-4 pl-3 pr-4 py-2 rounded-xl bg-surface-2 border border-border">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] uppercase tracking-wider text-fg-muted font-semibold">
                      Prévia de lucro
                    </span>
                  </span>
                  <span
                    className={`font-display text-lg sm:text-xl font-medium tabular-nums inline-flex items-center gap-1.5 ${
                      projectedBalance < 0 ? "text-danger" : "text-success"
                    }`}
                  >
                    <ProjIcon className="h-4 w-4" strokeWidth={2.5} />
                    {formatBRL(projectedBalance)}
                  </span>
                </div>
                <p className="text-[11px] text-fg-muted leading-relaxed max-w-md">
                  Atualiza automaticamente conforme você lança ou marca como pago/recebido.
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-fg-muted font-semibold mb-1">
                  Últimos 6 meses
                </p>
                <p className="text-sm text-fg">Entradas, Saídas e Saldo</p>
              </div>
            </div>
            <OverviewChart data={history} />
          </Card>
        );
      })()}

      {/* Quick filter chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <QuickKindFilter />
        <Link
          href="/registros"
          className="text-xs text-fg-muted hover:text-fg transition-colors inline-flex items-center gap-1"
        >
          Ver tudo no Registro
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Activity list: recent or filtered today */}
      <Card className="space-y-2">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-fg-muted font-semibold">
              {todayFilter ? "Hoje" : "Atividade recente"}
            </p>
            <h3 className="font-display text-lg font-semibold mt-0.5">
              {todayFilter === "income"
                ? "Receitas do dia"
                : todayFilter === "expense"
                  ? "Despesas do dia"
                  : "Últimos lançamentos"}
            </h3>
          </div>
        </div>

        {(todayFilter ? todayItems : recent).length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-fg-muted">
              {todayFilter
                ? "Nada lançado hoje neste tipo."
                : "Você ainda não tem lançamentos. Toque no + para adicionar."}
            </p>
          </div>
        ) : (
          <div className="-mx-2 divide-y divide-border">
            {(todayFilter ? todayItems : recent).map((tx) => (
              <TransactionRow
                key={tx.id}
                description={tx.description}
                occurredOn={tx.occurred_on}
                amountCents={tx.amount_cents}
                kind={tx.kind as "expense" | "income"}
                category={tx.category}
                member={tx.member}
                rightSlot={
                  tx.status === "forecast" ? (
                    <span className="text-[10px] uppercase tracking-wider text-warning bg-warning-soft px-1.5 py-0.5 rounded-md font-semibold">
                      Previsto
                    </span>
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
