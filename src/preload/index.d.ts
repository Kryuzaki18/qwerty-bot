import type { CaptureApi, RobotApi } from '../shared/ipc';

declare global {
  interface Window {
    robot: RobotApi;
    capture: CaptureApi;
  }
}

export {};
