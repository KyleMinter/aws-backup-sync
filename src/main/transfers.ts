const MILLISECONDS_PER_MINUTE = 60000;
const MILLISECONDS_PER_SECOND = 1000;

export default class Transfer {
    filepath: string;
    status: TransferStatus;
    dateCompleted: Date | undefined;
    timeout: NodeJS.Timeout | undefined;
    static updateListener: ((list: Transfer[]) => void) | undefined = undefined;

    constructor(filepath: string) {
        this.filepath = filepath;
        this.status = TransferStatus.InQueue;
        this.dateCompleted = undefined;
        this.timeout = undefined;
    }

    public async completeTransfer() {
        this.status = TransferStatus.Uploading;
        // do aws transfer stuff
        console.log(`uploading ${this.filepath} to AWS`);
        this.status = TransferStatus.Complete;
        this.dateCompleted = new Date();
    }

    public cancelDelayTimer() {
        if (this.timeout)
            clearTimeout(this.timeout);
    }

    public static registerUpdateListener(callback: (list: Transfer[]) => void) {
        Transfer.updateListener = callback;
    }

    public static invokeTransferListUpdate() {
        if (Transfer.updateListener) {
            Transfer.updateListener(
                transferList.map((transfer) => {
                    transfer.timeout = undefined;
                    return transfer;
                })
            );
        }
    }
}

export enum TransferStatus {
    InQueue,
    Uploading,
    Complete
}

const transferList: Transfer[] = [];
let transferDelay: number;

export function updateTransferDelay(delay: number) {
    transferDelay = delay;
}

export async function queueFileForUpload(filepath: string) {
    // Check for an already existing transfer for this file.
    let fileTranfer = findAndRemoveExistingTransfer(filepath);

    // If there wasn't an prexisting tranfers we will create a new one.
    if (!fileTranfer)
        fileTranfer = new Transfer(filepath);
    
    // Push this transfer onto the transfer list.
    transferList.push(fileTranfer);

    // Clear the delay for this transfer.
    fileTranfer.cancelDelayTimer();

    // If there is a transfer delay set we will complete the transfer once the delay has been executed. If not we will complete the transfer immediately.
    if (transferDelay > 0)
        fileTranfer.timeout = setTimeout(async () => {
            await fileTranfer!.completeTransfer();
            Transfer.invokeTransferListUpdate();
        }, transferDelay * MILLISECONDS_PER_SECOND);
    else {
        await fileTranfer.completeTransfer();
        Transfer.invokeTransferListUpdate();
    }

}

function findAndRemoveExistingTransfer(filepath: string): Transfer | undefined {
    // Find the index of a transfer with the same file path.
    const index = transferList.findIndex((element) => element.filepath === filepath);

    // If a transfer index was found we will remove that element from the transfer list and return it. If not we will return undefined.
    if (index !== -1) {
        const transfer = transferList[index];
        transferList.splice(index, 1);
        return transfer;
    }
    else {
        return undefined;
    }
}

export function getTransferList(filter: string): Transfer[] {
    let returnTransferList = transferList;
    switch (filter) {
        case 'All':
            break;
        case 'InQueue': {
            returnTransferList = transferList.filter((transfer) => transfer.status === TransferStatus.InQueue);
            break;
        }
        case 'Uploading': {
            returnTransferList = transferList.filter((transfer) => transfer.status === TransferStatus.Uploading);
            break;
        }
        case 'Completed': {
            returnTransferList = transferList.filter((transfer) => transfer.status === TransferStatus.Complete);
            break;
        }
        default:
            break;
    }

    return returnTransferList.map((transfer) => {
        transfer.timeout = undefined;
        return transfer;
    });
}