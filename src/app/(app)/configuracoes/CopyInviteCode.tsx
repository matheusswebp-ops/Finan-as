"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyInviteCode({ code }: { code: string }) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary-soft/40 p-5 grid gap-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-primary font-semibold">
        Código de convite
      </p>
      <p className="font-mono text-3xl tracking-[0.4em] text-fg select-all">
        {code}
      </p>
      <div>
        <Button
          variant="soft"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            toast.success("Código copiado");
          }}
        >
          <Copy className="h-3.5 w-3.5" />
          Copiar código
        </Button>
      </div>
    </div>
  );
}
