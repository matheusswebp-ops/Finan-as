"use client";

import { useState } from "react";
import { CalendarRange, X } from "lucide-react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
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
 * Popover com ícone de calendário para filtrar a aba Lucros por intervalo
 * de meses (de tal mês até tal mês). Quando aplicado grava
 * `?from=YYYY-MM-01&to=YYYY-MM-01` na URL e remove o filtro de ano.
 */
export function ProfitRangePopover({
  fromIso,
  toIso,
}: {
  fromIso: string | null;
  toIso: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const inCustom = !!(fromIso && toIso);

  const todayMonth = format(new Date(), "yyyy-MM");
  const [from, setFrom] = useState(fromIso ? fromIso.slice(0, 7) : todayMonth);
  const [to, setTo] = useState(toIso ? toIso.slice(0, 7) : todayMonth);

  const apply = () => {
    const sp = new URLSearchParams(params.toString());
    sp.delete("year");
    sp.set("from", `${from}-01`);
    sp.set("to", `${to}-01`);
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
            "h-8 w-8 grid place-items-center rounded-lg border transition-all",
            inCustom
              ? "bg-surface text-primary border-primary/40 shadow-[0_2px_12px_-4px_hsl(var(--primary)/0.4)]"
              : "bg-surface-2 text-fg-muted border-border hover:text-fg hover:bg-surface-3"
          )}
          aria-label="Filtrar lucro por intervalo de meses"
          title="Filtrar de tal mês até tal mês"
        >
          <CalendarRange className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="!w-[280px] space-y-3">
        <div>
          <p className="font-display text-sm font-semibold">Período personalizado</p>
          <p className="text-xs text-fg-muted">Escolha de tal mês até tal mês.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pr-from">De</Label>
          <Input id="pr-from" type="month" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pr-to">Até</Label>
          <Input id="pr-to" type="month" value={to} onChange={(e) => setTo(e.target.value)} />
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
          <p className="text-xs text-fg-muted tabular-nums pt-1 border-t border-border capitalize">
            {format(parse(fromIso, "yyyy-MM-dd", new Date()), "MMM/yy", { locale: ptBR })}
            {" → "}
            {format(parse(toIso, "yyyy-MM-dd", new Date()), "MMM/yy", { locale: ptBR })}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
