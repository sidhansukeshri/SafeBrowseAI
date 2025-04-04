// CyberGuard background script
// This script runs in the background and manages extension state

// Default settings
const defaultSettings = {
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

// Default protected websites
const defaultWebsites = [
  { domain: "reddit.com", features: "All Features" },
  { domain: "twitter.com", features: "All Features" },
  { domain: "facebook.com", features: "All Features" },
  { domain: "news.google.com", features: "All Features" }
];

// Initialize extension data on install
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      settings: defaultSettings,
      protectedWebsites: defaultWebsites,
      analysisResults: []
    });

    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'CyberGuard Installed',
      message: 'CyberGuard is now protecting your browsing experience. Click the extension icon to customize settings.'
    });
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeSentiment') {
    // Forward sentiment analysis request to the API
    fetch('http://localhost:8000/api/analyze/sentiment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message.text }),
    })
    .then(response => response.json())
    .then(data => sendResponse(data))
    .catch(error => {
      console.error('Error analyzing sentiment:', error);
      sendResponse({ error: 'Failed to analyze sentiment' });
    });
    
    return true; // Required for async sendResponse
  }
  
  if (message.action === 'rephraseContent') {
    // Forward rephrasing request to the API
    fetch('http://localhost:8000/api/rephrase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: message.text,
        type: message.type 
      }),
    })
    .then(response => response.json())
    .then(data => sendResponse(data))
    .catch(error => {
      console.error('Error rephrasing content:', error);
      sendResponse({ error: 'Failed to rephrase content' });
    });
    
    return true; // Required for async sendResponse
  }
  
  if (message.action === 'saveAnalysisResult') {
    chrome.storage.local.get(['analysisResults'], (data) => {
      const results = data.analysisResults || [];
      
      // Add unique ID and timestamp
      const newResult = {
        ...message.result,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      
      // Keep only the latest 20 results
      const updatedResults = [newResult, ...results].slice(0, 20);
      
      chrome.storage.local.set({ analysisResults: updatedResults }, () => {
        sendResponse({ success: true, result: newResult });
        
        // Show notification if enabled
        chrome.storage.local.get(['settings'], (data) => {
          if (data.settings?.notifications) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon-48.png',
              title: 'CyberGuard Alert',
              message: `${message.result.type === 'warning' ? 'Potentially harmful' : 
                        message.result.type === 'negative' ? 'Highly negative' : 
                        'Potentially misleading'} content detected and rephrased`
            });
          }
        });
      });
    });
    
    return true; // Required for async sendResponse
  }
});

// Track tab changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      // Check if this URL should be analyzed
      const url = new URL(tab.url);
      
      chrome.storage.local.get(['protectedWebsites', 'settings'], (data) => {
        const protectedSites = data.protectedWebsites || defaultWebsites;
        const settings = data.settings || defaultSettings;
        
        // Skip if all features are disabled
        if (!settings.contentDetection && 
            !settings.sentimentAnalysis && 
            !settings.contentRephrasing) {
          return;
        }
        
        // Check if domain is in protected websites
        const isProtected = protectedSites.some(site => 
          url.hostname.includes(site.domain)
        );
        
        if (isProtected) {
          // Notify content script to start analysis
          chrome.tabs.sendMessage(tabId, { 
            action: 'startAnalysis',
            settings: settings
          });
        }
      });
    } catch (e) {
      console.error('Error parsing URL:', e);
    }
  }
});
