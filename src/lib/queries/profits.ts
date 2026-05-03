import { cache } from "react";
import { format, parse, startOfMonth, subMonths } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";
import type { Profit } from "@/types/database";

export type ProfitWithComparison = Profit & {
  vsPrevious: number | null; // delta in cents vs previous month, null if no prev
};

const isoMonth = (d: Date) => format(startOfMonth(d), "yyyy-MM-dd");

export const listProfits = cache(async (): Promise<ProfitWithComparison[]> => {
  await getCurrentMember();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("monthly_profits")
    .select("*")
    .order("month", { ascending: false });
  if (error) throw new Error(error.message);
  const ordered = data ?? [];
  // Build a map by month for prev lookup
  const byMonth = new Map(ordered.map((p) => [p.month, p]));
  return ordered.map((p) => {
    const ref = parse(p.month, "yyyy-MM-dd", new Date());
    const prevKey = format(subMonths(ref, 1), "yyyy-MM-dd");
    const prev = byMonth.get(prevKey);
    return {
      ...p,
      vsPrevious: prev ? p.net_cents - prev.net_cents : null,
    };
  });
});

export const computeMonthProfit = cache(
  async (anchor: Date = new Date()): Promise<{
    income: number;
    expense: number;
    net: number;
  }> => {
    const member = await getCurrentMember();
    const supabase = await createClient();
    const start = isoMonth(anchor);
    const end = format(
      new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0),
      "yyyy-MM-dd"
    );
    const { data, error } = await supabase
      .from("transactions")
      .select("amount_cents, kind, status")
      .eq("household_id", member.householdId)
      .eq("status", "realized")
      .gte("occurred_on", start)
      .lte("occurred_on", end);
    if (error) throw new Error(error.message);
    let income = 0;
    let expense = 0;
    for (const t of data ?? []) {
      if (t.kind === "income") income += t.amount_cents;
      else expense += t.amount_cents;
    }
    return { income, expense, net: income - expense };
  }
);
