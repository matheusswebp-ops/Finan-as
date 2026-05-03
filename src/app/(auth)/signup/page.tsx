import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignupPage() {
  return (
    <div className="space-y-8 animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
      <div className="lg:hidden flex items-center gap-2.5">
        <span className="h-9 w-9 rounded-xl bg-primary grid place-items-center">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary-fg">
            <path d="M4 18 9 13l3 3 8-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 5h6v6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="font-display text-lg font-semibold">FinanceFlow</span>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-fg-muted">
          Comece em 30 segundos
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight">
          Crie sua conta.
        </h2>
        <p className="text-fg-muted text-[15px] leading-relaxed">
          Você terá um espaço pessoal pronto para uso, com categorias padrão e gráficos
          já configurados.
        </p>
      </div>

      <SignupForm />

      <p className="text-sm text-fg-muted">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="text-fg font-medium underline decoration-primary/60 decoration-2 underline-offset-4 hover:text-primary transition-colors"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
