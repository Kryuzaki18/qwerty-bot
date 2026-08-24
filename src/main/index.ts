import { app, BrowserWindow, globalShortcut, ipcMain, Menu, nativeImage, Tray } from 'electron';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { robotClient } from './robotClient';
import { getSystemInfo } from './systemInfo';
import {
  CAPTURE_CHANNELS,
  IPC_CHANNELS,
  OVERLAY_CHANNELS,
  SYSTEM_CHANNELS,
  WINDOW_CHANNELS,
  type MouseButton,
  type OverlayDot,
  type OverlayPositionEntry,
  type Point,
} from '../shared/ipc';

let overlayWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
const botDots = new Map<string, OverlayPositionEntry[]>();

function resolveAppIconPath(): string {
  const builtPath = join(__dirname, '../renderer/qwerty-logo.png');
  if (existsSync(builtPath)) return builtPath;
  return join(__dirname, '../../ui/public/qwerty-logo.png');
}

const appIconPath = resolveAppIconPath();

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    maximizable: false,
    icon: appIconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('close', (event) => {
    if (isQuitting) return;
    event.preventDefault();
    win.hide();
  });

  win.on('closed', () => {
    overlayWindow?.destroy();
    overlayWindow = null;
    mainWindow = null;
  });

  if (process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow = win;
}

function showMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function requestForceQuit(): void {
  showMainWindow();
  mainWindow?.webContents.send(WINDOW_CHANNELS.requestForceQuit);
}

function createTray(): void {
  const icon = nativeImage.createFromPath(appIconPath).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip('qwerty-bot');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open qwerty-bot', click: showMainWindow },
      { type: 'separator' },
      { label: 'Force Close', click: requestForceQuit },
    ]),
  );
  tray.on('click', showMainWindow);
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

  if (process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/src/overlay/overlay.html`);
  } else {
    void win.loadFile(join(__dirname, '../renderer/src/overlay/overlay.html'));
  }

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
  for (const [botId, entries] of botDots) {
    entries.forEach((entry, index) => {
      if (!entry.point) return;
      allDots.push({ botId, positionId: entry.id, index, x: entry.point.x, y: entry.point.y });
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
  ipcMain.handle(IPC_CHANNELS.clickMouse, (_event, button?: MouseButton) => robotClient.clickMouse(button));
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

  ipcMain.handle(WINDOW_CHANNELS.forceQuit, () => {
    isQuitting = true;
    app.quit();
  });
}

function registerOverlayHandlers(): void {
  ipcMain.handle(
    OVERLAY_CHANNELS.setBotDots,
    async (_event, botId: string, entries: OverlayPositionEntry[] | null) => {
      const hasVisibleEntries = entries?.some((entry) => entry.point !== null) ?? false;
      if (hasVisibleEntries && entries) {
        botDots.set(botId, entries);
        await ensureOverlayWindow();
      } else {
        botDots.delete(botId);
      }
      broadcastDots();
    },
  );

  ipcMain.handle(OVERLAY_CHANNELS.clearAll, () => {
    botDots.clear();
    broadcastDots();
  });

  ipcMain.on(OVERLAY_CHANNELS.setInteractive, (_event, interactive: boolean) => {
    overlayWindow?.setIgnoreMouseEvents(!interactive, { forward: true });
  });

  ipcMain.on(OVERLAY_CHANNELS.positionDragged, (_event, botId: string, index: number, point: Point) => {
    const entries = botDots.get(botId);
    if (!entries || index < 0 || index >= entries.length) return;
    entries[index] = { ...entries[index], point };
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
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else showMainWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  tray?.destroy();
  tray = null;
});
