import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import About from './About';
import Preferences from './Preferences';
import Folders from './Folders';

function LargeWindow(): JSX.Element {
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
      pageContent = <h2>Transfers</h2>
      break;
    default:
      pageContent = <About />
  }

  return (
    <div className="app">
      <h2>large window</h2>
      <Navbar active={activePage} handler={setActive} />
      {pageContent}
    </div>
  );
}

export default LargeWindow;
