// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';

/** Notify main the renderer is ready. */
function rendererReady() {
  ipcRenderer.send('renderer-ready');
}

async function storeGet(key: string): Promise<any> {
  return await ipcRenderer.invoke('store:get', key);
}

async function storeSet(key: string, value: any) {
  ipcRenderer.send('store:set', key, value);
}

export default { rendererReady, storeGet, storeSet };
