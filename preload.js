const { contextBridge, ipcRenderer } = require('electron');
console.log('Preload script loaded');
// Expose a limited API to the renderer process
contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => {
        console.log(`Sending via ipcRenderer: ${channel}`, data); // Debug log
        const validChannels = ['convert-png'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    on: (channel, callback) => {
        const validChannels = ['conversion-complete'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args));
        }
    },
});

