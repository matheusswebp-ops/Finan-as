"use client";

import { useState, useTransition } from "react";
import { Edit3, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "@/components/finance/CategoryFormDialog";
import { deleteCategory } from "@/lib/actions/categories";
import type { Category } from "@/types/database";

export function CategoryRowActions({ category }: { category: Category }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 h-8 w-8 grid place-items-center rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.06] transition-all"
            aria-label={`Opções de ${category.name}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit3 className="h-4 w-4 text-fg-muted" />
            Renomear / cor
          </DropdownMenuItem>
          {!category.is_default && (
            <DropdownMenuItem destructive onClick={() => setConfirm(true)}>
              <Trash2 className="h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CategoryFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={category}
      />

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir &quot;{category.name}&quot;?</DialogTitle>
            <DialogDescription>
              Os lançamentos antigos perdem a categoria, mas os valores são preservados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const r = await deleteCategory(category.id);
                  if (!r.ok) {
                    toast.error("Não foi possível excluir", { description: r.error });
                    return;
                  }
                  toast.success("Categoria excluída");
                  setConfirm(false);
                })
              }
            >
              {isPending ? "Excluindo…" : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
