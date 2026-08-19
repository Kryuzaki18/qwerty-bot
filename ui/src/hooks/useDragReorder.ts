import { useCallback, useRef, useState } from "react";
import { setOverlayDragLock } from "../services/overlayService";

const EMPTY_DRAG_IMAGE =
  typeof Image !== "undefined" ? new Image() : undefined;
if (EMPTY_DRAG_IMAGE) {
  EMPTY_DRAG_IMAGE.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7";
}

export interface PointerPosition {
  x: number;
  y: number;
}

export interface UseDragReorderResult {
  draggedIndex: number | null;
  dragOverIndex: number | null;
  pointerPosition: PointerPosition | null;
  getHandleProps: (index: number) => {
    draggable: boolean;
    onMouseDown: () => void;
    onMouseUp: () => void;
    onDragStart: (event: React.DragEvent) => void;
    onDrag: (event: React.DragEvent) => void;
    onDragEnd: () => void;
  };
  getDropTargetProps: (index: number) => {
    onDragOver: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
    onDragLeave: () => void;
  };
}

export function useDragReorder(
  onReorder: (fromIndex: number, toIndex: number) => void,
  disabled = false,
): UseDragReorderResult {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [pointerPosition, setPointerPosition] =
    useState<PointerPosition | null>(null);
  const draggedIndexRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    draggedIndexRef.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
    setPointerPosition(null);
    setOverlayDragLock(false);
  }, []);

  const getHandleProps = useCallback(
    (index: number) => ({
      draggable: !disabled,
      // Lock (and hide) the overlay as early as possible — before the
      // browser even recognizes a drag gesture — so there's no gap where
      // the always-on-top overlay can still steal/disrupt the mouse right
      // as a native drag is starting. If this turns out to be a plain
      // click (no drag follows), onMouseUp below undoes the lock.
      onMouseDown: () => {
        if (disabled) return;
        setOverlayDragLock(true);
      },
      onMouseUp: () => {
        if (draggedIndexRef.current === null) setOverlayDragLock(false);
      },
      onDragStart: (event: React.DragEvent) => {
        if (disabled) return;
        draggedIndexRef.current = index;
        setDraggedIndex(index);
        setPointerPosition({ x: event.clientX, y: event.clientY });
        event.dataTransfer.effectAllowed = "move";
        if (EMPTY_DRAG_IMAGE) {
          event.dataTransfer.setDragImage(EMPTY_DRAG_IMAGE, 0, 0);
        }
        setOverlayDragLock(true);
      },
      onDrag: (event: React.DragEvent) => {
        // Chromium fires a trailing drag event with (0, 0) on drop.
        if (event.clientX === 0 && event.clientY === 0) return;
        setPointerPosition({ x: event.clientX, y: event.clientY });
      },
      onDragEnd: reset,
    }),
    [disabled, reset],
  );

  const getDropTargetProps = useCallback(
    (index: number) => ({
      onDragOver: (event: React.DragEvent) => {
        if (draggedIndexRef.current === null) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDragOverIndex((current) => (current === index ? current : index));
      },
      onDrop: (event: React.DragEvent) => {
        event.preventDefault();
        const fromIndex = draggedIndexRef.current;
        reset();
        if (fromIndex === null || fromIndex === index) return;
        onReorder(fromIndex, index);
      },
      onDragLeave: () => {
        setDragOverIndex((current) => (current === index ? null : current));
      },
    }),
    [onReorder, reset],
  );

  return {
    draggedIndex,
    dragOverIndex,
    pointerPosition,
    getHandleProps,
    getDropTargetProps,
  };
}
