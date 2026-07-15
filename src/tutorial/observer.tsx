import { useEffect, useRef } from "react";
import { useGameStore } from "@/game/state";
import { useTutorialStore } from "@/tutorial/state";
import { detectHint } from "@/tutorial/hints";
import type { GameState } from "@/game/types";

/**
 * Invisible observer: watches useGameStore and dispatches tutorial advances
 * (decision-applied, quarter-ended) plus contextual hints. Mount once in game.tsx.
 */
export function TutorialObserver() {
  const prevRef = useRef<GameState | null>(null);
  const prevUsedRef = useRef(0);
  const prevHistoryRef = useRef(0);

  useEffect(() => {
    const store = useGameStore;
    // Prime refs with current values so we don't fire on mount.
    const cur = store.getState();
    prevRef.current = cur.state;
    prevUsedRef.current = cur.usedDecisionGroups.size;
    prevHistoryRef.current = cur.state.history.length;

    const unsub = store.subscribe((next) => {
      const usedNow = next.usedDecisionGroups.size;
      const historyNow = next.state.history.length;

      if (usedNow > prevUsedRef.current) {
        useTutorialStore.getState().onDecisionApplied();
      }
      if (historyNow > prevHistoryRef.current) {
        useTutorialStore.getState().onQuarterEnded();
      }

      // Contextual hints only after tutorial phase finished / skipped.
      const t = useTutorialStore.getState();
      if (!t.active && (t.completed || t.skipped)) {
        const hintId = detectHint({ prev: prevRef.current, next: next.state });
        if (hintId) t.triggerHint(hintId);
      }

      prevRef.current = next.state;
      prevUsedRef.current = usedNow;
      prevHistoryRef.current = historyNow;
    });

    return () => unsub();
  }, []);

  return null;
}
