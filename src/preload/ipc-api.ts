// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import Watcher from '_main/watcher';
import Transfer from '_main/transfers';

/** Notify main the renderer is ready. */
function rendererReady() {
  ipcRenderer.send('renderer-ready');
}



// Store API
async function storeGet(key: string): Promise<any> {
  return await ipcRenderer.invoke('store:get', key);
}

async function storeSet(key: string, value: any) {
  ipcRenderer.send('store:set', key, value);
}



// Watcher API
async function addWatcherInstance(instance: Watcher) {
  ipcRenderer.send('watcher:add', instance);
}

async function removeWatcherInstance(instance: Watcher) {
  ipcRenderer.send('watcher:remove', instance);
}

async function toggleWatcherInstance(instance: Watcher) {
  ipcRenderer.send('watcher:toggle', instance);
}

async function getAllWatchers(): Promise<Watcher[]> {
  return await ipcRenderer.invoke('watcher:getAll');
}


// Transfer API
async function getTransferList(filter: string): Promise<Transfer[]> {
  return await ipcRenderer.invoke('transfers:getTransferList', filter);
}

async function onUpdateTransferList(callback: (list: Transfer[]) => void) {
  ipcRenderer.on('transfers:update', (_event, list) => callback(list));
}

async function openFileDialog(): Promise<OpenDialogReturnValue> {
  return await ipcRenderer.invoke('electron:openFileDialog');
}

export default { rendererReady, storeGet, storeSet, addWatcherInstance, removeWatcherInstance, toggleWatcherInstance, getAllWatchers, getTransferList, onUpdateTransferList, openFileDialog };
