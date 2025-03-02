import Store from 'electron-store';
import Watcher from './watcher'
import Transfer from './transfers';

// Type definitions for the schema.
export type StoreSchema = {
    awsCredentials: {
        s3_BucketName: string;
        iam_accessKeyId: string;
        iam_secretAccessKey: string;
        awsRegion: string;
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
                default: 'S3 Bucket Name'
            },
            iam_accessKeyId: {
                type: 'string',
                default: 'IAM Access Key ID'
            },
            iam_secretAccessKey: {
                type: 'string',
                default: 'IAM Secret Access Key'
            },
            awsRegion: {
                type: 'string',
                default: 'AWS Region'
            },
        },
        default: {}
    },
    preferences: {
        type: 'object',
        properties: {
            openOnStartup: {
                type: 'boolean',
                default: true
            },
            transferDelay: {
                type: 'integer',
                default: 0
            }
        },
        default: {}
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
                dirpath: {
                    type: 'string',
                    default: ''
                },
                enabled: {
                    type: 'boolean',
                    default: true
                }
            }
        },
        default: []
    }
} as const;

// Store instance which allows us to inerface with the file system.
const store = new Store<StoreSchema>({ schema });

// Set the aws credentials and initial transfer delay from the store.
Transfer.setAWSCredentials(store.get('awsCredentials') as StoreSchema['awsCredentials']);
Transfer.updateTransferDelay(store.get('preferences').transferDelay);


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
        Transfer.updateTransferDelay(value.transferDelay as number);
}

/**
 * Stores a given watcher instance into storage.
 * @param watcher the watcher instance to store
 */
export function addWatcherToStore(watcher: Watcher) {
    const watchersList = store.get('watchers') as Watcher[];
    watchersList.push(watcher);
    store.set('watchers', watchersList);
}

/**
 * Removes a given watcher instance from storage.
 * @param watcher the watcher instance to remove
 */
export function removeWatcherFromStore(watcher: Watcher) {
    const watchersList = store.get('watchers') as Watcher[];
    const index = watchersList.findIndex((element) => element.dirpath === watcher.dirpath);
    if (index > -1) {
        watchersList.splice(index, 1);
    }
    store.set('watchers', watchersList);
}

/**
 * Updates a given watcher instance in storage.
 * @param watcher the watcher instance to update
 */
export function updateWatcherInStore(watcher: Watcher) {
    const watchersList = store.get('watchers') as Watcher[];
    watchersList.map((element) => {
        if (element.dirpath === watcher.dirpath) {
            element.name = watcher.name;
            element.enabled = watcher.enabled;
        }
    })
    store.set('watchers', watchersList);
}

/**
 * Returns a list of all the watchers that are stored.
 * @returns the list of all stored watcher instances
 */
export function getAllWatchersFromStore(): Watcher[] {
    return store.get('watchers') as Watcher[];
}

export default { getStore, setStore, addWatcherToStore, removeWatcherFromStore, updateWatcherInStore, getAllWatchersFromStore };