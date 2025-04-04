/**
 * Chrome API utilities
 */

// Define Chrome extension API types
declare global {
  interface Window {
    chrome?: any;
  }
  
  // Adding chrome namespace for TypeScript
  const chrome: {
    tabs: {
      query: (options: any) => Promise<any[]>;
      sendMessage: (tabId: number, message: any) => Promise<any>;
    };
    storage: {
      local: {
        get: (keys: string[]) => Promise<Record<string, any>>;
        set: (data: Record<string, any>) => Promise<any>;
      };
    };
    runtime: {
      sendMessage: (message: any) => Promise<any>;
    };
    notifications: {
      create: (options: any) => Promise<string>;
    };
  };
}

// Mock implementation for chrome API in development environment
const createChromeApiMock = () => {
  // In-memory storage to simulate chrome.storage.local
  const localStorage: Record<string, any> = {
    settings: {
      contentDetection: true,
      sentimentAnalysis: true,
      contentRephrasing: true,
      realTimeScraping: true,
      contentSensitivity: 2,
      sentimentSensitivity: 2,
      backgroundProcessing: true,
      analyticsSharing: false,
      notifications: true
    },
    analysisResults: [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        type: "warning",
        originalContent: "This content contains harmful misinformation about vaccines.",
        rephrasedContent: "Research shows vaccines are safe and effective medical interventions.",
        url: "https://example.com/article",
        domain: "example.com"
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        type: "negative",
        originalContent: "I hate this product, it's absolutely terrible and a waste of money.",
        rephrasedContent: "I'm disappointed with this product and don't feel it provided good value.",
        url: "https://example.com/reviews",
        domain: "example.com"
      }
    ],
    protectedWebsites: [
      { id: 1, domain: "twitter.com", enabled: true },
      { id: 2, domain: "reddit.com", enabled: true },
      { id: 3, domain: "facebook.com", enabled: true }
    ]
  };

  return {
    tabs: {
      query: async () => {
        return [{ id: 1, url: "https://example.com", title: "Example Website" }];
      },
      sendMessage: async () => {
        return { success: true };
      }
    },
    storage: {
      local: {
        get: async (keys: string[]) => {
          const result: Record<string, any> = {};
          keys.forEach(key => {
            result[key] = localStorage[key];
          });
          return result;
        },
        set: async (data: Record<string, any>) => {
          Object.keys(data).forEach(key => {
            localStorage[key] = data[key];
          });
          return { success: true };
        }
      }
    },
    runtime: {
      sendMessage: async () => {
        return { success: true };
      }
    },
    notifications: {
      create: async (options: any) => {
        console.log('Notification created:', options);
        return "notification-id";
      }
    }
  };
};

// Initialize chrome API for the web environment
if (typeof window !== 'undefined' && !window.chrome) {
  window.chrome = createChromeApiMock();
}

// Get the currently active tab
export async function getCurrentTab() {
  try {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await window.chrome!.tabs.query(queryOptions);
    return tab;
  } catch (error) {
    console.error("Error getting current tab:", error);
    return { id: 1, url: "https://example.com", title: "Example Website" };
  }
}

// Send a message to the active tab
export async function sendMessageToActiveTab(message: any) {
  try {
    const tab = await getCurrentTab();
    if (tab.id) {
      return window.chrome!.tabs.sendMessage(tab.id, message);
    }
    throw new Error("No active tab found");
  } catch (error) {
    console.error("Error sending message to tab:", error);
    return { success: false, error: "Failed to send message" };
  }
}

// Check if a URL should be analyzed based on protected websites list
export async function shouldAnalyzeUrl(url: string): Promise<boolean> {
  try {
    const hostname = new URL(url).hostname;
    const { protectedWebsites } = await window.chrome!.storage.local.get(["protectedWebsites"]);
    
    if (!protectedWebsites || !Array.isArray(protectedWebsites)) {
      // Default to analyzing common social media sites if no list is defined
      const defaultSites = ["reddit.com", "twitter.com", "x.com", "facebook.com"];
      return defaultSites.some(site => hostname.includes(site));
    }
    
    return protectedWebsites.some(site => hostname.includes(site.domain));
  } catch (error) {
    console.error("Error checking URL:", error);
    return false;
  }
}

// Get extension settings
export async function getSettings() {
  try {
    const { settings } = await window.chrome!.storage.local.get(["settings"]);
    return settings;
  } catch (error) {
    console.error("Error getting settings:", error);
    return null;
  }
}

// Save analysis result
export async function saveAnalysisResult(result: any) {
  try {
    const { analysisResults = [] } = await window.chrome!.storage.local.get(["analysisResults"]);
    
    // Add unique ID and timestamp
    const newResult = {
      ...result,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    // Keep only the latest 20 results
    const updatedResults = [newResult, ...analysisResults].slice(0, 20);
    
    await window.chrome!.storage.local.set({ analysisResults: updatedResults });
    return newResult;
  } catch (error) {
    console.error("Error saving analysis result:", error);
    return null;
  }
}

// Show notification
export async function showNotification(title: string, message: string) {
  try {
    const { settings } = await window.chrome!.storage.local.get(["settings"]);
    
    if (settings?.notifications) {
      window.chrome!.notifications.create({
        type: "basic",
        iconUrl: "icons/icon-48.png",
        title,
        message
      });
    }
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}
