"use server";

import { revalidatePath } from "next/cache";
import {
  addMonths,
  endOfMonth,
  format,
  formatISO,
  parse,
  startOfMonth,
  subMonths,
} from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";
import { transactionSchema, type TransactionInput } from "@/lib/schemas/transaction";
import { brazilToday } from "@/lib/tz";

type ActionResult = { ok: true } | { ok: false; error: string };
type CopyResult = { ok: true; count: number } | { ok: false; error: string };

function revalidateAll() {
  for (const p of [
    "/",
    "/registros",
    "/despesas",
    "/categorias",
    "/metas",
    "/lucros",
    "/sonhos",
  ]) {
    revalidatePath(p);
  }
}

export async function createTransaction(input: TransactionInput): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const data = parsed.data;
  const member = await getCurrentMember();
  const supabase = await createClient();

  const installments = data.installment_total ?? 1;

  if (installments > 1) {
    const groupId = crypto.randomUUID();
    const baseDate = new Date(data.occurred_on);
    const rows = Array.from({ length: installments }, (_, i) => ({
      household_id: member.householdId,
      created_by: member.memberId,
      kind: data.kind,
      status: i === 0 ? data.status : "forecast",
      amount_cents: data.amount_cents,
      description: `${data.description} (${i + 1}/${installments})`,
      category_id: data.category_id ?? null,
      occurred_on: formatISO(addMonths(baseDate, i), { representation: "date" }),
      installment_total: installments,
      installment_index: i + 1,
      installment_group: groupId,
      is_recurring: false,
    }));
    const { error } = await supabase.from("transactions").insert(rows);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("transactions").insert({
      household_id: member.householdId,
      created_by: member.memberId,
      kind: data.kind,
      status: data.status,
      amount_cents: data.amount_cents,
      description: data.description,
      category_id: data.category_id ?? null,
      occurred_on: data.occurred_on,
      is_recurring: data.is_recurring ?? false,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidateAll();
  return { ok: true };
}

export async function updateTransaction(input: TransactionInput): Promise<ActionResult> {
  if (!input.id) return { ok: false, error: "ID ausente." };
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;
  const supabase = await createClient();
  const abate = data.abate_cents ?? 0;

  if (abate > 0 && data.status === "forecast") {
    const member = await getCurrentMember();
    const remaining = data.amount_cents - abate;

    if (remaining <= 0) {
      // Pagamento total — marca a despesa original como realizada
      const { error } = await supabase
        .from("transactions")
        .update({
          kind: data.kind,
          status: "realized",
          amount_cents: data.amount_cents,
          description: data.description,
          category_id: data.category_id ?? null,
          occurred_on: data.occurred_on,
          is_recurring: data.is_recurring ?? false,
        })
        .eq("id", input.id!);
      if (error) return { ok: false, error: error.message };
    } else {
      // Pagamento parcial — cria realizado + reduz previsão
      const [updateRes, insertRes] = await Promise.all([
        supabase
          .from("transactions")
          .update({
            kind: data.kind,
            status: "forecast",
            amount_cents: remaining,
            description: data.description,
            category_id: data.category_id ?? null,
            occurred_on: data.occurred_on,
            is_recurring: data.is_recurring ?? false,
          })
          .eq("id", input.id!),
        supabase.from("transactions").insert({
          household_id: member.householdId,
          created_by: member.memberId,
          kind: data.kind,
          status: "realized",
          amount_cents: abate,
          description: data.description,
          category_id: data.category_id ?? null,
          occurred_on: brazilToday(),
          is_recurring: false,
        }),
      ]);
      if (updateRes.error) return { ok: false, error: updateRes.error.message };
      if (insertRes.error) return { ok: false, error: insertRes.error.message };
    }
  } else {
    const { error } = await supabase
      .from("transactions")
      .update({
        kind: data.kind,
        status: data.status,
        amount_cents: data.amount_cents,
        description: data.description,
        category_id: data.category_id ?? null,
        occurred_on: data.occurred_on,
        is_recurring: data.is_recurring ?? false,
      })
      .eq("id", input.id!);
    if (error) return { ok: false, error: error.message };
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "ID ausente." };
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

/**
 * Copia todos os lançamentos do mês anterior (mesmo kind) para o mês atual,
 * marcando-os como `forecast` (A pagar / A receber). Pula parcelas — elas já
 * cicilam automaticamente via `installment_group`.
 *
 * `referenceIso` é qualquer data dentro do mês destino (geralmente o `from`
 * exibido na página). Calculamos o mês anterior a partir dele.
 */
export async function copyFromPreviousMonth(input: {
  kind: "expense" | "income";
  referenceIso: string;
}): Promise<CopyResult> {
  const member = await getCurrentMember();
  const supabase = await createClient();

  const ref = parse(input.referenceIso.slice(0, 10), "yyyy-MM-dd", new Date());
  const targetStart = startOfMonth(ref);
  const prevAnchor = subMonths(targetStart, 1);
  const prevStart = format(startOfMonth(prevAnchor), "yyyy-MM-dd");
  const prevEnd = format(endOfMonth(prevAnchor), "yyyy-MM-dd");

  const { data: previous, error } = await supabase
    .from("transactions")
    .select(
      "kind, amount_cents, description, category_id, occurred_on, is_recurring, installment_group"
    )
    .eq("household_id", member.householdId)
    .eq("kind", input.kind)
    .gte("occurred_on", prevStart)
    .lte("occurred_on", prevEnd)
    .is("installment_group", null);

  if (error) return { ok: false, error: error.message };
  if (!previous || previous.length === 0) {
    return { ok: true, count: 0 };
  }

  const rows = previous.map((p) => {
    const original = parse(p.occurred_on, "yyyy-MM-dd", new Date());
    return {
      household_id: member.householdId,
      created_by: member.memberId,
      kind: p.kind,
      status: "forecast" as const,
      amount_cents: p.amount_cents,
      description: p.description,
      category_id: p.category_id ?? null,
      occurred_on: format(addMonths(original, 1), "yyyy-MM-dd"),
      is_recurring: p.is_recurring ?? false,
    };
  });

  const { error: insertError } = await supabase.from("transactions").insert(rows);
  if (insertError) return { ok: false, error: insertError.message };

  revalidateAll();
  return { ok: true, count: rows.length };
}

export async function markTransactionPaid(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "ID ausente." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .update({ status: "realized" })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}
