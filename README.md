# FinanceFlow

Plataforma de controle financeiro para casal/família — entradas, saídas, metas e dashboard. Em pt-BR, mobile-first, dark mode.

## Stack

- **Next.js 16** (App Router · Turbopack · React 19)
- **TypeScript** · **Tailwind CSS 4** · **shadcn-style** UI (Radix primitives)
- **Supabase** (Postgres · Auth · Row-Level Security)
- **Recharts** para gráficos · **react-hook-form** + **zod** para formulários
- **date-fns** com locale `pt-BR` · **lucide-react** para ícones · **sonner** para toasts
- Tipografia: **Bricolage Grotesque** (display) + **Geist** (UI) + **JetBrains Mono** (monetário)

## Como rodar

```bash
npm install
cp .env.local.example .env.local   # preencha com as credenciais do seu projeto Supabase
npm run dev                         # http://localhost:3000
npm run build                       # build de produção
npm start                           # servir o build
npm run typecheck                   # tsc --noEmit
```

Variáveis necessárias em `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave pública anon

## Deploy (Vercel)

1. Push para o GitHub.
2. Importe o repositório no [Vercel](https://vercel.com/new).
3. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mesmos valores do `.env.local`).
4. Em **Build Command** o padrão (`next build`) já funciona; o framework é detectado automaticamente.
5. No painel do Supabase, em **Authentication → URL Configuration**, adicione a URL de produção (`https://seu-app.vercel.app`) em *Site URL* e *Redirect URLs*.

## Estrutura

```
src/
├── app/
│   ├── (auth)/             rotas públicas: /login, /signup
│   └── (app)/              rotas protegidas: /, /registros, /entradas, /saidas, /categorias, /metas, /configuracoes
├── components/
│   ├── ui/                 button, input, card, dialog, sheet, select, dropdown, tabs, popover, etc.
│   ├── charts/             BalanceChart, MonthlyBars, CategoryPie
│   ├── finance/            TransactionRow, MoneyDelta, HealthIndicator, MonthSelector, etc.
│   ├── forms/              TransactionForm, MoneyInput
│   └── layout/             Sidebar, Topbar, MobileBottomNav, UserMenu, QuickAddTrigger
├── lib/
│   ├── supabase/           clients (browser, server, proxy)
│   ├── auth/               server actions de signIn/signUp/signOut
│   ├── actions/            server actions de transactions, categories, goals
│   ├── queries/            queries cacheadas (membership, balance, transactions, goals, categories)
│   ├── schemas/            schemas zod
│   ├── format.ts           BRL, datas e percentuais em pt-BR
│   └── colors.ts           paleta de categorias
├── proxy.ts                middleware Supabase (refresh de sessão + redirect de auth)
└── types/database.ts       tipos do Supabase
```

## Fluxo de auth

1. `/signup` cria usuário no Supabase Auth → trigger `handle_new_auth_user` cria `households`, `household_members` e 12 categorias padrão (8 saída + 4 entrada).
2. `/login` autentica e redireciona para `/`.
3. `proxy.ts` mantém a sessão atualizada e protege rotas privadas.
4. Todas as queries/actions cruzam `household_id` via RLS — segregação garantida no banco.

## Modelagem

- **households** — espaço compartilhado, com `invite_code` único (6 caracteres alfanuméricos).
- **household_members** — vínculo `auth.users` ↔ `households` com `display_name` e `role`.
- **categories** — por household, divididas em `expense`/`income`, com cor e ícone.
- **transactions** — `amount_cents` (inteiro), `installment_group` para parcelamentos.
- **monthly_goals** — limite por categoria por mês (`category_id null` = teto global).

## Verificações executadas

- `npm run build` — compila sem erros (todas as rotas).
- `tsc --noEmit` — typecheck limpo.
- `proxy.ts` redireciona `/` → `/login` para usuários não autenticados (testado via curl).
- Trigger de signup cria household + 12 categorias automaticamente (validado via API + SQL).
- Advisors do Supabase: nenhuma issue de segurança restante além de "leaked password protection" (toggle no dashboard).

## Próximos passos sugeridos (não no escopo MVP)

- Calendário (`/calendario`)
- Análise por IA (`/analise`)
- Agente WhatsApp via Evolution API + Whisper
- Convite por código (UI completa)
- Splits de casal · gastos fixos recorrentes · PWA

## Tema visual

Preto (#0A0A0A) com laranja (#F97316) como único acento, cards com bordas suaves e gradientes radiais sutis. Microinterações em hovers (borda laranja, leve elevação), tabular-nums em todos os valores monetários.
