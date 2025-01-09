import React, { useEffect, useState } from 'react';

function App(): JSX.Element {
  const [storeValue, setStoreValue] = useState('');
  const [inputValue, setInputValue] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    window.ipcAPI?.storeSet('watch_path', event.target.value);
    window.ipcAPI!.storeGet('watch_path').then(res => {
      setStoreValue(res);
    })
  }
  
  useEffect(() => {
    window.ipcAPI?.rendererReady();
  }, []);

  return (
    <div className="app">
      <h4>Welcome to React, Electron and TypeScript</h4>
      <p>Hello</p>
      <input type='text' value={inputValue} onChange={handleChange} />
      <p>Saved value: {storeValue}</p>
    </div>
  );
}

export default App;
