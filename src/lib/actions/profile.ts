"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function setAvatarUrl(url: string | null): Promise<ActionResult> {
  const member = await getCurrentMember();
  const supabase = await createClient();
  const { error } = await supabase
    .from("household_members")
    .update({ avatar_url: url })
    .eq("id", member.memberId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setDisplayName(name: string): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 60) {
    return { ok: false, error: "Informe um nome entre 1 e 60 caracteres." };
  }
  const member = await getCurrentMember();
  const supabase = await createClient();
  const { error } = await supabase
    .from("household_members")
    .update({ display_name: trimmed })
    .eq("id", member.memberId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
