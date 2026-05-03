import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/** Normaliza a URL: remove path e trailing slashes, mesmo que a env var venha
 *  com `/rest/v1` ou similar por engano. */
function normalizeSupabaseUrl(value: string): string {
  const trimmed = value.trim();
  try {
    const u = new URL(trimmed);
    return `${u.protocol}//${u.host}`;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component during render — ignore.
            // Sessions are refreshed by middleware.
          }
        },
      },
    }
  );
}
