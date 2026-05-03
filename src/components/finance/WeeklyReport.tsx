"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Sparkles, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";

export type WeeklyReportData = {
  weekLabel: string;
  income: number;
  expense: number;
  incomeGoal?: number;
  expenseGoal?: number;
};

export function WeeklyReport({ data }: { data: WeeklyReportData }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  const positives: string[] = [];
  const negatives: string[] = [];

  if (data.incomeGoal != null) {
    if (data.income >= data.incomeGoal) {
      positives.push(
        `Receita acima do esperado em ${formatBRL(data.income - data.incomeGoal)}`
      );
    } else {
      negatives.push(
        `Meta de receita não atingida. Falta ${formatBRL(data.incomeGoal - data.income)}`
      );
    }
  } else if (data.income > 0) {
    positives.push(`Receita registrada na semana: ${formatBRL(data.income)}`);
  }

  if (data.expenseGoal != null) {
    if (data.expense <= data.expenseGoal) {
      positives.push(
        `Despesas dentro do limite. Sobrou ${formatBRL(data.expenseGoal - data.expense)}`
      );
    } else {
      negatives.push(
        `Despesas acima do previsto em ${formatBRL(data.expense - data.expenseGoal)}`
      );
    }
  } else if (data.expense > 0) {
    negatives.push(`Despesas da semana somam ${formatBRL(data.expense)}`);
  }

  const balance = data.income - data.expense;
  if (balance > 0) positives.push(`Saldo positivo de ${formatBRL(balance)} na semana`);
  if (balance < 0) negatives.push(`Saldo negativo de ${formatBRL(-balance)} na semana`);

  return (
    <Card hero className="relative">
      <button
        onClick={() => setHidden(true)}
        className="absolute top-4 right-4 h-8 w-8 inline-flex items-center justify-center rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.06] transition-colors"
        aria-label="Fechar relatório"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 mb-4">
        <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary-soft text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-fg-muted font-semibold">
            Relatório semanal
          </p>
          <h3 className="font-display text-xl font-semibold tracking-tight">
            Resumo da {data.weekLabel}
          </h3>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-success uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Pontos positivos
          </p>
          {positives.length === 0 ? (
            <p className="text-sm text-fg-muted">Sem destaques positivos esta semana.</p>
          ) : (
            <ul className="space-y-1.5 text-sm text-fg">
              {positives.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-danger uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Pontos de atenção
          </p>
          {negatives.length === 0 ? (
            <p className="text-sm text-fg-muted">Tudo dentro do esperado.</p>
          ) : (
            <ul className="space-y-1.5 text-sm text-fg">
              {negatives.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-danger shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
