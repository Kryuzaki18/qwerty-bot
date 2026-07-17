import type { CaptureApi, OverlayApi, RobotApi, SystemApi } from '../shared/ipc';

declare global {
  interface Window {
    robot: RobotApi;
    capture: CaptureApi;
    system: SystemApi;
    overlay: OverlayApi;
  }
}

export {};
