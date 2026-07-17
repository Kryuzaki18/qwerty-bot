import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { join } from 'node:path';
import { robotClient } from './robotClient';
import { CAPTURE_CHANNELS, IPC_CHANNELS } from '../shared/ipc';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    maximizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (process.env['ELECTRON_RENDERER_URL']) {
    void mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

function registerRobotHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.isAvailable, () => robotClient.available);
  ipcMain.handle(IPC_CHANNELS.getScreenSize, () => robotClient.getScreenSize());
  ipcMain.handle(IPC_CHANNELS.getMousePos, () => robotClient.getMousePos());
  ipcMain.handle(IPC_CHANNELS.moveMouse, (_event, x: number, y: number) => robotClient.moveMouse(x, y));
  ipcMain.handle(IPC_CHANNELS.clickMouse, () => robotClient.clickMouse());
  ipcMain.handle(IPC_CHANNELS.typeString, (_event, text: string) => robotClient.typeString(text));
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
