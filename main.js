const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico'); // Import the library

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

// Handle PNG to ICO conversion
ipcMain.on('convert-png', (event, { name, data }) => {
    console.log(`Received file for conversion: ${name}`);
    
    const base64Data = data.split(',')[1]; // Remove the data URL prefix
    const buffer = Buffer.from(base64Data, 'base64');
    const tempPngPath = path.join(app.getPath('temp'), name);
    const icoPath = tempPngPath.replace('.png', '.ico');

    fs.writeFile(tempPngPath, buffer, (err) => {
        if (err) {
            console.error(`Error saving file: ${err.message}`);
            event.reply('conversion-complete', `Error: Failed to save PNG file`);
            return;
        }

        console.log(`PNG file saved to: ${tempPngPath}`);

        // Convert PNG to ICO
        pngToIco(tempPngPath)
            .then((icoBuffer) => {
                fs.writeFile(icoPath, icoBuffer, (err) => {
                    if (err) {
                        console.error(`Error saving ICO file: ${err.message}`);
                        event.reply('conversion-complete', `Error: Failed to save ICO file`);
                    } else {
                        console.log(`ICO file saved to: ${icoPath}`);
                        event.reply('conversion-complete', `File converted: ${icoPath}`);
                    }
                });
            })
            .catch((err) => {
                console.error(`Error converting to ICO: ${err.message}`);
                event.reply('conversion-complete', `Error: Failed to convert PNG to ICO`);
            });
    });
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
