"use client";

import { useState } from "react";
import { CalendarCheck, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatBRL, formatPercent } from "@/lib/format";

export type SaturdayMessage = {
  kind: "income" | "expense";
  label: string;
  pct: number;
  remaining: number;
  level: "ok" | "warning" | "over";
};

export function SaturdayUpdate({ messages }: { messages: SaturdayMessage[] }) {
  const [hidden, setHidden] = useState(false);
  if (hidden || messages.length === 0) return null;

  return (
    <Card hero className="relative">
      <button
        onClick={() => setHidden(true)}
        className="absolute top-4 right-4 h-8 w-8 inline-flex items-center justify-center rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.06] transition-colors"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 mb-4">
        <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary-soft text-primary">
          <CalendarCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-fg-muted font-semibold">
            Atualização de sábado
          </p>
          <h3 className="font-display text-xl font-semibold">Como vão suas metas</h3>
        </div>
      </div>
      <ul className="space-y-2">
        {messages.map((m, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-xl bg-surface-2 border border-border px-4 py-3"
          >
            <span
              className={
                m.kind === "income"
                  ? "h-2.5 w-2.5 rounded-full bg-success"
                  : m.level === "over"
                    ? "h-2.5 w-2.5 rounded-full bg-danger"
                    : m.level === "warning"
                      ? "h-2.5 w-2.5 rounded-full bg-warning"
                      : "h-2.5 w-2.5 rounded-full bg-primary"
              }
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{m.label}</p>
              <p className="text-xs text-fg-muted">
                {m.kind === "income"
                  ? `Você atingiu ${formatPercent(m.pct)} da meta. ${m.remaining > 0 ? `Faltam ${formatBRL(m.remaining)} para chegar lá.` : "Meta atingida."}`
                  : m.level === "over"
                    ? `Você ultrapassou a meta em ${formatBRL(-m.remaining)}.`
                    : m.level === "warning"
                      ? `Você já gastou ${formatPercent(m.pct)} do limite. Cuidado nos próximos dias.`
                      : `Você já gastou ${formatPercent(m.pct)} do limite. Tudo dentro do esperado.`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
