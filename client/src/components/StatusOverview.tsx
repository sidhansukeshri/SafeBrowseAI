import React from "react";
import { SettingsState } from "../context/SettingsContext";

interface StatusOverviewProps {
  currentDomain: string;
  analysisStatus: string;
  settings: SettingsState;
}

export default function StatusOverview({ 
  currentDomain,
  analysisStatus,
  settings 
}: StatusOverviewProps) {
  // Determine status based on enabled features
  const getStatusBadge = () => {
    const { contentDetection, sentimentAnalysis, contentRephrasing, realTimeScraping } = settings;
    const allFeaturesOn = contentDetection && sentimentAnalysis && contentRephrasing && realTimeScraping;
    const someFeaturesOn = contentDetection || sentimentAnalysis || contentRephrasing || realTimeScraping;

    if (allFeaturesOn) {
      return {
        className: "status-badge bg-success/10 text-success",
        icon: "mdi-check-circle",
        text: "Active"
      };
    } else if (someFeaturesOn) {
      return {
        className: "status-badge bg-warning/10 text-warning",
        icon: "mdi-alert",
        text: "Partial"
      };
    } else {
      return {
        className: "status-badge bg-danger/10 text-danger",
        icon: "mdi-close-circle",
        text: "Disabled"
      };
    }
  };

  const badge = getStatusBadge();

  return (
    <section className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Protection Status</h2>
        <span className={badge.className}>
          <i className={`mdi ${badge.icon} text-xs mr-1`}></i>
          {badge.text}
        </span>
      </div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm">Current Website:</p>
        <span className="text-sm font-medium">{currentDomain || "N/A"}</span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm">Content Analysis:</p>
        <span className="text-sm font-medium">{analysisStatus}</span>
      </div>
    </section>
  );
}
