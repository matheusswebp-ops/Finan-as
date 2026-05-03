"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { celebrate } from "@/components/finance/Celebration";
import { markTransactionPaid } from "@/lib/actions/transactions";
import { cn } from "@/lib/utils";

export function MarkPaidButton({
  id,
  kind,
  className,
}: {
  id: string;
  kind: "expense" | "income";
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const label = kind === "expense" ? "Marcar como pago" : "Marcar como recebido";
  const successMsg = kind === "expense" ? "Conta paga, parabéns!" : "Receita confirmada!";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation();
        startTransition(async () => {
          const res = await markTransactionPaid(id);
          if (!res.ok) {
            toast.error("Não foi possível atualizar", { description: res.error });
            return;
          }
          celebrate();
          toast.success(successMsg);
        });
      }}
      aria-label={label}
      title={label}
      className={cn(
        "h-9 w-9 grid place-items-center rounded-xl border transition-all shrink-0",
        "bg-transparent text-fg-muted border-border",
        "hover:bg-success-soft hover:text-success hover:border-success/50 hover:scale-[1.04]",
        "active:scale-95 disabled:opacity-60",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Check className="h-4 w-4" strokeWidth={2.5} />
      )}
    </button>
  );
}
