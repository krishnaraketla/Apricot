const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const Store = require('electron-store');

// Initialize the store for persistent data
const store = new Store();

// Keep a global reference of the window object to prevent it from being garbage collected
let mainWindow;

// Determine if we're in development or production mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Handle IPC messages for data storage
ipcMain.on('save-data', (event, { key, data }) => {
  store.set(key, data);
});

ipcMain.handle('load-data', async (event, key) => {
  return store.get(key);
});

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false // Don't show until loaded
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:5173' // Default Vite dev server URL
    : url.format({
        pathname: path.join(__dirname, './dist/index.html'),
        protocol: 'file:',
        slashes: true
      });

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    // Dereference the window object
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // Start the Vite dev server in development mode
  if (isDev) {
    console.log('Running in development mode');
    // You can start the development server here if needed
    // For now, we assume it's already running
  }
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS re-create a window when dock icon is clicked and no windows are open
  if (mainWindow === null) createWindow();
}); 