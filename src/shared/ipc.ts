export interface ScreenSize {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export const IPC_CHANNELS = {
  isAvailable: 'robot:isAvailable',
  getScreenSize: 'robot:getScreenSize',
  moveMouse: 'robot:moveMouse',
  clickMouse: 'robot:clickMouse',
} as const;

export interface RobotApi {
  isAvailable(): Promise<boolean>;
  getScreenSize(): Promise<ScreenSize>;
  moveMouse(x: number, y: number): Promise<void>;
  clickMouse(): Promise<void>;
}

export const CAPTURE_CHANNELS = {
  start: 'capture:start',
  stop: 'capture:stop',
  pointCaptured: 'capture:point-captured',
  stopped: 'capture:stopped',
} as const;

export interface CaptureApi {
  start(): Promise<void>;
  stop(): Promise<void>;
  onPointCaptured(callback: (point: Point) => void): () => void;
  onStopped(callback: () => void): () => void;
}

export interface SystemInfo {
  platform: string;
  osVersion: string;
  arch: string;
  hostname: string;
  cpuModel: string;
  cpuCores: number;
  totalMemory: number;
  freeMemory: number;
  gpu: string;
  uptime: number;
}

export const SYSTEM_CHANNELS = {
  getInfo: 'system:getInfo',
} as const;

export interface SystemApi {
  getInfo(): Promise<SystemInfo>;
}
