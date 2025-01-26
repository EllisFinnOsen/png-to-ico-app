import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
    const [status, setStatus] = useState('Drag a PNG file here!');
    const [isDragging, setIsDragging] = useState(false); // Track drag state
    const [convertedFile, setConvertedFile] = useState(null);

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false); // Reset drag state
        const file = event.dataTransfer.files[0];

        if (file && file.type === 'image/png') {
            setStatus('Converting...');
            setConvertedFile(null); // Clear previous conversion

            const reader = new FileReader();
            reader.onload = () => {
                const fileData = reader.result;

                if (window.ipcRenderer) {
                    window.ipcRenderer.send('convert-png', { name: file.name, data: fileData });

                    window.ipcRenderer.on('conversion-complete', (message) => {
                        if (message.startsWith('File converted:')) {
                            const filePath = message.split(': ')[1];
                            setConvertedFile(filePath);
                            setStatus('Conversion complete!');
                        } else {
                            setStatus(message);
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #aaa',
                backgroundColor: isDragging
                    ? '#e0f7fa' // Highlighted color when dragging
                    : status === 'Converting...'
                    ? '#f0f0f0'
                    : 'white',
                transition: 'background-color 0.3s ease',
            }}
        >
            {status === 'Converting...' ? (
                <div className="spinner" style={{ marginBottom: '20px' }}></div>
            ) : (
                <p>{status}</p>
            )}
            {convertedFile && (
                <a
                href={`file://${convertedFile}`}
                download
                className="download-link"
                style={{ marginTop: '20px' }}
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
