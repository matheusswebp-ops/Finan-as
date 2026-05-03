"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, PartyPopper, X } from "lucide-react";
import { formatBRL } from "@/lib/format";

export function MonthEndProfitBanner({ netCents }: { netCents: number }) {
  const [hidden, setHidden] = useState(false);
  if (hidden || netCents <= 0) return null;

  return (
    <div
      className="relative rounded-3xl border border-success/30 p-5 sm:p-6 overflow-hidden"
      style={{
        background:
          "radial-gradient(600px circle at 0% 0%, hsl(142 71% 45% / 0.18), transparent 55%), hsl(0 0% 8%)",
      }}
    >
      <button
        onClick={() => setHidden(true)}
        className="absolute top-4 right-4 h-8 w-8 inline-flex items-center justify-center rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.06] transition-colors"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid place-items-center h-12 w-12 rounded-2xl bg-success-soft text-success shrink-0">
          <PartyPopper className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-[200px]">
          <p className="text-[10px] uppercase tracking-[0.18em] text-fg-muted font-semibold">
            Fim do mês
          </p>
          <h3 className="font-display text-xl font-semibold mt-0.5">
            Lucro de {formatBRL(netCents)} este mês
          </h3>
          <p className="text-sm text-fg-muted mt-0.5">
            Registre nos Lucros para acompanhar a evolução mensal.
          </p>
        </div>
        <Link
          href="/lucros"
          className="inline-flex items-center gap-2 rounded-xl bg-success/15 hover:bg-success/25 border border-success/30 text-success font-medium px-4 py-2.5 transition-colors"
        >
          Ir para Lucros
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
