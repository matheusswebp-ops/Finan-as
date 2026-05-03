"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { setAvatarUrl } from "@/lib/actions/profile";
import { getInitials } from "@/lib/format";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUploader({
  userId,
  currentUrl,
  displayName,
}: {
  userId: string;
  currentUrl: string | null;
  displayName: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);

  const initials = getInitials(displayName);

  const onPickFile = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Formato não suportado", {
        description: "Use JPEG, PNG ou WebP.",
      });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Imagem muito grande", { description: "Limite de 2 MB." });
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const upload = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upload.error) {
        toast.error("Não foi possível enviar a imagem", {
          description: upload.error.message,
        });
        return;
      }
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub.publicUrl;
      const res = await setAvatarUrl(url);
      if (!res.ok) {
        toast.error("Erro ao salvar perfil", { description: res.error });
        return;
      }
      setPreviewUrl(url);
      toast.success("Foto de perfil atualizada");
      router.refresh();
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  const onRemove = () => {
    startTransition(async () => {
      const res = await setAvatarUrl(null);
      if (!res.ok) {
        toast.error("Erro ao remover", { description: res.error });
        return;
      }
      setPreviewUrl(null);
      toast.success("Foto removida");
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20 ring-2 ring-primary/30 ring-offset-4 ring-offset-surface">
          {previewUrl && <AvatarImage src={previewUrl} alt="" />}
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <button
          onClick={onPickFile}
          disabled={isPending}
          className="absolute -bottom-1 -right-1 h-9 w-9 grid place-items-center rounded-full bg-primary text-primary-fg border-4 border-surface shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.6)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
          aria-label="Mudar foto de perfil"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={onChange}
        />
      </div>
      <div className="space-y-1.5">
        <Button size="sm" variant="secondary" onClick={onPickFile} disabled={isPending}>
          <Camera className="h-4 w-4" />
          Mudar foto
        </Button>
        {previewUrl && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            disabled={isPending}
            className="!text-fg-muted hover:!text-danger"
          >
            <Trash2 className="h-4 w-4" />
            Remover
          </Button>
        )}
        <p className="text-[11px] text-fg-muted">JPEG, PNG ou WebP (até 2 MB).</p>
      </div>
    </div>
  );
}
