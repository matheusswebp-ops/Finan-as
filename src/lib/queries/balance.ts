import { cache } from "react";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";
import type { Category, Tx } from "@/types/database";

export type Period = "day" | "week" | "month";

export type PeriodSummary = {
  period: Period;
  fromIso: string;
  toIso: string;
  income: { realized: number; forecast: number };
  expense: { realized: number; forecast: number };
  balance: number; // realized only
};

const isoDate = (d: Date) => format(d, "yyyy-MM-dd");

function rangeFor(period: Period, anchor = new Date()): { from: Date; to: Date } {
  if (period === "day") return { from: startOfDay(anchor), to: endOfDay(anchor) };
  if (period === "week")
    return {
      from: startOfWeek(anchor, { weekStartsOn: 1 }),
      to: endOfWeek(anchor, { weekStartsOn: 1 }),
    };
  return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
}

async function fetchTxRange(from: string, to: string): Promise<Tx[]> {
  await getCurrentMember();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .gte("occurred_on", from)
    .lte("occurred_on", to)
    .order("occurred_on", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Tx[];
}

export const getPeriodSummary = cache(
  async (period: Period, anchor: Date = new Date()): Promise<PeriodSummary> => {
    const { from, to } = rangeFor(period, anchor);
    const fromIso = isoDate(from);
    const toIso = isoDate(to);
    return getRangeSummary(fromIso, toIso, period);
  }
);

export const getRangeSummary = cache(
  async (fromIso: string, toIso: string, period: Period = "month"): Promise<PeriodSummary> => {
    const txs = await fetchTxRange(fromIso, toIso);

    let incRealized = 0;
    let incForecast = 0;
    let expRealized = 0;
    let expForecast = 0;
    for (const t of txs) {
      if (t.kind === "income") {
        if (t.status === "realized") incRealized += t.amount_cents;
        else incForecast += t.amount_cents;
      } else {
        if (t.status === "realized") expRealized += t.amount_cents;
        else expForecast += t.amount_cents;
      }
    }
    return {
      period,
      fromIso,
      toIso,
      income: { realized: incRealized, forecast: incForecast },
      expense: { realized: expRealized, forecast: expForecast },
      balance: incRealized - expRealized,
    };
  }
);

export type MonthlyHistoryPoint = {
  month: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
};

export const getMonthlyHistory = cache(
  async (months = 6, anchor: Date = new Date()): Promise<MonthlyHistoryPoint[]> => {
    const start = startOfMonth(subMonths(anchor, months - 1));
    const end = endOfMonth(anchor);
    const txs = await fetchTxRange(isoDate(start), isoDate(end));

    const buckets: Record<string, { income: number; expense: number }> = {};
    for (let i = 0; i < months; i++) {
      const d = subMonths(anchor, months - 1 - i);
      buckets[format(d, "yyyy-MM")] = { income: 0, expense: 0 };
    }
    for (const t of txs) {
      if (t.status !== "realized") continue;
      const key = t.occurred_on.slice(0, 7);
      const b = buckets[key];
      if (!b) continue;
      if (t.kind === "income") b.income += t.amount_cents;
      else b.expense += t.amount_cents;
    }

    return Object.entries(buckets).map(([month, sum]) => {
      const d = new Date(`${month}-01T00:00:00`);
      const ptShort = d.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
      return {
        month,
        label: ptShort,
        income: sum.income,
        expense: sum.expense,
        balance: sum.income - sum.expense,
      };
    });
  }
);

export type CategoryBreakdownPoint = {
  category: Category | null;
  total: number;
  share: number;
};

async function categoryBreakdownByStatus(
  kind: "expense" | "income",
  status: "realized" | "forecast",
  fromIso?: string,
  toIso?: string
): Promise<CategoryBreakdownPoint[]> {
  await getCurrentMember();
  const supabase = await createClient();

  const start = fromIso ?? isoDate(startOfMonth(new Date()));
  const end = toIso ?? isoDate(endOfMonth(new Date()));

  const [{ data: txs }, { data: cats }] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount_cents, category_id")
      .eq("kind", kind)
      .eq("status", status)
      .gte("occurred_on", start)
      .lte("occurred_on", end),
    supabase.from("categories").select("*").eq("kind", kind),
  ]);

  const byCat = new Map<string | null, number>();
  let total = 0;
  for (const t of txs ?? []) {
    const cur = byCat.get(t.category_id) ?? 0;
    byCat.set(t.category_id, cur + t.amount_cents);
    total += t.amount_cents;
  }

  const points: CategoryBreakdownPoint[] = [];
  for (const [catId, sum] of byCat) {
    const cat = (cats ?? []).find((c) => c.id === catId) ?? null;
    points.push({ category: cat, total: sum, share: total ? sum / total : 0 });
  }
  points.sort((a, b) => b.total - a.total);
  return points;
}

export const getCategoryBreakdown = cache(
  async (
    kind: "expense" | "income" = "expense",
    fromIso?: string,
    toIso?: string
  ): Promise<CategoryBreakdownPoint[]> =>
    categoryBreakdownByStatus(kind, "realized", fromIso, toIso)
);

export const getCategoryBreakdownForecast = cache(
  async (
    kind: "expense" | "income" = "expense",
    fromIso?: string,
    toIso?: string
  ): Promise<CategoryBreakdownPoint[]> =>
    categoryBreakdownByStatus(kind, "forecast", fromIso, toIso)
);

export type RecentTx = Tx & {
  category: Pick<Category, "id" | "name" | "color" | "icon"> | null;
  member: { display_name: string } | null;
};

export const getRecentTransactions = cache(
  async (limit = 6): Promise<RecentTx[]> => {
    await getCurrentMember();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "*, category:categories(id, name, color, icon), member:household_members(display_name)"
      )
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as RecentTx[];
  }
);

/** Lançamentos do dia atual filtrados por tipo, para os chips da Visão Geral. */
export const getTodayByKind = cache(
  async (kind: "expense" | "income"): Promise<RecentTx[]> => {
    await getCurrentMember();
    const supabase = await createClient();
    const today = isoDate(new Date());
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "*, category:categories(id, name, color, icon), member:household_members(display_name)"
      )
      .eq("kind", kind)
      .eq("occurred_on", today)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as RecentTx[];
  }
);
