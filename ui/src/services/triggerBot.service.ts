import type { Point } from "../../../src/shared/ipc";
import type { TriggerBot, TriggerPosition } from "../store/useTriggerBotsStore";

export function mapBotPositions(
  bots: TriggerBot[],
  botId: string,
  updater: (positions: TriggerPosition[]) => TriggerPosition[],
): TriggerBot[] {
  return bots.map((bot) =>
    bot.id === botId ? { ...bot, positions: updater(bot.positions) } : bot,
  );
}

export function updatePositionField<K extends keyof TriggerPosition>(
  bots: TriggerBot[],
  botId: string,
  positionIndex: number,
  field: K,
  value: TriggerPosition[K],
): TriggerBot[] {
  return mapBotPositions(bots, botId, (positions) =>
    positions.map((position, i) =>
      i === positionIndex ? { ...position, [field]: value } : position,
    ),
  );
}

export function updatePositionPoint(
  bots: TriggerBot[],
  botId: string,
  positionIndex: number,
  point: Point,
): TriggerBot[] {
  return mapBotPositions(bots, botId, (positions) =>
    positions.map((position, i) =>
      i === positionIndex ? { ...position, ...point } : position,
    ),
  );
}

export function deletePosition(
  bots: TriggerBot[],
  botId: string,
  positionIndex: number,
): TriggerBot[] {
  return mapBotPositions(bots, botId, (positions) =>
    positions.filter((_, i) => i !== positionIndex),
  );
}

export function appendPositions(
  bots: TriggerBot[],
  botId: string,
  newPositions: TriggerPosition[],
): TriggerBot[] {
  return mapBotPositions(bots, botId, (positions) => [
    ...positions,
    ...newPositions,
  ]);
}

export function renameBot(
  bots: TriggerBot[],
  botId: string,
  name: string,
): TriggerBot[] {
  return bots.map((bot) => (bot.id === botId ? { ...bot, name } : bot));
}
