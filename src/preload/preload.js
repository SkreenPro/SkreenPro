const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSources: () => ipcRenderer.invoke('get-sources'),
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  screenshotSelected: (imageData) => ipcRenderer.send('screenshot-selected', imageData),
  cancelCapture: () => ipcRenderer.send('cancel-capture'),
  startCaptureMode: (mode) => ipcRenderer.send('start-capture-mode', mode),
  onScreenshotCaptured: (callback) => ipcRenderer.on('screenshot-captured', (_event, data) => callback(data)),
});
