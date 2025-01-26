import React from 'react';
import ReactDOM from 'react-dom/client';
import { useState } from 'react';

console.log('Is ipcRenderer available?', window.ipcRenderer);
const App = () => {
    console.log('Is global defined?', typeof global);
    const [status, setStatus] = useState('Drag a PNG file here!');

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
    
        // Attempt to get the full file path
        const filePath = file?.path || event.dataTransfer.items[0].getAsFile()?.path;
    
        if (file && file.type === 'image/png' && filePath) {
            setStatus('Converting...');
            console.log('Dropped file path:', filePath); // Debug log
    
            if (window.ipcRenderer) {
                window.ipcRenderer.send('convert-png', filePath);
    
                window.ipcRenderer.on('conversion-complete', (message) => {
                    setStatus(message);
                });
            } else {
                console.error('ipcRenderer is not available');
                setStatus('Error: Unable to process file.');
            }
        } else {
            setStatus('Please drop a valid PNG file.');
        }
    };
    
    
    
    
    

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #aaa',
            }}
        >
            <p>{status}</p>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

console.log('React app successfully loaded.');
