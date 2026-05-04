"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { categoryHsl } from "@/lib/colors";
import { formatBRL } from "@/lib/format";

export type BreakdownData = {
  name: string;
  color: string;
  paid: number;
  forecast: number;
};

export function CategoryBreakdownChart({
  data,
  paidLabel,
  forecastLabel,
}: {
  data: BreakdownData[];
  paidLabel: string;
  forecastLabel: string;
}) {
  const total = data.reduce((s, d) => s + d.paid + d.forecast, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-fg-muted text-sm gap-2 py-10">
        <div className="h-32 w-32 rounded-full border-2 border-dashed border-border-strong" />
        <p>Sem lançamentos no período.</p>
      </div>
    );
  }

  // Anel externo: pago. Anel interno: previsto. Cores semelhantes mas com
  // padrão tracejado simulado pela opacidade.
  const paidData = data
    .filter((d) => d.paid > 0)
    .map((d) => ({ name: d.name, value: d.paid / 100, color: d.color }));
  const forecastData = data
    .filter((d) => d.forecast > 0)
    .map((d) => ({ name: d.name, value: d.forecast / 100, color: d.color }));

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <div className="relative h-[260px]">
        <ResponsiveContainer>
          <PieChart>
            {/* Anel externo: pago */}
            <Pie
              data={paidData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              stroke="hsl(var(--bg-elev))"
              strokeWidth={3}
            >
              {paidData.map((entry, i) => (
                <Cell key={i} fill={categoryHsl(entry.color)} />
              ))}
            </Pie>
            {/* Anel interno: previsto */}
            <Pie
              data={forecastData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={64}
              paddingAngle={2}
              stroke="hsl(var(--bg-elev))"
              strokeWidth={2}
            >
              {forecastData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={categoryHsl(entry.color)}
                  fillOpacity={0.45}
                />
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
              formatter={(value, name) => [formatBRL(Number(value) * 100), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-fg-muted font-semibold">
              Total
            </p>
            <p className="font-display text-base font-semibold tabular-nums">
              {formatBRL(total)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-5 text-[11px] text-fg-muted mt-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-fg" />
          Anel externo: {paidLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: "hsl(var(--fg) / 0.45)" }}
          />
          Anel interno: {forecastLabel}
        </span>
      </div>
    </div>
  );
}
