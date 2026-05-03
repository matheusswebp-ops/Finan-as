"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyHistoryPoint } from "@/lib/queries/balance";
import { formatBRL } from "@/lib/format";

export function BalanceChart({ data }: { data: MonthlyHistoryPoint[] }) {
  const chartData = data.map((p) => ({
    label: p.label,
    Saldo: p.balance / 100,
  }));

  return (
    <div className="h-[220px] sm:h-[260px] w-full">
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 8, bottom: 0, left: 8 }}
        >
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="balanceStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(var(--primary-2))" stopOpacity={1} />
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
            cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "3 3", strokeOpacity: 0.4 }}
            contentStyle={{
              background: "hsl(var(--bg-elev))",
              border: "1px solid hsl(var(--border-strong))",
              borderRadius: 12,
              padding: "8px 12px",
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--fg-muted))", marginBottom: 4 }}
            itemStyle={{ color: "hsl(var(--fg))" }}
            formatter={(value) => [formatBRL(Number(value) * 100), "Saldo"]}
          />
          <Area
            type="monotone"
            dataKey="Saldo"
            stroke="url(#balanceStroke)"
            strokeWidth={2.5}
            fill="url(#balanceFill)"
            activeDot={{
              r: 5,
              fill: "hsl(var(--primary))",
              stroke: "hsl(var(--bg))",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
