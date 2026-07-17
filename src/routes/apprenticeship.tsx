import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useReducer, useState } from "react";
import { RotateCcw } from "lucide-react";
import { MobileWarning } from "@/components/game/mobile-warning";
import { RoundHeader } from "@/apprenticeship/components/RoundHeader";
import { TaskPanel } from "@/apprenticeship/components/TaskPanel";
import { EurekaPanel } from "@/apprenticeship/components/EurekaPanel";
import { CheckQuestion } from "@/apprenticeship/components/CheckQuestion";
import { Round1Commodity } from "@/apprenticeship/rounds/Round1Commodity";
import { Round2Value } from "@/apprenticeship/rounds/Round2Value";
import { Round3Absolute } from "@/apprenticeship/rounds/Round3Absolute";
import { Round4Machine } from "@/apprenticeship/rounds/Round4Machine";
import { Round5Overproduction } from "@/apprenticeship/rounds/Round5Overproduction";
import { Round6Accumulation } from "@/apprenticeship/rounds/Round6Accumulation";
import { initialState, reducer } from "@/apprenticeship/state";
import { ROUNDS, ADVANCED_LOCKED_COUNT } from "@/apprenticeship/content";
import type { RoundId } from "@/apprenticeship/types";

export const Route = createFileRoute("/apprenticeship")({
  head: () => ({
    meta: [
      { title: "Ca học việc — Das Kapitalist" },
      { name: "description", content: "Minigame khởi động dạy trực giác về hàng hóa, giá trị và tư bản trước khi bước vào Das Kapitalist." },
    ],
  }),
  component: Apprenticeship,
});

function Apprenticeship() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [roundKey, setRoundKey] = useState(0); // increment on reset to remount round
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const round = ROUNDS[state.currentRound];

  const resetRound = () => {
    dispatch({ type: "RESET_ROUND" });
    setRoundKey((k) => k + 1);
  };

  const gotoRound = (r: RoundId, dev?: boolean) => {
    dispatch({ type: "GOTO_ROUND", round: r, dev });
    setRoundKey((k) => k + 1);
  };

  if (state.phase === "complete") {
    return (
      <>
        <MobileWarning />
        <main className="hidden min-h-screen bg-background lg:block">
          <CompletionScreen onExit={() => navigate({ to: "/" })} />
        </main>
      </>
    );
  }

  const renderRound = () => {
    const props = {
      onSimulate: () => dispatch({ type: "SET_PHASE", phase: "simulate" }),
      running: state.phase === "simulate",
    };
    switch (state.currentRound) {
      case 1: return <Round1Commodity key={roundKey} {...props} />;
      case 2: return <Round2Value key={roundKey} {...props} />;
      case 3: return <Round3Absolute key={roundKey} {...props} />;
      case 4: return <Round4Machine key={roundKey} {...props} />;
      case 5: return <Round5Overproduction key={roundKey} {...props} />;
      case 6: return <Round6Accumulation key={roundKey} {...props} />;
    }
  };

  const phaseKey = `${state.currentRound}-${state.phase}-${roundKey}`;

  return (
    <>
      <MobileWarning />
      <main className="hidden min-h-screen flex-col bg-background lg:flex">
        <RoundHeader state={state} onGoto={gotoRound} />
        <div className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Stage — 65-70% */}
          <section className="relative">
            {renderRound()}
            <button
              type="button"
              onClick={resetRound}
              className="absolute right-2 top-2 flex cursor-pointer items-center gap-1 rounded border border-border/50 bg-panel/70 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition hover:border-primary/40 hover:text-gold"
              aria-label="Reset round hiện tại"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </section>
          {/* Task / Eureka / Check panel — 30-35% */}
          <section className="relative min-h-[520px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={phaseKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.35 }}
                className="absolute inset-0"
              >
                {(state.phase === "brief" || state.phase === "interact" || state.phase === "simulate") && (
                  <TaskPanel
                    focusKey={phaseKey}
                    subtitle={round.subtitle}
                    title={round.title}
                    hints={state.phase === "brief" ? round.brief : round.interactHint}
                    action={
                      state.phase === "brief" ? (
                        <button
                          type="button"
                          onClick={() => dispatch({ type: "SET_PHASE", phase: "interact" })}
                          className="cursor-pointer rounded-md border border-primary bg-primary/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-gold transition hover:bg-primary/30"
                        >
                          Bắt đầu round
                        </button>
                      ) : state.phase === "simulate" ? (
                        <button
                          type="button"
                          onClick={() => dispatch({ type: "SET_PHASE", phase: "eureka" })}
                          className="cursor-pointer rounded-md border border-primary bg-primary/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-gold transition hover:bg-primary/30"
                        >
                          Xem điều vừa xảy ra
                        </button>
                      ) : null
                    }
                  />
                )}
                {state.phase === "eureka" && (
                  <EurekaPanel
                    focusKey={phaseKey}
                    concepts={round.concepts}
                    onContinue={() => dispatch({ type: "SET_PHASE", phase: "check" })}
                  />
                )}
                {state.phase === "check" && (
                  <CheckQuestion
                    focusKey={phaseKey}
                    question={round.check.question}
                    options={round.check.options}
                    correctIndex={round.check.correctIndex}
                    wrongExplanation={round.check.wrongExplanation}
                    onCorrect={() => dispatch({ type: "COMPLETE_ROUND" })}
                    onWrong={() => dispatch({ type: "WRONG_ANSWER" })}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
        {import.meta.env.DEV && (
          <div className="border-t border-border/40 bg-panel/40 px-6 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            DEV · nhảy round:
            {([1, 2, 3, 4, 5, 6] as RoundId[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => gotoRound(r, true)}
                className="ml-2 cursor-pointer rounded border border-border/60 px-2 py-0.5 hover:border-primary/50 hover:text-gold"
              >
                R{r}
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function CompletionScreen({ onExit }: { onExit: () => void }) {
  const learned = Object.values(ROUNDS).flatMap((r) => r.concepts);
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-primary/70">Hoàn tất ca học việc</div>
        <h1 className="mt-2 font-display text-4xl text-gold">Bạn đã sẵn sàng bước vào xưởng</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Mười khái niệm nền tảng đã hiện diện trong trực giác của bạn. Những khái niệm nâng cao sẽ mở khóa khi Heinrich thực sự đối diện chúng.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-3 gap-3">
        {learned.map((c) => (
          <div key={c.id} className="rounded-lg border border-primary/40 bg-primary/5 p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary/70">Đã học</div>
            <div className="mt-1 font-display text-sm text-gold">{c.title}</div>
          </div>
        ))}
        {Array.from({ length: ADVANCED_LOCKED_COUNT }).map((_, i) => (
          <div key={`locked-${i}`} className="rounded-lg border border-border/40 bg-panel/30 p-3 opacity-60">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Chưa mở</div>
            <div className="mt-1 font-display text-sm text-muted-foreground/60">?</div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex justify-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="cursor-pointer rounded-md border border-primary bg-primary/20 px-6 py-2 font-mono text-xs uppercase tracking-widest text-gold transition hover:bg-primary/30"
        >
          Về màn hình chính
        </button>
      </div>
    </div>
  );
}
