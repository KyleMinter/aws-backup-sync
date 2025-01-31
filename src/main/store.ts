import { IpcMainInvokeEvent } from 'electron';
import Store from 'electron-store';
import Watcher from './watcher'
import { updateTransferDelay } from './transfers';

// Type definitions for the schema.
type StoreSchema = {
    awsCredentials: {
        s3_BucketName: string;
        s3_ObjectKey: string;
        s3_awsRegion: string;
    },
    preferences: {
        openOnStartup: boolean;
        transferDelay: number;
    }
    watchers: Watcher[];
}

// JSON schema used by the store object.
const schema = {
    awsCredentials: {
        type: 'object',
        properties: {
            s3_BucketName: {
                type: 'string',
                default: ''
            },
            s3_ObjectKey: {
                type: 'string',
                default: ''
            },
            s3_awsRegion: {
                type: 'string',
                default: ''
            },
        },
        default: {}
    },
    preferences: {
        type: 'object',
        properties: {
            openOnStartup: {
                type: 'boolean',
                default: 'true'
            },
            transferDelay: {
                type: 'integer',
                default: 0
            }
        }
    },
    watchers: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    default: ''
                },
                filepath: {
                    type: 'string',
                    default: ''
                },
                enabled: {
                    type: 'boolean',
                    default: true
                }
            }
        },
        default: [{name: '', filepath: ''}]
    }
} as const;

// Store instance which allows us to inerface with the file system.
const store = new Store<StoreSchema>({ schema });
updateTransferDelay(store.get('preferences').transferDelay);


/**
 * Gets the value of a stored key in storage.
 * @param key the key to get the value of
 * @returns the value of the key
 */
export function getStore(key: string): any {
    return store.get(key);
}

/**
 * Stores a provided key value pair into storage.
 * @param key the key associated with the stored value
 * @param value the value to store
 */
export function setStore(key: string, value: any): void {
    store.set(key, value);

    if (key === 'preferences')
        updateTransferDelay(value.transferDelay as number);
}

export function addWatcherToStore(watcher: Watcher) {
    const watchersList = store.get('watchers') as Watcher[];
    watchersList.push(watcher);
    store.set('watchers', watchersList);
}

export function removeWatcherFromStore(watcher: Watcher) {
    const watchersList = store.get('watchers') as Watcher[];
    const index = watchersList.findIndex((element) => element.filepath === watcher.filepath);
    if (index > -1) {
        watchersList.splice(index, 1);
    }
    store.set('watchers', watchersList);
}

export function updateWatcherInStore(watcher: Watcher) {
    const watchersList = store.get('watchers') as Watcher[];
    watchersList.map((element) => {
        if (element.filepath === watcher.filepath) {
            element.name = watcher.name;
            element.enabled = watcher.enabled;
        }
    })
    store.set('watchers', watchersList);
}

export function getAllWatchersFromStore(): Watcher[] {
    return store.get('watchers') as Watcher[];
}