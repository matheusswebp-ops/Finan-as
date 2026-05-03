import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CategoryPie } from "@/components/charts/CategoryPie";
import { PageHeader } from "@/components/finance/PageHeader";
import { MonthSelector } from "@/components/finance/MonthSelector";
import { CategoryFormDialog } from "@/components/finance/CategoryFormDialog";
import { CategoryRowActions } from "./CategoryRowActions";
import { getCategories } from "@/lib/queries/categories";
import { getCategoryBreakdown } from "@/lib/queries/balance";
import { getMonthGoals } from "@/lib/queries/goals";
import { categoryHsl, categoryBgSoft } from "@/lib/colors";
import { formatBRL, formatPercent } from "@/lib/format";

export const metadata: Metadata = { title: "Categorias" };
export const dynamic = "force-dynamic";

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const monthAnchor = sp.month ? parseISO(`${sp.month}-01`) : new Date();

  const fromIso = format(startOfMonth(monthAnchor), "yyyy-MM-dd");
  const toIso = format(endOfMonth(monthAnchor), "yyyy-MM-dd");

  const [allCategories, breakdown, goals] = await Promise.all([
    getCategories(),
    getCategoryBreakdown("expense", fromIso, toIso),
    getMonthGoals(format(monthAnchor, "yyyy-MM")),
  ]);

  const expenseCats = allCategories.filter((c) => c.kind === "expense");
  const incomeCats = allCategories.filter((c) => c.kind === "income");

  // Build per-category usage map
  const usageById = new Map<string, number>();
  for (const p of breakdown) {
    if (p.category) usageById.set(p.category.id, p.total);
  }
  const goalById = new Map(
    goals.filter((g) => g.goal.category_id).map((g) => [g.goal.category_id!, g])
  );

  return (
    <div>
      <PageHeader
        eyebrow="Distribuição"
        title="Categorias"
        description="Veja onde o dinheiro está indo e ajuste suas metas por categoria."
        actions={<MonthSelector />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4 lg:gap-5 mb-5">
        <Card>
          <p className="text-[10px] uppercase tracking-[0.18em] text-fg-muted font-semibold mb-1">
            Saídas do mês
          </p>
          <h3 className="font-display text-lg font-semibold mb-4">
            Onde foi o dinheiro
          </h3>
          <CategoryPie data={breakdown} size={200} />
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-fg-muted font-semibold">
                Categorias de saída
              </p>
              <h3 className="font-display text-lg font-semibold mt-0.5">
                {expenseCats.length} categorias ativas
              </h3>
            </div>
            <CategoryFormDialog
              defaultKind="expense"
              trigger={
                <Button size="sm" variant="secondary">
                  <Plus className="h-4 w-4" />
                  Nova categoria
                </Button>
              }
            />
          </div>

          <ul className="grid gap-2">
            {expenseCats.map((c) => {
              const used = usageById.get(c.id) ?? 0;
              const goal = goalById.get(c.id);
              const goalPct = goal ? Math.min(1, goal.pct) : null;

              return (
                <li
                  key={c.id}
                  className="group rounded-xl border border-border bg-surface-2 p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className="h-9 w-9 rounded-xl grid place-items-center"
                      style={{
                        background: categoryBgSoft(c.color),
                        color: categoryHsl(c.color),
                      }}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      <p className="text-xs text-fg-muted">
                        {goal
                          ? `Meta de ${formatBRL(goal.goal.limit_cents)}`
                          : "Sem meta definida"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatBRL(used)}
                      </p>
                      {goal && (
                        <p className="text-xs text-fg-muted tabular-nums">
                          {formatPercent(goal.pct)} usado
                        </p>
                      )}
                    </div>
                    <CategoryRowActions category={c} />
                  </div>
                  {goal && (
                    <div className="mt-1.5 space-y-1">
                      <Progress
                        value={Math.min(100, goalPct! * 100)}
                        indicatorClassName={
                          goal.level === "over"
                            ? "bg-danger"
                            : goal.level === "warning"
                              ? "bg-warning"
                              : "bg-primary"
                        }
                      />
                      {goal.level === "warning" && (
                        <Badge variant="warning">
                          Próximo do limite
                        </Badge>
                      )}
                      {goal.level === "over" && (
                        <Badge variant="danger">
                          Acima da meta em {formatBRL(used - goal.goal.limit_cents)}
                        </Badge>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-fg-muted font-semibold">
              Categorias de entrada
            </p>
            <h3 className="font-display text-lg font-semibold mt-0.5">
              {incomeCats.length} fontes de receita
            </h3>
          </div>
          <CategoryFormDialog
            defaultKind="income"
            trigger={
              <Button size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
                Nova fonte
              </Button>
            }
          />
        </div>

        <ul className="grid sm:grid-cols-2 gap-2">
          {incomeCats.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2.5 group hover:border-primary/30 transition-colors"
            >
              <span
                className="h-8 w-8 rounded-lg grid place-items-center"
                style={{
                  background: categoryBgSoft(c.color),
                  color: categoryHsl(c.color),
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              </span>
              <span className="flex-1 text-sm font-medium">{c.name}</span>
              <CategoryRowActions category={c} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
