import chokidar from 'chokidar';
import * as store from "./store";
import Transfer from './transfers';

/**
 * A class representing a directory watcher with a name, directory path, and a flag determining if the watcher is enabled or not.
 * This class also contains static methods for managing a list of watchers.
 */
export default class Watcher {
    // Static fields.
    private static watcherList: chokidar.FSWatcher;
    private static watcherOptions = {
        persistent: true,
        ignoreInitial: true,
        followSymLinks: true,
        usePolling: false,
        awaitWriteFinish: true,
        ignorePermissionErrors: true,
        atomic: true,
    };

    // Instance fields.
    name: string;
    dirpath: string;
    enabled: boolean;

    /**
     * Constructs a new Watcher object with a given name, directory path, and a flag which determines if this watcher is enabled.
     * @param name the name of the watcher
     * @param filepath the directory path of the watcher
     * @param enabled a flag determing if the watcher is enabled
     */
    constructor(name: string, dirpath: string, enabled: boolean) {
        this.name = name;
        this.dirpath = dirpath;
        this.enabled = enabled;
    }

    /**
     * Initializes the watcher from storage and registers the required event listeners.
     */
    static initializeWatchers() {
        Watcher.watcherList = chokidar.watch(store.getAllWatchersFromStore().map((watcher: Watcher) => watcher.dirpath), Watcher.watcherOptions);
        Watcher.watcherList.on('all', Watcher.onAll);
    }
    
    /**
     * Event listener for all events invoked by the watcher (This is probably gonna change so I'm not gonna put that much effort into this comment).
     * @param _event 
     * @param path 
     */
    private static onAll(_event: string, path: string) {
        Transfer.queueFileForUpload(path);
    }

    /**
     * Adds a given watcher instance to the watcher list and saved it to the store.
     * @param instance the watcher instance to add
     */
    static addWatcherInstance(instance: Watcher): void {
        store.addWatcherToStore(instance);
        if (instance.enabled)
            Watcher.watcherList.add(instance.dirpath);
    }
    
    /**
     * Removes a given watcher instance from the watcher list and the store.
     * @param instance the watcher instance to remove
     */
    static removeWatcherInstance(instance: Watcher): void {
        store.removeWatcherFromStore(instance);
        Watcher.watcherList.unwatch(instance.dirpath);
    }
    
    /**
     * Toggles a given watcher instanceand updates the flag in the store.
     * @param instance the watcher instance to toggle
     */
    static toggleWatcherInstance(instance: Watcher): void {
        instance.enabled = !instance.enabled;
        store.updateWatcherInStore(instance)
    
        if (instance.enabled)
            Watcher.watcherList.add(instance.dirpath);
        else
            Watcher.watcherList.unwatch(instance.dirpath);
    }
}

