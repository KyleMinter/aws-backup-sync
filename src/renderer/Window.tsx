import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import About from './About';
import Preferences from './Preferences';
import Folders from './Folders';
import Transfers from './Transfers';

function Window(): JSX.Element {
  useEffect(() => {
    window.ipcAPI?.rendererReady();
  }, []);

  const [activePage, setActive] = useState('About');

  let pageContent;
  switch (activePage) {
    case 'About':
      pageContent = <About />
      break;
    case 'Preferences':
      pageContent = <Preferences />
      break;
    case 'Folders':
      pageContent = <Folders />
      break;
    case 'Transfers':
      pageContent = <Transfers />
      break;
    default:
      pageContent = <About />
  }

  return (
    <div className="app">
      <Navbar active={activePage} handler={setActive} />
      {pageContent}
    </div>
  );
}

export default Window;
