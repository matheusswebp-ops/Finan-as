"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";
import {
  dreamSchema,
  dreamUpdateSchema,
  type DreamInput,
  type DreamUpdateInput,
} from "@/lib/schemas/transaction";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createDream(input: DreamInput): Promise<ActionResult> {
  const parsed = dreamSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const member = await getCurrentMember();
  const supabase = await createClient();
  const { error } = await supabase.from("dreams").insert({
    household_id: member.householdId,
    created_by: member.memberId,
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    image_url: parsed.data.image_url ?? null,
    target_cents: parsed.data.target_cents,
    current_cents: parsed.data.current_cents ?? 0,
    deadline: parsed.data.deadline,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/sonhos");
  return { ok: true };
}

export async function updateDream(input: DreamInput): Promise<ActionResult> {
  if (!input.id) return { ok: false, error: "ID ausente." };
  const parsed = dreamSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("dreams")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      image_url: parsed.data.image_url ?? null,
      target_cents: parsed.data.target_cents,
      current_cents: parsed.data.current_cents ?? 0,
      deadline: parsed.data.deadline,
    })
    .eq("id", input.id!);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/sonhos");
  return { ok: true };
}

export async function deleteDream(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "ID ausente." };
  const supabase = await createClient();
  const { error } = await supabase.from("dreams").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/sonhos");
  return { ok: true };
}

export async function addDreamUpdate(input: DreamUpdateInput): Promise<ActionResult> {
  const parsed = dreamUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const member = await getCurrentMember();
  const supabase = await createClient();

  const { data: dream, error: dreamErr } = await supabase
    .from("dreams")
    .select("current_cents")
    .eq("id", parsed.data.dream_id)
    .single();
  if (dreamErr || !dream) {
    return { ok: false, error: dreamErr?.message ?? "Sonho não encontrado." };
  }

  const delta = parsed.data.amount_cents - dream.current_cents;

  const { error: insertErr } = await supabase.from("dream_updates").insert({
    dream_id: parsed.data.dream_id,
    household_id: member.householdId,
    amount_cents: parsed.data.amount_cents,
    delta_cents: delta,
    note: parsed.data.note ?? "",
    occurred_on: parsed.data.occurred_on,
  });
  if (insertErr) return { ok: false, error: insertErr.message };

  const { error: updateErr } = await supabase
    .from("dreams")
    .update({ current_cents: parsed.data.amount_cents })
    .eq("id", parsed.data.dream_id);
  if (updateErr) return { ok: false, error: updateErr.message };

  revalidatePath("/sonhos");
  return { ok: true };
}
