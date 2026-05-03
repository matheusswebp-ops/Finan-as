"use client";

import { useEffect, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import { dreamUpdateSchema, type DreamUpdateInput } from "@/lib/schemas/transaction";
import { addDreamUpdate } from "@/lib/actions/dreams";

export function DreamUpdateDialog({
  open,
  onOpenChange,
  dreamId,
  dreamTitle,
  currentCents,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dreamId: string;
  dreamTitle: string;
  currentCents: number;
}) {
  const [isPending, startTransition] = useTransition();
  const today = format(new Date(), "yyyy-MM-dd");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<DreamUpdateInput>({
    resolver: zodResolver(dreamUpdateSchema),
    defaultValues: {
      dream_id: dreamId,
      amount_cents: currentCents,
      note: "",
      occurred_on: today,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        dream_id: dreamId,
        amount_cents: currentCents,
        note: "",
        occurred_on: today,
      });
    }
  }, [open, dreamId, currentCents, reset, today]);

  const onSubmit = (data: DreamUpdateInput) => {
    startTransition(async () => {
      const res = await addDreamUpdate(data);
      if (!res.ok) {
        toast.error("Erro ao registrar", { description: res.error });
        return;
      }
      toast.success("Atualização registrada");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Atualizar progresso</DialogTitle>
            <DialogDescription>
              Quanto vocês têm guardado para {dreamTitle} hoje?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Valor atual guardado</Label>
            <Controller
              control={control}
              name="amount_cents"
              render={({ field }) => (
                <MoneyInput value={field.value || 0} onChange={field.onChange} />
              )}
            />
            {errors.amount_cents && (
              <p className="text-xs text-danger">{errors.amount_cents.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="occurred_on">Data</Label>
            <Input id="occurred_on" type="date" {...register("occurred_on")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Observação (opcional)</Label>
            <Input
              id="note"
              placeholder="Como foi este mês?"
              {...register("note")}
            />
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
                "Registrar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
