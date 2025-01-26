const { contextBridge, ipcRenderer } = require('electron');

// Expose a limited API to the renderer process
contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => {
        const validChannels = ['convert-png', 'select-directory'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    on: (channel, callback) => {
        const validChannels = ['conversion-complete', 'directory-selected'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args));
        }
    },
    removeListener: (channel, callback) => {
        const validChannels = ['conversion-complete', 'directory-selected'];
        if (validChannels.includes(channel)) {
            ipcRenderer.removeListener(channel, callback);
        }
    },
    removeAllListeners: (channel) => {
        const validChannels = ['conversion-complete', 'directory-selected'];
        if (validChannels.includes(channel)) {
            ipcRenderer.removeAllListeners(channel);
        }
    },
});
