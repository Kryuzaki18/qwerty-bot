export const DELAY_OPTIONS: Array<{ label: string; value: number }> = [
  { label: '100ms', value: 100 },
  { label: '250ms', value: 250 },
  { label: '500ms', value: 500 },
  { label: '1sec', value: 1000 },
  { label: '2secs', value: 2000 },
  { label: '3secs', value: 3000 },
  { label: '5secs', value: 5000 },
  { label: '6secs', value: 6000 },
  { label: '7secs', value: 7000 },
  { label: '8secs', value: 8000 },
  { label: '9secs', value: 9000 },
  { label: '10secs', value: 10000 },
];

export const DEFAULT_DELAY_MS = 100;

export interface KeyOption {
  label: string;
  value: string;
}

export interface KeyOptionGroup {
  label: string;
  options: KeyOption[];
}

export const NONE_KEY_OPTION: KeyOption = { label: 'None', value: '' };

export const KEY_OPTION_GROUPS: KeyOptionGroup[] = [
  {
    label: 'Modifiers',
    options: [
      { label: 'Ctrl', value: 'LeftControl' },
      { label: 'Shift', value: 'LeftShift' },
      { label: 'Alt', value: 'LeftAlt' },
      { label: 'Win', value: 'LeftSuper' },
    ],
  },
  {
    label: 'Letters',
    options: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .split('')
      .map((letter) => ({ label: letter, value: letter })),
  },
  {
    label: 'Function Keys',
    options: Array.from({ length: 12 }, (_, i) => ({
      label: `F${i + 1}`,
      value: `F${i + 1}`,
    })),
  },
  {
    label: 'Numbers',
    options: Array.from({ length: 10 }, (_, i) => ({
      label: String(i),
      value: `Num${i}`,
    })),
  },
];

export const KEY_OPTIONS: KeyOption[] = [
  NONE_KEY_OPTION,
  ...KEY_OPTION_GROUPS.flatMap((group) => group.options),
];

export const KEY_SELECT_POPUP_HEIGHT_CLASSNAME =
  '[appearance:base-select] [&::picker(select)]:max-h-[280px] [&::picker(select)]:overflow-y-auto';

export const KEY_COMBO_SEPARATOR = '+';

export function formatKeyCombo(key: string, comboKey: string): string {
  if (!key || !comboKey) return key;
  return `${key}${KEY_COMBO_SEPARATOR}${comboKey}`;
}

export function parseKeyCombo(key: string): [primaryKey: string, comboKey: string] {
  const [primaryKey = '', comboKey = ''] = key.split(KEY_COMBO_SEPARATOR);
  return [primaryKey, comboKey];
}

export const CAPTURING_OVERLAY_ID = '__capturing__';
export const MOUSE_CLICK_SETTLE_MS = 50;

export const MAX_TRIGGER_BOTS = 20;

export const GENERATE_POSITIONS_OPTIONS = [5, 10, 15, 20];
export const GENERATE_POSITIONS_COLUMNS = 5;
export const GENERATE_POSITIONS_SPACING_X = 120;
export const GENERATE_POSITIONS_SPACING_Y = 100;
