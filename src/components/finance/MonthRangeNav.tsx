"use client";

import { useState } from "react";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import {
  addMonths,
  endOfMonth,
  format,
  parse,
  startOfMonth,
  subMonths,
} from "date-fns";
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
import { capitalize } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Navegador de mês para Despesas/Entradas. Por padrão exibe o mês atual
 * (sem precisar de URL params). Setas migram entre meses gravando
 * `?from=YYYY-MM-01&to=YYYY-MM-LL`. Inclui um popover de calendário
 * para intervalos personalizados (que tira o estado de "mês cheio").
 */
export function MonthRangeNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const fromParam = params.get("from");
  const toParam = params.get("to");
  const today = new Date();

  const fromDate = fromParam
    ? parse(fromParam.slice(0, 10), "yyyy-MM-dd", new Date())
    : startOfMonth(today);
  const toDate = toParam
    ? parse(toParam.slice(0, 10), "yyyy-MM-dd", new Date())
    : endOfMonth(today);

  // Detecta se from/to representam exatamente um mês cheio.
  const startOfFrom = startOfMonth(fromDate);
  const endOfFrom = endOfMonth(fromDate);
  const isWholeMonth =
    format(startOfFrom, "yyyy-MM-dd") === format(fromDate, "yyyy-MM-dd") &&
    format(endOfFrom, "yyyy-MM-dd") === format(toDate, "yyyy-MM-dd");
  const isCurrentMonth =
    isWholeMonth && format(fromDate, "yyyy-MM") === format(today, "yyyy-MM");

  const [popFrom, setPopFrom] = useState(format(fromDate, "yyyy-MM-dd"));
  const [popTo, setPopTo] = useState(format(toDate, "yyyy-MM-dd"));

  const goToMonth = (anchor: Date) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("from", format(startOfMonth(anchor), "yyyy-MM-dd"));
    sp.set("to", format(endOfMonth(anchor), "yyyy-MM-dd"));
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const reset = () => {
    const sp = new URLSearchParams(params.toString());
    sp.delete("from");
    sp.delete("to");
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const applyCustom = () => {
    const sp = new URLSearchParams(params.toString());
    sp.set("from", popFrom);
    sp.set("to", popTo);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const monthLabel = capitalize(
    format(fromDate, "MMMM 'de' yyyy", { locale: ptBR })
  );

  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center gap-1 rounded-xl bg-surface-2 border border-border p-1">
        <button
          onClick={() => goToMonth(subMonths(fromDate, 1))}
          className="h-8 w-8 grid place-items-center rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.06] transition-colors"
          aria-label="Mês anterior"
          title="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => goToMonth(today)}
          className="px-3 h-8 text-sm font-medium tabular-nums text-fg hover:text-primary transition-colors"
          title="Voltar para o mês atual"
        >
          {isWholeMonth ? (
            monthLabel
          ) : (
            <span className="inline-flex items-center gap-1">
              Personalizado <span className="text-fg-muted">·</span>{" "}
              <span className="text-xs text-fg-muted">
                {format(fromDate, "dd/MM/yy")} → {format(toDate, "dd/MM/yy")}
              </span>
            </span>
          )}
          {!isCurrentMonth && (
            <RotateCcw className="ml-1.5 h-3 w-3 inline-block text-fg-muted" />
          )}
        </button>
        <button
          onClick={() => goToMonth(addMonths(fromDate, 1))}
          className="h-8 w-8 grid place-items-center rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.06] transition-colors"
          aria-label="Próximo mês"
          title="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "h-9 w-9 grid place-items-center rounded-xl border transition-all",
              !isWholeMonth
                ? "bg-surface text-primary border-primary/40 shadow-[0_2px_12px_-4px_hsl(var(--primary)/0.4)]"
                : "bg-surface-2 text-fg-muted border-border hover:text-fg hover:bg-surface-3"
            )}
            aria-label="Filtrar por intervalo personalizado"
            title="Intervalo personalizado"
          >
            <CalendarRange className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="!w-[calc(100vw-1.5rem)] sm:!w-[300px] space-y-3">
          <div>
            <p className="font-display text-sm font-semibold">Intervalo personalizado</p>
            <p className="text-xs text-fg-muted">Use para qualquer faixa de datas.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mr-from">De</Label>
            <Input
              id="mr-from"
              type="date"
              value={popFrom}
              onChange={(e) => setPopFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mr-to">Até</Label>
            <Input
              id="mr-to"
              type="date"
              value={popTo}
              onChange={(e) => setPopTo(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            {!isCurrentMonth && (
              <Button variant="ghost" size="sm" onClick={reset}>
                <X className="h-3.5 w-3.5" />
                Mês atual
              </Button>
            )}
            <Button size="sm" className="ml-auto" onClick={applyCustom}>
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
