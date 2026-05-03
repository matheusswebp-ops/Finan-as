import * as Icons from "lucide-react";
import { categoryHsl, categoryBgSoft } from "@/lib/colors";
import { formatBRL, formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type LucideKeys = keyof typeof Icons;

function getIcon(name: string | null | undefined): React.ComponentType<{ className?: string }> {
  if (!name) return Icons.Circle as never;
  const candidates = [
    name,
    name
      .split("-")
      .map((p, i) => (i === 0 ? p[0]!.toUpperCase() + p.slice(1) : p[0]!.toUpperCase() + p.slice(1)))
      .join(""),
  ];
  for (const c of candidates) {
    const cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
      c as LucideKeys
    ];
    if (cmp) return cmp;
  }
  return Icons.Circle as never;
}

export function TransactionRow({
  description,
  occurredOn,
  amountCents,
  kind,
  category,
  member,
  rightSlot,
  className,
  dateLabel,
}: {
  description: string;
  occurredOn: string;
  amountCents: number;
  kind: "expense" | "income";
  category: { name: string; color: string; icon: string } | null;
  member: { display_name: string } | null;
  rightSlot?: React.ReactNode;
  className?: string;
  /** Quando preenchido, substitui o relativo (ex.: "Vence 12/05/2026"). */
  dateLabel?: string;
}) {
  const Icon = getIcon(category?.icon);
  const color = category?.color ?? "cat-8";
  return (
    <div
      className={cn(
        "group flex items-center gap-3 sm:gap-4 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors",
        className
      )}
    >
      <div
        className="grid place-items-center h-10 w-10 rounded-xl shrink-0 ring-1 ring-inset"
        style={{
          background: categoryBgSoft(color),
          color: categoryHsl(color),
          // @ts-expect-error CSS var
          "--tw-ring-color": categoryHsl(color) + "30",
        }}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg truncate">{description}</p>
        <p className="text-xs text-fg-muted truncate flex items-center gap-1.5">
          <span>{category?.name ?? "Sem categoria"}</span>
          <span className="text-fg-muted">·</span>
          <span>{dateLabel ?? formatRelativeDate(occurredOn)}</span>
          {member && (
            <>
              <span className="text-fg-muted">·</span>
              <span className="truncate">{member.display_name}</span>
            </>
          )}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            kind === "income" ? "text-success" : "text-fg"
          )}
        >
          {kind === "income" ? "+" : "−"}
          {formatBRL(amountCents)}
        </p>
        {rightSlot}
      </div>
    </div>
  );
}
