"use client";

import { ChevronRight, Copy, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/actions";
import Link from "next/link";

export type UserMenuProps = {
  children: React.ReactNode;
  member: {
    displayName: string;
    email: string | null;
    householdName: string;
    inviteCode: string;
  };
};

export function UserMenu({ children, member }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-3 py-2.5">
          <p className="text-sm font-semibold truncate">{member.displayName}</p>
          {member.email && (
            <p className="text-xs text-fg-muted truncate">{member.email}</p>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="px-3 py-2.5 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-fg-muted font-semibold">
            Espaço compartilhado
          </p>
          <p className="text-sm font-medium truncate">{member.householdName}</p>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(member.inviteCode);
              toast.success("Código copiado", {
                description: "Compartilhe com seu parceiro(a) para participar.",
              });
            }}
            className="group inline-flex items-center gap-2 text-xs text-fg-muted hover:text-fg transition-colors"
          >
            <span className="font-mono tracking-[0.18em] text-primary">
              {member.inviteCode}
            </span>
            <Copy className="h-3 w-3" />
            <span>copiar convite</span>
          </button>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/configuracoes" className="!px-2.5">
            <Settings className="h-4 w-4 text-fg-muted" />
            <span className="flex-1">Configurações</span>
            <ChevronRight className="h-3.5 w-3.5 text-fg-muted" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild destructive>
            <button type="submit" className="w-full !px-2.5">
              <LogOut className="h-4 w-4" />
              Sair da conta
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
