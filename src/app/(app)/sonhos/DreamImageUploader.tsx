"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function DreamImageUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string>(value);

  const handleFile = (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Formato não suportado", { description: "Use JPEG, PNG ou WebP." });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Imagem muito grande", { description: "Limite de 5 MB." });
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("dreams")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (error) {
        toast.error("Erro ao enviar imagem", { description: error.message });
        return;
      }

      const { data: pub } = supabase.storage.from("dreams").getPublicUrl(path);
      setPreview(pub.publicUrl);
      onChange(pub.publicUrl);
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview("");
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-fg">Capa do sonho <span className="text-fg-muted font-normal">(opcional)</span></p>

      {/* Preview state */}
      {preview ? (
        <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden border border-border">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Remover imagem"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Upload area — mesma proporção do card (2:1) */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onDragOver={(e) => e.preventDefault()}
          disabled={isPending}
          className="w-full aspect-[2/1] rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-surface-2 transition-colors flex flex-col items-center justify-center gap-2 text-fg-muted hover:text-fg disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <>
              <ImagePlus className="h-7 w-7" />
              <span className="text-sm font-medium">Clique ou arraste uma imagem</span>
              <span className="text-xs opacity-70">JPEG · PNG · WebP · até 5 MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
