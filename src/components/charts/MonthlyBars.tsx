"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyHistoryPoint } from "@/lib/queries/balance";
import { formatBRL } from "@/lib/format";

export function MonthlyBars({ data }: { data: MonthlyHistoryPoint[] }) {
  const chartData = data.map((p) => ({
    label: p.label,
    Entradas: p.income / 100,
    Saídas: p.expense / 100,
  }));

  return (
    <div className="h-[220px] sm:h-[260px] w-full min-w-0 overflow-hidden">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 8, bottom: 0, left: 8 }}
          barCategoryGap="22%"
          barGap={4}
        >
          <defs>
            <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.95} />
              <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.55} />
            </linearGradient>
            <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="hsl(0 0% 100% / 0.05)"
            strokeDasharray="3 6"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            stroke="hsl(var(--fg-dim))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            stroke="hsl(var(--fg-dim))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v: number) => {
              const abs = Math.abs(v);
              if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
              if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
              return `${v}`;
            }}
          />
          <Tooltip
            cursor={{ fill: "hsl(0 0% 100% / 0.04)" }}
            contentStyle={{
              background: "hsl(var(--bg-elev))",
              border: "1px solid hsl(var(--border-strong))",
              borderRadius: 12,
              padding: "8px 12px",
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--fg-muted))", marginBottom: 4 }}
            itemStyle={{ color: "hsl(var(--fg))" }}
            formatter={(value, name) => [formatBRL(Number(value) * 100), String(name)]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "hsl(var(--fg-muted))", paddingBottom: 4 }}
          />
          <Bar dataKey="Entradas" fill="url(#incomeBar)" radius={[6, 6, 0, 0]} maxBarSize={28} />
          <Bar dataKey="Saídas" fill="url(#expenseBar)" radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
