import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Point } from '../../../src/shared/ipc';
import { TRIGGER_BOTS_STORAGE_KEY } from '../constants/storage.constant';
import {
  renameBot as renameBotInList,
  updatePositionField,
} from '../services/triggerBot.service';

export interface TriggerPosition extends Point {
  delayMs: number;
  key: string;
  keyDelayMs: number;
}

export interface TriggerBot {
  id: string;
  name: string;
  positions: TriggerPosition[];
  createdAt: number;
}

interface TriggerBotsState {
  triggerBots: TriggerBot[];
  setTriggerBots: (
    updater: TriggerBot[] | ((prev: TriggerBot[]) => TriggerBot[]),
  ) => void;
  renameBot: (botId: string, name: string) => void;
  updatePositionDelay: (botId: string, positionIndex: number, delayMs: number) => void;
  updatePositionKey: (botId: string, positionIndex: number, key: string) => void;
  updatePositionKeyDelay: (
    botId: string,
    positionIndex: number,
    keyDelayMs: number,
  ) => void;
}

export const useTriggerBotsStore = create<TriggerBotsState>()(
  persist(
    (set) => ({
      triggerBots: [],
      setTriggerBots: (updater) =>
        set((state) => ({
          triggerBots:
            typeof updater === 'function' ? updater(state.triggerBots) : updater,
        })),
      renameBot: (botId, name) =>
        set((state) => ({
          triggerBots: renameBotInList(state.triggerBots, botId, name),
        })),
      updatePositionDelay: (botId, positionIndex, delayMs) =>
        set((state) => ({
          triggerBots: updatePositionField(
            state.triggerBots,
            botId,
            positionIndex,
            'delayMs',
            delayMs,
          ),
        })),
      updatePositionKey: (botId, positionIndex, key) =>
        set((state) => ({
          triggerBots: updatePositionField(
            state.triggerBots,
            botId,
            positionIndex,
            'key',
            key,
          ),
        })),
      updatePositionKeyDelay: (botId, positionIndex, keyDelayMs) =>
        set((state) => ({
          triggerBots: updatePositionField(
            state.triggerBots,
            botId,
            positionIndex,
            'keyDelayMs',
            keyDelayMs,
          ),
        })),
    }),
    { name: TRIGGER_BOTS_STORAGE_KEY },
  ),
);
