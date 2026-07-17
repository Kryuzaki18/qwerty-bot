import { contextBridge, ipcRenderer } from 'electron';
import {
  CAPTURE_CHANNELS,
  IPC_CHANNELS,
  OVERLAY_CHANNELS,
  SYSTEM_CHANNELS,
  type CaptureApi,
  type OverlayApi,
  type Point,
  type RobotApi,
  type SystemApi,
} from '../shared/ipc';

const robotApi: RobotApi = {
  isAvailable: () => ipcRenderer.invoke(IPC_CHANNELS.isAvailable),
  getScreenSize: () => ipcRenderer.invoke(IPC_CHANNELS.getScreenSize),
  moveMouse: (x, y) => ipcRenderer.invoke(IPC_CHANNELS.moveMouse, x, y),
  clickMouse: () => ipcRenderer.invoke(IPC_CHANNELS.clickMouse),
};

const captureApi: CaptureApi = {
  start: () => ipcRenderer.invoke(CAPTURE_CHANNELS.start),
  stop: () => ipcRenderer.invoke(CAPTURE_CHANNELS.stop),
  onPointCaptured: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, point: { x: number; y: number }): void =>
      callback(point);
    ipcRenderer.on(CAPTURE_CHANNELS.pointCaptured, listener);
    return () => ipcRenderer.removeListener(CAPTURE_CHANNELS.pointCaptured, listener);
  },
  onStopped: (callback) => {
    const listener = (): void => callback();
    ipcRenderer.on(CAPTURE_CHANNELS.stopped, listener);
    return () => ipcRenderer.removeListener(CAPTURE_CHANNELS.stopped, listener);
  },
};

const systemApi: SystemApi = {
  getInfo: () => ipcRenderer.invoke(SYSTEM_CHANNELS.getInfo),
};

const overlayApi: OverlayApi = {
  setBotDots: (botId, points) => ipcRenderer.invoke(OVERLAY_CHANNELS.setBotDots, botId, points),
  clearAll: () => ipcRenderer.invoke(OVERLAY_CHANNELS.clearAll),
  onDotsUpdated: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, dots: Point[]): void => callback(dots);
    ipcRenderer.on(OVERLAY_CHANNELS.dotsUpdated, listener);
    return () => ipcRenderer.removeListener(OVERLAY_CHANNELS.dotsUpdated, listener);
  },
  notifyReady: () => ipcRenderer.send(OVERLAY_CHANNELS.ready),
};

contextBridge.exposeInMainWorld('robot', robotApi);
contextBridge.exposeInMainWorld('capture', captureApi);
contextBridge.exposeInMainWorld('system', systemApi);
contextBridge.exposeInMainWorld('overlay', overlayApi);
