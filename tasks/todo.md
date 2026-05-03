# FinanceFlow — Plano de execução

## Concluído

- [x] Scaffold Next.js 16 (App Router, TS, Tailwind v4, src/)
- [x] Dependências (Supabase SSR, Radix UI, Recharts, RHF, zod, date-fns, lucide, sonner)
- [x] Design system: tokens HSL preto+laranja, fontes Bricolage/Geist/JetBrains
- [x] Componentes UI: Button, Input, Label, Card, Badge, Dialog, Sheet, Select, DropdownMenu, Tabs, Progress, Avatar, Popover, Checkbox, Switch, Separator, Skeleton, Sonner
- [x] Projeto Supabase + schema com RLS, trigger de seed e advisors verdes
- [x] Clients Supabase (browser/server) e proxy.ts com refresh de sessão
- [x] Auth pages: /login e /signup com validação e estados de erro/loading
- [x] App shell: Sidebar (desktop), Topbar com avatar+busca, MobileBottomNav com botão flutuante de adicionar
- [x] CRUD de Transações: TransactionForm + Server Actions (criar/editar/excluir, com parcelamento)
- [x] Dashboard /: hero do saldo, sparkline area, cards de entradas/saídas/saúde, gráficos de barras 6 meses, donut de categorias, lançamentos recentes
- [x] Pages /entradas, /saidas, /registros: filtros (mês, categoria, busca, tipo), agrupamento por dia, edição/exclusão inline
- [x] /categorias: pizza + lista com progresso vs metas + CRUD (proteção em categorias padrão)
- [x] /metas: meta global + meta por categoria, progresso, alertas, replicar do mês anterior
- [x] /configuracoes: perfil, código de convite, lista de membros
- [x] Verificações: typecheck limpo, build de produção passa, proxy redireciona, trigger cria 12 categorias

## Pós-MVP (planejado)

- [ ] Calendário com indicadores diários
- [ ] Análise por IA
- [ ] Agente WhatsApp (Evolution API + Whisper)
- [ ] UI completa de convite com código (apresentação atual mostra o código, falta tela do convidado)
- [ ] Gastos fixos recorrentes (cron + UI)
- [ ] Splits de casal
- [ ] PWA + relatório mensal
