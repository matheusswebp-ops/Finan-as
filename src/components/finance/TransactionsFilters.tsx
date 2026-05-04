"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { categoryHsl } from "@/lib/colors";
import type { Category } from "@/types/database";
import type { TxKindFilter } from "@/lib/queries/transactions";

export function TransactionsFilters({
  categories,
  showKind = true,
}: {
  categories: Category[];
  showKind?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(params.get("q") ?? "");
  const kind = (params.get("kind") as TxKindFilter) ?? "all";
  const categoryId = params.get("category") ?? "all";

  // Debounce search updates
  useEffect(() => {
    const handle = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      if (search) sp.set("q", search);
      else sp.delete("q");
      const qs = sp.toString();
      startTransition(() => {
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
      });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const updateParam = (key: string, value: string | null) => {
    const sp = new URLSearchParams(params.toString());
    if (value === null || value === "all") sp.delete(key);
    else sp.set(key, value);
    const qs = sp.toString();
    startTransition(() => {
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  const filteredCategories = categories.filter((c) =>
    kind === "all" ? true : c.kind === kind
  );

  const activeFilterCount = [
    search,
    kind !== "all" ? kind : null,
    categoryId !== "all" ? categoryId : null,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearch("");
    const sp = new URLSearchParams();
    const month = params.get("month");
    if (month) sp.set("month", month);
    const qs = sp.toString();
    startTransition(() => {
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex-1 min-w-full sm:min-w-[200px]">
        <Input
          placeholder="Buscar descrição…"
          startIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          endIcon={
            search ? (
              <button
                onClick={() => setSearch("")}
                className="text-fg-muted hover:text-fg"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null
          }
        />
      </div>

      {showKind && (
        <Select value={kind} onValueChange={(v) => updateParam("kind", v)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="expense">Saídas</SelectItem>
            <SelectItem value="income">Entradas</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Select
        value={categoryId}
        onValueChange={(v) => updateParam("category", v)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {filteredCategories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: categoryHsl(c.color) }}
                aria-hidden
              />
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X className="h-3.5 w-3.5" />
          Limpar
        </Button>
      )}
    </div>
  );
}
