"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";
import { goalSchema, type GoalInput } from "@/lib/schemas/transaction";

type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateAll() {
  for (const p of ["/", "/metas", "/categorias", "/despesas", "/lucros"]) {
    revalidatePath(p);
  }
}

export async function upsertGoal(input: GoalInput): Promise<ActionResult> {
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const member = await getCurrentMember();
  const supabase = await createClient();

  const eqQuery = supabase
    .from("monthly_goals")
    .select("id")
    .eq("household_id", member.householdId)
    .eq("month", parsed.data.month)
    .eq("goal_kind", parsed.data.goal_kind);
  const existing = parsed.data.category_id
    ? await eqQuery.eq("category_id", parsed.data.category_id).maybeSingle()
    : await eqQuery.is("category_id", null).maybeSingle();

  if (existing.data?.id) {
    const { error } = await supabase
      .from("monthly_goals")
      .update({ limit_cents: parsed.data.limit_cents })
      .eq("id", existing.data.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("monthly_goals").insert({
      household_id: member.householdId,
      category_id: parsed.data.category_id,
      goal_kind: parsed.data.goal_kind,
      month: parsed.data.month,
      limit_cents: parsed.data.limit_cents,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "ID ausente." };
  const supabase = await createClient();
  const { error } = await supabase.from("monthly_goals").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function copyGoalsFromPreviousMonth(month: string): Promise<ActionResult> {
  const member = await getCurrentMember();
  const supabase = await createClient();
  const date = new Date(`${month}-01T00:00:00`);
  const prevDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-01`;

  const { data: prevGoals, error: fetchErr } = await supabase
    .from("monthly_goals")
    .select("category_id, limit_cents, goal_kind")
    .eq("household_id", member.householdId)
    .eq("month", prevMonth);
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!prevGoals || prevGoals.length === 0) {
    return { ok: false, error: "Não há metas no mês anterior para replicar." };
  }

  await supabase
    .from("monthly_goals")
    .delete()
    .eq("household_id", member.householdId)
    .eq("month", month);

  const rows = prevGoals.map((g) => ({
    household_id: member.householdId,
    category_id: g.category_id,
    goal_kind: g.goal_kind,
    month,
    limit_cents: g.limit_cents,
  }));
  const { error: insertErr } = await supabase.from("monthly_goals").insert(rows);
  if (insertErr) return { ok: false, error: insertErr.message };

  revalidateAll();
  return { ok: true };
}
