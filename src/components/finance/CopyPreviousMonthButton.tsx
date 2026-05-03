"use client";

import { useState, useTransition } from "react";
import { CopyPlus, Loader2 } from "lucide-react";
import { format, parse, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import { copyFromPreviousMonth } from "@/lib/actions/transactions";

export function CopyPreviousMonthButton({
  kind,
  referenceIso,
}: {
  kind: "expense" | "income";
  referenceIso: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const ref = parse(referenceIso.slice(0, 10), "yyyy-MM-dd", new Date());
  const prevLabel = format(subMonths(ref, 1), "MMMM 'de' yyyy", { locale: ptBR });
  const targetLabel = format(ref, "MMMM 'de' yyyy", { locale: ptBR });
  const isExpense = kind === "expense";

  const onConfirm = () => {
    startTransition(async () => {
      const r = await copyFromPreviousMonth({ kind, referenceIso });
      if (!r.ok) {
        toast.error("Não foi possível copiar", { description: r.error });
        return;
      }
      if (r.count === 0) {
        toast.info(`Nenhum lançamento único em ${prevLabel} para copiar.`, {
          description:
            "Lançamentos parcelados são pulados — eles já se renovam automaticamente.",
        });
        setOpen(false);
        return;
      }

      toast.success(
        `${r.count} ${r.count === 1 ? "lançamento copiado" : "lançamentos copiados"}`,
        {
          description: `Marcados como ${isExpense ? "a pagar" : "a receber"} em ${targetLabel}.`,
        }
      );

      // Leva o usuário direto para a aba que mostra os lançamentos copiados.
      const sp = new URLSearchParams(params.toString());
      sp.set("tab", "due");
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
      router.refresh();
      setOpen(false);
    });
  };

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <CopyPlus className="h-4 w-4" />
        Copiar do mês anterior
      </Button>

      <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              Copiar de {prevLabel} para {targetLabel}?
            </DialogTitle>
            <DialogDescription>
              {isExpense
                ? "Vamos copiar todas as despesas únicas do mês anterior, ajustando a data em +1 mês. Os novos lançamentos entram como “A pagar” e você marca como pago quando quitar."
                : "Vamos copiar todas as entradas únicas do mês anterior, ajustando a data em +1 mês. Os novos lançamentos entram como “A receber” e você marca como recebido quando cair."}
              {" "}Lançamentos parcelados são pulados — eles já se renovam sozinhos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={onConfirm} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Copiando...
                </>
              ) : (
                <>
                  <CopyPlus className="h-4 w-4" />
                  Copiar agora
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
