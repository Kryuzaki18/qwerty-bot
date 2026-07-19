import type { MouseButton, Point } from "../../../src/shared/ipc";
import type { TriggerBot, TriggerPosition } from "../store/useTriggerBotsStore";

export interface PositionDefaults {
  delayMs: number;
  key: string;
  keyDelayMs: number;
  mouseButton: MouseButton;
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

type ImportedPosition = Omit<TriggerPosition, "mouseButton"> & {
  mouseButton?: MouseButton;
};
type ImportedBot = Omit<TriggerBot, "positions"> & {
  positions: ImportedPosition[];
};

function isValidPosition(value: unknown): value is ImportedPosition {
  if (typeof value !== "object" || value === null) return false;
  const position = value as Record<string, unknown>;
  return (
    typeof position.x === "number" &&
    typeof position.y === "number" &&
    typeof position.delayMs === "number" &&
    typeof position.key === "string" &&
    typeof position.keyDelayMs === "number" &&
    (position.mouseButton === undefined ||
      position.mouseButton === "left" ||
      position.mouseButton === "right")
  );
}

function isValidImportedBot(value: unknown): value is ImportedBot {
  if (typeof value !== "object" || value === null) return false;
  const bot = value as Record<string, unknown>;
  return (
    typeof bot.name === "string" &&
    bot.name.trim().length > 0 &&
    Array.isArray(bot.positions) &&
    bot.positions.every(isValidPosition)
  );
}

export function parseImportedTriggerBots(jsonText: string): TriggerBot[] {
  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error("File is not valid JSON.");
  }
  if (!Array.isArray(data) || data.length === 0 || !data.every(isValidImportedBot)) {
    throw new Error("File does not contain valid trigger bots data.");
  }
  return data.map((bot) => ({
    ...bot,
    positions: bot.positions.map((position) => ({
      ...position,
      mouseButton: position.mouseButton ?? "left",
    })),
  }));
}

export function mergeImportedTriggerBots(
  existingBots: TriggerBot[],
  importedBots: TriggerBot[],
): TriggerBot[] {
  return importedBots.reduce((bots, importedBot) => {
    const name = bots.some((bot) => bot.name === importedBot.name)
      ? generateCopyName(bots, importedBot.name)
      : importedBot.name;
    return [
      ...bots,
      createTriggerBot(
        name,
        importedBot.positions.map((position) => ({ ...position })),
      ),
    ];
  }, existingBots);
}
