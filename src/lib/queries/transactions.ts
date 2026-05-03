import { cache } from "react";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";
import type { Category, Tx, TxStatus } from "@/types/database";

export type TxKindFilter = "all" | "expense" | "income";
export type TxStatusFilter = "all" | TxStatus;

export interface TxFilters {
  kind?: TxKindFilter;
  status?: TxStatusFilter;
  from?: string;
  to?: string;
  month?: string;
  categoryId?: string;
  search?: string;
  minCents?: number;
  maxCents?: number;
  limit?: number;
  isRecurring?: boolean;
}

export type TxWithRelations = Tx & {
  category: Pick<Category, "id" | "name" | "color" | "icon"> | null;
  member: { display_name: string } | null;
};

export const listTransactions = cache(async (filters: TxFilters = {}) => {
  await getCurrentMember();
  const supabase = await createClient();
  let q = supabase
    .from("transactions")
    .select(
      "*, category:categories(id, name, color, icon), member:household_members(display_name)"
    )
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.kind && filters.kind !== "all") q = q.eq("kind", filters.kind);
  if (filters.status && filters.status !== "all") q = q.eq("status", filters.status);

  if (filters.month) {
    const ref = parseISO(`${filters.month}-01`);
    q = q
      .gte("occurred_on", format(startOfMonth(ref), "yyyy-MM-dd"))
      .lte("occurred_on", format(endOfMonth(ref), "yyyy-MM-dd"));
  } else {
    if (filters.from) q = q.gte("occurred_on", filters.from);
    if (filters.to) q = q.lte("occurred_on", filters.to);
  }

  if (filters.categoryId) q = q.eq("category_id", filters.categoryId);
  if (filters.search) q = q.ilike("description", `%${filters.search}%`);
  if (filters.minCents) q = q.gte("amount_cents", filters.minCents);
  if (filters.maxCents) q = q.lte("amount_cents", filters.maxCents);
  if (typeof filters.isRecurring === "boolean")
    q = q.eq("is_recurring", filters.isRecurring);
  if (filters.limit) q = q.limit(filters.limit);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as TxWithRelations[];
});

export function totalsForList(txs: TxWithRelations[]) {
  let income = 0;
  let expense = 0;
  let realized = 0;
  let forecast = 0;
  for (const t of txs) {
    if (t.kind === "income") income += t.amount_cents;
    else expense += t.amount_cents;
    if (t.status === "realized") realized += t.amount_cents;
    else forecast += t.amount_cents;
  }
  return {
    income,
    expense,
    balance: income - expense,
    count: txs.length,
    realized,
    forecast,
  };
}
