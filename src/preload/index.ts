import { contextBridge, ipcRenderer } from 'electron';
import { CAPTURE_CHANNELS, IPC_CHANNELS, type CaptureApi, type RobotApi } from '../shared/ipc';

const robotApi: RobotApi = {
  isAvailable: () => ipcRenderer.invoke(IPC_CHANNELS.isAvailable),
  getScreenSize: () => ipcRenderer.invoke(IPC_CHANNELS.getScreenSize),
  getMousePos: () => ipcRenderer.invoke(IPC_CHANNELS.getMousePos),
  moveMouse: (x, y) => ipcRenderer.invoke(IPC_CHANNELS.moveMouse, x, y),
  clickMouse: () => ipcRenderer.invoke(IPC_CHANNELS.clickMouse),
  typeString: (text) => ipcRenderer.invoke(IPC_CHANNELS.typeString, text),
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

contextBridge.exposeInMainWorld('robot', robotApi);
contextBridge.exposeInMainWorld('capture', captureApi);
