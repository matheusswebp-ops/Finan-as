"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "./CategoryPicker";
import { categorySchema, type CategoryInput } from "@/lib/schemas/transaction";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import type { Category } from "@/types/database";

export interface CategoryFormDialogProps {
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Triggers used in uncontrolled mode. */
  trigger?: React.ReactNode;
  initial?: Category;
  defaultKind?: "expense" | "income";
}

export function CategoryFormDialog({
  open: controlledOpen,
  onOpenChange,
  trigger,
  initial,
  defaultKind = "expense",
}: CategoryFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next);
    else setInternalOpen(next);
  };

  const [isPending, startTransition] = useTransition();
  const isEdit = !!initial;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: initial?.id,
      name: initial?.name ?? "",
      kind: (initial?.kind as "expense" | "income") ?? defaultKind,
      color: initial?.color ?? "cat-1",
      icon: initial?.icon ?? "circle",
    },
  });

  // Reset form when reopened with different data
  useEffect(() => {
    if (open) {
      reset({
        id: initial?.id,
        name: initial?.name ?? "",
        kind: (initial?.kind as "expense" | "income") ?? defaultKind,
        color: initial?.color ?? "cat-1",
        icon: initial?.icon ?? "circle",
      });
    }
  }, [open, initial, defaultKind, reset]);

  const onSubmit = (data: CategoryInput) => {
    startTransition(async () => {
      const res = isEdit
        ? await updateCategory({ ...data, id: initial!.id })
        : await createCategory(data);
      if (!res.ok) {
        toast.error("Erro ao salvar", { description: res.error });
        return;
      }
      toast.success(isEdit ? "Categoria atualizada" : "Categoria criada");
      setOpen(false);
    });
  };

  return (
    <>
      {!isControlled && trigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="contents"
          aria-label="Abrir formulário de categoria"
        >
          {trigger}
        </button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "Editar categoria" : "Nova categoria"}
              </DialogTitle>
              <DialogDescription>
                Categorias ajudam você a entender para onde o dinheiro está indo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="cat-name">Nome</Label>
              <Input
                id="cat-name"
                placeholder="Ex: Streaming, Pet, Energia…"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-danger">{errors.name.message}</p>
              )}
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Controller
                  control={control}
                  name="kind"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Saída</SelectItem>
                        <SelectItem value="income">Entrada</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Cor</Label>
              <Controller
                control={control}
                name="color"
                render={({ field }) => (
                  <ColorPicker value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Salvando…
                  </>
                ) : isEdit ? (
                  "Salvar alterações"
                ) : (
                  "Criar categoria"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
