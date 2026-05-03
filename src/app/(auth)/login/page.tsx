import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div
      className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-8 sm:p-10 shadow-[0_30px_120px_-30px_rgba(0,0,0,0.7)] backdrop-blur-2xl backdrop-saturate-150 animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
      style={{
        boxShadow:
          "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 30px 120px -30px rgba(0,0,0,0.7)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-8">
        <span className="relative h-9 w-9 rounded-xl bg-primary grid place-items-center shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary-fg" aria-hidden>
            <path
              d="M4 18 9 13l3 3 8-8"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 5h6v6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="font-display text-lg font-semibold tracking-tight text-fg">
          FinanceFlow
        </span>
      </div>

      <div className="space-y-1.5 mb-7">
        <p className="text-[11px] uppercase tracking-[0.28em] text-fg-muted">
          Acesse a sua conta
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-fg">
          Bem-vindos.
        </h2>
        <p className="text-fg-muted text-[15px] leading-relaxed">
          Entre para acompanhar entradas, despesas e metas em um só lugar.
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
