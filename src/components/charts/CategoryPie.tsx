"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CategoryBreakdownPoint } from "@/lib/queries/balance";
import { categoryHsl } from "@/lib/colors";
import { formatBRL, formatPercent } from "@/lib/format";

export function CategoryPie({
  data,
  size = 180,
}: {
  data: CategoryBreakdownPoint[];
  size?: number;
}) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-fg-muted text-sm gap-2 py-6">
        <div className="h-32 w-32 rounded-full border-2 border-dashed border-border-strong" />
        <p>Sem gastos no mês.</p>
      </div>
    );
  }

  const chartData = data.map((p) => ({
    name: p.category?.name ?? "Sem categoria",
    value: p.total / 100,
    color: p.category ? categoryHsl(p.category.color) : "hsl(var(--cat-8))",
    share: p.share,
  }));

  return (
    <div className="grid sm:grid-cols-[auto_1fr] gap-5 items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width={size} height={size}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={size / 2 - 30}
              outerRadius={size / 2 - 6}
              paddingAngle={2}
              stroke="hsl(var(--bg-elev))"
              strokeWidth={3}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--bg-elev))",
                border: "1px solid hsl(var(--border-strong))",
                borderRadius: 12,
                padding: "8px 12px",
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(var(--fg-muted))" }}
              formatter={(value, name, item) => {
                const share = (item as { payload?: { share?: number } } | undefined)?.payload
                  ?.share;
                return [
                  `${formatBRL(Number(value) * 100)} · ${formatPercent(share ?? 0)}`,
                  String(name),
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-fg-muted">
              Categorias
            </p>
            <p className="font-display text-lg font-semibold tabular-nums">
              {chartData.length}
            </p>
          </div>
        </div>
      </div>
      <ul className="grid gap-2 text-sm w-full max-w-[260px]">
        {chartData.slice(0, 6).map((d) => (
          <li
            key={d.name}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: d.color }}
              aria-hidden
            />
            <span className="truncate text-fg">{d.name}</span>
            <span className="tabular-nums text-fg-muted">
              {formatPercent(d.share)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
