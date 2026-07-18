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

export const KEY_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'None', value: '' },
  { label: 'F1', value: 'F1' },
  { label: 'F2', value: 'F2' },
  { label: 'F3', value: 'F3' },
  { label: 'F4', value: 'F4' },
  { label: 'F5', value: 'F5' },
  { label: 'F6', value: 'F6' },
  { label: 'F7', value: 'F7' },
  { label: 'F8', value: 'F8' },
  { label: 'F9', value: 'F9' },
  { label: 'F10', value: 'F10' },
  { label: 'F11', value: 'F11' },
  { label: 'F12', value: 'F12' },
  { label: '0', value: 'Num0' },
  { label: '1', value: 'Num1' },
  { label: '2', value: 'Num2' },
  { label: '3', value: 'Num3' },
  { label: '4', value: 'Num4' },
  { label: '5', value: 'Num5' },
  { label: '6', value: 'Num6' },
  { label: '7', value: 'Num7' },
  { label: '8', value: 'Num8' },
  { label: '9', value: 'Num9' },
];

export const CAPTURING_OVERLAY_ID = '__capturing__';
export const MOUSE_CLICK_SETTLE_MS = 50;

export const TRIGGER_DEFAULTS_STORAGE_KEY = 'qwerty-bot-trigger-defaults';

export const TRIGGER_BOTS_STORAGE_KEY = 'qwerty-bot-trigger-bots';
export const MAX_TRIGGER_BOTS = 20;

export const GENERATE_POSITIONS_OPTIONS = [5, 10, 15, 20];
export const GENERATE_POSITIONS_COLUMNS = 5;
export const GENERATE_POSITIONS_SPACING_X = 120;
export const GENERATE_POSITIONS_SPACING_Y = 100;
