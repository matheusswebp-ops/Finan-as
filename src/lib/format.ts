import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PCT = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const NUM = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Format integer cents as BRL string. */
export function formatBRL(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return "R$ 0,00";
  return BRL.format(cents / 100);
}

/** Compact BRL ("R$ 12,4 mil"). Falls back to full when small. */
export function formatBRLCompact(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return "R$ 0,00";
  const value = cents / 100;
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `R$ ${NUM.format(value / 1_000_000)} mi`;
  if (abs >= 10_000) return `R$ ${NUM.format(value / 1_000)} mil`;
  return BRL.format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "0,0%";
  return PCT.format(value);
}

/** "+12,3%" / "−5,1%": signed, with locale-aware separator. */
export function formatPercentDelta(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "0,0%";
  const formatted = PCT.format(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
}

export function parseBRLToCents(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^\d,-]/g, "").replace(",", ".");
  const value = Number.parseFloat(cleaned);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}

export function formatCentsAsInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function formatDate(date: Date | string, pattern = "dd MMM, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: ptBR });
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatMonthYear(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMMM 'de' yyyy", { locale: ptBR });
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  return formatDistanceToNow(d, { locale: ptBR, addSuffix: true });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "HH:mm", { locale: ptBR });
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Inicia­is do nome (até 2 letras maiúsculas) — seguro de usar em client components. */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}
