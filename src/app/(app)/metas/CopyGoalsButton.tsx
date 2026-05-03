"use client";

import { useTransition } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { copyGoalsFromPreviousMonth } from "@/lib/actions/goals";

export function CopyGoalsButton({ monthIso }: { monthIso: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const r = await copyGoalsFromPreviousMonth(`${monthIso}-01`);
          if (!r.ok) {
            toast.error("Não foi possível replicar", { description: r.error });
            return;
          }
          toast.success("Metas replicadas do mês anterior");
        })
      }
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RotateCcw className="h-4 w-4" />
      )}
      Replicar do mês anterior
    </Button>
  );
}
