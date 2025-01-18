import chokidar from 'chokidar';
import { addWatcherToStore, removeWatcherFromStore, updateWatcherInStore, getAllWatchersFromStore } from "./store";

export default class Watcher {
    name: string;
    filepath: string;
    enabled: boolean;

    constructor(name: string, filepath: string, enabled: boolean) {
        this.name = name;
        this.filepath = filepath;
        this.enabled = enabled;
    }
}

const watcherOptions = {
    persistent: true,
    ignoreInitial: true,
    followSymLinks: true,
    usePolling: false,
    awaitWriteFinish: true,
    ignorePermissionErrors: true,
    atomic: true,
}


const watcher = chokidar.watch(getAllWatchersFromStore().map((watcher: Watcher) => watcher.filepath), watcherOptions);
watcher.on('all', (path) => {
    console.log(path);
});

export function addWatcherInstance(instance: Watcher): void {
    addWatcherToStore(instance);
    watcher.add(instance.filepath);
}

export function removeWatcherInstance(instance: Watcher): void {
    removeWatcherFromStore(instance);
    watcher.unwatch(instance.filepath);
}

export function toggleWatcherInstance(instance: Watcher): void {
    instance.enabled = !instance.enabled;
    updateWatcherInStore(instance)

    if (instance.enabled)
        watcher.add(instance.filepath);
    else
        watcher.unwatch(instance.filepath);
}

