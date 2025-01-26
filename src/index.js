import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
    const [status, setStatus] = useState('Drag a PNG file here!');
    const [isDragging, setIsDragging] = useState(false);
    const [convertedFile, setConvertedFile] = useState([]);

    // Define the listener for "conversion-complete"
    const handleConversionComplete = (message) => {
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
        setConvertedFile([]); // Clear previous conversions

        // Remove previous listener for "conversion-complete"
        window.ipcRenderer.removeListener('conversion-complete', handleConversionComplete);

        // Register the listener
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

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #aaa',
                backgroundColor: isDragging ? '#e0f7fa' : status === 'Converting...' ? '#f0f0f0' : 'white',
                transition: 'background-color 0.3s ease',
            }}
        >
            {status === 'Converting...' ? (
                <div className="spinner" style={{ marginBottom: '20px' }}></div>
            ) : (
                <p>{status}</p>
            )}
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
