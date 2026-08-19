import { useLayoutEffect, useRef } from "react";

const TRANSITION_MS = 220;
export function useFlipAnimation(keys: string[]): (key: string) => (el: HTMLElement | null) => void {
  const elementsRef = useRef(new Map<string, HTMLElement>());
  const prevRectsRef = useRef(new Map<string, DOMRect>());
  const keysSignature = keys.join("|");

  useLayoutEffect(() => {
    const nextRects = new Map<string, DOMRect>();
    elementsRef.current.forEach((el, key) => {
      nextRects.set(key, el.getBoundingClientRect());
    });

    elementsRef.current.forEach((el, key) => {
      const prevRect = prevRectsRef.current.get(key);
      const nextRect = nextRects.get(key);
      if (!prevRect || !nextRect) return;

      const deltaX = prevRect.left - nextRect.left;
      const deltaY = prevRect.top - nextRect.top;
      if (deltaX === 0 && deltaY === 0) return;

      el.style.transition = "none";
      el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      // Force a reflow so the transform above applies before we animate it away.
      el.getBoundingClientRect();
      el.style.transition = `transform ${TRANSITION_MS}ms ease`;
      el.style.transform = "";
    });

    prevRectsRef.current = nextRects;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysSignature]);

  return (key: string) => (el: HTMLElement | null) => {
    if (el) elementsRef.current.set(key, el);
    else elementsRef.current.delete(key);
  };
}
