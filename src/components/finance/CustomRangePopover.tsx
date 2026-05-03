"use client";

import { useState } from "react";
import { CalendarRange, X } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Botão com ícone de calendário que abre um popover para escolher
 * um intervalo personalizado (de tal data até tal data). Quando aplicado,
 * grava `?from=YYYY-MM-DD&to=YYYY-MM-DD` na URL e remove `month`/`period`.
 */
export function CustomRangePopover({
  /** Quais query params devem ser limpos quando o range custom é aplicado. */
  clears = ["month", "period"],
}: {
  clears?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const customFrom = params.get("from");
  const customTo = params.get("to");
  const inCustom = !!(customFrom && customTo);

  const today = new Date();
  const [from, setFrom] = useState(customFrom ?? format(startOfMonth(today), "yyyy-MM-dd"));
  const [to, setTo] = useState(customTo ?? format(endOfMonth(today), "yyyy-MM-dd"));

  const apply = () => {
    const sp = new URLSearchParams(params.toString());
    for (const c of clears) sp.delete(c);
    sp.set("from", from);
    sp.set("to", to);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const clear = () => {
    const sp = new URLSearchParams(params.toString());
    sp.delete("from");
    sp.delete("to");
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "h-9 w-9 grid place-items-center rounded-xl border transition-all",
            inCustom
              ? "bg-surface text-primary border-primary/40 shadow-[0_2px_12px_-4px_hsl(var(--primary)/0.4)]"
              : "bg-surface-2 text-fg-muted border-border hover:text-fg hover:bg-surface-3"
          )}
          aria-label="Filtrar por intervalo de datas"
          title="Filtrar de tal data até tal data"
        >
          <CalendarRange className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="!w-[300px] space-y-3">
        <div>
          <p className="font-display text-sm font-semibold">Intervalo personalizado</p>
          <p className="text-xs text-fg-muted">Escolha de tal data até tal data.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cr-from">De</Label>
          <Input id="cr-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cr-to">Até</Label>
          <Input id="cr-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 pt-1">
          {inCustom && (
            <Button variant="ghost" size="sm" onClick={clear}>
              <X className="h-3.5 w-3.5" />
              Limpar
            </Button>
          )}
          <Button size="sm" className="ml-auto" onClick={apply}>
            Aplicar
          </Button>
        </div>
        {inCustom && (
          <p className="text-xs text-fg-muted tabular-nums pt-1 border-t border-border">
            Filtrando de {format(parseISO(customFrom), "dd/MM/yyyy")} até{" "}
            {format(parseISO(customTo), "dd/MM/yyyy")}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
