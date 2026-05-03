"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

function normalizeSupabaseUrl(value: string): string {
  const trimmed = value.trim();
  try {
    const u = new URL(trimmed);
    return `${u.protocol}//${u.host}`;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

export function createClient() {
  return createBrowserClient<Database>(
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
  );
}
