import { useCallback, useEffect, useRef, useState } from "react";

export interface PointerPosition {
  x: number;
  y: number;
}

export interface UseDragReorderResult {
  draggedIndex: number | null;
  dragOverIndex: number | null;
  pointerPosition: PointerPosition | null;
  getHandleProps: (index: number) => {
    onPointerDown: (event: React.PointerEvent) => void;
  };
  getItemProps: (index: number) => {
    "data-reorder-index": number;
  };
}

/**
 * Pointer-based (not native HTML5 `draggable`) list reordering. Native drag
 * on Windows runs an OS-level OLE drag session that gets disrupted by the
 * app's always-on-top overlay window merely existing — tracking the pointer
 * ourselves avoids that entirely, and lets callers (e.g. to live-update the
 * on-screen overlay dots) see the in-progress hover target on every move,
 * not just on drop.
 */
export function useDragReorder(
  onReorder: (fromIndex: number, toIndex: number) => void,
  disabled = false,
): UseDragReorderResult {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [pointerPosition, setPointerPosition] =
    useState<PointerPosition | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    draggedIndexRef.current = null;
    dragOverIndexRef.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
    setPointerPosition(null);
  }, []);

  useEffect(() => {
    if (draggedIndex === null) return;

    const handlePointerMove = (event: PointerEvent): void => {
      setPointerPosition({ x: event.clientX, y: event.clientY });
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const itemEl = target?.closest<HTMLElement>("[data-reorder-index]");
      const indexAttr = itemEl?.dataset.reorderIndex;
      if (indexAttr === undefined) return;
      const index = Number(indexAttr);
      if (index !== dragOverIndexRef.current) {
        dragOverIndexRef.current = index;
        setDragOverIndex(index);
      }
    };

    const handlePointerUp = (): void => {
      const fromIndex = draggedIndexRef.current;
      const toIndex = dragOverIndexRef.current;
      reset();
      if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;
      onReorder(fromIndex, toIndex);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [draggedIndex, onReorder, reset]);

  const getHandleProps = useCallback(
    (index: number) => ({
      onPointerDown: (event: React.PointerEvent) => {
        if (disabled || event.button !== 0) return;
        event.preventDefault();
        draggedIndexRef.current = index;
        dragOverIndexRef.current = index;
        setDraggedIndex(index);
        setDragOverIndex(index);
        setPointerPosition({ x: event.clientX, y: event.clientY });
      },
    }),
    [disabled],
  );

  const getItemProps = useCallback(
    (index: number) => ({
      "data-reorder-index": index,
    }),
    [],
  );

  return {
    draggedIndex,
    dragOverIndex,
    pointerPosition,
    getHandleProps,
    getItemProps,
  };
}
