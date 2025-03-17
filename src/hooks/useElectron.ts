import { useState, useEffect, useCallback } from 'react';
import ElectronBridge from '../utils/electronBridge';

// A custom hook to interact with Electron features
export const useElectron = () => {
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const [platform, setPlatform] = useState<string>('web');
  const [appInfo, setAppInfo] = useState<{name: string, version: string}>({ name: 'Walnut', version: '1.0.0' });

  // Initialize on component mount
  useEffect(() => {
    const electronDetected = ElectronBridge.isElectron();
    setIsElectron(electronDetected);
    
    if (electronDetected) {
      setPlatform(ElectronBridge.getPlatform());
      setAppInfo(ElectronBridge.getAppInfo());
    }
  }, []);

  // Save data to persistent storage - memoized to prevent unnecessary re-renders
  const saveData = useCallback(async (key: string, data: any): Promise<void> => {
    return ElectronBridge.saveData(key, data);
  }, []);

  // Load data from persistent storage - memoized to prevent unnecessary re-renders
  const loadData = useCallback(async (key: string): Promise<any> => {
    return ElectronBridge.loadData(key);
  }, []);

  return {
    isElectron,
    platform,
    appInfo,
    saveData,
    loadData
  };
};

export default useElectron; 