import type { Metadata } from "next";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LogOut, Mail, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/finance/PageHeader";
import { AvatarUploader } from "@/components/finance/AvatarUploader";
import { CopyInviteCode } from "./CopyInviteCode";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";
import { getInitials } from "@/lib/format";
import { signOut } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Configurações" };
export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const member = await getCurrentMember();
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("household_members")
    .select("id, display_name, role, joined_at, user_id, avatar_url")
    .eq("household_id", member.householdId)
    .order("joined_at", { ascending: true });

  return (
    <div>
      <PageHeader
        eyebrow="Minha conta"
        title="Configurações"
        description="Gerencie seu perfil e o espaço compartilhado do casal."
      />

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 lg:gap-5 mb-5">
        <Card className="space-y-6">
          <h3 className="font-display text-lg font-semibold">Perfil</h3>

          <AvatarUploader
            userId={member.userId}
            currentUrl={member.avatarUrl}
            displayName={member.displayName}
          />

          <div className="grid gap-3">
            <div className="rounded-xl bg-surface-2 border border-border p-4">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted font-semibold">
                Nome
              </p>
              <p className="font-display text-lg font-semibold mt-0.5">
                {member.displayName}
              </p>
            </div>
            {member.email && (
              <div className="rounded-xl bg-surface-2 border border-border p-4">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted font-semibold flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  E-mail de acesso
                </p>
                <p className="text-sm mt-1 truncate">{member.email}</p>
              </div>
            )}
            <div className="rounded-xl bg-surface-2 border border-border p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-fg-muted font-semibold">
                  Função no espaço
                </p>
                <p className="text-sm mt-1">
                  {member.role === "owner" ? "Proprietário" : "Membro"}
                </p>
              </div>
              <Badge variant={member.role === "owner" ? "primary" : "default"}>
                {member.role === "owner" ? "Proprietário" : "Membro"}
              </Badge>
            </div>
          </div>

          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>
          </form>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary-soft text-primary">
              <Shield className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold">
                Convite do casal
              </h3>
              <p className="text-sm text-fg-muted">
                Cada espaço de finanças tem um código único.
              </p>
            </div>
          </div>

          <CopyInviteCode code={member.inviteCode} />

          <div className="rounded-xl bg-surface-2 border border-border p-4 space-y-2">
            <p className="text-sm font-medium text-fg">Como funciona?</p>
            <ol className="text-xs text-fg-muted leading-relaxed list-decimal pl-4 space-y-1.5">
              <li>
                Compartilhe o código acima com seu parceiro ou parceira.
              </li>
              <li>
                A pessoa convidada cria a conta dela e informa o código no
                primeiro acesso.
              </li>
              <li>
                A partir daí, vocês veem os mesmos lançamentos, metas e sonhos
                automaticamente.
              </li>
            </ol>
            <p className="text-[11px] text-fg-muted leading-relaxed pt-2 border-t border-border">
              Funcionalidade ainda em desenvolvimento. Por enquanto, vocês
              compartilham o mesmo login.
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-display text-lg font-semibold mb-3">
          Pessoas neste espaço
        </h3>
        <ul className="divide-y divide-border">
          {(members ?? []).map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <Avatar className="h-10 w-10">
                {m.avatar_url && <AvatarImage src={m.avatar_url} alt="" />}
                <AvatarFallback>{getInitials(m.display_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.display_name}</p>
                <p className="text-xs text-fg-muted">
                  Entrou em{" "}
                  {format(parseISO(m.joined_at), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <Badge variant={m.role === "owner" ? "primary" : "outline"}>
                {m.role === "owner" ? "Proprietário" : "Membro"}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
