import type { CaptureApi, OverlayApi, RobotApi, SystemApi, WindowApi } from '../shared/ipc';

declare global {
  interface Window {
    robot: RobotApi;
    capture: CaptureApi;
    system: SystemApi;
    overlay: OverlayApi;
    appWindow: WindowApi;
  }
}

export {};
