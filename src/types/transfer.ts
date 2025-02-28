/**
 * A Enum representing the status of a Transfer.
 * A transfer can be InQueue, Uploading, or Complete.
 */
export enum TransferStatus {
    InQueue,
    Uploading,
    Complete
}

/**
 * An interface representing a basic file Transfer. This template is primarily used by the renderer process.
 */
export interface TransferTemplate {
    filepath: string;
    status: TransferStatus;
    dateCompleted: Date | undefined;
}