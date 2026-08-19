import type { OverlayPositionEntry, Point } from "../../../src/shared/ipc";
import type { TriggerPosition } from "../store/useTriggerBotsStore";
import { getObjectId } from "../utils/objectId.util";
import { moveItem } from "./triggerBot.service";

export function setOverlayDots(id: string, entries: OverlayPositionEntry[] | null): void {
  void window.overlay.setBotDots(id, entries);
}

export function clearOverlay(id: string): void {
  void window.overlay.setBotDots(id, null);
}

export function toOverlayDots(
  positions: TriggerPosition[],
  hiddenIndices: Set<number>,
): OverlayPositionEntry[] {
  return positions.map((position, index) => ({
    id: getObjectId(position),
    point: hiddenIndices.has(index) ? null : { x: position.x, y: position.y },
  }));
}

/** Same as `toOverlayDots`, for plain (not-yet-saved) captured points. */
export function toCaptureOverlayDots(points: Point[]): OverlayPositionEntry[] {
  return points.map((point) => ({ id: getObjectId(point), point }));
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
