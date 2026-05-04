"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, Plus } from "lucide-react";
import { MOBILE_MORE_ITEMS, MOBILE_NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import { QuickAddTrigger } from "./QuickAddTrigger";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileBottomNav() {
  const pathname = usePathname();
  const left = MOBILE_NAV_ITEMS.slice(0, 2);
  const right = MOBILE_NAV_ITEMS.slice(2); // [Entradas]

  const moreIsActive = MOBILE_MORE_ITEMS.some((item) =>
    item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="Navegação principal"
    >
      <div className="relative mx-auto max-w-md rounded-2xl border border-border-strong bg-bg-elev/85 backdrop-blur-xl backdrop-saturate-150 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-5 items-center px-1.5 py-1.5">
          {left.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}

          <QuickAddTrigger>
            <button
              className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-fg shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.55)] active:scale-95 transition-transform"
              aria-label="Adicionar lançamento"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </QuickAddTrigger>

          {right.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}

          {/* "Mais" — abre drawer com as páginas restantes */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl text-[10px] font-medium transition-colors w-full",
                  moreIsActive ? "text-primary" : "text-fg-muted hover:text-fg"
                )}
              >
                <MoreHorizontal
                  className="h-[18px] w-[18px]"
                  strokeWidth={moreIsActive ? 2.4 : 2}
                />
                <span className="leading-none">Mais</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Mais páginas</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-3 mt-2">
                {MOBILE_MORE_ITEMS.map((item) => {
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
                        "flex flex-col items-center gap-2 rounded-xl p-3 transition-colors text-xs font-medium",
                        active
                          ? "bg-primary-soft text-primary"
                          : "bg-surface-2 text-fg-muted hover:text-fg"
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                      <span className="leading-none text-center">{item.shortLabel}</span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  item,
  pathname,
}: {
  item: (typeof MOBILE_NAV_ITEMS)[number];
  pathname: string;
}) {
  const Icon = item.icon;
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl text-[10px] font-medium transition-colors",
        active ? "text-primary" : "text-fg-muted hover:text-fg"
      )}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
      <span className="leading-none">{item.shortLabel}</span>
    </Link>
  );
}
