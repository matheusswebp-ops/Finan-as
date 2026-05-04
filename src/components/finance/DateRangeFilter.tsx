"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const today = new Date();
  const defaultFrom = format(startOfMonth(today), "yyyy-MM-dd");
  const defaultTo = format(endOfMonth(today), "yyyy-MM-dd");

  const [from, setFrom] = useState(params.get("from") ?? defaultFrom);
  const [to, setTo] = useState(params.get("to") ?? defaultTo);

  // sync state when URL changes externally
  useEffect(() => {
    setFrom(params.get("from") ?? defaultFrom);
    setTo(params.get("to") ?? defaultTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const apply = (nextFrom: string, nextTo: string) => {
    const sp = new URLSearchParams(params.toString());
    if (nextFrom) sp.set("from", nextFrom);
    if (nextTo) sp.set("to", nextTo);
    const qs = sp.toString();
    startTransition(() => {
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  const reset = () => {
    setFrom(defaultFrom);
    setTo(defaultTo);
    const sp = new URLSearchParams(params.toString());
    sp.delete("from");
    sp.delete("to");
    const qs = sp.toString();
    startTransition(() => {
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="from">De</Label>
        <Input
          id="from"
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            apply(e.target.value, to);
          }}
          className="w-full sm:w-[160px]"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="to">Até</Label>
        <Input
          id="to"
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            apply(from, e.target.value);
          }}
          className="w-full sm:w-[160px]"
        />
      </div>
      <Button variant="ghost" size="sm" onClick={reset}>
        Mês atual
      </Button>
    </div>
  );
}
