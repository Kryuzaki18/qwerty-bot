import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { join } from 'node:path';
import { robotClient } from './robotClient';
import { getSystemInfo } from './systemInfo';
import { CAPTURE_CHANNELS, IPC_CHANNELS, OVERLAY_CHANNELS, SYSTEM_CHANNELS, type Point } from '../shared/ipc';

let overlayWindow: BrowserWindow | null = null;
const botDots = new Map<string, Point[]>();

function createWindow(): void {
  const mainWindow = new BrowserWindow({
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

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    overlayWindow?.destroy();
    overlayWindow = null;
  });

  void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
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
  win.setIgnoreMouseEvents(true);
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
  const allDots = Array.from(botDots.values()).flat();
  overlayWindow.webContents.send(OVERLAY_CHANNELS.dotsUpdated, allDots);
  if (allDots.length > 0) overlayWindow.showInactive();
  else overlayWindow.hide();
}

function registerRobotHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.isAvailable, () => robotClient.available);
  ipcMain.handle(IPC_CHANNELS.getScreenSize, () => robotClient.getScreenSize());
  ipcMain.handle(IPC_CHANNELS.moveMouse, (_event, x: number, y: number) => robotClient.moveMouse(x, y));
  ipcMain.handle(IPC_CHANNELS.clickMouse, () => robotClient.clickMouse());
}

function registerSystemHandlers(): void {
  ipcMain.handle(SYSTEM_CHANNELS.getInfo, () => getSystemInfo());
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
