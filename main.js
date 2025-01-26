const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false,
        },
    });

    const isDev = !app.isPackaged;
    const startURL = isDev
        ? 'http://localhost:8080'
        : `file://${path.join(__dirname, 'dist', 'index.html')}`;

    mainWindow.loadURL(startURL);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
});

// Handle file conversion request
ipcMain.on('convert-png', (event, { name, data }) => {
    console.log(`Received file for conversion: ${name}`);
    
    // Decode the base64 data
    const base64Data = data.split(',')[1]; // Remove the data URL prefix
    const buffer = Buffer.from(base64Data, 'base64');

    // Save the file to a temporary location
    const tempPath = path.join(app.getPath('temp'), name);
    const icoPath = tempPath.replace('.png', '.ico'); // Set .ico output path

    fs.writeFile(tempPath, buffer, (err) => {
        if (err) {
            console.error(`Error saving file: ${err.message}`);
            event.reply('conversion-complete', `Error: ${err.message}`);
        } else {
            console.log(`File saved to: ${tempPath}`);
            // Convert the saved PNG to ICO
            sharp(tempPath)
                .resize(256, 256) // Resize for ICO
                .toFile(icoPath, (err) => {
                    if (err) {
                        console.error(`Error converting to ICO: ${err.message}`);
                        event.reply('conversion-complete', `Error: ${err.message}`);
                    } else {
                        console.log(`File converted to ICO: ${icoPath}`);
                        event.reply('conversion-complete', `File converted: ${icoPath}`);
                    }
                });
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
