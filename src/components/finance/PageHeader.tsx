import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4 mb-5 sm:mb-6",
        className
      )}
    >
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-fg-muted font-semibold">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl sm:text-3xl font-medium tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-fg-muted max-w-xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
