"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, format, parse, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { capitalize } from "@/lib/format";

export function MonthSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const monthParam = params.get("month");

  const current = monthParam
    ? parse(`${monthParam}-01`, "yyyy-MM-dd", new Date())
    : new Date();

  const setMonth = (d: Date) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("month", format(d, "yyyy-MM"));
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const reset = () => {
    const sp = new URLSearchParams(params.toString());
    sp.delete("month");
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const label = capitalize(format(current, "MMMM 'de' yyyy", { locale: ptBR }));
  const isCurrent = format(current, "yyyy-MM") === format(new Date(), "yyyy-MM");

  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-surface-2 border border-border p-1">
      <button
        onClick={() => setMonth(subMonths(current, 1))}
        className="h-8 w-8 grid place-items-center rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.06] transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={reset}
        className="px-3 h-8 text-sm font-medium tabular-nums text-fg hover:text-primary transition-colors"
        title="Voltar para o mês atual"
      >
        {label}
        {!isCurrent && <span className="ml-1.5 text-xs text-fg-muted">↺</span>}
      </button>
      <button
        onClick={() => setMonth(addMonths(current, 1))}
        className="h-8 w-8 grid place-items-center rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.06] transition-colors"
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
