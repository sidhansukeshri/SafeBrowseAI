import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SettingsState {
  contentDetection: boolean;
  sentimentAnalysis: boolean;
  contentRephrasing: boolean;
  realTimeScraping: boolean;
  contentSensitivity: number;
  sentimentSensitivity: number;
  backgroundProcessing: boolean;
  analyticsSharing: boolean;
  notifications: boolean;
}

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (settings: Partial<SettingsState>) => void;
  resetSettings: () => void;
}

const defaultSettings: SettingsState = {
  contentDetection: true,
  sentimentAnalysis: true,
  contentRephrasing: true,
  realTimeScraping: true,
  contentSensitivity: 2,
  sentimentSensitivity: 2,
  backgroundProcessing: true,
  analyticsSharing: true,
  notifications: true
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {}
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    // Load settings from storage
    chrome.storage.local.get(["settings"], (result) => {
      if (result.settings) {
        setSettings({
          ...defaultSettings,
          ...result.settings
        });
      }
    });
  }, []);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save to storage
    chrome.storage.local.set({ settings: updatedSettings });
    
    // Notify content script about settings change
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: "settingsUpdated", 
          settings: updatedSettings 
        });
      }
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    chrome.storage.local.set({ settings: defaultSettings });
    
    // Notify content script about settings reset
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: "settingsUpdated", 
          settings: defaultSettings 
        });
      }
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
