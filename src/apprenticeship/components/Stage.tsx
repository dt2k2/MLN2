import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  resultTray?: ReactNode;
}

export function Stage({ children, resultTray }: Props) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex min-h-[420px] flex-1 items-stretch justify-center rounded-lg border border-border/60 bg-panel/50 p-6">
        {children}
      </div>
      <div
        aria-live="polite"
        className="min-h-[92px] rounded-lg border border-border/50 bg-panel/40 p-4"
      >
        {resultTray ?? (
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
            Chạy thử nghiệm để xem kết quả xuất hiện tại đây.
          </p>
        )}
      </div>
    </div>
  );
}
