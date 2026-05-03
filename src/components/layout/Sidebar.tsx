"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[248px] shrink-0 sticky top-0 h-dvh py-6 pr-3 pl-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 px-2 mb-10 group"
        aria-label="FinanceFlow"
      >
        <span className="relative h-9 w-9 rounded-xl bg-primary grid place-items-center shadow-[0_0_0_4px_hsl(var(--primary)/0.18)] group-hover:shadow-[0_0_0_6px_hsl(var(--primary)/0.22)] transition-all">
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
        <span className="font-display text-[17px] font-semibold tracking-tight">
          FinanceFlow
        </span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
          Navegação
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "text-fg bg-surface-2"
                  : "text-fg-muted hover:text-fg hover:bg-white/[0.04]"
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary"
                />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-primary" : "text-fg-muted group-hover:text-fg"
                )}
                strokeWidth={active ? 2.4 : 2}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
