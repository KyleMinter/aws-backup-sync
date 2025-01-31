import React, { useState, useEffect } from 'react';
import Transfer, { TransferStatus } from '_/main/transfers';
//import ipcApi from '_/preload/ipc-api';

function Transfers(): JSX.Element {
    const [transferList, setTransferList] = useState<Transfer[]>([]);
    const [selectedFilter, setSelectedFilter] = useState('All');

    // Fetches the list of transfers.
    async function fetchTransferList() {
        const transfers = await window.ipcAPI?.getTransferList(selectedFilter);
        if (transfers !== undefined)
        {
            setTransferList(transfers);
        }
    }

    const handleReply = (list: Transfer[]) => {
        setTransferList(list);
    }

    window.ipcAPI?.onUpdateTransferList(handleReply);

    fetchTransferList();

    return (
        <div className="app">
            <h4>Transfers</h4>
            <div className="folder-list">
                {transferList.map(transferInstance => (
                    <TransferInstance transfer={transferInstance}/>
                ))}
            </div>
            <form>
                <h4>Filter:</h4>
                <label>
                    All
                    <input type="radio" checked={selectedFilter === "All"} onChange={() => {setSelectedFilter("All"); fetchTransferList()}} />
                </label>
                <label>
                    In Queue
                    <input type="radio" checked={selectedFilter === "InQueue"} onChange={() => {setSelectedFilter("InQueue"); fetchTransferList()}} />
                </label>
                <label>
                    Uploading
                    <input type="radio" checked={selectedFilter === "Uploading"} onChange={() => {setSelectedFilter("Uploading"); fetchTransferList()}} />
                </label>
                <label>
                    Completed
                    <input type="radio" checked={selectedFilter === "Completed"} onChange={() => {setSelectedFilter("Completed"); fetchTransferList()}} />
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
