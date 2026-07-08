import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface ActionPreview {
  label: string;
  value: string;
  tone: "up" | "down" | "warn";
}

export function ActionButton({
  icon: Icon,
  title,
  description,
  cost,
  previews,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  cost: string;
  previews: ActionPreview[];
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="panel-industrial group relative w-full overflow-hidden rounded-lg p-3 text-left transition-colors hover:border-primary/50"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md border border-border/60 bg-panel-elevated p-2 text-primary transition group-hover:border-primary/60 group-hover:bg-primary/10">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate font-display text-sm font-semibold tracking-wide text-foreground">
              {title}
            </div>
            <div className="shrink-0 font-mono text-xs text-gold">{cost}</div>
          </div>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {previews.map((p) => (
              <span
                key={p.label}
                className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                  p.tone === "up"
                    ? "border-[color:var(--success)]/40 text-[color:var(--success)]"
                    : p.tone === "down"
                      ? "border-destructive/40 text-destructive"
                      : "border-[color:var(--contradiction)]/50 text-[color:var(--contradiction)]"
                }`}
              >
                {p.label} {p.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
}