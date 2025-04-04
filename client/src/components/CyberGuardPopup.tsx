import { useState, useEffect } from "react";
import Header from "./Header";
import StatusOverview from "./StatusOverview";
import FeatureToggles from "./FeatureToggles";
import ContentAnalysisResults from "./ContentAnalysisResults";
import Footer from "./Footer";
import SettingsModal from "./SettingsModal";
import { useSettings } from "../context/SettingsContext";
import { getCurrentTab } from "../lib/chromeApi";

interface CyberGuardPopupProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

export default function CyberGuardPopup({ darkMode, setDarkMode }: CyberGuardPopupProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentDomain, setCurrentDomain] = useState("");
  const [analysisStatus, setAnalysisStatus] = useState("Initializing");
  const { settings } = useSettings();

  useEffect(() => {
    const loadCurrentTab = async () => {
      try {
        const tab = await getCurrentTab();
        if (tab?.url) {
          const url = new URL(tab.url);
          setCurrentDomain(url.hostname);
          setAnalysisStatus(
            settings.contentDetection || settings.sentimentAnalysis 
              ? "Running" 
              : "Disabled"
          );
        }
      } catch (error) {
        console.error("Error getting current tab:", error);
        setCurrentDomain("Unknown");
        setAnalysisStatus("Error");
      }
    };

    loadCurrentTab();
  }, [settings]);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className="font-sans bg-background-light text-neutral-dark">
      <Header 
        onOpenSettings={handleOpenSettings} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />
      <StatusOverview 
        currentDomain={currentDomain} 
        analysisStatus={analysisStatus} 
        settings={settings}
      />
      <FeatureToggles />
      <ContentAnalysisResults />
      <Footer />
      {isSettingsOpen && (
        <SettingsModal onClose={handleCloseSettings} />
      )}
    </div>
  );
}
