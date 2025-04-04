import React from "react";
import { useSettings } from "../context/SettingsContext";

export default function FeatureToggles() {
  const { settings, updateSettings } = useSettings();

  const handleToggleFeature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    updateSettings({ [id]: checked });
  };

  return (
    <section className="p-4 border-b border-gray-200">
      <h2 className="text-lg font-medium mb-3">Protection Features</h2>
      
      <div className="grid gap-3">
        {/* Content Detection Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Inappropriate Content Detection</h3>
            <p className="text-xs text-gray-500">Block offensive language</p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              id="contentDetection" 
              checked={settings.contentDetection} 
              onChange={handleToggleFeature}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Sentiment Analysis Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Sentiment Analysis</h3>
            <p className="text-xs text-gray-500">Detect negative content</p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              id="sentimentAnalysis" 
              checked={settings.sentimentAnalysis} 
              onChange={handleToggleFeature}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Content Rephrasing Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Content Rephrasing</h3>
            <p className="text-xs text-gray-500">Rewrite negative content</p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              id="contentRephrasing" 
              checked={settings.contentRephrasing} 
              onChange={handleToggleFeature}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Real-time Scraping Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Real-time Scraping</h3>
            <p className="text-xs text-gray-500">Monitor page changes</p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              id="realTimeScraping" 
              checked={settings.realTimeScraping} 
              onChange={handleToggleFeature}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </section>
  );
}
