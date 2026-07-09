import { toast } from "sonner";
import { Award } from "lucide-react";

export function showAchievement({
  title,
  description,
  conceptName,
}: {
  title: string;
  description?: string;
  conceptName?: string;
}) {
  toast.custom(
    () => (
      <div className="flex w-[340px] items-start gap-3 rounded-lg border border-primary/60 bg-gradient-to-br from-[oklch(0.28_0.08_78)] to-[oklch(0.16_0.02_60)] p-3 shadow-[0_10px_30px_oklch(0_0_0/0.5)]">
        <div className="mt-0.5 rounded-md border border-primary/60 bg-[oklch(0.14_0.01_60)] p-2 text-gold">
          <Award className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">
            Thành tựu
          </div>
          <div className="mt-0.5 font-display text-sm font-bold text-gold">{title}</div>
          {description ? (
            <div className="mt-1 text-[11px] text-foreground/85">{description}</div>
          ) : null}
          {conceptName ? (
            <div className="mt-1.5 border-t border-primary/30 pt-1 text-[10px] text-muted-foreground">
              Mở khóa: <span className="text-gold">{conceptName}</span> trong Codex
            </div>
          ) : null}
        </div>
      </div>
    ),
    { duration: 4000 },
  );
}

export function showWarning(text: string) {
  toast.custom(
    () => (
      <div className="w-[340px] rounded-lg border border-destructive/60 bg-[oklch(0.2_0.05_25)] px-3 py-2.5 text-sm text-destructive shadow-lg">
        {text}
      </div>
    ),
    { duration: 3500 },
  );
}
