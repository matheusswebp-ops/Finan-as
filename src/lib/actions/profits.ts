"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";
import { profitSchema, type ProfitInput } from "@/lib/schemas/transaction";
import { computeMonthProfit } from "@/lib/queries/profits";

type ActionResult = { ok: true } | { ok: false; error: string };

// Normaliza "yyyy-MM-..." para "yyyy-MM-01" sem usar Date (evita drift de timezone).
function toMonthStartIso(value: string): string {
  return `${value.slice(0, 7)}-01`;
}

export async function upsertProfit(input: ProfitInput): Promise<ActionResult> {
  const parsed = profitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const member = await getCurrentMember();
  const supabase = await createClient();

  const monthStart = toMonthStartIso(parsed.data.month);
  const net = parsed.data.income_cents - parsed.data.expense_cents;

  const { data: existing } = await supabase
    .from("monthly_profits")
    .select("id")
    .eq("household_id", member.householdId)
    .eq("month", monthStart)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("monthly_profits")
      .update({
        income_cents: parsed.data.income_cents,
        expense_cents: parsed.data.expense_cents,
        net_cents: net,
        notes: parsed.data.notes ?? "",
        is_auto: false,
      })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("monthly_profits").insert({
      household_id: member.householdId,
      month: monthStart,
      income_cents: parsed.data.income_cents,
      expense_cents: parsed.data.expense_cents,
      net_cents: net,
      notes: parsed.data.notes ?? "",
      is_auto: false,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/lucros");
  return { ok: true };
}

export async function deleteProfit(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("monthly_profits").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/lucros");
  return { ok: true };
}

/** Gera lucros automáticos com base nas transactions para o mês informado. */
export async function generateAutoProfit(monthIso: string): Promise<ActionResult> {
  const member = await getCurrentMember();
  const supabase = await createClient();
  const monthStart = toMonthStartIso(monthIso);
  const [y, m] = monthStart.split("-").map(Number);
  // Construído com componentes locais para evitar drift UTC.
  const monthDate = new Date(y, m - 1, 1);

  const { income, expense, net } = await computeMonthProfit(monthDate);

  const { data: existing } = await supabase
    .from("monthly_profits")
    .select("id, is_auto")
    .eq("household_id", member.householdId)
    .eq("month", monthStart)
    .maybeSingle();

  if (existing?.id) {
    if (!existing.is_auto) {
      return { ok: false, error: "Já existe um lançamento manual neste mês." };
    }
    const { error } = await supabase
      .from("monthly_profits")
      .update({
        income_cents: income,
        expense_cents: expense,
        net_cents: net,
      })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("monthly_profits").insert({
      household_id: member.householdId,
      month: monthStart,
      income_cents: income,
      expense_cents: expense,
      net_cents: net,
      is_auto: true,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/lucros");
  return { ok: true };
}
