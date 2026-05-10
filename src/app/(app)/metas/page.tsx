import type { Metadata } from "next";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import { brazilToday } from "@/lib/tz";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/finance/PageHeader";
import { MonthSelector } from "@/components/finance/MonthSelector";
import { GoalCard } from "./GoalCard";
import { CopyGoalsButton } from "./CopyGoalsButton";
import { NewCategoryButton } from "./NewCategoryButton";
import { SaturdayUpdate, type SaturdayMessage } from "./SaturdayUpdate";
import { getCategories } from "@/lib/queries/categories";
import { getMonthGoals } from "@/lib/queries/goals";
import { getPeriodSummary } from "@/lib/queries/balance";
import { createClient } from "@/lib/supabase/server";
import { capitalize, formatBRL, formatPercent } from "@/lib/format";

export const metadata: Metadata = { title: "Metas" };
export const dynamic = "force-dynamic";

export default async function MetasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const anchor = sp.month ? parseISO(`${sp.month}-01`) : new Date();
  const monthIso = format(startOfMonth(anchor), "yyyy-MM");

  const [categories, goals, summary] = await Promise.all([
    getCategories(),
    getMonthGoals(monthIso),
    getPeriodSummary("month", anchor),
  ]);

  const expenseCats = categories.filter((c) => c.kind === "expense");

  const incomeGoal = goals.find(
    (g) => g.goal.goal_kind === "income" && g.goal.category_id === null
  );
  const expenseGoal = goals.find(
    (g) => g.goal.goal_kind === "expense" && g.goal.category_id === null
  );
  const profitGoal = goals.find(
    (g) => g.goal.goal_kind === "profit" && g.goal.category_id === null
  );
  const netBalance = summary.income.realized - summary.expense.realized;
  const goalByCat = new Map(
    goals
      .filter((g) => g.goal.goal_kind === "expense" && g.goal.category_id)
      .map((g) => [g.goal.category_id!, g])
  );

  // Build Saturday update messages (only on Saturday)
  const today = parseISO(brazilToday());
  const isSaturday = today.getDay() === 6;
  const messages: SaturdayMessage[] = [];
  if (isSaturday) {
    if (incomeGoal) {
      messages.push({
        kind: "income",
        label: "Receita",
        pct: incomeGoal.pct,
        remaining: incomeGoal.remainingCents,
        level: incomeGoal.level,
      });
    }
    if (expenseGoal) {
      messages.push({
        kind: "expense",
        label: "Despesas",
        pct: expenseGoal.pct,
        remaining: expenseGoal.remainingCents,
        level: expenseGoal.level,
      });
    }
  }

  // History: previous 5 months goals + outcome
  const historyMonths: { month: Date; iso: string }[] = [];
  for (let i = 1; i <= 5; i++) {
    const m = subMonths(today, i);
    historyMonths.push({ month: m, iso: format(startOfMonth(m), "yyyy-MM-dd") });
  }
  const supabase = await createClient();
  const { data: histGoals } = await supabase
    .from("monthly_goals")
    .select("month, goal_kind, category_id, limit_cents")
    .in(
      "month",
      historyMonths.map((m) => m.iso)
    )
    .is("category_id", null);
  const historyByMonth = new Map<string, { income?: number; expense?: number }>();
  for (const g of histGoals ?? []) {
    const cur = historyByMonth.get(g.month) ?? {};
    if (g.goal_kind === "income") cur.income = g.limit_cents;
    else cur.expense = g.limit_cents;
    historyByMonth.set(g.month, cur);
  }
  const histSummaries = await Promise.all(
    historyMonths.map(async (m) => ({
      month: m.month,
      iso: m.iso,
      goals: historyByMonth.get(m.iso) ?? {},
      summary: await getPeriodSummary("month", m.month),
    }))
  );

  return (
    <div>
      <PageHeader
        eyebrow="Limites mensais"
        title="Metas"
        description="Defina metas de receita e despesa. Receba lembretes aos sábados."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <CopyGoalsButton monthIso={monthIso} />
            <MonthSelector />
          </div>
        }
      />

      {messages.length > 0 && (
        <div className="mb-5">
          <SaturdayUpdate messages={messages} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-5">
        <GoalCard
          monthIso={monthIso}
          goalKind="income"
          categoryId={null}
          categoryName="Meta de faturamento"
          categoryColor="cat-4"
          goalId={incomeGoal?.goal.id}
          limitCents={incomeGoal?.goal.limit_cents}
          usedCents={summary.income.realized}
          pct={
            incomeGoal
              ? summary.income.realized / incomeGoal.goal.limit_cents
              : undefined
          }
          level={incomeGoal?.level}
        />
        <GoalCard
          monthIso={monthIso}
          goalKind="expense"
          categoryId={null}
          categoryName="Teto de despesas"
          categoryColor="cat-1"
          goalId={expenseGoal?.goal.id}
          limitCents={expenseGoal?.goal.limit_cents}
          usedCents={summary.expense.realized}
          pct={
            expenseGoal
              ? summary.expense.realized / expenseGoal.goal.limit_cents
              : undefined
          }
          level={expenseGoal?.level}
          global
        />
        <GoalCard
          monthIso={monthIso}
          goalKind="profit"
          categoryId={null}
          categoryName="Meta de lucro"
          categoryColor="cat-1"
          goalId={profitGoal?.goal.id}
          limitCents={profitGoal?.goal.limit_cents}
          usedCents={netBalance}
          pct={
            profitGoal
              ? Math.max(0, netBalance) / profitGoal.goal.limit_cents
              : undefined
          }
          level={profitGoal?.level}
        />
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-3 px-1 gap-3">
          <h3 className="font-display text-lg font-semibold">
            Limites por categoria
          </h3>
          <NewCategoryButton />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenseCats.map((c) => {
            const g = goalByCat.get(c.id);
            return (
              <GoalCard
                key={c.id}
                monthIso={monthIso}
                goalKind="expense"
                categoryId={c.id}
                categoryName={c.name}
                categoryColor={c.color}
                goalId={g?.goal.id}
                limitCents={g?.goal.limit_cents}
                usedCents={g?.usedCents ?? 0}
                pct={g?.pct}
                level={g?.level}
              />
            );
          })}
        </div>
      </div>

      <Card>
        <h3 className="font-display text-lg font-semibold mb-3">Histórico de metas</h3>
        {histSummaries.every((h) => !h.goals.income && !h.goals.expense) ? (
          <p className="text-sm text-fg-muted">
            Você ainda não tem metas definidas em meses anteriores.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {histSummaries.map((h) => {
              const incomePct = h.goals.income
                ? h.summary.income.realized / h.goals.income
                : null;
              const expensePct = h.goals.expense
                ? h.summary.expense.realized / h.goals.expense
                : null;
              const incomeOk = incomePct != null && incomePct >= 1;
              const expenseOk = expensePct != null && expensePct <= 1;
              return (
                <li
                  key={h.iso}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <p className="text-sm font-medium capitalize">
                    {format(h.month, "MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-fg-muted tabular-nums">
                    {h.goals.income ? (
                      <>
                        Receita {formatBRL(h.summary.income.realized)} de{" "}
                        {formatBRL(h.goals.income)}{" "}
                        <span className={incomeOk ? "text-success" : "text-warning"}>
                          ({formatPercent(incomePct ?? 0)})
                        </span>
                      </>
                    ) : (
                      <span className="text-fg-muted">Sem meta de receita</span>
                    )}
                  </p>
                  <p className="text-sm text-fg-muted tabular-nums">
                    {h.goals.expense ? (
                      <>
                        Despesa {formatBRL(h.summary.expense.realized)} de{" "}
                        {formatBRL(h.goals.expense)}{" "}
                        <span className={expenseOk ? "text-success" : "text-danger"}>
                          ({formatPercent(expensePct ?? 0)})
                        </span>
                      </>
                    ) : (
                      <span className="text-fg-muted">Sem meta de despesa</span>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <p className="sr-only">
        {capitalize(format(anchor, "MMMM 'de' yyyy", { locale: ptBR }))}
      </p>
    </div>
  );
}
