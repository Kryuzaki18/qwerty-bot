import type { CaptureApi, RobotApi, SystemApi } from '../shared/ipc';

declare global {
  interface Window {
    robot: RobotApi;
    capture: CaptureApi;
    system: SystemApi;
  }
}

export {};
