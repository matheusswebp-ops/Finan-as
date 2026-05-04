"use client";

import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Notification } from "@/lib/queries/notifications";
import { cn } from "@/lib/utils";

const ICONS: Record<Notification["kind"], typeof Bell> = {
  "due-soon": Clock,
  overdue: AlertCircle,
  "goal-warn": AlertTriangle,
  "goal-over": AlertCircle,
  "dream-deadline": Sparkles,
  "month-end": CheckCircle2,
};

export function NotificationsBell({
  notifications,
}: {
  notifications: Notification[];
}) {
  const count = notifications.length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={`Notificações${count ? `, ${count} não lidas` : ""}`}
          className="relative h-10 w-10 inline-flex items-center justify-center rounded-xl bg-surface-2 border border-border hover:bg-surface-3 hover:border-border-strong transition-colors"
        >
          <Bell className="h-[18px] w-[18px]" />
          {count > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-fg text-[10px] font-bold inline-flex items-center justify-center tabular-nums shadow-[0_0_0_3px_hsl(var(--bg))]"
              aria-hidden
            >
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="!w-[calc(100vw-1.5rem)] sm:!w-[360px] !p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="font-display font-semibold text-sm">Notificações</p>
          <p className="text-xs text-fg-muted tabular-nums">
            {count} {count === 1 ? "alerta" : "alertas"}
          </p>
        </div>
        {count === 0 ? (
          <div className="p-6 text-center">
            <div className="mx-auto h-10 w-10 rounded-full bg-success-soft text-success grid place-items-center mb-2">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-fg">Tudo em ordem</p>
            <p className="text-xs text-fg-muted mt-1">
              Sem alertas no momento. Continue acompanhando suas metas.
            </p>
          </div>
        ) : (
          <ul className="max-h-[440px] overflow-y-auto py-1">
            {notifications.map((n) => {
              const Icon = ICONS[n.kind];
              const tone = n.iconTone;
              const Wrapper = n.href ? Link : "div";
              return (
                <li key={n.id}>
                  <Wrapper
                    href={n.href ?? "#"}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors"
                  >
                    <span
                      className={cn(
                        "mt-0.5 h-9 w-9 rounded-xl grid place-items-center shrink-0",
                        tone === "warning" && "bg-warning-soft text-warning",
                        tone === "danger" && "bg-danger-soft text-danger",
                        tone === "primary" && "bg-primary-soft text-primary",
                        tone === "success" && "bg-success-soft text-success"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-fg leading-snug">
                        {n.title}
                      </p>
                      <p className="text-xs text-fg-muted leading-snug mt-0.5">
                        {n.description}
                      </p>
                    </div>
                  </Wrapper>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
