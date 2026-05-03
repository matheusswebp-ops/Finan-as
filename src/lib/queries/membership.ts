import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentMember = {
  userId: string;
  email: string | null;
  memberId: string;
  householdId: string;
  displayName: string;
  role: "owner" | "member";
  householdName: string;
  inviteCode: string;
  avatarUrl: string | null;
};

/**
 * Returns the current member's profile context. Throws if not authenticated.
 * Cached per request via React's cache().
 */
export const getCurrentMember = cache(async (): Promise<CurrentMember> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: member, error: memberError } = await supabase
    .from("household_members")
    .select("id, household_id, display_name, role, avatar_url")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (memberError || !member) {
    throw new Error("Conta sem espaço definido. Recarregue após o cadastro.");
  }

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("name, invite_code")
    .eq("id", member.household_id)
    .single();

  if (householdError || !household) throw new Error("Household não encontrado.");

  return {
    userId: user.id,
    email: user.email ?? null,
    memberId: member.id,
    householdId: member.household_id,
    displayName: member.display_name,
    role: (member.role as "owner" | "member") ?? "member",
    householdName: household.name,
    inviteCode: household.invite_code,
    avatarUrl: member.avatar_url ?? null,
  };
});

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}
