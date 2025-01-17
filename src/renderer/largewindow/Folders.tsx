import React, { useState, useEffect } from 'react';
import Watcher from '_main/watcher';

function Folders(): JSX.Element {
    const [list, setList] = useState<Watcher[]>([]);

    useEffect(() => {
        async function fetchWatcherList() {
            const watchers = await window.ipcAPI?.getAllWatchers();
            if (watchers !== undefined)
            {
                setList(watchers);
            }
        }

        fetchWatcherList();
    }, []);


    return (
        <div className="app">
            <h4>Synced Folders</h4>
            <ul>
                {list.map((key) => (
                    <li><FolderWatcher watcher={key} /></li>
                ))}
            </ul>
        </div>
    );
}

interface FolderWatcherProps {
    watcher: Watcher
}

function FolderWatcher(props: FolderWatcherProps): JSX.Element {
    return (
        <div className="">
            <input type="checkbox" checked={props.watcher.enabled} onChange={() => window.ipcAPI?.toggleWatcherInstance(props.watcher)} />
            <p>{props.watcher.name}</p>
            <p>{props.watcher.filepath}</p>
        </div>
    )
}

export default Folders;
