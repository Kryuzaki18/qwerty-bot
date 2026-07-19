import type { Point } from "../../../src/shared/ipc";

export function setOverlayDots(id: string, points: (Point | null)[] | null): void {
  void window.overlay.setBotDots(id, points);
}

export function clearOverlay(id: string): void {
  void window.overlay.setBotDots(id, null);
}

/** Maps positions to overlay dots, replacing hidden ones with `null` holes so the remaining dots keep their original index (and on-screen number). */
export function toOverlayDots(
  positions: Point[],
  hiddenIndices: Set<number>,
): (Point | null)[] {
  return positions.map((position, index) =>
    hiddenIndices.has(index) ? null : { x: position.x, y: position.y },
  );
}

/** Re-numbers a hidden-index set after a position at `deletedIndex` is removed from the underlying array. */
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
