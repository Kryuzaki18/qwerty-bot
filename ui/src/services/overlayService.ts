import type { Point } from "../../../src/shared/ipc";

/** Strips extra fields (delay, key, ...) down to plain screen points. */
export function toOverlayPoints(positions: Point[]): Point[] {
  return positions.map((position) => ({ x: position.x, y: position.y }));
}

export function setOverlayDots(id: string, points: Point[] | null): void {
  void window.overlay.setBotDots(id, points);
}

export function clearOverlay(id: string): void {
  void window.overlay.setBotDots(id, null);
}
