import type { Point } from "../../../src/shared/ipc";
import type { TriggerBot, TriggerPosition } from "../store/useTriggerBotsStore";

export interface PositionDefaults {
  delayMs: number;
  key: string;
  keyDelayMs: number;
}

export function toTriggerPositions(
  points: Point[],
  defaults: PositionDefaults,
): TriggerPosition[] {
  return points.map((point) => ({ ...point, ...defaults }));
}

export function createTriggerBot(
  name: string,
  positions: TriggerPosition[],
): TriggerBot {
  return {
    id: `${name}-${Date.now()}`,
    name,
    positions,
    createdAt: Date.now(),
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function generateCopyName(
  existingBots: TriggerBot[],
  sourceName: string,
): string {
  const baseNameMatch = sourceName.match(/^(.*)-\d+$/);
  const baseName = baseNameMatch ? baseNameMatch[1] : sourceName;
  const counterPattern = new RegExp(`^${escapeRegExp(baseName)}-(\\d+)$`);
  const maxCounter = existingBots.reduce((max, existing) => {
    const match = existing.name.match(counterPattern);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${baseName}-${maxCounter + 1}`;
}
