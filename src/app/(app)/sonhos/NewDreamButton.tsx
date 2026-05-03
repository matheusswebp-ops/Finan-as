"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DreamFormDialog } from "./DreamFormDialog";

export function NewDreamButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Novo sonho
      </Button>
      <DreamFormDialog open={open} onOpenChange={setOpen} initial={null} />
    </>
  );
}
