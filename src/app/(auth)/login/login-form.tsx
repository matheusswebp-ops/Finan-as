"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { signIn, type AuthState } from "@/lib/auth/actions";
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
          Entrando...
        </>
      ) : (
        "Entrar"
      )}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Seu nome</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="username"
          required
          placeholder="Como você se chama"
          startIcon={<User className="h-4 w-4" />}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          placeholder="Sua senha"
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
        <div className="text-sm text-danger bg-danger-soft border border-danger/30 rounded-xl px-4 py-3">
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
