import React, { useState, useEffect, useCallback } from 'react';
import Transfer, { TransferStatus } from '_/main/transfers';

function Transfers(): JSX.Element {
    const [transferList, setTransferList] = useState<Transfer[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<TransferStatus | undefined>(undefined);

    /**
     * Callback function that is invoked whenever a Transfer has been updated.
     * @param transfer the updated transfer
     */
    const handleTransferUpdate = useCallback((transfer: Transfer) => {
        if (selectedFilter === undefined) {
            // If a there is no filter applied and the transfer is already in the list, we will update the Transfer element.
            if (transferList.some((e) => e.filepath === transfer.filepath))
                setTransferList(transferList.map((element) => element.filepath === transfer.filepath ? transfer : element));
            // If a there is no filter applied and the transfer is already in the list, we will add the Transfer to the list.
            else
                setTransferList([...transferList, transfer]);
        }
        else {
            // If the updated transfer does match the current filter, we will remove it from the list.
            if (selectedFilter as TransferStatus !== transfer.status)
                setTransferList(transferList.filter((element) => element.filepath === transfer.filepath));
            // If the update transfer does match the current filter, we will add it to the list.
            else if (selectedFilter as TransferStatus === transfer.status)
                setTransferList([...transferList, transfer]);
        }
    }, [selectedFilter, transferList]);

    useEffect(() => {
        // Async functions for setting the update callback & fetching the transfer list.
        async function setUpdateCallback() {
            await window.ipcAPI?.onUpdateTransfer(handleTransferUpdate);
        }
        
        async function fetchTransferList() {
            const transfers = await window.ipcAPI?.getTransferList(selectedFilter);
            if (transfers !== undefined)
                setTransferList(transfers);
        }

        setUpdateCallback();
        fetchTransferList();
    }, [transferList, selectedFilter, handleTransferUpdate]);

    return (
        <div className="transfers-container">
            <div className="transfer-list">
                {transferList.map(transferInstance => (
                    <TransferInstance transfer={transferInstance}/>
                ))}
            </div>
            <form>
                <h4>Filter:</h4>
                <label>
                    All
                    <input type="radio" checked={selectedFilter === undefined} onChange={() => setSelectedFilter(undefined)} />
                </label>
                <label>
                    In Queue
                    <input type="radio" checked={selectedFilter === TransferStatus.InQueue} onChange={() => setSelectedFilter(TransferStatus.InQueue)} />
                </label>
                <label>
                    Uploading
                    <input type="radio" checked={selectedFilter === TransferStatus.Uploading} onChange={() => setSelectedFilter(TransferStatus.Uploading)} />
                </label>
                <label>
                    Completed
                    <input type="radio" checked={selectedFilter === TransferStatus.Complete} onChange={() => setSelectedFilter(TransferStatus.Complete)} />
                </label>
            </form>
        </div>
    );
}

interface TransferInstanceProps {
    transfer: Transfer
}

function TransferInstance(props: TransferInstanceProps): JSX.Element {
    return (
        <div>
            <p>{props.transfer.filepath}</p>
            <p>{TransferStatus[props.transfer.status]}</p>
            <p>{props.transfer.dateCompleted !== undefined ? props.transfer.dateCompleted.toLocaleString() : 'N/A'}</p>
        </div>
    )
}

export default Transfers;
