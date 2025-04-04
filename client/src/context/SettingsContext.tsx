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
    try {
      if (window.chrome?.storage?.local) {
        window.chrome.storage.local.get(["settings"])
          .then((result: any) => {
            if (result.settings) {
              setSettings({
                ...defaultSettings,
                ...result.settings
              });
            }
          })
          .catch((error: any) => {
            console.error("Error loading settings:", error);
          });
      }
    } catch (error) {
      console.error("Error accessing chrome API:", error);
    }
  }, []);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      // Save to storage
      if (window.chrome?.storage?.local) {
        window.chrome.storage.local.set({ settings: updatedSettings })
          .catch((error: any) => {
            console.error("Error saving settings:", error);
          });
      }
      
      // Notify content script about settings change
      if (window.chrome?.tabs) {
        window.chrome.tabs.query({ active: true, currentWindow: true })
          .then((tabs: any[]) => {
            if (tabs[0]?.id && window.chrome?.tabs) {
              window.chrome.tabs.sendMessage(tabs[0].id, { 
                action: "settingsUpdated", 
                settings: updatedSettings 
              }).catch((error: any) => {
                console.error("Error sending settings update message:", error);
              });
            }
          })
          .catch((error: any) => {
            console.error("Error querying tabs:", error);
          });
      }
    } catch (error) {
      console.error("Error accessing chrome API:", error);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    
    try {
      // Save to storage
      if (window.chrome?.storage?.local) {
        window.chrome.storage.local.set({ settings: defaultSettings })
          .catch((error: any) => {
            console.error("Error resetting settings:", error);
          });
      }
      
      // Notify content script about settings reset
      if (window.chrome?.tabs) {
        window.chrome.tabs.query({ active: true, currentWindow: true })
          .then((tabs: any[]) => {
            if (tabs[0]?.id && window.chrome?.tabs) {
              window.chrome.tabs.sendMessage(tabs[0].id, {
                action: "settingsUpdated",
                settings: defaultSettings
              }).catch((error: any) => {
                console.error("Error sending settings reset message:", error);
              });
            }
          })
          .catch((error: any) => {
            console.error("Error querying tabs:", error);
          });
      }
    } catch (error) {
      console.error("Error accessing chrome API:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
