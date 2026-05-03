"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  ok: boolean;
  error?: string;
};

function pickErrorMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials"))
    return "Nome ou senha incorretos.";
  if (lower.includes("user already registered"))
    return "Já existe uma conta com este e-mail.";
  if (lower.includes("password should be at least"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (lower.includes("email rate limit"))
    return "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
  if (lower.includes("for security purposes"))
    return "Aguarde alguns segundos antes de tentar novamente.";
  return message;
}

/**
 * Sign in by display name + password. Looks up the linked email server-side
 * via SECURITY DEFINER RPC, then signs in the user.
 */
export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !password) {
    return { ok: false, error: "Preencha o nome e a senha." };
  }

  const supabase = await createClient();
  const { data: email, error: lookupError } = await supabase.rpc("email_for_login_name", {
    p_name: name,
  });

  if (lookupError) {
    return { ok: false, error: "Erro ao validar o nome. Tente novamente." };
  }
  if (!email) {
    return { ok: false, error: "Nome ou senha incorretos." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { ok: false, error: pickErrorMessage(error.message) };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!email || !password || !displayName) {
    return { ok: false, error: "Preencha todos os campos." };
  }
  if (password.length < 6) {
    return { ok: false, error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  // Cria o usuário via REST direto — algumas combinações de @supabase/ssr +
  // chaves publishable retornam 404 em supabase.auth.signUp, mesmo com o
  // endpoint funcionando. Chamada raw via fetch é estável.
  // Normaliza a URL: extrai só `https://host` mesmo que venha com path
  // (`/rest/v1` etc.) por engano nas env vars do deploy.
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  let baseUrl: string;
  try {
    const u = new URL(rawUrl);
    baseUrl = `${u.protocol}//${u.host}`;
  } catch {
    baseUrl = rawUrl.replace(/\/+$/, "");
  }
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

  let resp: Response;
  try {
    resp = await fetch(`${baseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        data: { display_name: displayName },
      }),
    });
  } catch (e) {
    const cause = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Erro de rede ao cadastrar: ${cause}` };
  }

  if (!resp.ok) {
    let body = "";
    try {
      body = await resp.text();
    } catch {
      // ignore
    }
    let parsed: { msg?: string; error_description?: string; message?: string } | null = null;
    try {
      parsed = body ? JSON.parse(body) : null;
    } catch {
      // ignore
    }
    const apiMsg =
      parsed?.msg || parsed?.error_description || parsed?.message || body || "sem detalhes";
    return {
      ok: false,
      error: pickErrorMessage(apiMsg),
    };
  }

  // Já criou o usuário. Agora loga via SSR client pra setar os cookies de
  // sessão e redirecionar pra área autenticada.
  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInErr) {
    // Cadastro deu certo mas precisamos do confirm de email — o login não
    // gera sessão sem confirmar. Avisa o usuário.
    return {
      ok: true,
      error:
        "Cadastro recebido. Verifique o e-mail enviado para confirmar e fazer login.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
