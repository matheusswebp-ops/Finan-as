import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getCurrentMember } from "@/lib/queries/membership";
import { getInitials } from "@/lib/format";
import { getNotifications } from "@/lib/queries/notifications";
import { UserMenu } from "./UserMenu";
import { QuickAddTrigger } from "./QuickAddTrigger";
import { SearchBar } from "./SearchBar";
import { NotificationsBell } from "./NotificationsBell";
import { ThemeToggle } from "./ThemeToggle";

export async function Topbar() {
  const [member, notifications] = await Promise.all([
    getCurrentMember(),
    getNotifications().catch(() => []),
  ]);
  const initials = getInitials(member.displayName);
  const firstName = member.displayName.split(" ")[0] ?? member.displayName;

  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-0 pt-4 lg:pt-6 pb-3 lg:pb-4 bg-bg/85 backdrop-blur-xl backdrop-saturate-150 border-b border-border lg:border-b-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-fg-muted font-medium truncate">
            {greeting()}
          </p>
          <h1 className="font-display text-lg sm:text-2xl font-semibold tracking-tight truncate">
            Olá, <span className="text-primary">{firstName}</span>
          </h1>
        </div>

        <SearchBar />

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <QuickAddTrigger>
            <Button size="icon" variant="primary" aria-label="Adicionar lançamento">
              <Plus className="h-5 w-5" />
            </Button>
          </QuickAddTrigger>

          <NotificationsBell notifications={notifications} />

          <ThemeToggle />

          <UserMenu
            member={{
              displayName: member.displayName,
              email: member.email,
              householdName: member.householdName,
              inviteCode: member.inviteCode,
            }}
          >
            <button
              className="group relative inline-flex items-center gap-2 rounded-xl bg-surface-2 border border-border px-1.5 sm:px-2 py-1.5 hover:bg-surface-3 hover:border-border-strong transition-colors"
              aria-label="Conta"
            >
              <Avatar className="h-7 w-7 ring-2 ring-primary/30 ring-offset-2 ring-offset-surface-2">
                {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden xl:inline text-sm font-medium pr-1">{firstName}</span>
            </button>
          </UserMenu>
        </div>
      </div>
    </header>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
