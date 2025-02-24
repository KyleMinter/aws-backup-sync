import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Watcher from '_main/watcher';
import ipcApi from '_/preload/ipc-api';

function Folders(): JSX.Element {
    const [didFetch, setDidFetch] = useState(false);

    const [watcherList, setWatcherList] = useState<Watcher[]>([]);
    const [selectedWatchers, setSelectedWatchers] = useState<Watcher[]>([]);
    const [isPopupOpen, setPopupOpen] = useState(false);

    const [newWatcherInstanceName, setWatcherInstanceName] = useState('');
    const [newWatcherInstancePath, setWatcherInstancePath] = useState('');
    const [newWatcherInstanceEnabled, setWatcherInstanceEnabled] = useState(true);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        if (!didFetch) {
            setDidFetch(true);
            fetchWatcherList();
        }
    }, [didFetch]);

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
        //fetchWatcherList();
        setDidFetch(false);
    }

    // Handle selection of a watcher instance.
    function handleWatcherSelect(watcher: Watcher) {
        // Check if the specified watcher instance is already selected. If it is, it will be removed from the list. Otherwise it will be added to the list.
        if (selectedWatchers.some(selectedWatcher => selectedWatcher.dirpath === watcher.dirpath)) {
            setSelectedWatchers(selectedWatchers.filter((selectedWatcher) => selectedWatcher.dirpath !== watcher.dirpath))
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
            //fetchWatcherList();
            setDidFetch(false);
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

        if (watcherList.some(e => e.dirpath === newWatcherInstancePath)) {
            error = true;
            messages.push('Folder path must not be the same as a prexisting watched folder.');
        }

        if (error) {
            setErrorMessages(messages);
        }
        else {
            const watcher: Watcher = {name: newWatcherInstanceName, dirpath: newWatcherInstancePath, enabled: newWatcherInstanceEnabled};
            window.ipcAPI?.addWatcherInstance(watcher);
            setWatcherInstanceName('');
            setWatcherInstancePath('');
            setWatcherInstanceEnabled(true);
            setErrorMessages([]);
            setPopupOpen(false);
            setDidFetch(false);
        }
    }

    return (
        <div className="folders-container">
            <div className="folders-body">
                <div className="folders-list">
                    <table className="folders-table">
                        <tr>
                            <th>Enabled</th>
                            <th>Name</th>
                            <th>Directory Path</th>
                        </tr>
                        {watcherList.length > 0 && watcherList.map(watcherInstance => (
                            <FolderWatcher watcher={watcherInstance} toggleHandler={handleWatcherToggle} selectionHandler={handleWatcherSelect} />
                        ))}
                    </table>
                    {watcherList.length === 0 && (
                        <div className="folders-empty">
                            <p>There are no watched folders.<br />Click the 'Add' button to add a folder.</p>
                        </div>
                    )}
                </div>
                <div className="folders-add-remove-container">
                    <hr />
                    <div>
                        <button type="button" onClick={() => setPopupOpen(true)}>Add</button>
                        <button type="button" onClick={onWatcherDelete}>Delete</button>
                    </div>
                </div>
            </div>
            <Modal
                className="modal-container"
                overlayClassName="modal-overlay"
                isOpen={isPopupOpen}
                onRequestClose={() => setPopupOpen(false)}
            >
                <h2>Add New Folder</h2>
                <hr />
                <form className="modal-form">
                    <label className="modal-label">
                        <div>Name:</div>
                        <input
                            type="text"
                            value={newWatcherInstanceName}
                            onChange={(e) => setWatcherInstanceName(e.target.value)}
                        />
                    </label>
                    <br />
                    <label className="modal-label">
                        <div>Folder Path:</div>
                        <input type="text" readOnly={true} value={newWatcherInstancePath} />
                        <button type="button" onClick={() => fetchWatcherInstancePath()}>Search</button>
                    </label>
                    <br />
                    <label className="modal-label">
                        <div>Enabled:</div>
                        <input type="checkbox" checked={newWatcherInstanceEnabled} onChange={(e) => setWatcherInstanceEnabled(e.target.checked)} />
                    </label>
                </form>
                <div className="modal-submit-container">
                    <hr />
                    <p>{errorMessages.length !== 0 && errorMessages.map(message => (
                        <span>{message + ' '}</span>
                    ))}</p>
                    <div>
                        <button type="button" onClick={onWatcherAdd}>Confirm</button>
                        <button type="button" onClick={() => {setErrorMessages([]); setPopupOpen(false);}}>Cancel</button>
                    </div>
                </div>
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

    const classes = '' + (selected ? 'selected ' : '') + (props.watcher.enabled ? '' : 'disabled');

    return (
        <tr className={classes} onClick={handleClick}>
            <td><input type="checkbox" checked={props.watcher.enabled} onChange={() => props.toggleHandler(props.watcher)} /></td>
            <td>{props.watcher.name}</td>
            <td>{props.watcher.dirpath}</td>
        </tr>
    )
}

export default Folders;
