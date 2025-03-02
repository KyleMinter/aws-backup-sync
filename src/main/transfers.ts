import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { StoreSchema } from './store';
import { TransferTemplate, TransferStatus } from '_/types/transfer';
import fs from 'fs';
import path from 'path';

/**
 * A class representing a file transfer to AWS S3.
 * It contains the filepath of the file being uploaded, the transfer's status, when the transfer was complete (if applicable), and a timeout used for delaying the transfer.
 * This class also has a static member used as a callback listner for invoking UI updates of the transfer list whenever an individual transfer is completed/updated/changed.
 */
export default class Transfer implements TransferTemplate {
    // Static constants.
    private static readonly MILLISECONDS_PER_MINUTE = 60000;
    private static readonly MILLISECONDS_PER_SECOND = 1000;

    // Static class members.
    private static transferList: Transfer[] = [];
    private static transferDelay: number;
    private static s3_BucketName: string;
    private static client: S3Client;
    public static updateListener: ((transfer: TransferTemplate) => void) | undefined = undefined;
    public static logFilePath: string;
    
    // Class members.
    filepath: string;
    status: TransferStatus;
    dateCompleted: Date | undefined;
    timeout: NodeJS.Timeout | undefined;

    /**
     * Constructs a Transfer object with a given filepath. This new Transfer's status = InQueue, dateCompleted = undefined, and timeout = undefined.
     * @param filepath the filepath of the file to be uploaded to AWS S3.
     */
    constructor(filepath: string) {
        this.filepath = filepath;
        this.status = TransferStatus.InQueue;
        this.dateCompleted = undefined;
        this.timeout = undefined;
    }

    /**
     * Compeltes the transfer by uploading the file to AWS S3.
     * The status of the transfer is updated while completing the transfer process and the date/time it was completed is update upon it finishing.
     */
    public async completeTransfer() {
        // Set the status of the transfer to "Uploading" and invoke an UI update.
        this.status = TransferStatus.Uploading;
        Transfer.invokeTransferListUpdate(this);

        // Create a read stream and construct the params for the AWS client command.
        const readStream = fs.createReadStream(this.filepath);
        const params = {
            'Body': readStream,
            'Bucket': Transfer.s3_BucketName,
            'Key': this.filepath,
        };

        try {
            // Attempt to upload the file to S3.
            const command = new PutObjectCommand(params);
            await Transfer.client.send(command);

            // Set the status of the transfer to "Complete" and set the date completed of the transfer.
            this.status = TransferStatus.Complete;
            this.dateCompleted = new Date();
        }
        catch (error) {
            // In the event of something going wrong with the file being uploaded to S3, we will set the status of the transfer to "Error."
            this.status = TransferStatus.Error;

            // Append the error message to the log with a timestamp.
            const timestamp = new Date();
            const errorLog = `${this.filepath}\n${timestamp}\n${error}\n----------------------------------------------------------------------------------------\n`;
            fs.appendFile(Transfer.logFilePath, errorLog, (_err) => {});

        }
        finally {
            // Invoke an UI update since we've since changed the status of the transfer.
            Transfer.invokeTransferListUpdate(this);
        }
    }

    /**
     * Cancels the delay timer on the current Transfer. If this Transfer doesn't have a delay timer, this method will do nothing.
     * Once the delay timer is canceled, the Transfer will no longer automatically complete itself.
     */
    public cancelDelayTimer() {
        if (this.timeout)
            clearTimeout(this.timeout);
    }

    /**
     * Invokes a UI update of a given Transfer by calling Transfer.updateListner.
     */
    public static async invokeTransferListUpdate(transfer: Transfer) {
        if (Transfer.updateListener) {
            transfer.timeout = undefined;
            Transfer.updateListener(transfer);
        }
    }

    /**
     * Updates the transfer delay for all future transfers.
     * @param delay the new tranfer delay (mins)
     */
    static updateTransferDelay(delay: number) {
        Transfer.transferDelay = delay;
    }

    /**
     * Sets the credentials for the AWS client.
     * @param credentials an object containing all of the credentials
     */
    static setAWSCredentials(credentials: StoreSchema['awsCredentials']) {
        Transfer.s3_BucketName = credentials.s3_BucketName;
        Transfer.client = new S3Client({
            region: credentials.awsRegion,
            credentials: {
                accessKeyId: credentials.iam_accessKeyId,
                secretAccessKey: credentials.iam_secretAccessKey
            }
        });
    }

    /**
     * Queues a file for upload to AWS D3 and creates a new Transfer object for it.
     * @param filepath the filepath of the file to be uploaded to AWS S3.
     */
    static async queueFileForUpload(filepath: string) {
        // Check for an already existing transfer for this file.
        let fileTransfer = Transfer.findAndRemoveExistingTransfer(filepath);

        // If there wasn't an prexisting tranfers we will create a new one.
        if (!fileTransfer)
            fileTransfer = new Transfer(filepath);
        
        // Push this transfer onto the transfer list.
        Transfer.transferList.push(fileTransfer);

        // Clear the delay and date for this transfer.
        fileTransfer.cancelDelayTimer();
        fileTransfer.dateCompleted = undefined;

        // Set the transfer status to InQueue.
        fileTransfer.status = TransferStatus.InQueue;

        // If there is a transfer delay set we will complete the transfer once the delay has been executed. If not we will complete the transfer immediately.
        if (Transfer.transferDelay > 0) {
            Transfer.invokeTransferListUpdate(fileTransfer);
            fileTransfer.timeout = setTimeout(async () => {
                await fileTransfer!.completeTransfer();
            }, Transfer.transferDelay * Transfer.MILLISECONDS_PER_MINUTE);
        }
        else {
            await fileTransfer.completeTransfer();
        }
    }

    /**
     * Removes an existing transfer with a given filepath from the transfer list and returns it. If no transfer was found in the list, undefined is returned.
     * @param filepath the filepath of the transfer to be removed from the list
     * @returns the transfer that was removed from the list, undefined if no transfer with the given filepath was found
     */
    private static findAndRemoveExistingTransfer(filepath: string): Transfer | undefined {
        // Find the index of a transfer with the same file path.
        const index = Transfer.transferList.findIndex((element) => element.filepath === filepath);
    
        // If a transfer index was found we will remove that element from the transfer list and return it. If not we will return undefined.
        if (index !== -1) {
            const transfer = Transfer.transferList[index];
            Transfer.transferList.splice(index, 1);
            return transfer;
        }
        else {
            return undefined;
        }
    }

    /**
     * Returns the transfer list with a specified filter for the transfer status applied.
     * @param filter the filter to apply to the transfer list. Options include [All, InQueue, Uploading, Complete, Error]
     * @returns the transfer list with the filter applied
     */
    static getTransferList(filter: TransferStatus | undefined): TransferTemplate[] {
        let returnTransferList: TransferTemplate[] = Transfer.formatTransfers(Transfer.transferList);
        
        // Applies the given filter to the transfer list.
        if (filter === TransferStatus.InQueue)
            returnTransferList = returnTransferList.filter((transfer) => transfer.status === TransferStatus.InQueue);
        else if (filter === TransferStatus.Uploading)
            returnTransferList = returnTransferList.filter((transfer) => transfer.status === TransferStatus.Uploading);
        else if (filter === TransferStatus.Complete)
            returnTransferList = returnTransferList.filter((transfer) => transfer.status === TransferStatus.Complete);
        else if (filter === TransferStatus.Error)
            returnTransferList = returnTransferList.filter((transfer) => transfer.status === TransferStatus.Error);

        return returnTransferList;
    }

    /**
     * Strips the a given transfer list of any timer infromation as Electron will throw an exception if we try to send it over the IPC channels.
     * Also casts the given transfer list to the type of TransferTemplate[].
     * @param list the transfer list to strip timer delay from
     * @returns the given transfer list without delay timers
     */
    private static formatTransfers(list: Transfer[]): TransferTemplate[] {
        return list.map((transfer) => {
            transfer.timeout = undefined;
            return transfer as TransferTemplate;
        })
    }
}