import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function normalizeUrl(value: string): string {
  try {
    const u = new URL(value.trim());
    return `${u.protocol}//${u.host}`;
  } catch {
    return value.trim().replace(/\/+$/, "");
  }
}

/** Service-role client — use only in server-side webhook routes, never on client. */
export function createAdminClient() {
  const url = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
