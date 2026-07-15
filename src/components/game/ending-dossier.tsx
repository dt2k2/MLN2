import { ArrowRight, BookOpen, GitBranch, History, Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buildEndingReport } from "@/game/ending-report";
import type { EndingId, GameState } from "@/game/types";

const metricTone = {
  neutral: "text-foreground",
  positive: "text-[color:var(--success)]",
  warning: "text-gold",
} as const;

export function EndingDossier({ state, ending }: { state: GameState; ending: EndingId }) {
  const report = buildEndingReport(state, ending);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-gold/60 bg-black/35 px-5 py-3 font-display text-sm uppercase tracking-wider text-gold transition-colors hover:bg-gold/10"
        >
          <BookOpen className="h-4 w-4" /> Xem hồ sơ lịch sử
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] w-[min(94vw,960px)] max-w-none gap-0 overflow-y-auto border-gold/35 bg-[oklch(0.12_0.012_60)] p-0 text-left shadow-2xl">
        <DialogHeader className="border-b border-border/70 px-5 py-5 pr-12 sm:px-7">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
            Hồ sơ lịch sử · Müller & Söhne
          </div>
          <DialogTitle className="font-display text-2xl text-foreground sm:text-3xl">
            Con đường dẫn tới kết cục
          </DialogTitle>
          <DialogDescription className="max-w-3xl leading-relaxed">
            {report.thesis}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 border-b border-border/70 sm:grid-cols-3 lg:grid-cols-6">
          {report.metrics.map((metric) => (
            <div
              key={metric.label}
              className="min-w-0 border-b border-r border-border/50 px-4 py-4 last:border-r-0 sm:border-b-0"
            >
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </div>
              <div
                className={`mt-1 break-words font-mono text-sm font-semibold sm:text-base ${metricTone[metric.tone]}`}
              >
                {metric.value}
              </div>
              <div className="mt-1 text-[10px] leading-snug text-muted-foreground">
                {metric.detail}
              </div>
            </div>
          ))}
        </div>

        <section className="border-b border-border/70 px-5 py-6 sm:px-7">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
            <History className="h-4 w-4" /> Những bước ngoặt
          </div>
          <div className="mt-4 divide-y divide-border/60 border-y border-border/60">
            {report.pivots.length ? (
              report.pivots.map((pivot) => (
                <article
                  key={`${pivot.id}-${pivot.turn}`}
                  className="grid gap-2 py-4 sm:grid-cols-[92px_1fr]"
                >
                  <div className="font-mono text-xs text-gold">
                    {pivot.period}
                    <div className="mt-1 text-[9px] uppercase text-muted-foreground">
                      Lượt {pivot.turn}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-base text-foreground">{pivot.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/75">
                      {pivot.mechanism}
                    </p>
                    <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-muted-foreground">
                      {pivot.evidence}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <p className="py-5 text-sm text-muted-foreground">
                Ván chơi chưa có đủ dữ liệu quý để xác định bước ngoặt.
              </p>
            )}
          </div>
        </section>

        <section className="grid border-b border-border/70 lg:grid-cols-[1.2fr_1fr]">
          <div className="border-b border-border/70 px-5 py-6 sm:px-7 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
              <GitBranch className="h-4 w-4" /> Chuỗi vận động
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {report.causalChain.map((step, index) => (
                <div key={`${step}-${index}`} className="contents">
                  <span className="border border-border/70 bg-panel/60 px-2.5 py-1.5 text-xs text-foreground/85">
                    {step}
                  </span>
                  {index < report.causalChain.length - 1 ? (
                    <ArrowRight className="h-3.5 w-3.5 text-gold/70" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 py-6 sm:px-7">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
              <Lightbulb className="h-4 w-4" /> Con đường chưa đi
            </div>
            <ul className="mt-4 space-y-3">
              {report.counterfactuals.map((item) => (
                <li
                  key={item}
                  className="border-l-2 border-gold/40 pl-3 text-xs leading-relaxed text-foreground/75"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <p className="px-5 py-4 text-[10px] italic leading-relaxed text-muted-foreground sm:px-7">
          {report.qualification}
        </p>
      </DialogContent>
    </Dialog>
  );
}
