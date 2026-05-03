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

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) return { ok: false, error: pickErrorMessage(error.message) };

  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    return {
      ok: true,
      error:
        "Cadastro recebido. Confirme o e-mail enviado para fazer login (se a confirmação estiver ativada).",
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
