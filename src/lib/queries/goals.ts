import { cache } from "react";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";
import type { Category, Goal } from "@/types/database";

export type GoalWithUsage = {
  goal: Goal;
  category: Category | null;
  usedCents: number;
  remainingCents: number;
  pct: number;
  level: "ok" | "warning" | "over";
};

const isoDate = (d: Date) => format(d, "yyyy-MM-dd");

export const getMonthGoals = cache(async (month?: string): Promise<GoalWithUsage[]> => {
  const member = await getCurrentMember();
  const supabase = await createClient();
  const ref = month ? parseISO(`${month}-01`) : new Date();
  const monthStart = isoDate(startOfMonth(ref));
  const monthEnd = isoDate(endOfMonth(ref));

  const [{ data: goals, error: goalsErr }, { data: txs, error: txErr }, { data: cats }] =
    await Promise.all([
      supabase
        .from("monthly_goals")
        .select("*")
        .eq("household_id", member.householdId)
        .eq("month", monthStart),
      supabase
        .from("transactions")
        .select("amount_cents, category_id, kind, status")
        .eq("status", "realized")
        .gte("occurred_on", monthStart)
        .lte("occurred_on", monthEnd),
      supabase.from("categories").select("*"),
    ]);

  if (goalsErr) throw new Error(goalsErr.message);
  if (txErr) throw new Error(txErr.message);

  let totalExpense = 0;
  let totalIncome = 0;
  const expenseByCategory = new Map<string | null, number>();
  for (const t of txs ?? []) {
    if (t.kind === "expense") {
      totalExpense += t.amount_cents;
      expenseByCategory.set(
        t.category_id,
        (expenseByCategory.get(t.category_id) ?? 0) + t.amount_cents
      );
    } else if (t.kind === "income") {
      totalIncome += t.amount_cents;
    }
  }

  return (goals ?? []).map((g) => {
    const cat = (cats ?? []).find((c) => c.id === g.category_id) ?? null;
    let used = 0;
    if (g.goal_kind === "income") {
      used = totalIncome;
    } else if (g.category_id) {
      used = expenseByCategory.get(g.category_id) ?? 0;
    } else {
      used = totalExpense;
    }
    const pct = g.limit_cents ? used / g.limit_cents : 0;
    const level: GoalWithUsage["level"] =
      g.goal_kind === "income"
        ? pct >= 1
          ? "ok"
          : pct >= 0.6
            ? "warning"
            : "over"
        : pct >= 1
          ? "over"
          : pct >= 0.8
            ? "warning"
            : "ok";
    return {
      goal: g,
      category: cat,
      usedCents: used,
      remainingCents: g.limit_cents - used,
      pct,
      level,
    };
  });
});
