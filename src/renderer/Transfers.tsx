import React, { useState, useEffect, useCallback } from 'react';
import { TransferTemplate, TransferStatus } from '_/types/transfer';

function Transfers(): JSX.Element {
    const [transferList, setTransferList] = useState<TransferTemplate[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<TransferStatus | undefined>(undefined);
    const [errorEncountered, setErrorEncountered] = useState<boolean>(false);
    const [errorLogLocation, setErrorLogLocation] = useState<string>('');

    /**
     * Callback function that is invoked whenever a Transfer has been updated.
     * @param transfer the updated transfer
     */
    const handleTransferUpdate = useCallback(async (transfer: TransferTemplate) => {
        // Check if this transfer has encountered an error.
        if (!errorEncountered && transfer.status === TransferStatus.Error) {
            setErrorEncountered(true);
            setErrorLogLocation(await window.ipcAPI?.getErrorLogLocation() || '');
        }
        
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
            if (transfers !== undefined) {
                setTransferList(transfers);

                // Check if any of the transfers have encountered an error.
                if (!errorEncountered && transferList.some((transfer) => { return (transfer.status === TransferStatus.Error) })) {
                    setErrorEncountered(true);
                    setErrorLogLocation(await window.ipcAPI?.getErrorLogLocation() || '');
                }
            }
        }

        setUpdateCallback();
        fetchTransferList();
    }, [transferList, selectedFilter, handleTransferUpdate]);
    
    return (
        <div className="transfers-container">
            <div className="transfers-filter-container">
                <form>
                    <h3>Filter:</h3>
                    <div>
                        <label>
                            <input type="radio" checked={selectedFilter === undefined} onChange={() => setSelectedFilter(undefined)} />
                            All
                        </label>
                        <label>
                            <input type="radio" checked={selectedFilter === TransferStatus.InQueue} onChange={() => setSelectedFilter(TransferStatus.InQueue)} />
                            In Queue
                        </label>
                        <label>
                            <input type="radio" checked={selectedFilter === TransferStatus.Uploading} onChange={() => setSelectedFilter(TransferStatus.Uploading)} />
                            Uploading
                        </label>
                        <label>
                            <input type="radio" checked={selectedFilter === TransferStatus.Complete} onChange={() => setSelectedFilter(TransferStatus.Complete)} />
                            Completed
                        </label>
                        <label>
                            <input type="radio" checked={selectedFilter === TransferStatus.Error} onChange={() => setSelectedFilter(TransferStatus.Error)} />
                            Error
                        </label>
                    </div>
                    <hr />
                </form>
            </div>
            <div className="transfers-list">
                <table className="transfers-table">
                    <tr>
                        <th>File</th>
                        <th>Status</th>
                        <th>Time Completed</th>
                    </tr>
                    {transferList.length > 0 && transferList.map(transferInstance => (
                        <TransferInstance transfer={transferInstance}/>
                    ))}
                </table>
                {transferList.length === 0 && (
                    <div className="transfers-empty">
                        <p>There are no transfers to display.</p>
                    </div>
                )}
                {errorEncountered && (
                    <div className="transfers-error">
                        <p>An error was encountered when uploading a file to AWS.</p>
                        <p>Check "{errorLogLocation}" for see error logs.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface TransferInstanceProps {
    transfer: TransferTemplate
}

function TransferInstance(props: TransferInstanceProps): JSX.Element {
    return (
        <tr>
            <td>{props.transfer.filepath}</td>
            <td>{TransferStatus[props.transfer.status]}</td>
            <td>{props.transfer.dateCompleted !== undefined ? props.transfer.dateCompleted.toLocaleString() : 'N/A'}</td>
        </tr>
    )
}

export default Transfers;
