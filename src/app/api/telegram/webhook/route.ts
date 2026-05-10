import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { brazilToday } from "@/lib/tz";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ALLOWED_CHAT = process.env.TELEGRAM_CHAT_ID!;
const HOUSEHOLD_ID = process.env.TELEGRAM_HOUSEHOLD_ID!;

// ─── Telegram helpers ────────────────────────────────────────────────────────

async function sendMessage(chatId: string | number, text: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

// ─── Main handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Validate webhook secret (set when registering the webhook URL)
  const secret = req.nextUrl.searchParams.get("secret");
  if (!TOKEN || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: TelegramUpdate;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = body.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId = String(message.chat.id);
  const text = message.text.trim();

  // /start — mostra chat ID para configuração
  if (text === "/start") {
    await sendMessage(chatId, `👋 Olá! Seu Chat ID é:\n\n<code>${chatId}</code>\n\nAdicione esse valor como <b>TELEGRAM_CHAT_ID</b> nas variáveis de ambiente da Vercel.\n\nDepois é só mandar uma mensagem como:\n• <i>Gastei 50 no mercado</i>\n• <i>Recebi 3000 de salário</i>\n• <i>Paguei 120 de streaming ontem</i>`);
    return NextResponse.json({ ok: true });
  }

  // Só responde para o chat autorizado
  if (!ALLOWED_CHAT || chatId !== ALLOWED_CHAT) {
    return NextResponse.json({ ok: true });
  }

  if (!HOUSEHOLD_ID) {
    await sendMessage(chatId, "⚠️ Configuração incompleta. Adicione TELEGRAM_HOUSEHOLD_ID nas variáveis da Vercel.");
    return NextResponse.json({ ok: true });
  }

  // Buscar categorias do household para passar ao Claude
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, kind")
    .eq("household_id", HOUSEHOLD_ID)
    .order("sort_order", { ascending: true });

  const catList = (categories ?? [])
    .map((c) => `${c.name} (${c.kind === "expense" ? "saída" : "entrada"})`)
    .join(", ");

  const today = brazilToday();

  // Chamar Claude para interpretar a mensagem
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let parsed: ParsedTransaction | null = null;

  try {
    const resp = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: `Você é um assistente financeiro para um app de finanças pessoais brasileiro.
Interprete a mensagem do usuário e extraia informações de uma transação financeira.
Retorne SOMENTE JSON válido, sem explicações.

Formato obrigatório:
{
  "kind": "expense" | "income",
  "amount_cents": <inteiro em centavos>,
  "description": "<descrição curta, capitalizada>",
  "category_name": "<nome da categoria mais adequada da lista abaixo, ou null>",
  "occurred_on": "<data no formato yyyy-MM-dd>"
}

Hoje é ${today}.
Categorias disponíveis: ${catList}

Se a mensagem não for uma transação financeira, retorne: {"error": "not_a_transaction"}`,
      messages: [{ role: "user", content: text }],
    });

    const raw = resp.content[0]?.type === "text" ? resp.content[0].text : "{}";
    parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch {
    await sendMessage(chatId, "❌ Não consegui interpretar a mensagem. Tente:\n<i>Gastei 50 no mercado</i>");
    return NextResponse.json({ ok: true });
  }

  if (!parsed || "error" in parsed) {
    await sendMessage(chatId, "🤔 Não entendi como uma transação. Tente:\n<i>Gastei 50 no mercado</i>\n<i>Recebi 3000 de salário hoje</i>");
    return NextResponse.json({ ok: true });
  }

  // Encontrar o ID da categoria correspondente
  const matchedCat = (categories ?? []).find(
    (c) =>
      c.name.toLowerCase() === (parsed!.category_name ?? "").toLowerCase() &&
      c.kind === parsed!.kind
  );

  // Buscar o membro principal do household para atribuir o lançamento
  const { data: member } = await supabase
    .from("household_members")
    .select("id")
    .eq("household_id", HOUSEHOLD_ID)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!member) {
    await sendMessage(chatId, "❌ Configuração incorreta. Verifique TELEGRAM_HOUSEHOLD_ID.");
    return NextResponse.json({ ok: true });
  }

  // Inserir transação
  const { error } = await supabase.from("transactions").insert({
    household_id: HOUSEHOLD_ID,
    created_by: member.id,
    kind: parsed.kind,
    amount_cents: parsed.amount_cents,
    description: parsed.description,
    category_id: matchedCat?.id ?? null,
    occurred_on: parsed.occurred_on,
    status: "realized",
    is_recurring: false,
    created_via: "telegram",
  });

  if (error) {
    await sendMessage(chatId, `❌ Erro ao salvar: ${error.message}`);
    return NextResponse.json({ ok: true });
  }

  const emoji = parsed.kind === "expense" ? "🔴" : "🟢";
  const brl = (parsed.amount_cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const catName = matchedCat?.name ?? "Sem categoria";
  const dateFormatted = parsed.occurred_on.split("-").reverse().join("/");

  await sendMessage(
    chatId,
    `${emoji} <b>${parsed.description}</b>\n💰 ${brl}\n📂 ${catName}\n📅 ${dateFormatted}\n\n✅ Registrado no dashboard!`
  );

  return NextResponse.json({ ok: true });
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from?: { id: number };
    text?: string;
  };
}

interface ParsedTransaction {
  kind: "expense" | "income";
  amount_cents: number;
  description: string;
  category_name: string | null;
  occurred_on: string;
  error?: string;
}
