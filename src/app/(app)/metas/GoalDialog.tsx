"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse, startOfMonth } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { goalSchema, type GoalInput } from "@/lib/schemas/transaction";
import { deleteGoal, upsertGoal } from "@/lib/actions/goals";

export function GoalDialog({
  open,
  onOpenChange,
  monthIso,
  goalKind = "expense",
  categoryId,
  categoryName,
  existingGoalId,
  existingLimitCents,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthIso: string;
  goalKind?: "expense" | "income";
  categoryId: string | null;
  categoryName: string;
  existingGoalId?: string;
  existingLimitCents?: number;
}) {
  const [isPending, startTransition] = useTransition();
  const monthDate = format(
    startOfMonth(parse(`${monthIso}-01`, "yyyy-MM-dd", new Date())),
    "yyyy-MM-dd"
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      id: existingGoalId,
      goal_kind: goalKind,
      category_id: categoryId,
      month: monthDate,
      limit_cents: existingLimitCents ?? 0,
    },
  });

  const onSubmit = (data: GoalInput) => {
    startTransition(async () => {
      const res = await upsertGoal(data);
      if (!res.ok) {
        toast.error("Erro ao salvar meta", { description: res.error });
        return;
      }
      toast.success("Meta salva", {
        description: categoryName + " atualizado para o mês.",
      });
      onOpenChange(false);
    });
  };

  const onDelete = () => {
    if (!existingGoalId) return;
    startTransition(async () => {
      const res = await deleteGoal(existingGoalId);
      if (!res.ok) {
        toast.error("Erro ao remover meta", { description: res.error });
        return;
      }
      toast.success("Meta removida");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Meta de {categoryName}</DialogTitle>
            <DialogDescription>
              {goalKind === "income"
                ? "Defina o quanto deseja receber neste mês."
                : "Defina um teto de gastos para este mês."}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl bg-surface-2 border border-border p-5 space-y-1">
            <Label className="block">
              {goalKind === "income" ? "Valor da meta" : "Limite"}
            </Label>
            <Controller
              control={control}
              name="limit_cents"
              render={({ field }) => (
                <MoneyInput
                  variant="hero"
                  value={field.value || 0}
                  onChange={field.onChange}
                  autoFocus
                />
              )}
            />
            {errors.limit_cents && (
              <p className="text-xs text-danger">{errors.limit_cents.message}</p>
            )}
          </div>
          <DialogFooter>
            {existingGoalId && (
              <Button
                type="button"
                variant="ghost"
                onClick={onDelete}
                disabled={isPending}
                className="mr-auto !text-danger"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                "Salvar meta"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
