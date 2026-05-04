"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBRL } from "@/lib/format";

export type ProfitPoint = {
  label: string;
  net: number;
  income: number;
  expense: number;
};

export function ProfitsChart({ data }: { data: ProfitPoint[] }) {
  const chartData = data.map((d) => ({
    label: d.label,
    Lucro: d.net / 100,
  }));

  return (
    <div className="h-[260px] w-full min-w-0 overflow-hidden">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 8, bottom: 0, left: 8 }}
          barCategoryGap="22%"
        >
          <defs>
            <linearGradient id="profitPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.95} />
              <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.55} />
            </linearGradient>
            <linearGradient id="profitNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--danger))" stopOpacity={0.5} />
              <stop offset="100%" stopColor="hsl(var(--danger))" stopOpacity={0.95} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(0 0% 100% / 0.05)" strokeDasharray="3 6" vertical={false} />
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
          <Bar dataKey="Lucro" radius={[6, 6, 0, 0]} maxBarSize={36}>
            {chartData.map((d, i) => (
              <Cell key={i} fill={d.Lucro >= 0 ? "url(#profitPos)" : "url(#profitNeg)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
