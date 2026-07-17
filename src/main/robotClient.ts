import type * as NutJS from '@nut-tree-fork/nut-js';
import type { Point, ScreenSize } from '../shared/ipc';

export interface RobotClient {
  readonly available: boolean;
  moveMouse(x: number, y: number): Promise<void>;
  getMousePos(): Promise<Point>;
  clickMouse(): Promise<void>;
  getScreenSize(): Promise<ScreenSize>;
}

function loadNut(): typeof NutJS | null {
  try {
    // @nut-tree-fork/nut-js loads a native addon and may fail on unsupported platforms.
    return require('@nut-tree-fork/nut-js') as typeof NutJS;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`@nut-tree-fork/nut-js not available: ${message}`);
    return null;
  }
}

const nut = loadNut();

function requireNut(): typeof NutJS {
  if (!nut) {
    throw new Error(
      '@nut-tree-fork/nut-js is not installed or failed to load a native binding for this platform.',
    );
  }
  return nut;
}

export const robotClient: RobotClient = {
  get available() {
    return nut !== null;
  },
  async moveMouse(x, y) {
    await requireNut().mouse.setPosition({ x, y });
  },
  async getMousePos() {
    return requireNut().mouse.getPosition();
  },
  async clickMouse() {
    const nutjs = requireNut();
    await nutjs.mouse.click(nutjs.Button.LEFT);
  },
  async getScreenSize() {
    const nutjs = requireNut();
    const [width, height] = await Promise.all([nutjs.screen.width(), nutjs.screen.height()]);
    return { width, height };
  },
};
