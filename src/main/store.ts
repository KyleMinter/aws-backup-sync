import { IpcMainInvokeEvent } from 'electron';
import Store from 'electron-store';

// Type definitions for the schema.
type StoreSchema = {
    aws: {
        s3_BucketName: string;
        s3_ObjectKey: string;
        s3_AWSRegion: string;
    },
    watch_path: string;
}

// JSON schema used by the store object.
const schema = {
    aws: {
        type: 'object',
        properties: {
            s3_BucketName: {
                type: 'string',
                default: ""
            },
            s3_ObjectKey: {
                type: 'string',
                default: ""
            },
            s3_AWSRegion: {
                type: 'string',
                default: ""
            },
        },
        default: {}
    },
    watch_path: {
        type: 'string',
        default: ""
    }
} as const;

// Store instance which allows us to inerface with the file system.
const store = new Store<StoreSchema>({ schema });


// Callback functions used by electron to interface with the store object.
export function getStore(event: IpcMainInvokeEvent, key: string): any {
    return store.get(key);
}

export function setStore(event: IpcMainInvokeEvent, key: string, value: any): void {
    store.set(key, value);
}