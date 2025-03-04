// eslint-disable-next-line import/no-extraneous-dependencies
import * as path from 'path';
import { BrowserWindow, Tray, Menu, nativeImage, screen, app, ipcMain, dialog, shell } from 'electron';
import * as nodeEnv from '_utils/node-env';
import * as store from './store';
import Watcher from './watcher';
import Transfer from './transfers';
import { TransferTemplate, TransferStatus } from '_/types/transfer';

let singleInstanceLock: boolean;
let tray: Electron.Tray | undefined;
let window: Electron.BrowserWindow | undefined;
let isAppQuitting = false;
const errorLog = path.join(app.getPath('userData'), 'aws-backup-sync-errorlog.txt');

/**
 * Creates the tray icon for the application.
 */
const createTray = () => {
    // Create the tray icon.
    const icon = nativeImage.createFromPath('public/assets/logo.png');
    tray = new Tray(icon);
    tray.setToolTip('app');

    // Build the context menu that is displayed when right clicking the tray icon.
    const contextMenu = Menu.buildFromTemplate([
        { label: 'About', type: 'normal', click: () => invokeNavbarUpdateEvent('About') },
        { label: 'Preferences', type: 'normal', click: () => invokeNavbarUpdateEvent('Preferences') },
        { label: 'Folders', type: 'normal', click: () => invokeNavbarUpdateEvent('Folders') },
        { label: 'Transfers', type: 'normal', click: () => invokeNavbarUpdateEvent('Transfers') },
        { type: 'separator' },
        { label: 'Exit', type: 'normal', click: handleQuit }
    ])
    tray.setContextMenu(contextMenu)

    // Toggle the window when the tray icon is clicked.
    tray.on('click', toggleWindow);
}

async function createWindow() {
    // Get the size of the display so we can size the window accordingly.
    const display = screen.getPrimaryDisplay();
    const displayWidth = display.bounds.width;
    const displayHeight = display.bounds.height;

    // The desired size of the window in relation to the screen size.
    const diplayWidthPercentage = .36;
    const displayHeightPercentage = .80;

    // The ultimate width and height of the window. This is done to ensure the window doesn't get too small.
    const windowWidth = Math.max(displayWidth * diplayWidthPercentage, 690);
    const windowHeight = Math.min(Math.max(displayHeight * displayHeightPercentage, 860), displayHeight);
    
    // Get the icon for the app.
    const icon = nativeImage.createFromPath('public/assets/logo.png');

    window = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        icon: icon,
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
    await window.loadFile('index.html');

    // Open links using the system's default browser instead of attempting to open them from within this app window.
    window.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    })

    // Hide the window when it loses focus.
    window.on('close', (e) => {
        if (!isAppQuitting) {
            e.preventDefault();
            window!.hide();
        }
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
app.whenReady().then(async () => {
    //if (nodeEnv.dev || nodeEnv.prod) createWindow();

    // Get the single instance lock. If this is the second instance we will force it to quit.
    singleInstanceLock = app.requestSingleInstanceLock();
    if (!singleInstanceLock)
            handleQuit();

    // Create the tray and window.
    await createWindow();
    createTray();

    // Register the update listener for the transfers and initialize the watchers.
    Transfer.updateListener = invokeUpdateTransfersEvent;
    Transfer.logFilePath = errorLog;
    Watcher.initializeWatchers();
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
    isAppQuitting = true;
    app.quit();
}

// IPC handles for store related functions
ipcMain.handle('store:get', (_event, key: string) => {
    return store.getStore(key);
});
ipcMain.on('store:set', (_event, key: string, value: string) => {
    store.setStore(key, value);
});

// IPC handles for watcher related functions
ipcMain.on('watcher:add', (_event, instance: Watcher) => {
    Watcher.addWatcherInstance(instance);
});
ipcMain.on('watcher:remove', (_event, instance: Watcher) => {
    Watcher.removeWatcherInstance(instance);
});
ipcMain.on('watcher:toggle', (_event, instance: Watcher) => {
    Watcher.toggleWatcherInstance(instance);
});
ipcMain.handle('watcher:getAll', () => {
    return store.getAllWatchersFromStore();
});

//IPC handler for transfer log functions
ipcMain.handle('transfers:getTransfers', (_event, filter: TransferStatus | undefined) => {
    return Transfer.getTransferList(filter);
});
function invokeUpdateTransfersEvent(transfer: TransferTemplate) {
    window?.webContents.send('transfers:update', transfer);
}
ipcMain.handle('electron:errorLog', () => {
    return app.getPath('userData');
})

// IPC handle for electron related functions
function invokeNavbarUpdateEvent(active: string) {
    if (!window?.isVisible()) 
        window?.show();
    window?.webContents.send('electron:navbar', active);
}
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
