import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Watcher from '_main/watcher';
import ipcApi from '_/preload/ipc-api';

function Folders(): JSX.Element {
    const [watcherList, setWatcherList] = useState<Watcher[]>([]);
    const [selectedWatchers, setSelectedWatchers] = useState<Watcher[]>([]);
    const [isPopupOpen, setPopupOpen] = useState(false);

    const [newWatcherInstanceName, setWatcherInstanceName] = useState('');
    const [newWatcherInstancePath, setWatcherInstancePath] = useState('');
    const [newWatcherInstanceEnabled, setWatcherInstanceEnabled] = useState(true);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    // Fetches the list of watchers.
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

    // Fetches the result of the watcher instance path via a open file dialog.
    async function fetchWatcherInstancePath() {
        const result = await window.ipcAPI?.openFileDialog();
        if (result !== undefined && !result.canceled)
        {
            setWatcherInstancePath(result.filePaths[0]);
        }
    }

    // Handles the adding of a watcher instance.
    function onWatcherAdd() {
        let error: boolean = false;
        const messages: string[] = [];
        
        if (newWatcherInstanceName === '') {
            error = true;
            messages.push('Name must not be empty.');
        }
        
        if (watcherList.some(e => e.name === newWatcherInstanceName)) {
            error = true;
            messages.push('Name must not be the same as a prexisting watched folder.');
        }

        if (newWatcherInstancePath === '') {
            error = true;
            messages.push('Folder path must not be empty.');
        }

        if (watcherList.some(e => e.filepath === newWatcherInstancePath)) {
            error = true;
            messages.push('Folder path must not be the same as a prexisting watched folder.');
        }

        if (error) {
            setErrorMessages(messages);
        }
        else {
            const watcher: Watcher = {name: newWatcherInstanceName, filepath: newWatcherInstancePath, enabled: newWatcherInstanceEnabled};
            window.ipcAPI?.addWatcherInstance(watcher);
            setWatcherInstanceName('');
            setWatcherInstancePath('');
            setWatcherInstanceEnabled(true);
            setErrorMessages([]);
            setPopupOpen(false);
        }
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
            <button type="button" onClick={() => setPopupOpen(true)}>Add</button>
            <button type="button" onClick={onWatcherDelete}>Delete</button>
            <Modal
                isOpen={isPopupOpen}
                onRequestClose={() => setPopupOpen(false)}
            >
                <h1>Add New Folder</h1>
                <p>wasd</p>
                <form>
                    <label>
                        Name:
                        <input type="text" value={newWatcherInstanceName} onChange={(e) => setWatcherInstanceName(e.target.value)} />
                    </label>
                    <br />
                    <label>
                        Folder Path:
                        <input type="text" readOnly={true} value={newWatcherInstancePath} />
                        <button type="button" onClick={() => fetchWatcherInstancePath()}>Search</button>
                    </label>
                    <br />
                    <label>
                        Enabled:
                        <input type="checkbox" checked={newWatcherInstanceEnabled} onChange={(e) => setWatcherInstanceEnabled(e.target.checked)} />
                    </label>
                    <br />

                    {errorMessages.length !== 0 && errorMessages.map(message => (
                        <p>{message}<br /></p>
                    ))}

                    <button type="button" onClick={onWatcherAdd}>Confirm</button>
                    <button type="button" onClick={() => {setErrorMessages([]); setPopupOpen(false);}}>Cancel</button>
                </form>
            </Modal>
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
