import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { join } from 'node:path';
import { robotClient } from './robotClient';
import { getSystemInfo } from './systemInfo';
import {
  CAPTURE_CHANNELS,
  IPC_CHANNELS,
  OVERLAY_CHANNELS,
  SYSTEM_CHANNELS,
  WINDOW_CHANNELS,
  type OverlayDot,
  type Point,
} from '../shared/ipc';

let overlayWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;
const botDots = new Map<string, Point[]>();

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    maximizable: false,
    icon: join(__dirname, '../../ui/public/qwerty-logo.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    overlayWindow?.destroy();
    overlayWindow = null;
    mainWindow = null;
  });

  void win.loadFile(join(__dirname, '../renderer/index.html'));

  mainWindow = win;
}

function waitForOverlayReady(win: BrowserWindow): Promise<void> {
  return new Promise((resolve) => {
    const listener = (event: Electron.IpcMainEvent): void => {
      if (event.sender.id !== win.webContents.id) return;
      ipcMain.off(OVERLAY_CHANNELS.ready, listener);
      resolve();
    };
    ipcMain.on(OVERLAY_CHANNELS.ready, listener);
  });
}

async function ensureOverlayWindow(): Promise<BrowserWindow> {
  if (overlayWindow && !overlayWindow.isDestroyed()) return overlayWindow;

  const { width, height } = await robotClient.getScreenSize();
  const win = new BrowserWindow({
    x: 0,
    y: 0,
    width,
    height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });
  win.setIgnoreMouseEvents(true, { forward: true });
  win.setAlwaysOnTop(true, 'screen-saver');

  const ready = waitForOverlayReady(win);

  void win.loadFile(join(__dirname, '../renderer/src/overlay/overlay.html'));

  win.on('closed', () => {
    overlayWindow = null;
  });

  overlayWindow = win;
  await ready;
  return win;
}

function broadcastDots(): void {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  const allDots: OverlayDot[] = [];
  for (const [botId, points] of botDots) {
    points.forEach((point, index) => {
      allDots.push({ botId, index, x: point.x, y: point.y });
    });
  }
  overlayWindow.webContents.send(OVERLAY_CHANNELS.dotsUpdated, allDots);
  if (allDots.length > 0) overlayWindow.showInactive();
  else overlayWindow.hide();
}

function registerRobotHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.isAvailable, () => robotClient.available);
  ipcMain.handle(IPC_CHANNELS.getScreenSize, () => robotClient.getScreenSize());
  ipcMain.handle(IPC_CHANNELS.moveMouse, (_event, x: number, y: number) => robotClient.moveMouse(x, y));
  ipcMain.handle(IPC_CHANNELS.clickMouse, () => robotClient.clickMouse());
  ipcMain.handle(IPC_CHANNELS.pressKey, (_event, key: string) => robotClient.pressKey(key));
}

function registerSystemHandlers(): void {
  ipcMain.handle(SYSTEM_CHANNELS.getInfo, () => getSystemInfo());
}

function registerWindowHandlers(): void {
  ipcMain.handle(WINDOW_CHANNELS.minimize, () => {
    mainWindow?.minimize();
  });

  ipcMain.handle(WINDOW_CHANNELS.restore, () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.restore();
    mainWindow.focus();
  });
}

function registerOverlayHandlers(): void {
  ipcMain.handle(OVERLAY_CHANNELS.setBotDots, async (_event, botId: string, points: Point[] | null) => {
    if (points && points.length > 0) {
      botDots.set(botId, points);
      await ensureOverlayWindow();
    } else {
      botDots.delete(botId);
    }
    broadcastDots();
  });

  ipcMain.handle(OVERLAY_CHANNELS.clearAll, () => {
    botDots.clear();
    broadcastDots();
  });

  ipcMain.on(OVERLAY_CHANNELS.setInteractive, (_event, interactive: boolean) => {
    overlayWindow?.setIgnoreMouseEvents(!interactive, { forward: true });
  });

  ipcMain.on(OVERLAY_CHANNELS.positionDragged, (_event, botId: string, index: number, point: Point) => {
    const points = botDots.get(botId);
    if (!points || !points[index]) return;
    points[index] = point;
    broadcastDots();
    mainWindow?.webContents.send(OVERLAY_CHANNELS.positionUpdated, botId, index, point);
  });
}

function stopCapture(sender: Electron.WebContents): void {
  globalShortcut.unregister('Space');
  globalShortcut.unregister('Escape');
  sender.send(CAPTURE_CHANNELS.stopped);
}

function registerCaptureHandlers(): void {
  ipcMain.handle(CAPTURE_CHANNELS.start, (event) => {
    const { sender } = event;
    globalShortcut.register('Space', () => {
      void robotClient.getMousePos().then((point) => {
        sender.send(CAPTURE_CHANNELS.pointCaptured, point);
      });
    });
    globalShortcut.register('Escape', () => {
      stopCapture(sender);
    });
  });

  ipcMain.handle(CAPTURE_CHANNELS.stop, (event) => {
    stopCapture(event.sender);
  });
}

void app.whenReady().then(() => {
  registerRobotHandlers();
  registerCaptureHandlers();
  registerSystemHandlers();
  registerOverlayHandlers();
  registerWindowHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
