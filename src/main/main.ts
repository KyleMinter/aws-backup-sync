import * as path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, Tray, Menu, nativeImage, screen, app, ipcMain } from 'electron';
import * as nodeEnv from '_utils/node-env';
import { getStore, setStore } from './store';

let singleInstanceLock: boolean;
let tray: Electron.Tray | undefined;
let dockedWindow: Electron.BrowserWindow | undefined;
let largeWindow: Electron.BrowserWindow | undefined;

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

  // Toggle the docked window when the tray icon is clicked.
  tray.on('click', toggleDockedWindow);
}

function createLargeWindow() {

  // The desired size of the docked window.
  const windowWidth = 800;
  const windowHeight = 600;
  
  largeWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    show: true,
    frame: true,
    fullscreenable: false,
    resizable: false,
    movable: true,
    transparent: false,
    webPreferences: {
      devTools: nodeEnv.dev,
      preload: path.join(__dirname, './preload.bundle.js'),
      webSecurity: nodeEnv.prod,
    },
  });

  // and load the index.html of the app.
  largeWindow.loadFile('largewindow.html');
}

/**
 * Creates the docked window for the application. This is the window that is shown when the tray icon is clicked.
 */
function createDockedWindow() {
  // Get the size of the display so we can position the window in the bottom right corner of the screen.
  const display = screen.getPrimaryDisplay();
  const displayWidth = display.bounds.width;
  const displayHeight = display.bounds.height;

  // The desired size of the docked window.
  const windowWidth = 800;
  const windowHeight = 600;
  
  dockedWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    // Position the window in the bottom right corner.
    x: displayWidth - windowWidth,
    y: displayHeight - windowHeight,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    movable: false,
    transparent: false,
    webPreferences: {
      devTools: nodeEnv.dev,
      preload: path.join(__dirname, './preload.bundle.js'),
      webSecurity: nodeEnv.prod,
    },
  });

  // and load the index.html of the app.
  dockedWindow.loadFile('dockedwindow.html');

  // Hide the window when it loses focus.
  dockedWindow.on('blur', () => {
    dockedWindow!.hide();
  });
}

/**
* Toggles the visibility of the docked window for the application.
*/
function toggleDockedWindow() {
  // If the window is undefined for some reason, we will create it and show it. (this shouldn't happen)
  if (!dockedWindow) {
    createDockedWindow();
    dockedWindow!.show();
  }
  else {
    if (dockedWindow.isVisible())
      dockedWindow.hide();
    else
        dockedWindow.show();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  //if (nodeEnv.dev || nodeEnv.prod) createDockedWindow();

  // Get the single instance lock. If this is the second instance we will force it to quit.
  singleInstanceLock = app.requestSingleInstanceLock();
  if (!singleInstanceLock)
      handleQuit();

  // Create the tray and docked window.
  createDockedWindow();
  createLargeWindow();
  createTray();
});

app.on('second-instance', () => {
  if (dockedWindow) {
    if (dockedWindow.isMinimized()) {
        dockedWindow.restore()
    }
    dockedWindow.focus();
  }
})

function handleQuit() {
  app.quit();
}

// IPC handles for store related functions
ipcMain.handle('store:get', getStore);
ipcMain.on('store:set', setStore)

ipcMain.on('renderer-ready', () => {
  // eslint-disable-next-line no-console
  console.log('Renderer is ready.');
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// eslint-disable-next-line import/prefer-default-export
export const exportedForTests = nodeEnv.test ? { createDockedWindow } : undefined;
