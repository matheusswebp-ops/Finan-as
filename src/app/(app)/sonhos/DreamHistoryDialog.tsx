"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, History as HistoryIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/format";
import type { DreamUpdate } from "@/types/database";

export function DreamHistoryDialog({
  open,
  onOpenChange,
  dreamId,
  dreamTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dreamId: string;
  dreamTitle: string;
}) {
  const [updates, setUpdates] = useState<DreamUpdate[] | null>(null);

  useEffect(() => {
    if (!open) return;
    setUpdates(null);
    const supabase = createClient();
    supabase
      .from("dream_updates")
      .select("*")
      .eq("dream_id", dreamId)
      .order("occurred_on", { ascending: false })
      .then(({ data }) => setUpdates(data ?? []));
  }, [open, dreamId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HistoryIcon className="h-4 w-4 text-fg-muted" />
            Histórico de {dreamTitle}
          </DialogTitle>
          <DialogDescription>
            Cada registro mostra o valor guardado naquela data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {updates === null ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : updates.length === 0 ? (
            <p className="text-sm text-fg-muted py-6 text-center">
              Sem atualizações registradas ainda.
            </p>
          ) : (
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {updates.map((u) => {
                const positive = (u.delta_cents ?? 0) > 0;
                const negative = (u.delta_cents ?? 0) < 0;
                return (
                  <li
                    key={u.id}
                    className="flex items-center gap-3 rounded-xl bg-surface-2 border border-border px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium tabular-nums">
                        {formatBRL(u.amount_cents)}
                      </p>
                      <p className="text-xs text-fg-muted">
                        {format(parseISO(u.occurred_on), "dd 'de' MMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                        {u.note ? ` · ${u.note}` : ""}
                      </p>
                    </div>
                    {u.delta_cents != null && u.delta_cents !== 0 && (
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums px-2 py-0.5 rounded-full ${
                          positive
                            ? "bg-success-soft text-success"
                            : negative
                              ? "bg-danger-soft text-danger"
                              : "text-fg-muted"
                        }`}
                      >
                        {positive ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : negative ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : null}
                        {formatBRL(Math.abs(u.delta_cents))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
