const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Load the preload script
            contextIsolation: true, // Enable context isolation for security
            nodeIntegration: false, // Disable direct Node.js integration
            webSecurity: false, // Ensure this is set
        },
    });

    const isDev = !app.isPackaged;
    const startURL = isDev
        ? 'http://localhost:8080' // Development server
        : `file://${path.join(__dirname, 'dist', 'index.html')}`; // Production build

    mainWindow.loadURL(startURL);

    if (isDev) {
        mainWindow.webContents.openDevTools(); // Enable DevTools in development
    }
});

// Handle file conversion request
ipcMain.on('convert-png', (event, filePath) => {
    console.log(`Received file for conversion:`, filePath); // Debug log
    if (!filePath) {
        event.reply('conversion-complete', 'Error: File path is undefined');
    } else {
        event.reply('conversion-complete', `Converted file: ${filePath}`);
    }
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
