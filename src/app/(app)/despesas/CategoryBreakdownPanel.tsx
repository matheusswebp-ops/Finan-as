import { Card } from "@/components/ui/card";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";
import { categoryHsl, categoryBgSoft } from "@/lib/colors";
import { formatBRL, formatPercent } from "@/lib/format";
import type { CategoryBreakdownPoint } from "@/lib/queries/balance";

export interface CategoryBreakdownPanelProps {
  breakdownPaid: CategoryBreakdownPoint[];
  breakdownForecast: CategoryBreakdownPoint[];
  fromIso: string;
  toIso: string;
  kind?: "expense" | "income";
}

export function CategoryBreakdownPanel({
  breakdownPaid,
  breakdownForecast,
  kind = "expense",
}: CategoryBreakdownPanelProps) {
  const totalPaid = breakdownPaid.reduce((s, p) => s + p.total, 0);
  const totalForecast = breakdownForecast.reduce((s, p) => s + p.total, 0);
  const totalAll = totalPaid + totalForecast;

  const map = new Map<
    string,
    { name: string; color: string; paid: number; forecast: number }
  >();
  for (const p of breakdownPaid) {
    const id = p.category?.id ?? "none";
    const cur = map.get(id) ?? {
      name: p.category?.name ?? "Sem categoria",
      color: p.category?.color ?? "cat-8",
      paid: 0,
      forecast: 0,
    };
    cur.paid += p.total;
    map.set(id, cur);
  }
  for (const p of breakdownForecast) {
    const id = p.category?.id ?? "none";
    const cur = map.get(id) ?? {
      name: p.category?.name ?? "Sem categoria",
      color: p.category?.color ?? "cat-8",
      paid: 0,
      forecast: 0,
    };
    cur.forecast += p.total;
    map.set(id, cur);
  }
  const combined = Array.from(map.entries())
    .map(([id, v]) => ({ id, ...v, total: v.paid + v.forecast }))
    .sort((a, b) => b.total - a.total);

  const paidLabel = kind === "expense" ? "Pago" : "Recebido";
  const forecastLabel = kind === "expense" ? "A pagar" : "A receber";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4 lg:gap-5">
      <Card>
        <p className="text-[10px] uppercase tracking-[0.18em] text-fg-muted font-semibold mb-1">
          Distribuição
        </p>
        <h3 className="font-display text-lg font-semibold mb-1">
          {kind === "expense" ? "Despesas" : "Entradas"} por categoria
        </h3>
        <p className="text-xs text-fg-muted mb-4">
          Pago + previsto somam o total geral.
        </p>
        <CategoryBreakdownChart
          data={combined.map((c) => ({
            name: c.name,
            color: c.color,
            paid: c.paid,
            forecast: c.forecast,
          }))}
          paidLabel={paidLabel}
          forecastLabel={forecastLabel}
        />
      </Card>

      <Card className="space-y-3">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 text-center">
          <div className="rounded-xl bg-surface-2 border border-border px-2 sm:px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-fg-muted font-semibold">
              {paidLabel}
            </p>
            <p className="font-display text-sm sm:text-lg font-semibold tabular-nums mt-0.5 truncate">
              {formatBRL(totalPaid)}
            </p>
          </div>
          <div className="rounded-xl bg-warning-soft border border-warning/30 px-2 sm:px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-warning font-semibold">
              {forecastLabel}
            </p>
            <p className="font-display text-sm sm:text-lg font-semibold tabular-nums mt-0.5 text-warning truncate">
              {formatBRL(totalForecast)}
            </p>
          </div>
          <div className="rounded-xl bg-surface-2 border border-border-strong px-2 sm:px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-fg-muted font-semibold">
              Total
            </p>
            <p className="font-display text-sm sm:text-lg font-semibold tabular-nums mt-0.5 truncate">
              {formatBRL(totalAll)}
            </p>
          </div>
        </div>

        {combined.length === 0 ? (
          <div className="py-12 text-center text-sm text-fg-muted">
            Sem lançamentos no período selecionado.
          </div>
        ) : (
          <ul className="space-y-2">
            {combined.map((c) => {
              const pctPaid = totalAll ? c.paid / totalAll : 0;
              const pctForecast = totalAll ? c.forecast / totalAll : 0;
              const pct = pctPaid + pctForecast;
              return (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl bg-surface-2 border border-border px-4 py-3"
                >
                  <span
                    className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
                    style={{
                      background: categoryBgSoft(c.color),
                      color: categoryHsl(c.color),
                    }}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-3 overflow-hidden flex">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${pctPaid * 100}%`,
                          background: categoryHsl(c.color),
                        }}
                      />
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${pctForecast * 100}%`,
                          background: `repeating-linear-gradient(45deg, ${categoryHsl(c.color)}, ${categoryHsl(c.color)} 4px, transparent 4px, transparent 8px)`,
                          opacity: 0.55,
                        }}
                      />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-fg-muted tabular-nums">
                      <span>
                        {paidLabel}: {formatBRL(c.paid)}
                      </span>
                      {c.forecast > 0 && (
                        <span className="text-warning">
                          {forecastLabel}: {formatBRL(c.forecast)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatBRL(c.total)}
                    </p>
                    <p className="text-xs text-fg-muted tabular-nums">
                      {formatPercent(pct)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
