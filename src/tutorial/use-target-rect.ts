import { useEffect, useLayoutEffect, useState } from "react";

export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function useTargetRect(targetId: string | null, deps: unknown[] = []): TargetRect | null {
  const [rect, setRect] = useState<TargetRect | null>(null);

  useLayoutEffect(() => {
    if (!targetId || typeof window === "undefined") {
      setRect(null);
      return;
    }
    let cancelled = false;
    const el = document.querySelector<HTMLElement>(`[data-tutorial="${targetId}"]`);
    if (!el) {
      setRect(null);
      return;
    }

    const update = () => {
      if (cancelled) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    update();
    el.scrollIntoView({ block: "center", behavior: "smooth" });

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, ...deps]);

  // Refresh occasionally in case layout shifts without triggering ResizeObserver
  useEffect(() => {
    if (!targetId) return;
    const id = setInterval(() => {
      const el = document.querySelector<HTMLElement>(`[data-tutorial="${targetId}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect((cur) => {
        if (
          cur &&
          Math.abs(cur.top - r.top) < 0.5 &&
          Math.abs(cur.left - r.left) < 0.5 &&
          Math.abs(cur.width - r.width) < 0.5 &&
          Math.abs(cur.height - r.height) < 0.5
        )
          return cur;
        return { top: r.top, left: r.left, width: r.width, height: r.height };
      });
    }, 500);
    return () => clearInterval(id);
  }, [targetId]);

  return rect;
}
