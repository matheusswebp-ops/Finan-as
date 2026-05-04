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
import type { Period } from "@/lib/queries/balance";

const OPTIONS: { value: Period; label: string }[] = [
  { value: "day", label: "Hoje" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
];

export function PeriodSelector({ defaultPeriod = "month" }: { defaultPeriod?: Period }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const customFrom = params.get("from");
  const customTo = params.get("to");
  const inCustom = !!(customFrom && customTo);
  const current = (params.get("period") as Period) ?? defaultPeriod;

  const today = new Date();
  const [from, setFrom] = useState(customFrom ?? format(startOfMonth(today), "yyyy-MM-dd"));
  const [to, setTo] = useState(customTo ?? format(endOfMonth(today), "yyyy-MM-dd"));

  const setPeriod = (period: Period) => {
    const sp = new URLSearchParams(params.toString());
    sp.delete("from");
    sp.delete("to");
    if (period === defaultPeriod) sp.delete("period");
    else sp.set("period", period);
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const applyCustom = () => {
    const sp = new URLSearchParams(params.toString());
    sp.delete("period");
    sp.set("from", from);
    sp.set("to", to);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const clearCustom = () => {
    const sp = new URLSearchParams(params.toString());
    sp.delete("from");
    sp.delete("to");
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-surface-2 border border-border p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setPeriod(opt.value)}
          className={cn(
            "h-9 px-4 rounded-lg text-sm font-medium transition-all",
            !inCustom && current === opt.value
              ? "bg-surface text-fg shadow-[0_2px_12px_-4px_hsl(var(--primary)/0.4)] border border-border-strong"
              : "text-fg-muted hover:text-fg"
          )}
        >
          {opt.label}
        </button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "h-9 w-9 grid place-items-center rounded-lg transition-all",
              inCustom
                ? "bg-surface text-primary shadow-[0_2px_12px_-4px_hsl(var(--primary)/0.4)] border border-border-strong"
                : "text-fg-muted hover:text-fg"
            )}
            aria-label="Filtrar por intervalo de datas"
          >
            <CalendarRange className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="!w-[calc(100vw-1.5rem)] sm:!w-[300px] space-y-3">
          <div>
            <p className="font-display text-sm font-semibold">Intervalo personalizado</p>
            <p className="text-xs text-fg-muted">Escolha de tal data até tal data.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-from">De</Label>
            <Input
              id="custom-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-to">Até</Label>
            <Input
              id="custom-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            {inCustom && (
              <Button variant="ghost" size="sm" onClick={clearCustom}>
                <X className="h-3.5 w-3.5" />
                Limpar
              </Button>
            )}
            <Button size="sm" className="ml-auto" onClick={applyCustom}>
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
    </div>
  );
}
