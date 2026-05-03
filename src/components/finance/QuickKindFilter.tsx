"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function QuickKindFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("today") as "income" | "expense" | null;

  const set = (val: "income" | "expense" | null) => {
    const sp = new URLSearchParams(params.toString());
    if (val === null || sp.get("today") === val) sp.delete("today");
    else sp.set("today", val);
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => set("income")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
          active === "income"
            ? "bg-success text-fg shadow-[0_4px_16px_-4px_hsl(var(--success)/0.5)]"
            : "bg-success-soft text-success border border-success/30 hover:brightness-110"
        )}
      >
        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        Receita do dia
      </button>
      <button
        onClick={() => set("expense")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
          active === "expense"
            ? "bg-danger text-fg shadow-[0_4px_16px_-4px_hsl(var(--danger)/0.5)]"
            : "bg-danger-soft text-danger border border-danger/30 hover:brightness-110"
        )}
      >
        <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        Despesa do dia
      </button>
      {active && (
        <button
          onClick={() => set(null)}
          className="text-xs text-fg-muted hover:text-fg underline underline-offset-2"
        >
          limpar filtro
        </button>
      )}
    </div>
  );
}
