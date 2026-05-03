"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function YearSelect({
  years,
  current,
}: {
  years: number[];
  current: number | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <select
      value={current ?? ""}
      className="font-display text-base font-medium bg-transparent outline-none cursor-pointer text-fg"
      onChange={(e) => {
        const v = e.target.value;
        const sp = new URLSearchParams(params.toString());
        if (v) sp.set("year", v);
        else sp.delete("year");
        const qs = sp.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
      }}
    >
      <option value="">Todos os anos</option>
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
}
