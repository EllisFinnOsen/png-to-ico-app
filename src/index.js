import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
    const [status, setStatus] = useState('Drag a PNG file here!');
    const [convertedFile, setConvertedFile] = useState(null); // Store the converted file path

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];

        if (file && file.type === 'image/png') {
            setStatus('Converting...');
            setConvertedFile(null); // Clear previous conversion

            const reader = new FileReader();
            reader.onload = () => {
                const fileData = reader.result;

                if (window.ipcRenderer) {
                    // Send file data to the main process
                    window.ipcRenderer.send('convert-png', { name: file.name, data: fileData });

                    // Listen for completion
                    window.ipcRenderer.on('conversion-complete', (message) => {
                        if (message.startsWith('File converted:')) {
                            const filePath = message.split(': ')[1];
                            setConvertedFile(filePath); // Store the converted file path
                            setStatus('Conversion complete!');
                        } else {
                            setStatus(message); // Display error
                        }
                    });
                } else {
                    console.error('ipcRenderer is not available');
                    setStatus('Error: Unable to process file.');
                }
            };
            reader.readAsDataURL(file);
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
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #aaa',
                backgroundColor: status === 'Converting...' ? '#f0f0f0' : 'white',
                transition: 'background-color 0.3s ease',
            }}
        >
            {/* Status or Spinner */}
            {status === 'Converting...' ? (
                <div className="spinner" style={{ marginBottom: '20px' }}></div>
            ) : (
                <p>{status}</p>
            )}

            {/* Converted File Link */}
            {convertedFile && (
                <a
                    href={`file://${convertedFile}`}
                    download
                    style={{ marginTop: '20px', textDecoration: 'none', color: '#007BFF' }}
                >
                    Download Converted Icon
                </a>
            )}
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
