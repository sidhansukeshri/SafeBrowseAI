import React, { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<{domain: string, features: string}[]>([]);
  const [newWebsite, setNewWebsite] = useState("");
  
  // Local state to track changes before saving
  const [localSettings, setLocalSettings] = useState({ ...settings });

  useEffect(() => {
    // Load protected websites from storage
    chrome.storage.local.get(["protectedWebsites"], (data) => {
      if (data.protectedWebsites && Array.isArray(data.protectedWebsites)) {
        setWebsites(data.protectedWebsites);
      } else {
        // Default websites if none found
        setWebsites([
          { domain: "reddit.com", features: "All Features" },
          { domain: "twitter.com", features: "All Features" },
          { domain: "news.example.com", features: "Custom" }
        ]);
      }
    });
  }, []);

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const sensitivityKey = id === "contentSensitivity" ? "contentSensitivity" : "sentimentSensitivity";
    setLocalSettings({
      ...localSettings,
      [sensitivityKey]: parseInt(value)
    });
  };

  const handleToggleSetting = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setLocalSettings({
      ...localSettings,
      [id]: checked
    });
  };

  const getSensitivityLabel = (value: number) => {
    const labels = ["Low", "Medium", "High"];
    return labels[value - 1] || "Medium";
  };

  const handleSaveSettings = () => {
    updateSettings(localSettings);
    
    // Save websites to storage
    chrome.storage.local.set({ protectedWebsites: websites });
    
    toast({
      title: "Settings saved",
      description: "Your settings have been successfully updated",
    });
    
    onClose();
  };

  const handleResetSettings = () => {
    resetSettings();
    setLocalSettings({
      contentDetection: true,
      sentimentAnalysis: true,
      contentRephrasing: true,
      realTimeScraping: true,
      contentSensitivity: 2,
      sentimentSensitivity: 2,
      backgroundProcessing: true,
      analyticsSharing: true,
      notifications: true
    });

    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults",
    });
  };

  const handleAddWebsite = () => {
    if (newWebsite && !websites.some(site => site.domain === newWebsite)) {
      setWebsites([...websites, { domain: newWebsite, features: "All Features" }]);
      setNewWebsite("");
    }
  };

  const handleRemoveWebsite = (domain: string) => {
    setWebsites(websites.filter(site => site.domain !== domain));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-popup max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold">Settings</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <i className="mdi mdi-close text-xl"></i>
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-md font-medium mb-3">Protection Sensitivity</h3>
          
          {/* Content Sensitivity Slider */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <label htmlFor="contentSensitivity" className="text-sm">Content Filtering</label>
              <span className="text-xs font-medium">
                {getSensitivityLabel(localSettings.contentSensitivity)}
              </span>
            </div>
            <input 
              type="range" 
              id="contentSensitivity" 
              min="1" 
              max="3" 
              value={localSettings.contentSensitivity} 
              className="w-full"
              onChange={handleSensitivityChange}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          {/* Sentiment Sensitivity Slider */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <label htmlFor="sentimentSensitivity" className="text-sm">Sentiment Detection</label>
              <span className="text-xs font-medium">
                {getSensitivityLabel(localSettings.sentimentSensitivity)}
              </span>
            </div>
            <input 
              type="range" 
              id="sentimentSensitivity" 
              min="1" 
              max="3" 
              value={localSettings.sentimentSensitivity} 
              className="w-full"
              onChange={handleSensitivityChange}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          <h3 className="text-md font-medium mb-3 mt-6">Website Settings</h3>
          
          {/* Protected Websites */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm">Protected Websites</label>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="domain.com"
                  className="text-xs border rounded px-2 py-1 mr-2"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                />
                <button 
                  className="text-xs text-primary hover:text-primary-dark"
                  onClick={handleAddWebsite}
                >
                  <i className="mdi mdi-plus text-xs"></i> Add
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded border border-gray-200 max-h-40 overflow-y-auto">
              {websites.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {websites.map((site, index) => (
                    <li key={index} className="flex items-center justify-between p-2 hover:bg-gray-100">
                      <span className="text-sm">{site.domain}</span>
                      <div className="flex items-center">
                        <span className={`text-xs ${site.features === "Custom" ? "bg-gray-200 text-gray-700" : "bg-primary/10 text-primary"} px-2 py-0.5 rounded mr-2`}>
                          {site.features}
                        </span>
                        <button 
                          className="text-gray-400 hover:text-danger"
                          onClick={() => handleRemoveWebsite(site.domain)}
                        >
                          <i className="mdi mdi-close text-sm"></i>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-center text-gray-500 text-sm">
                  No websites added yet
                </div>
              )}
            </div>
          </div>

          <h3 className="text-md font-medium mb-3 mt-6">Advanced Settings</h3>
          
          {/* Advanced Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Background Processing</h4>
                <p className="text-xs text-gray-500">Allow analysis when browsing</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="backgroundProcessing" 
                  checked={localSettings.backgroundProcessing} 
                  onChange={handleToggleSetting}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Analytics Sharing</h4>
                <p className="text-xs text-gray-500">Help improve CyberGuard</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="analyticsSharing" 
                  checked={localSettings.analyticsSharing} 
                  onChange={handleToggleSetting}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Notifications</h4>
                <p className="text-xs text-gray-500">Show browser notifications</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="notifications" 
                  checked={localSettings.notifications} 
                  onChange={handleToggleSetting}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button 
            className="text-sm text-gray-600 hover:text-gray-800 mr-3"
            onClick={handleResetSettings}
          >
            Reset Defaults
          </button>
          <button 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            onClick={handleSaveSettings}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
