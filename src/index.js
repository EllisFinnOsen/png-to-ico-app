import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
    const [status, setStatus] = useState('Drag a PNG file here!');
    const [isDragging, setIsDragging] = useState(false);
    const [convertedFile, setConvertedFile] = useState([]);

    const handleConversionComplete = (message) => {
        console.log('Received conversion-complete message:', message); // Debug log
        if (message.startsWith('File converted:')) {
            const filePath = message.split(': ')[1];
            setConvertedFile((prev) => [...prev, filePath]);
            setStatus('Conversion complete!');
        } else {
            setStatus(message);
        }
    };
    

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const files = Array.from(event.dataTransfer.files);
        const pngFiles = files.filter((file) => file.type === 'image/png');

        if (pngFiles.length === 0) {
            setStatus('Please drop one or more valid PNG files.');
            return;
        }

        setStatus('Converting...');
        setTimeout(() => {
            if (status === 'Converting...') {
                setStatus('Conversion timed out. Please try again.');
            }
        }, 10000); // 10 seconds timeout
        
        setConvertedFile([]);

        window.ipcRenderer.removeListener('conversion-complete', handleConversionComplete);
        window.ipcRenderer.on('conversion-complete', handleConversionComplete);

        pngFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                const fileData = reader.result;

                if (window.ipcRenderer) {
                    window.ipcRenderer.send('convert-png', { name: file.name, data: fileData });
                } else {
                    console.error('ipcRenderer is not available');
                    setStatus('Error: Unable to process files.');
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleDownloadAll = () => {
        if (convertedFile.length === 0) {
            setStatus('No files to download.');
            return;
        }
    
        // Send request to select directory
        window.ipcRenderer.send('select-directory', convertedFile);
    
        // Clean up any previous listeners
        window.ipcRenderer.removeAllListeners('directory-selected');
    
        // Add a fresh listener for directory selection
        window.ipcRenderer.on('directory-selected', (message) => {
            setStatus(message); // Update status with the result
        });
    };
    
    

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${status === 'Converting...' ? 'converting' : ''}`}
        >
            <p className={isDragging ? 'dragging-text' : ''}>{status}</p>
            {convertedFile.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    {convertedFile.map((filePath, index) => (
                        <a
                            key={index}
                            href={`file://${filePath}`}
                            download
                            className="download-link"
                            style={{ display: 'block', marginBottom: '10px' }}
                        >
                            Download {filePath.split('\\').pop()}
                        </a>
                    ))}
                    <button
                        onClick={handleDownloadAll}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            backgroundColor: '#007BFF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                        }}
                    >
                        Download All
                    </button>
                </div>
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
