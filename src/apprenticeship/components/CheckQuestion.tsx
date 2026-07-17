import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusPhaseHeading } from "../hooks/useFocusPhaseHeading";

interface Props {
  question: string;
  options: string[];
  correctIndex: number;
  wrongExplanation: string;
  onCorrect: () => void;
  onWrong: () => void;
  focusKey: string;
}

export function CheckQuestion({
  question,
  options,
  correctIndex,
  wrongExplanation,
  onCorrect,
  onWrong,
  focusKey,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showWrong, setShowWrong] = useState(false);
  const ref = useFocusPhaseHeading<HTMLHeadingElement>(focusKey);

  const pick = (i: number) => {
    setSelected(i);
    if (i === correctIndex) {
      setShowWrong(false);
    } else {
      setShowWrong(true);
      onWrong();
    }
  };

  const retry = () => {
    setSelected(null);
    setShowWrong(false);
  };

  return (
    <aside
      aria-live="polite"
      className="flex h-full flex-col gap-4 rounded-lg border border-border/60 bg-panel/70 p-5"
    >
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary/70">
          Kiểm tra hiểu
        </div>
        <h2
          ref={ref}
          tabIndex={-1}
          className="mt-1 font-display text-lg text-gold outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {question}
        </h2>
      </div>
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => {
          const isCorrect = selected !== null && i === correctIndex;
          const isWrong = selected === i && i !== correctIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={selected === correctIndex}
              className={cn(
                "cursor-pointer rounded-md border px-3 py-2 text-left text-sm transition",
                "border-border/60 bg-panel/40 hover:border-primary/40",
                isCorrect && "border-success bg-success/15 text-success",
                isWrong && "border-danger bg-danger/15 text-danger",
                selected === correctIndex && !isCorrect && "opacity-60",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {showWrong && (
        <div className="rounded-md border border-danger/40 bg-danger/10 p-3 text-xs leading-relaxed text-danger">
          {wrongExplanation}
        </div>
      )}
      {selected === correctIndex ? (
        <button
          type="button"
          onClick={onCorrect}
          className="mt-auto flex cursor-pointer items-center justify-center gap-2 rounded-md border border-success bg-success/15 px-4 py-2 font-mono text-xs uppercase tracking-widest text-success transition hover:bg-success/25"
        >
          <Check className="h-4 w-4" /> Sang round tiếp theo
        </button>
      ) : (
        showWrong && (
          <button
            type="button"
            onClick={retry}
            className="mt-auto flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border/60 px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition hover:border-primary/40 hover:text-gold"
          >
            <RotateCcw className="h-3 w-3" /> Thử lại
          </button>
        )
      )}
    </aside>
  );
}
