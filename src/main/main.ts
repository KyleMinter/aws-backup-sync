import * as path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, Tray, Menu, nativeImage, screen, app, ipcMain, dialog } from 'electron';
import * as nodeEnv from '_utils/node-env';
import { getStore, setStore, getAllWatchersFromStore } from './store';
import Watcher, { addWatcherInstance, removeWatcherInstance, toggleWatcherInstance } from './watcher';

let singleInstanceLock: boolean;
let tray: Electron.Tray | undefined;
let window: Electron.BrowserWindow | undefined;

/**
 * Creates the tray icon for the application.
 */
const createTray = () => {
  // Create the tray icon.
  const icon = nativeImage.createFromPath('public/assets/cat.jpg')
  tray = new Tray(icon);
  tray.setToolTip('app');

  // Build the context menu that is displayed when right clicking the tray icon.
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Exit', type: 'normal', click: handleQuit }
  ])
  tray.setContextMenu(contextMenu)

  // Toggle the window when the tray icon is clicked.
  tray.on('click', toggleWindow);
}

function createWindow() {
  // Get the size of the display so we can size the window accordingly.
  const display = screen.getPrimaryDisplay();
  const displayWidth = display.bounds.width;
  const displayHeight = display.bounds.height;

  // The desired size of the window in relation to the screen size.
  const windowWidth = .60;
  const windowHeight = .75;
  
  window = new BrowserWindow({
    width: displayWidth * windowWidth,
    height: displayHeight * windowHeight,
    show: false,
    frame: true,
    fullscreenable: false,
    resizable: false,
    movable: true,
    transparent: false,
    autoHideMenuBar: true,
    webPreferences: {
      devTools: nodeEnv.dev,
      preload: path.join(__dirname, './preload.bundle.js'),
      webSecurity: nodeEnv.prod,
    },
  });

  // and load the index.html of the app.
  window.loadFile('index.html');

  // Hide the window when it loses focus.
  window.on('blur', () => {
    window!.hide();
  });
}

/**
* Toggles the visibility of the window.
*/
function toggleWindow() {
  // If the window is undefined for some reason, we will create it and show it. (this shouldn't happen)
  if (!window) {
    createWindow();
    window!.show();
  }
  else {
    if (window.isVisible())
      window.hide();
    else
        window.show();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  //if (nodeEnv.dev || nodeEnv.prod) createWindow();

  // Get the single instance lock. If this is the second instance we will force it to quit.
  singleInstanceLock = app.requestSingleInstanceLock();
  if (!singleInstanceLock)
      handleQuit();

  // Create the tray and window.
  createWindow();
  createTray();
});

app.on('second-instance', () => {
  if (window) {
    if (window.isMinimized()) {
        window.restore()
    }
    window.focus();
  }
})

function handleQuit() {
  app.quit();
}

// IPC handles for store related functions
ipcMain.handle('store:get', getStore);
ipcMain.on('store:set', setStore)

ipcMain.on('watcher:add', (event, instance: Watcher) => {
  addWatcherInstance(instance);
});
ipcMain.on('watcher:remove', (event, instance: Watcher) => {
  removeWatcherInstance(instance);
});
ipcMain.on('watcher:toggle', (event, instance: Watcher) => {
  toggleWatcherInstance(instance);
});
ipcMain.handle('watcher:getAll', () => {
  return getAllWatchersFromStore();
});

ipcMain.handle('electron:openFileDialog', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    return await dialog.showOpenDialog(window, {
      title: 'title',
      defaultPath: app.getPath('home'),
      properties: ['openDirectory', 'createDirectory', 'dontAddToRecent']
    });
  }
  return undefined;
});

ipcMain.on('renderer-ready', () => {
  // eslint-disable-next-line no-console
  console.log('Renderer is ready.');
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// eslint-disable-next-line import/prefer-default-export
export const exportedForTests = nodeEnv.test ? { createWindow } : undefined;
