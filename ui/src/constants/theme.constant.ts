import type { Theme } from '../store/useThemeStore';

export const DEFAULT_THEME: Theme = 'dark';
export const THEME_STORAGE_KEY = 'qwerty-bot-theme';

export const THEME_TOGGLE_ARIA_LABELS: Record<Theme, string> = {
  dark: 'Switch to light theme',
  light: 'Switch to dark theme',
};
