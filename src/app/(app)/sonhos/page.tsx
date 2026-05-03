import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/finance/PageHeader";
import { DreamCard } from "./DreamCard";
import { NewDreamButton } from "./NewDreamButton";
import { listDreams } from "@/lib/queries/dreams";

export const metadata: Metadata = { title: "Sonhos" };
export const dynamic = "force-dynamic";

export default async function SonhosPage() {
  const dreams = await listDreams();

  return (
    <div>
      <PageHeader
        eyebrow="Planejamento"
        title="Sonhos"
        description="Cadastre objetivos de longo prazo e acompanhe a evolução mês a mês."
        actions={<NewDreamButton />}
      />

      {dreams.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary-soft text-primary grid place-items-center mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-sm text-fg-muted max-w-sm mx-auto">
            Que tal cadastrar a viagem dos sonhos, a entrada do apê ou o curso que você quer fazer? Comece pelo botão acima.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {dreams.map((d) => (
            <DreamCard key={d.id} dream={d} />
          ))}
        </div>
      )}
    </div>
  );
}
