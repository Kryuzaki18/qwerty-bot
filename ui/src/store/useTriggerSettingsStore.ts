import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_DELAY_MS, TRIGGER_DEFAULTS_STORAGE_KEY } from '../constants/trigger.constant';

interface TriggerSettingsState {
  defaultDelayMs: number;
  defaultKey: string;
  defaultKeyDelayMs: number;
  setDefaultDelayMs: (delayMs: number) => void;
  setDefaultKey: (key: string) => void;
  setDefaultKeyDelayMs: (keyDelayMs: number) => void;
  resetDefaults: () => void;
}

const INITIAL_DEFAULTS = {
  defaultDelayMs: DEFAULT_DELAY_MS,
  defaultKey: '',
  defaultKeyDelayMs: DEFAULT_DELAY_MS,
};

export const useTriggerSettingsStore = create<TriggerSettingsState>()(
  persist(
    (set) => ({
      ...INITIAL_DEFAULTS,
      setDefaultDelayMs: (delayMs) => set({ defaultDelayMs: delayMs }),
      setDefaultKey: (key) => set({ defaultKey: key }),
      setDefaultKeyDelayMs: (keyDelayMs) => set({ defaultKeyDelayMs: keyDelayMs }),
      resetDefaults: () => set(INITIAL_DEFAULTS),
    }),
    { name: TRIGGER_DEFAULTS_STORAGE_KEY },
  ),
);
