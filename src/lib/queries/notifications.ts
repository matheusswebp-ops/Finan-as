import { cache } from "react";
import { addDays, differenceInCalendarDays, endOfMonth, format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";

export type Notification = {
  id: string;
  kind: "due-soon" | "overdue" | "goal-warn" | "goal-over" | "dream-deadline" | "month-end";
  title: string;
  description: string;
  href?: string;
  iconTone: "warning" | "danger" | "primary" | "success";
  occurredAt: string;
};

export const getNotifications = cache(async (): Promise<Notification[]> => {
  const member = await getCurrentMember();
  const supabase = await createClient();
  const today = new Date();
  const todayIso = format(today, "yyyy-MM-dd");
  const in7daysIso = format(addDays(today, 7), "yyyy-MM-dd");

  const [pendingRes, overdueRes, dreamsRes, goalsRes] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, description, occurred_on, amount_cents, kind")
      .eq("household_id", member.householdId)
      .eq("status", "forecast")
      .gte("occurred_on", todayIso)
      .lte("occurred_on", in7daysIso)
      .order("occurred_on", { ascending: true })
      .limit(8),
    supabase
      .from("transactions")
      .select("id, description, occurred_on, amount_cents, kind")
      .eq("household_id", member.householdId)
      .eq("status", "forecast")
      .lt("occurred_on", todayIso)
      .order("occurred_on", { ascending: false })
      .limit(8),
    supabase
      .from("dreams")
      .select("id, title, deadline, current_cents, target_cents")
      .eq("household_id", member.householdId)
      .eq("is_archived", false),
    supabase
      .from("monthly_goals")
      .select("id, goal_kind, category_id, limit_cents, month")
      .eq("household_id", member.householdId)
      .eq("month", format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd")),
  ]);

  const list: Notification[] = [];

  for (const t of pendingRes.data ?? []) {
    const days = differenceInCalendarDays(parseISO(t.occurred_on), today);
    list.push({
      id: `due-${t.id}`,
      kind: "due-soon",
      title: t.kind === "expense" ? "Conta a pagar" : "Receita a receber",
      description: `${t.description} em ${days === 0 ? "hoje" : days === 1 ? "amanhã" : `${days} dias`}`,
      href: t.kind === "expense" ? "/despesas?tab=due" : "/entradas?tab=due",
      iconTone: "warning",
      occurredAt: t.occurred_on,
    });
  }

  for (const t of overdueRes.data ?? []) {
    const days = -differenceInCalendarDays(parseISO(t.occurred_on), today);
    list.push({
      id: `over-${t.id}`,
      kind: "overdue",
      title: t.kind === "expense" ? "Despesa em atraso" : "Receita atrasada",
      description: `${t.description} venceu há ${days} ${days === 1 ? "dia" : "dias"}`,
      href: t.kind === "expense" ? "/despesas?tab=due" : "/entradas?tab=due",
      iconTone: "danger",
      occurredAt: t.occurred_on,
    });
  }

  for (const d of dreamsRes.data ?? []) {
    const days = differenceInCalendarDays(parseISO(d.deadline), today);
    if (days >= 0 && days <= 30 && d.current_cents < d.target_cents) {
      list.push({
        id: `dream-${d.id}`,
        kind: "dream-deadline",
        title: "Sonho com prazo próximo",
        description: `${d.title} vence em ${days === 0 ? "hoje" : `${days} dias`}`,
        href: "/sonhos",
        iconTone: "primary",
        occurredAt: d.deadline,
      });
    }
  }

  // Verifica metas em risco (consulta os agregados pra evitar duplicação)
  // Simples: se já existem metas globais e o realizado for crítico, alerta.
  const monthStart = format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(today), "yyyy-MM-dd");
  const { data: monthTxs } = await supabase
    .from("transactions")
    .select("amount_cents, kind, status")
    .eq("household_id", member.householdId)
    .eq("status", "realized")
    .gte("occurred_on", monthStart)
    .lte("occurred_on", monthEnd);

  let monthIncome = 0;
  let monthExpense = 0;
  for (const t of monthTxs ?? []) {
    if (t.kind === "income") monthIncome += t.amount_cents;
    else monthExpense += t.amount_cents;
  }
  for (const g of goalsRes.data ?? []) {
    if (g.category_id !== null) continue;
    if (g.goal_kind === "expense") {
      const pct = monthExpense / g.limit_cents;
      if (pct >= 1) {
        list.push({
          id: `goal-exp-over-${g.id}`,
          kind: "goal-over",
          title: "Teto de despesas estourado",
          description: "Você passou do limite de gastos do mês.",
          href: "/metas",
          iconTone: "danger",
          occurredAt: monthEnd,
        });
      } else if (pct >= 0.8) {
        list.push({
          id: `goal-exp-warn-${g.id}`,
          kind: "goal-warn",
          title: "Teto próximo do limite",
          description: `Já gastou ${Math.round(pct * 100)}% do mês.`,
          href: "/metas",
          iconTone: "warning",
          occurredAt: monthEnd,
        });
      }
    } else if (g.goal_kind === "income") {
      const pct = monthIncome / g.limit_cents;
      const dayOfMonth = today.getDate();
      const totalDays = endOfMonth(today).getDate();
      const expectedPct = dayOfMonth / totalDays;
      if (pct < expectedPct * 0.6 && dayOfMonth > 7) {
        list.push({
          id: `goal-inc-warn-${g.id}`,
          kind: "goal-warn",
          title: "Receita abaixo do esperado",
          description: `Atingiu ${Math.round(pct * 100)}% da meta com o mês ${Math.round(expectedPct * 100)}% concluído.`,
          href: "/metas",
          iconTone: "warning",
          occurredAt: monthEnd,
        });
      }
    }
  }

  // Notificação fim do mês (último dia)
  if (todayIso === format(endOfMonth(today), "yyyy-MM-dd")) {
    const net = monthIncome - monthExpense;
    if (net > 0) {
      list.push({
        id: "month-end-positive",
        kind: "month-end",
        title: "Lucro do mês fechado",
        description: "Você terminou o mês no positivo. Registre nos Lucros.",
        href: "/lucros",
        iconTone: "success",
        occurredAt: todayIso,
      });
    }
  }

  return list;
});
