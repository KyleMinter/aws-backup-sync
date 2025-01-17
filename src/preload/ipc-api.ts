// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import Watcher from '_main/watcher';

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



export default { rendererReady, storeGet, storeSet, addWatcherInstance, removeWatcherInstance, toggleWatcherInstance, getAllWatchers };
