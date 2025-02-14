import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './Navbar';
import About from './About';
import Preferences from './Preferences';
import Folders from './Folders';
import Transfers from './Transfers';

function Window(): JSX.Element {
    const [activePage, setActive] = useState('About');
    
    const handleNavbarUpdate = useCallback((active: string) => {
        setActive(active);
    }, [activePage]);
    
    useEffect(() => {
        async function setUpdateCallback() {
            await window.ipcAPI?.onUpdateNavbar(handleNavbarUpdate);
        }

        setUpdateCallback();
        window.ipcAPI?.rendererReady();
    }, []);

    let pageContent;
    switch (activePage) {
        case 'About':
            pageContent = <About />;
            break;
        case 'Preferences':
            pageContent = <Preferences />;
            break;
        case 'Folders':
            pageContent = <Folders />;
            break;
        case 'Transfers':
            pageContent = <Transfers />;
            break;
        default:
            pageContent = <About />;
    }

    return (
        <div className="window-container lato-regular">
            <div className="window-header">
                <Navbar active={activePage} handler={setActive} />
                <h1>{activePage}</h1>
                <hr />
            </div>
            <div className="window-body">
                {pageContent}
            </div>
        </div>
    );
}

export default Window;
