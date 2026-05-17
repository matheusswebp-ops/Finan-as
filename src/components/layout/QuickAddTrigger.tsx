"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";

export function QuickAddTrigger({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    if (!open || categories) return;
    const supabase = createClient();
    supabase
      .from("categories")
      .select("*")
      .order("kind", { ascending: false })
      .order("sort_order", { ascending: true })
      .then(({ data }) => setCategories(data ?? []));
  }, [open, categories]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="!max-w-xl">
        <DialogHeader>
          <DialogTitle>Novo lançamento</DialogTitle>
          <DialogDescription>
            Registre uma entrada ou saída em segundos.
          </DialogDescription>
        </DialogHeader>
        {categories === null ? (
          <div className="space-y-4">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-11 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
        ) : (
          <TransactionForm
            categories={categories}
            onSuccess={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
