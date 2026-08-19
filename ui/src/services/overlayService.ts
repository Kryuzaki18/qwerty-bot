import type { Point } from "../../../src/shared/ipc";
import { moveItem } from "./triggerBot.service";

export function setOverlayDots(id: string, points: (Point | null)[] | null): void {
  void window.overlay.setBotDots(id, points);
}

export function clearOverlay(id: string): void {
  void window.overlay.setBotDots(id, null);
}

export function setOverlayDragLock(locked: boolean): void {
  window.overlay.setDragLocked(locked);
}

export function toOverlayDots(
  positions: Point[],
  hiddenIndices: Set<number>,
): (Point | null)[] {
  return positions.map((position, index) =>
    hiddenIndices.has(index) ? null : { x: position.x, y: position.y },
  );
}

export function shiftHiddenIndicesAfterDelete(
  hiddenIndices: Set<number>,
  deletedIndex: number,
): Set<number> {
  const next = new Set<number>();
  hiddenIndices.forEach((index) => {
    if (index === deletedIndex) return;
    next.add(index > deletedIndex ? index - 1 : index);
  });
  return next;
}

export function reorderHiddenIndices(
  hiddenIndices: Set<number>,
  positionsLength: number,
  fromIndex: number,
  toIndex: number,
): Set<number> {
  if (hiddenIndices.size === 0) return hiddenIndices;
  const order = Array.from({ length: positionsLength }, (_, index) => index);
  const reorderedIndices = moveItem(order, fromIndex, toIndex);
  const next = new Set<number>();
  reorderedIndices.forEach((originalIndex, newIndex) => {
    if (hiddenIndices.has(originalIndex)) next.add(newIndex);
  });
  return next;
}
