import { useEffect, useRef } from "react";

export function useFocusPhaseHeading<T extends HTMLElement>(key: string) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [key]);
  return ref;
}
