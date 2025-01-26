const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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
    const base64Data = data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const tempPngPath = path.join(app.getPath('temp'), name);
    const icoPath = tempPngPath.replace('.png', '.ico');

    // Save the PNG file to a temporary directory
    fs.writeFile(tempPngPath, buffer, (err) => {
        if (err) {
            console.error(`Error saving PNG file: ${err.message}`);
            event.reply('conversion-complete', `Error: Failed to save PNG file.`);
            return;
        }

        console.log(`PNG file saved to: ${tempPngPath}`);

        // Convert PNG to ICO
        pngToIco(tempPngPath)
            .then((icoBuffer) => {
                // Save the ICO file
                fs.writeFile(icoPath, icoBuffer, (err) => {
                    if (err) {
                        console.error(`Error saving ICO file: ${err.message}`);
                        event.reply('conversion-complete', `Error: Failed to save ICO file.`);
                    } else {
                        console.log(`ICO file saved to: ${icoPath}`);
                        event.reply('conversion-complete', `File converted: ${icoPath}`);
                    }
                });
            })
            .catch((err) => {
                console.error(`Error converting to ICO: ${err.message}`);
                event.reply('conversion-complete', `Error: Failed to convert PNG to ICO.`);
            });
    });
});

// Handle directory selection
ipcMain.on('select-directory', (event, convertedFiles) => {
    console.log('Received request to select directory with files:', convertedFiles); // Debug log
    dialog.showOpenDialog({
        properties: ['openDirectory'],
    }).then((result) => {
        if (!result.canceled) {
            const selectedDir = result.filePaths[0];
            console.log('Directory selected:', selectedDir); // Debug log

            let successCount = 0;
            let errorCount = 0;

            convertedFiles.forEach((filePath) => {
                const fileName = path.basename(filePath);
                const destination = path.join(selectedDir, fileName);

                fs.copyFile(filePath, destination, (err) => {
                    if (err) {
                        console.error(`Error copying file ${fileName}: ${err.message}`);
                        errorCount++;
                    } else {
                        console.log(`File copied to: ${destination}`);
                        successCount++;
                    }

                    // Send status back to renderer when all files are processed
                    if (successCount + errorCount === convertedFiles.length) {
                        event.reply(
                            'directory-selected',
                            `${successCount} file(s) saved successfully. ${errorCount} error(s).`
                        );
                    }
                });
            });
        } else {
            console.log('Directory selection canceled'); // Debug log
            event.reply('directory-selected', 'Directory selection canceled.');
        }
    }).catch((err) => {
        console.error('Error selecting directory:', err.message);
        event.reply('directory-selected', 'Error selecting directory.');
    });
});





app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
