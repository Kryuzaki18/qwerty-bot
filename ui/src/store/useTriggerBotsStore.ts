import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Point } from '../../../src/shared/ipc';
import { TRIGGER_BOTS_STORAGE_KEY } from '../constants/trigger.constant';

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
    }),
    { name: TRIGGER_BOTS_STORAGE_KEY },
  ),
);
