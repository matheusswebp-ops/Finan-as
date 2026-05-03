"use client";

import { useState, useTransition } from "react";
import {
  Edit3,
  MoreVertical,
  RefreshCw,
  Trash2,
  Plus,
} from "lucide-react";
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
import { ProfitFormDialog } from "./ProfitFormDialog";
import { deleteProfit, generateAutoProfit } from "@/lib/actions/profits";
import type { Profit } from "@/types/database";

export function NewProfitButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Registrar lucro
      </Button>
      <ProfitFormDialog open={open} onOpenChange={setOpen} initial={null} />
    </>
  );
}

export function GenerateAutoButton({ monthIso }: { monthIso: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const r = await generateAutoProfit(monthIso);
          if (!r.ok) {
            toast.error("Não foi possível gerar", { description: r.error });
            return;
          }
          toast.success("Lucro automático atualizado");
        })
      }
    >
      <RefreshCw className="h-4 w-4" />
      Gerar do mês atual
    </Button>
  );
}

export function ProfitRowActions({ profit }: { profit: Profit }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="h-8 w-8 grid place-items-center rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.06] transition-all"
            aria-label="Opções"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit3 className="h-4 w-4 text-fg-muted" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem destructive onClick={() => setConfirm(true)}>
            <Trash2 className="h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfitFormDialog open={editOpen} onOpenChange={setEditOpen} initial={profit} />

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir lançamento de lucro?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita.
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
                  const r = await deleteProfit(profit.id);
                  if (!r.ok) {
                    toast.error("Não foi possível excluir", { description: r.error });
                    return;
                  }
                  toast.success("Lucro excluído");
                  setConfirm(false);
                })
              }
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
