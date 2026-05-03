# Lições aprendidas — FinanceFlow

## Next.js 16 / `proxy.ts`

- Em Next 16 o arquivo `middleware.ts` foi renomeado para `proxy.ts` e o export `middleware` para `proxy` — a mensagem de deprecação aponta o caminho.
- Para projetos com `src/`, o arquivo deve ficar em `src/proxy.ts`. Colocar na raiz não funcionou.
- O `matcher` precisa incluir `/` explicitamente quando o objetivo é proteger a rota raiz, além do padrão de exclusão.

## Tailwind v4

- Tokens via `@theme inline` exigem que cada variável `--color-foo` mapeie um valor concreto (no caso, `hsl(var(--foo))`).
- Para animações de estado (`data-[state=open]:animate-in fade-in-0 zoom-in-95`), o plugin `tailwindcss-animate` (v3) não é compatível; usar `tw-animate-css` via `@import` em `globals.css`.

## Zod 4 + react-hook-form

- Schemas com `.default()` ou `.optional()` produzem tipos input ≠ output, e o `zodResolver` rejeita o `useForm` se as defaults vierem do schema. Solução: definir todos os campos como obrigatórios no schema e usar `defaultValues` do RHF.

## Supabase types & RLS

- `Database` types gerados precisam manter o array `Relationships` preenchido para que o cliente JS aceite joins implícitos no `select("*, relacao:tabela(...)")`. Com array vazio o TS rejeita o cast.
- Funções `SECURITY DEFINER` chamadas por trigger devem ter `EXECUTE` revogado de `public/anon/authenticated` para sair como WARN dos advisors.
- Funções triggers e helpers devem ter `search_path` setado (ex.: `set search_path = public, pg_temp`) para evitar warnings de mutabilidade.

## Recharts + TS strict

- O tipo de `formatter` aceita `ValueType` (que pode ser `undefined`). Use assinatura sem tipo explícito e converta com `Number(value)`/`String(name)` em vez de tipar como `(value: number, name: string) => ...`.

## Centavos x float

- Sempre persistir valores monetários como `bigint` em centavos no banco e converter para reais somente na formatação. Evita erros de arredondamento.
