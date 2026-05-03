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
import { dreamSchema, type DreamInput } from "@/lib/schemas/transaction";
import { createDream, updateDream } from "@/lib/actions/dreams";
import type { Dream } from "@/types/database";

export function DreamFormDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Dream | null;
}) {
  const [isPending, startTransition] = useTransition();
  const today = format(new Date(), "yyyy-MM-dd");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<DreamInput>({
    resolver: zodResolver(dreamSchema),
    defaultValues: {
      id: initial?.id,
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      image_url: initial?.image_url ?? "",
      target_cents: initial?.target_cents ?? 0,
      current_cents: initial?.current_cents ?? 0,
      deadline: initial?.deadline ?? today,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        id: initial?.id,
        title: initial?.title ?? "",
        description: initial?.description ?? "",
        image_url: initial?.image_url ?? "",
        target_cents: initial?.target_cents ?? 0,
        current_cents: initial?.current_cents ?? 0,
        deadline: initial?.deadline ?? today,
      });
    }
  }, [open, initial, reset, today]);

  const onSubmit = (data: DreamInput) => {
    startTransition(async () => {
      const res = initial?.id
        ? await updateDream({ ...data, id: initial.id })
        : await createDream(data);
      if (!res.ok) {
        toast.error("Erro ao salvar", { description: res.error });
        return;
      }
      toast.success(initial ? "Sonho atualizado" : "Sonho criado");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{initial ? "Editar sonho" : "Novo sonho"}</DialogTitle>
            <DialogDescription>
              Conte para onde você quer chegar e em quanto tempo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Ex: Viagem ao Japão" {...register("title")} />
            {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Conte um pouco sobre esse sonho"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da imagem (opcional)</Label>
            <Input
              id="image_url"
              type="url"
              placeholder="Cole o link de uma foto"
              {...register("image_url")}
            />
            {errors.image_url && (
              <p className="text-xs text-danger">{errors.image_url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor total</Label>
              <Controller
                control={control}
                name="target_cents"
                render={({ field }) => (
                  <MoneyInput value={field.value || 0} onChange={field.onChange} />
                )}
              />
              {errors.target_cents && (
                <p className="text-xs text-danger">{errors.target_cents.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Já guardado</Label>
              <Controller
                control={control}
                name="current_cents"
                render={({ field }) => (
                  <MoneyInput value={field.value || 0} onChange={field.onChange} />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo</Label>
            <Input id="deadline" type="date" {...register("deadline")} />
            {errors.deadline && (
              <p className="text-xs text-danger">{errors.deadline.message}</p>
            )}
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
