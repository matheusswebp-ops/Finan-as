"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { signUp, type AuthState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Criando conta…
        </>
      ) : (
        "Criar conta"
      )}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(signUp, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="display_name">Como podemos te chamar?</Label>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          autoComplete="name"
          required
          placeholder="Seu primeiro nome"
          startIcon={<User className="h-4 w-4" />}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@exemplo.com"
          startIcon={<Mail className="h-4 w-4" />}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          startIcon={<Lock className="h-4 w-4" />}
          endIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-fg-muted hover:text-fg transition-colors"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
      </div>

      {state.error && (
        <div
          className={`text-sm rounded-xl px-4 py-3 border ${
            state.ok
              ? "text-fg bg-primary-soft border-primary/30"
              : "text-danger bg-danger-soft border-danger/30"
          }`}
        >
          {state.error}
        </div>
      )}

      <SubmitButton />

      <p className="text-xs text-fg-muted text-center leading-relaxed">
        Ao criar conta você concorda em manter seus dados seguros e em uso pessoal.
      </p>
    </form>
  );
}
