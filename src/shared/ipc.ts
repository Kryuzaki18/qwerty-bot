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
  getMousePos: 'robot:getMousePos',
  moveMouse: 'robot:moveMouse',
  clickMouse: 'robot:clickMouse',
  typeString: 'robot:typeString',
} as const;

export interface RobotApi {
  isAvailable(): Promise<boolean>;
  getScreenSize(): Promise<ScreenSize>;
  getMousePos(): Promise<Point>;
  moveMouse(x: number, y: number): Promise<void>;
  clickMouse(): Promise<void>;
  typeString(text: string): Promise<void>;
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
