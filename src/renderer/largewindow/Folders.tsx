import React, { useState, useEffect } from 'react';
import Watcher from '_main/watcher';

function Folders(): JSX.Element {
    const [list, setList] = useState<Watcher[]>([]);

    async function fetchWatcherList() {
        const watchers = await window.ipcAPI?.getAllWatchers();
        if (watchers !== undefined)
        {
            setList(watchers);
        }
    }

    function handleChange(watcher: Watcher) {
        window.ipcAPI?.toggleWatcherInstance(watcher);
        fetchWatcherList();
    }

    fetchWatcherList();


    return (
        <div className="app">
            <h4>Synced Folders</h4>
            <ul>
                {list.map((key) => (
                    <li><FolderWatcher watcher={key} handler={handleChange} /></li>
                ))}
            </ul>
        </div>
    );
}

interface FolderWatcherProps {
    watcher: Watcher;
    handler: any;
}

function FolderWatcher(props: FolderWatcherProps): JSX.Element {
    return (
        <div className="folder-watcher">
            <input type="checkbox" checked={props.watcher.enabled} onChange={() => props.handler(props.watcher)} />
            <p>{props.watcher.name}</p>
            <p>{props.watcher.filepath}</p>
        </div>
    )
}

export default Folders;
