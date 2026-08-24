import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_DELAY_MS } from '../constants/trigger.constant';
import { TRIGGER_DEFAULTS_STORAGE_KEY } from '../constants/storage.constant';

interface TriggerSettingsState {
  defaultDelayMs: number;
  defaultKey: string;
  defaultKeyCombo: string;
  defaultKeyDelayMs: number;
  setDefaultDelayMs: (delayMs: number) => void;
  setDefaultKey: (key: string) => void;
  setDefaultKeyCombo: (comboKey: string) => void;
  setDefaultKeyDelayMs: (keyDelayMs: number) => void;
  resetDefaults: () => void;
}

const INITIAL_DEFAULTS = {
  defaultDelayMs: DEFAULT_DELAY_MS,
  defaultKey: '',
  defaultKeyCombo: '',
  defaultKeyDelayMs: DEFAULT_DELAY_MS,
};

export const useTriggerSettingsStore = create<TriggerSettingsState>()(
  persist(
    (set) => ({
      ...INITIAL_DEFAULTS,
      setDefaultDelayMs: (delayMs) => set({ defaultDelayMs: delayMs }),
      setDefaultKey: (key) => set({ defaultKey: key }),
      setDefaultKeyCombo: (comboKey) => set({ defaultKeyCombo: comboKey }),
      setDefaultKeyDelayMs: (keyDelayMs) => set({ defaultKeyDelayMs: keyDelayMs }),
      resetDefaults: () => set(INITIAL_DEFAULTS),
    }),
    { name: TRIGGER_DEFAULTS_STORAGE_KEY },
  ),
);
