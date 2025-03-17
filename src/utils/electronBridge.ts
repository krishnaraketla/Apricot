// Bridge to safely access Electron features from the renderer process

// Define the ElectronAPI interface to match what's exposed in preload.js
interface ElectronAPI {
  appInfo: {
    name: string;
    version: string;
  };
  platform: string;
  saveData: (key: string, data: any) => void;
  loadData: (key: string) => Promise<any>;
  versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
  };
}

// Declare global window interface with our ElectronAPI
declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

// A class to handle Electron features with fallbacks for web
export class ElectronBridge {
  // Check if running in Electron
  static isElectron(): boolean {
    return window.electron !== undefined;
  }

  // Get platform (win32, darwin, linux)
  static getPlatform(): string {
    return window.electron?.platform || 'web';
  }

  // Persistent storage methods with localStorage fallback
  static async saveData(key: string, data: any): Promise<void> {
    if (this.isElectron()) {
      window.electron?.saveData(key, data);
    } else {
      // Fallback to localStorage in browser environment
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  static async loadData(key: string): Promise<any> {
    if (this.isElectron()) {
      return window.electron?.loadData(key);
    } else {
      // Fallback to localStorage in browser environment
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  }

  // Get app information
  static getAppInfo(): { name: string; version: string } {
    return (
      window.electron?.appInfo || {
        name: 'Walnut',
        version: '1.0.0',
      }
    );
  }
}

export default ElectronBridge; 