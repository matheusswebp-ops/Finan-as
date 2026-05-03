"use client";

import { useEffect, useTransition } from "react";
import { Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { profitSchema, type ProfitInput } from "@/lib/schemas/transaction";
import { upsertProfit } from "@/lib/actions/profits";
import type { Profit } from "@/types/database";

export function ProfitFormDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Profit | null;
}) {
  const [isPending, startTransition] = useTransition();
  const today = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProfitInput>({
    resolver: zodResolver(profitSchema),
    defaultValues: {
      id: initial?.id,
      month: initial?.month ?? today,
      income_cents: initial?.income_cents ?? 0,
      expense_cents: initial?.expense_cents ?? 0,
      notes: initial?.notes ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        id: initial?.id,
        month: initial?.month ?? today,
        income_cents: initial?.income_cents ?? 0,
        expense_cents: initial?.expense_cents ?? 0,
        notes: initial?.notes ?? "",
      });
    }
  }, [open, initial, reset, today]);

  const income = watch("income_cents") || 0;
  const expense = watch("expense_cents") || 0;
  const net = income - expense;

  const onSubmit = (data: ProfitInput) => {
    startTransition(async () => {
      const monthStart = format(
        startOfMonth(parse(data.month.slice(0, 10), "yyyy-MM-dd", new Date())),
        "yyyy-MM-dd"
      );
      const res = await upsertProfit({ ...data, month: monthStart });
      if (!res.ok) {
        toast.error("Erro ao salvar", { description: res.error });
        return;
      }
      toast.success("Lucro salvo");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{initial ? "Editar lucro" : "Registrar lucro"}</DialogTitle>
            <DialogDescription>
              Informe os totais de receita e despesa do mês para registrar o lucro líquido.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="month">Mês</Label>
            <Input
              id="month"
              type="month"
              defaultValue={(initial?.month ?? today).slice(0, 7)}
              {...register("month", {
                setValueAs: (v: string) => (v && v.length === 7 ? `${v}-01` : v),
              })}
            />
            {errors.month && <p className="text-xs text-danger">{errors.month.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Receitas</Label>
              <Controller
                control={control}
                name="income_cents"
                render={({ field }) => (
                  <MoneyInput value={field.value || 0} onChange={field.onChange} />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Despesas</Label>
              <Controller
                control={control}
                name="expense_cents"
                render={({ field }) => (
                  <MoneyInput value={field.value || 0} onChange={field.onChange} />
                )}
              />
            </div>
          </div>

          <div className="rounded-xl bg-surface-2 border border-border px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-fg-muted">Lucro líquido</p>
            <p
              className={`font-display text-xl font-medium tabular-nums ${
                net < 0 ? "text-danger" : "text-success"
              }`}
            >
              {(net / 100).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observação (opcional)</Label>
            <Input id="notes" placeholder="Anote algo sobre este mês" {...register("notes")} />
          </div>

          <DialogFooter>
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
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
