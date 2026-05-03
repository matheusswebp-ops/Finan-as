"use client";

import { useState, useTransition } from "react";
import {
  CalendarClock,
  Edit3,
  History,
  MoreVertical,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DreamFormDialog } from "./DreamFormDialog";
import { DreamUpdateDialog } from "./DreamUpdateDialog";
import { DreamHistoryDialog } from "./DreamHistoryDialog";
import { deleteDream } from "@/lib/actions/dreams";
import type { DreamWithProgress } from "@/lib/queries/dreams";
import { formatBRL, formatPercent } from "@/lib/format";

export function DreamCard({ dream }: { dream: DreamWithProgress }) {
  const [editOpen, setEditOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const pct = Math.min(1, dream.pct);
  const fallbackImg =
    "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80";

  return (
    <Card interactive className="!p-0 overflow-hidden">
      <div className="relative h-44 sm:h-48 overflow-hidden">
        <img
          src={dream.image_url ?? fallbackImg}
          alt=""
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImg;
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.65) 100%)",
          }}
        />
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-8 w-8 grid place-items-center rounded-lg bg-black/60 text-fg hover:bg-black/80 transition-colors"
                aria-label="Opções"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
                <Plus className="h-4 w-4 text-fg-muted" />
                Atualizar valor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
                <History className="h-4 w-4 text-fg-muted" />
                Histórico
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Edit3 className="h-4 w-4 text-fg-muted" />
                Editar sonho
              </DropdownMenuItem>
              <DropdownMenuItem destructive onClick={() => setConfirm(true)}>
                <Trash2 className="h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2">
          {pct >= 1 && (
            <Badge variant="success">
              <Sparkles className="h-3 w-3" />
              Conquistado
            </Badge>
          )}
          {dream.daysLeft <= 30 && pct < 1 && (
            <Badge variant="warning">
              <CalendarClock className="h-3 w-3" />
              {dream.daysLeft === 0 ? "Prazo hoje" : `${dream.daysLeft} dias`}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-display text-lg font-semibold">{dream.title}</h3>
          {dream.description && (
            <p className="text-sm text-fg-muted line-clamp-2 mt-0.5">{dream.description}</p>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-2 mb-1.5">
            <p className="font-display text-2xl font-medium tabular-nums">
              {formatBRL(dream.current_cents)}
            </p>
            <p className="text-sm text-fg-muted tabular-nums">
              de {formatBRL(dream.target_cents)}
            </p>
          </div>
          <Progress
            value={pct * 100}
            indicatorClassName={pct >= 1 ? "bg-success" : "bg-primary"}
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-fg-muted tabular-nums">
            <span>{formatPercent(pct)}</span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              prazo {format(parseISO(dream.deadline), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="primary" className="flex-1" onClick={() => setUpdateOpen(true)}>
            <TrendingUp className="h-4 w-4" />
            Atualizar
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setHistoryOpen(true)}>
            <History className="h-4 w-4" />
            Histórico
          </Button>
        </div>
      </div>

      <DreamFormDialog open={editOpen} onOpenChange={setEditOpen} initial={dream} />
      <DreamUpdateDialog
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        dreamId={dream.id}
        dreamTitle={dream.title}
        currentCents={dream.current_cents}
      />
      <DreamHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        dreamId={dream.id}
        dreamTitle={dream.title}
      />

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir &quot;{dream.title}&quot;?</DialogTitle>
            <DialogDescription>
              Você perderá o histórico de atualizações deste sonho.
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
                  const r = await deleteDream(dream.id);
                  if (!r.ok) {
                    toast.error("Não foi possível excluir", { description: r.error });
                    return;
                  }
                  toast.success("Sonho excluído");
                  setConfirm(false);
                })
              }
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
