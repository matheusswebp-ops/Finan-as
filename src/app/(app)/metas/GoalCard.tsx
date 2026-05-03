"use client";

import { useState } from "react";
import { Edit3, Plus, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GoalDialog } from "./GoalDialog";
import { categoryHsl, categoryBgSoft } from "@/lib/colors";
import { formatBRL, formatPercent } from "@/lib/format";

export type GoalCardProps = {
  monthIso: string;
  goalKind?: "expense" | "income";
  categoryId: string | null;
  categoryName: string;
  categoryColor: string;
  goalId?: string;
  limitCents?: number;
  usedCents: number;
  pct?: number;
  level?: "ok" | "warning" | "over";
  global?: boolean;
};

export function GoalCard(props: GoalCardProps) {
  const [open, setOpen] = useState(false);
  const hasGoal = !!props.goalId;
  const pct = props.pct ?? 0;
  const isIncome = props.goalKind === "income";

  const subLabel = isIncome
    ? "Meta de receita"
    : props.global
      ? "Teto global"
      : "Categoria de saída";

  return (
    <>
      <Card interactive className="!p-5 space-y-3">
        <div className="flex items-center gap-3">
          <span
            className="h-10 w-10 rounded-xl grid place-items-center shrink-0"
            style={{
              background: isIncome
                ? "hsl(var(--success-soft))"
                : props.global
                  ? "hsl(var(--primary-soft))"
                  : categoryBgSoft(props.categoryColor),
              color: isIncome
                ? "hsl(var(--success))"
                : props.global
                  ? "hsl(var(--primary))"
                  : categoryHsl(props.categoryColor),
            }}
          >
            {isIncome ? <TrendingUp className="h-4 w-4" /> : <Target className="h-4 w-4" />}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-base truncate">
              {props.categoryName}
            </p>
            <p className="text-xs text-fg-muted">{subLabel}</p>
          </div>
          {hasGoal ? (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setOpen(true)}
              aria-label="Editar meta"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" variant="soft" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Definir
            </Button>
          )}
        </div>

        {hasGoal ? (
          <>
            <div className="flex items-baseline gap-2">
              <p className="font-display text-2xl font-medium tabular-nums">
                {formatBRL(props.usedCents)}
              </p>
              <p className="text-sm text-fg-muted tabular-nums">
                / {formatBRL(props.limitCents ?? 0)}
              </p>
            </div>
            <div className="space-y-1.5">
              <Progress
                value={Math.min(100, pct * 100)}
                indicatorClassName={
                  isIncome
                    ? props.level === "ok"
                      ? "bg-success"
                      : props.level === "warning"
                        ? "bg-primary"
                        : "bg-warning"
                    : props.level === "over"
                      ? "bg-danger"
                      : props.level === "warning"
                        ? "bg-warning"
                        : "bg-primary"
                }
              />
              <div className="flex items-center justify-between text-xs text-fg-muted tabular-nums">
                <span>{formatPercent(pct)} {isIncome ? "atingido" : "usado"}</span>
                <span>
                  {isIncome
                    ? pct >= 1
                      ? "Meta atingida"
                      : `Faltam ${formatBRL(Math.max(0, (props.limitCents ?? 0) - props.usedCents))}`
                    : pct >= 1
                      ? `Excedeu em ${formatBRL(props.usedCents - (props.limitCents ?? 0))}`
                      : `Restam ${formatBRL((props.limitCents ?? 0) - props.usedCents)}`}
                </span>
              </div>
              {!isIncome && props.level === "warning" && (
                <Badge variant="warning">Próximo do limite</Badge>
              )}
              {!isIncome && props.level === "over" && (
                <Badge variant="danger">Acima da meta</Badge>
              )}
              {isIncome && props.level === "ok" && (
                <Badge variant="success">Meta atingida</Badge>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-fg-muted">
            {isIncome
              ? "Sem meta de receita. Defina um valor para acompanhar o progresso."
              : "Sem meta este mês. Defina um teto para receber alertas ao se aproximar."}
          </p>
        )}
      </Card>

      <GoalDialog
        open={open}
        onOpenChange={setOpen}
        monthIso={props.monthIso}
        goalKind={props.goalKind ?? "expense"}
        categoryId={props.categoryId}
        categoryName={props.categoryName}
        existingGoalId={props.goalId}
        existingLimitCents={props.limitCents}
      />
    </>
  );
}
