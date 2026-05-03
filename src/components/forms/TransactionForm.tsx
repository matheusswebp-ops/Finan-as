"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Infinity as InfinityIcon,
  Loader2,
  Repeat,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MoneyInput } from "./MoneyInput";
import { transactionSchema, type TransactionInput } from "@/lib/schemas/transaction";
import { createTransaction, updateTransaction } from "@/lib/actions/transactions";
import { celebrate } from "@/components/finance/Celebration";
import type { Category } from "@/types/database";
import { categoryHsl } from "@/lib/colors";
import { cn } from "@/lib/utils";

export interface TransactionFormProps {
  categories: Category[];
  defaultKind?: "expense" | "income";
  defaultStatus?: "realized" | "forecast";
  initial?: Partial<TransactionInput> & { id?: string };
  /** Status do registro antes da edição (para detectar transição forecast→realized e festejar). */
  previousStatus?: "realized" | "forecast";
  onSuccess?: () => void;
}

export function TransactionForm({
  categories,
  defaultKind = "expense",
  defaultStatus = "realized",
  initial,
  previousStatus,
  onSuccess,
}: TransactionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [installmentEnabled, setInstallmentEnabled] = useState(
    !!initial?.installment_total
  );

  const today = format(new Date(), "yyyy-MM-dd");

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      id: initial?.id,
      kind: (initial?.kind as "expense" | "income") ?? defaultKind,
      status:
        (initial?.status as "realized" | "forecast") ?? defaultStatus,
      amount_cents: initial?.amount_cents ?? 0,
      description: initial?.description ?? "",
      category_id: initial?.category_id ?? null,
      occurred_on: initial?.occurred_on ?? today,
      is_recurring: initial?.is_recurring ?? false,
      installment_total: initial?.installment_total ?? null,
    },
  });

  const kind = watch("kind");
  const filteredCategories = categories.filter((c) => c.kind === kind);

  const onSubmit = (data: TransactionInput) => {
    startTransition(async () => {
      const payload: TransactionInput = {
        ...data,
        installment_total: installmentEnabled ? data.installment_total ?? 2 : null,
      };
      const result = initial?.id
        ? await updateTransaction({ ...payload, id: initial.id })
        : await createTransaction(payload);

      if (!result.ok) {
        toast.error("Não foi possível salvar", { description: result.error });
        return;
      }
      // Festejar quando uma conta sai de "previsto" para "pago"
      const becamePaid =
        data.status === "realized" &&
        (previousStatus === "forecast" || (!initial?.id && data.status === "realized" && data.kind === "expense"));
      if (becamePaid && previousStatus === "forecast") {
        celebrate();
      }
      toast.success(initial?.id ? "Lançamento atualizado" : "Lançamento adicionado");
      onSuccess?.();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Kind toggle */}
      <Controller
        control={control}
        name="kind"
        render={({ field }) => (
          <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-surface-2 border border-border">
            <button
              type="button"
              onClick={() => field.onChange("expense")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all",
                field.value === "expense"
                  ? "bg-danger-soft text-danger shadow-[inset_0_0_0_1px_hsl(var(--danger)/0.3)]"
                  : "text-fg-muted hover:text-fg"
              )}
            >
              <ArrowDownRight className="h-4 w-4" />
              Saída
            </button>
            <button
              type="button"
              onClick={() => field.onChange("income")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all",
                field.value === "income"
                  ? "bg-success-soft text-success shadow-[inset_0_0_0_1px_hsl(var(--success)/0.3)]"
                  : "text-fg-muted hover:text-fg"
              )}
            >
              <ArrowUpRight className="h-4 w-4" />
              Entrada
            </button>
          </div>
        )}
      />

      {/* Hero amount */}
      <div className="rounded-2xl bg-surface-2 border border-border p-5 space-y-1">
        <Label htmlFor="amount" className="block">
          Valor
        </Label>
        <Controller
          control={control}
          name="amount_cents"
          render={({ field }) => (
            <MoneyInput
              variant="hero"
              value={field.value || 0}
              onChange={field.onChange}
              autoFocus
              id="amount"
            />
          )}
        />
        {errors.amount_cents && (
          <p className="text-xs text-danger">{errors.amount_cents.message}</p>
        )}
      </div>

      {/* Status: realizado vs previsão */}
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-surface-2 border border-border">
              <button
                type="button"
                onClick={() => field.onChange("realized")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all",
                  field.value === "realized"
                    ? "bg-success-soft text-success shadow-[inset_0_0_0_1px_hsl(var(--success)/0.3)]"
                    : "text-fg-muted hover:text-fg"
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
                {kind === "expense" ? "Pago" : "Recebido"}
              </button>
              <button
                type="button"
                onClick={() => field.onChange("forecast")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all",
                  field.value === "forecast"
                    ? "bg-warning-soft text-warning shadow-[inset_0_0_0_1px_hsl(var(--warning)/0.3)]"
                    : "text-fg-muted hover:text-fg"
                )}
              >
                <Clock className="h-4 w-4" />
                {kind === "expense" ? "A pagar" : "A receber"}
              </button>
            </div>
          </div>
        )}
      />

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          placeholder={kind === "expense" ? "Ex: Mercado da semana" : "Ex: Salário de maio"}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-danger">{errors.description.message}</p>
        )}
      </div>

      {/* Category + Date */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <Select
                value={field.value ?? "none"}
                onValueChange={(v) => field.onChange(v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sem categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-fg-muted">Sem categoria</span>
                  </SelectItem>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: categoryHsl(c.color) }}
                        aria-hidden
                      />
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="occurred_on">Data</Label>
          <Input
            id="occurred_on"
            type="date"
            startIcon={<CalendarDays className="h-4 w-4" />}
            {...register("occurred_on")}
          />
        </div>
      </div>

      {/* Lançamento fixo (recorrente) — vale para ambos os tipos */}
      <Controller
        control={control}
        name="is_recurring"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-2 border border-border px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid place-items-center h-7 w-7 rounded-lg bg-primary-soft text-primary">
                <InfinityIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">
                  Lançamento fixo
                </p>
                <p className="text-xs text-fg-muted">
                  {kind === "expense"
                    ? "Marque despesas que se repetem todo mês (aluguel, internet, escola)."
                    : "Marque receitas que se repetem todo mês (salário fixo, mensalidade)."}
                </p>
              </div>
            </div>
            <Switch
              checked={!!field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
            />
          </div>
        )}
      />

      {/* Installment toggle (expense only) */}
      {kind === "expense" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-2 border border-border px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid place-items-center h-7 w-7 rounded-lg bg-primary-soft text-primary">
                <Repeat className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Parcelar lançamento</p>
                <p className="text-xs text-fg-muted">
                  Cria uma cópia mensal automaticamente
                </p>
              </div>
            </div>
            <Switch
              checked={installmentEnabled}
              onCheckedChange={(checked) => {
                setInstallmentEnabled(checked);
                if (checked && !watch("installment_total")) setValue("installment_total", 3);
                if (!checked) setValue("installment_total", null);
              }}
            />
          </div>
          {installmentEnabled && (
            <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl bg-surface-2 border border-border px-4 py-3 animate-[fade-in_0.3s_ease]">
              <Label
                htmlFor="installment_total"
                className="!text-fg !normal-case !tracking-normal !text-sm"
              >
                Quantas parcelas?
              </Label>
              <Input
                id="installment_total"
                type="number"
                inputMode="numeric"
                min={2}
                max={60}
                className="max-w-[120px] ml-auto"
                {...register("installment_total", { valueAsNumber: true })}
              />
            </div>
          )}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : initial?.id ? (
          "Salvar alterações"
        ) : (
          "Adicionar lançamento"
        )}
      </Button>
    </form>
  );
}
