import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database";

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("kind", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getCategoriesByKind = cache(
  async (kind: "expense" | "income"): Promise<Category[]> => {
    const all = await getCategories();
    return all.filter((c) => c.kind === kind);
  }
);
