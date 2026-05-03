"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyHistoryPoint } from "@/lib/queries/balance";
import { formatBRL } from "@/lib/format";

export function OverviewChart({ data }: { data: MonthlyHistoryPoint[] }) {
  const chartData = data.map((d) => ({
    label: d.label,
    Entradas: d.income / 100,
    Saídas: d.expense / 100,
    Saldo: d.balance / 100,
  }));

  return (
    <div className="h-[300px] sm:h-[340px] w-full">
      <ResponsiveContainer>
        <ComposedChart
          data={chartData}
          margin={{ top: 24, right: 12, bottom: 4, left: 12 }}
          barCategoryGap="22%"
          barGap={4}
        >
          <defs>
            <linearGradient id="incomeBar2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="expenseBar2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--danger))" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(var(--danger))" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(0 0% 100% / 0.06)" strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="hsl(var(--fg-muted))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            stroke="hsl(var(--fg-muted))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(v: number) => {
              const abs = Math.abs(v);
              if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
              if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
              return `${v}`;
            }}
          />
          <ReferenceLine y={0} stroke="hsl(0 0% 100% / 0.2)" strokeWidth={1} />
          <Tooltip
            cursor={{ fill: "hsl(0 0% 100% / 0.04)" }}
            contentStyle={{
              background: "hsl(var(--bg-elev))",
              border: "1px solid hsl(var(--border-strong))",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--fg-muted))", marginBottom: 6, fontWeight: 600 }}
            itemStyle={{ color: "hsl(var(--fg))" }}
            formatter={(value, name) => [formatBRL(Math.abs(Number(value)) * 100), String(name)]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "hsl(var(--fg-muted))", paddingBottom: 8 }}
          />
          <Bar dataKey="Entradas" fill="url(#incomeBar2)" radius={[8, 8, 0, 0]} maxBarSize={42} />
          <Bar dataKey="Saídas" fill="url(#expenseBar2)" radius={[8, 8, 0, 0]} maxBarSize={42} />
          <Line
            type="monotone"
            dataKey="Saldo"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: "hsl(var(--primary))",
              stroke: "hsl(var(--bg))",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: "hsl(var(--primary))",
              stroke: "hsl(var(--bg))",
              strokeWidth: 2,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
