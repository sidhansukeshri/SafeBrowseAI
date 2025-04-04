import React from "react";

export default function Footer() {
  const handleOpenHelp = () => {
    chrome.tabs.create({ url: "https://cyberguard-help.example.com" });
  };

  const handleOpenFeedback = () => {
    chrome.tabs.create({ url: "https://cyberguard-feedback.example.com" });
  };

  return (
    <footer className="px-4 py-3 bg-gray-50 text-center border-t border-gray-200">
      <div className="flex justify-between items-center">
        <div>
          <button 
            className="text-xs text-primary hover:text-primary-dark flex items-center"
            onClick={handleOpenHelp}
          >
            <i className="mdi mdi-help-circle text-sm mr-1"></i>
            Help
          </button>
        </div>
        <div>
          <span className="text-xs text-gray-500">CyberGuard v1.0.0</span>
        </div>
        <div>
          <button 
            className="text-xs text-primary hover:text-primary-dark flex items-center"
            onClick={handleOpenFeedback}
          >
            <i className="mdi mdi-message-text-outline text-sm mr-1"></i>
            Feedback
          </button>
        </div>
      </div>
    </footer>
  );
}
