import React, { useState, useEffect } from 'react';
import Watcher from '_main/watcher';

function Folders(): JSX.Element {
    const [watcherList, setWatcherList] = useState<Watcher[]>([]);
    const [selectedWatchers, setSelectedWatchers] = useState<Watcher[]>([]);

    async function fetchWatcherList() {
        const watchers = await window.ipcAPI?.getAllWatchers();
        if (watchers !== undefined)
        {
            setWatcherList(watchers);
        }
    }

    // Handle toggling of a watcher instance.
    function handleWatcherToggle(watcher: Watcher) {
        window.ipcAPI?.toggleWatcherInstance(watcher);
        fetchWatcherList();
    }

    // Handle selection of a watcher instance.
    function handleWatcherSelect(watcher: Watcher) {
        // Check if the specified watcher instance is already selected. If it is, it will be removed from the list. Otherwise it will be added to the list.
        if (selectedWatchers.some(selectedWatcher => selectedWatcher.filepath === watcher.filepath)) {
            setSelectedWatchers(selectedWatchers.filter((selectedWatcher) => selectedWatcher.filepath !== watcher.filepath))
        }
        else {
            setSelectedWatchers([...selectedWatchers, watcher]);
        }
    }

    // Handle the deletion of watcher instance(s).
    function onWatcherDelete() {
        if (selectedWatchers !== undefined)
        {
            // Remove each watcher instance in the selected watchers list.
            selectedWatchers.forEach(selectedWatcher => {
                window.ipcAPI?.removeWatcherInstance(selectedWatcher);
            });

            // Empty the selected watchers list and refetch the new watcher list from storage.
            setSelectedWatchers([]);
            fetchWatcherList();
        }
    }

    function onWatcherAdd() {
        
    }

    fetchWatcherList();

    return (
        <div className="app">
            <h4>Synced Folders</h4>
            <div className="folder-list">
                {watcherList.map(watcherInstance => (
                    <FolderWatcher watcher={watcherInstance} toggleHandler={handleWatcherToggle} selectionHandler={handleWatcherSelect} />
                ))}
            </div>
            <button type="button" onClick={onWatcherAdd}>Add</button>
            <button type="button" onClick={onWatcherDelete}>Delete</button>
        </div>
    );
}

interface FolderWatcherProps {
    watcher: Watcher;
    toggleHandler: any;
    selectionHandler: any;
}

function FolderWatcher(props: FolderWatcherProps): JSX.Element {
    const [selected, setSelected] = useState(false);
    
    // Handle clicking of UI component.
    function handleClick () {
        setSelected(!selected);
        props.selectionHandler(props.watcher);
    }

    return (
        <div className={"folder-watcher" + (selected ? "active" : "")} onClick={handleClick} style={{backgroundColor: selected ? 'lightblue' : 'white'}}>
            <input type="checkbox" checked={props.watcher.enabled} onChange={() => props.toggleHandler(props.watcher)} />
            <p>{props.watcher.name}</p>
            <p>{props.watcher.filepath}</p>
        </div>
    )
}

export default Folders;
