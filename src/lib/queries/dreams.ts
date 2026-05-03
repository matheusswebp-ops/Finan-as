import { cache } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";
import type { Dream, DreamUpdate } from "@/types/database";

export type DreamWithProgress = Dream & {
  pct: number;
  daysLeft: number;
  daysTotal: number;
};

export const listDreams = cache(async (): Promise<DreamWithProgress[]> => {
  await getCurrentMember();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dreams")
    .select("*")
    .order("is_archived", { ascending: true })
    .order("deadline", { ascending: true });
  if (error) throw new Error(error.message);
  const today = new Date();
  return (data ?? []).map((d) => {
    const pct = d.target_cents ? Math.min(1, d.current_cents / d.target_cents) : 0;
    const deadline = parseISO(d.deadline);
    const created = parseISO(d.created_at);
    return {
      ...d,
      pct,
      daysLeft: Math.max(0, differenceInDays(deadline, today)),
      daysTotal: Math.max(1, differenceInDays(deadline, created)),
    };
  });
});

export const getDream = cache(async (id: string): Promise<DreamWithProgress | null> => {
  await getCurrentMember();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dreams")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const today = new Date();
  const pct = data.target_cents ? Math.min(1, data.current_cents / data.target_cents) : 0;
  const deadline = parseISO(data.deadline);
  const created = parseISO(data.created_at);
  return {
    ...data,
    pct,
    daysLeft: Math.max(0, differenceInDays(deadline, today)),
    daysTotal: Math.max(1, differenceInDays(deadline, created)),
  };
});

export const getDreamUpdates = cache(async (dreamId: string): Promise<DreamUpdate[]> => {
  await getCurrentMember();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dream_updates")
    .select("*")
    .eq("dream_id", dreamId)
    .order("occurred_on", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});
