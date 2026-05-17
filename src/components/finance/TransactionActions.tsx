"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Edit3, MoreHorizontal, Trash2 } from "lucide-react";
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
import { TransactionForm } from "@/components/forms/TransactionForm";
import { celebrate } from "@/components/finance/Celebration";
import {
  deleteTransaction,
  markTransactionPaid,
} from "@/lib/actions/transactions";
import type { Category } from "@/types/database";
import type { TxWithRelations } from "@/lib/queries/transactions";

export function TransactionActions({
  tx,
  categories,
}: {
  tx: TxWithRelations;
  categories: Category[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onDelete = () => {
    startTransition(async () => {
      const res = await deleteTransaction(tx.id);
      if (!res.ok) {
        toast.error("Não foi possível excluir", { description: res.error });
        return;
      }
      toast.success("Lançamento excluído");
      setConfirmOpen(false);
      router.refresh();
    });
  };

  const onMarkPaid = () => {
    startTransition(async () => {
      const res = await markTransactionPaid(tx.id);
      if (!res.ok) {
        toast.error("Não foi possível marcar como pago", { description: res.error });
        return;
      }
      celebrate();
      toast.success(tx.kind === "expense" ? "Conta paga, parabéns!" : "Receita confirmada!", {
        description: tx.description,
      });
      router.refresh();
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 h-8 w-8 grid place-items-center rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.06] transition-all"
            aria-label="Ações"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {tx.status === "forecast" && (
            <DropdownMenuItem onClick={onMarkPaid}>
              <CheckCircle2 className="h-4 w-4 text-success" />
              {tx.kind === "expense" ? "Marcar como pago" : "Marcar como recebido"}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit3 className="h-4 w-4 text-fg-muted" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem destructive onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="!max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar lançamento</DialogTitle>
            <DialogDescription>Atualize as informações abaixo.</DialogDescription>
          </DialogHeader>
          <TransactionForm
            categories={categories}
            initial={{
              id: tx.id,
              kind: tx.kind as "expense" | "income",
              status: tx.status as "realized" | "forecast",
              amount_cents: tx.amount_cents,
              description: tx.description,
              category_id: tx.category_id,
              occurred_on: tx.occurred_on,
              is_recurring: tx.is_recurring,
              installment_total: tx.installment_total,
            }}
            onSuccess={() => {
                setEditOpen(false);
                router.refresh();
              }}
            previousStatus={tx.status as "realized" | "forecast"}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir lançamento?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O lançamento &quot;{tx.description}&quot; será removido.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={isPending}>
              {isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
