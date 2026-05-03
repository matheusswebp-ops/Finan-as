"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "@/components/finance/CategoryFormDialog";

export function NewCategoryButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nova categoria
      </Button>
      <CategoryFormDialog open={open} onOpenChange={setOpen} defaultKind="expense" />
    </>
  );
}
