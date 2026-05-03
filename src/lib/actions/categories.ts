"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries/membership";
import { categorySchema, type CategoryInput } from "@/lib/schemas/transaction";

type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateAll() {
  for (const p of ["/", "/categorias", "/metas", "/registros", "/entradas", "/saidas"]) {
    revalidatePath(p);
  }
}

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const member = await getCurrentMember();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    household_id: member.householdId,
    name: parsed.data.name,
    kind: parsed.data.kind,
    color: parsed.data.color,
    icon: parsed.data.icon ?? "circle",
  });
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Já existe uma categoria com este nome." };
    return { ok: false, error: error.message };
  }
  revalidateAll();
  return { ok: true };
}

export async function updateCategory(input: CategoryInput): Promise<ActionResult> {
  if (!input.id) return { ok: false, error: "ID ausente." };
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      color: parsed.data.color,
      icon: parsed.data.icon ?? "circle",
    })
    .eq("id", input.id!);
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Já existe uma categoria com este nome." };
    return { ok: false, error: error.message };
  }
  revalidateAll();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "ID ausente." };
  const supabase = await createClient();

  // Check if it's a default category — defaults can be renamed but not deleted
  const { data: cat } = await supabase
    .from("categories")
    .select("is_default")
    .eq("id", id)
    .maybeSingle();
  if (cat?.is_default) {
    return {
      ok: false,
      error: "Categorias padrão não podem ser excluídas. Você pode renomeá-las.",
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}
