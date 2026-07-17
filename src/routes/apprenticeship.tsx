import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useReducer, useState } from "react";
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
import desk from "@/assets/intro-3-desk.jpg";
import workers from "@/assets/intro-4-workers.jpg";

export const Route = createFileRoute("/apprenticeship")({
  head: () => ({
    meta: [
      { title: "Ca học việc — Das Kapitalist" },
      {
        name: "description",
        content:
          "Minigame khởi động dạy trực giác về hàng hóa, giá trị và tư bản trước khi bước vào Das Kapitalist.",
      },
    ],
  }),
  component: Apprenticeship,
});

function Apprenticeship() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [roundKey, setRoundKey] = useState(0); // increment on reset to remount round
  const [simulationReady, setSimulationReady] = useState(false);
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const round = ROUNDS[state.currentRound];

  const resetRound = () => {
    dispatch({ type: "RESET_ROUND" });
    setSimulationReady(false);
    setRoundKey((k) => k + 1);
  };

  const gotoRound = (r: RoundId, dev?: boolean) => {
    dispatch({ type: "GOTO_ROUND", round: r, dev });
    setSimulationReady(false);
    setRoundKey((k) => k + 1);
  };

  useEffect(() => {
    if (state.phase !== "simulate") {
      setSimulationReady(false);
      return;
    }
    const timer = window.setTimeout(() => setSimulationReady(true), reduce ? 0 : 850);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.currentRound, roundKey, reduce]);

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
      case 1:
        return <Round1Commodity key={roundKey} {...props} />;
      case 2:
        return <Round2Value key={roundKey} {...props} />;
      case 3:
        return <Round3Absolute key={roundKey} {...props} />;
      case 4:
        return <Round4Machine key={roundKey} {...props} />;
      case 5:
        return <Round5Overproduction key={roundKey} {...props} />;
      case 6:
        return <Round6Accumulation key={roundKey} {...props} />;
    }
  };

  const phaseKey = `${state.currentRound}-${state.phase}-${roundKey}`;

  return (
    <>
      <MobileWarning />
      <main className="relative isolate hidden min-h-screen overflow-hidden bg-background lg:block">
        <img
          src={desk}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08]"
        />
        <div className="pointer-events-none absolute inset-0 bg-background/90" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <RoundHeader state={state} onGoto={gotoRound} />
          <div className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Stage — 65-70% */}
            <section className="relative">
              {renderRound()}
              <button
                type="button"
                onClick={resetRound}
                className="absolute right-2 top-2 flex cursor-pointer items-center gap-1 rounded border border-border/50 bg-panel/70 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition hover:border-primary/40 hover:text-gold"
                aria-label="Làm lại chặng hiện tại"
              >
                <RotateCcw className="h-3 w-3" /> Làm lại
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
                  {(state.phase === "brief" ||
                    state.phase === "interact" ||
                    state.phase === "simulate") && (
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
                            Bắt đầu chặng
                          </button>
                        ) : state.phase === "simulate" ? (
                          <button
                            type="button"
                            disabled={!simulationReady}
                            onClick={() => dispatch({ type: "SET_PHASE", phase: "eureka" })}
                            className="rounded-md border border-primary bg-primary/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-gold transition enabled:cursor-pointer enabled:hover:bg-primary/30 disabled:cursor-wait disabled:opacity-50"
                          >
                            {simulationReady
                              ? "Giải thích điều vừa xảy ra"
                              : "Đang quan sát kết quả…"}
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
            <div className="fixed bottom-3 left-1/2 z-30 hidden -translate-x-1/2 rounded border border-border/50 bg-panel/95 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground shadow-lg backdrop-blur min-[1440px]:block">
              DEV · chuyển chặng:
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
        </div>
      </main>
    </>
  );
}

function CompletionScreen({ onExit }: { onExit: () => void }) {
  const learned = Object.values(ROUNDS).flatMap((r) => r.concepts);
  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src={workers}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15"
      />
      <div className="pointer-events-none absolute inset-0 bg-background/90" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-primary/70">
            Hoàn tất ca học việc
          </div>
          <h1 className="mt-2 font-display text-4xl text-gold">Bạn đã sẵn sàng bước vào xưởng</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Bạn đã tự tay trải nghiệm mười khái niệm nền tảng. Năm khái niệm còn lại sẽ được khám
            phá khi Heinrich thật sự chứng kiến chúng trong trò chơi chính.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {learned.map((c) => (
            <div key={c.id} className="rounded-lg border border-primary/40 bg-primary/5 p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary/70">
                Đã học
              </div>
              <div className="mt-1 font-display text-sm text-gold">{c.title}</div>
            </div>
          ))}
          {Array.from({ length: ADVANCED_LOCKED_COUNT }).map((_, i) => (
            <div
              key={`locked-${i}`}
              className="rounded-lg border border-border/40 bg-panel/30 p-3 opacity-60"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Chưa mở
              </div>
              <div className="mt-1 font-display text-sm text-muted-foreground/60">?</div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="cursor-pointer rounded-md border border-primary bg-primary/20 px-6 py-2 font-mono text-xs uppercase tracking-widest text-gold transition hover:bg-primary/30"
          >
            Về màn hình chính
          </button>
        </div>
      </div>
    </div>
  );
}
