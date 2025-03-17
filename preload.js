const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    appInfo: {
      name: 'Walnut',
      version: process.env.npm_package_version || '1.0.0',
    },
    // Expose platform info
    platform: process.platform,
    // Add APIs for interacting with the main process
    saveData: (key, data) => {
      ipcRenderer.send('save-data', { key, data });
    },
    loadData: (key) => {
      return ipcRenderer.invoke('load-data', key);
    },
    // Versions for informational purposes
    versions: {
      node: () => process.versions.node,
      chrome: () => process.versions.chrome,
      electron: () => process.versions.electron
    }
  }
); 