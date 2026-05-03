"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/registros?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={submit}
      className="hidden md:flex items-center gap-2 rounded-xl bg-surface-2 border border-border h-10 w-72 px-3.5 text-sm text-fg-muted focus-within:border-primary/40 transition-colors"
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar lançamentos..."
        className="flex-1 bg-transparent outline-none text-fg placeholder:text-fg-muted"
        aria-label="Buscar lançamentos"
      />
      <kbd className="ml-auto hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-3 text-[10px] text-fg-muted font-mono shrink-0">
        Enter
      </kbd>
    </form>
  );
}
