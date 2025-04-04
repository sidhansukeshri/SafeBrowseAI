// CyberGuard content script
// This script runs in the context of web pages

// Configuration
let settings = {
  contentDetection: true,
  sentimentAnalysis: true,
  contentRephrasing: true,
  realTimeScraping: true,
  contentSensitivity: 2,
  sentimentSensitivity: 2
};

let observerActive = false;
let mutationObserver = null;
let processedElements = new WeakSet();

// Small list of offensive words for client-side filtering
const offensiveWords = [
  "hate", "stupid", "idiot", "dumb", "moron", "loser",
  "fool", "jerk", "ass", "damn", "hell", "crap", "suck"
];

// Initialize extension
function init() {
  // Load settings
  chrome.storage.local.get(['settings'], (data) => {
    if (data.settings) {
      settings = {...settings, ...data.settings};
    }
    
    // Check if we should analyze this page
    if (shouldAnalyzePage()) {
      analyzePage();
      
      // Set up observer for real-time monitoring if enabled
      if (settings.realTimeScraping) {
        setupMutationObserver();
      }
    }
  });
}

// Determine if current page should be analyzed
function shouldAnalyzePage() {
  // Skip if all detection features are disabled
  if (!settings.contentDetection && !settings.sentimentAnalysis) {
    return false;
  }
  
  const hostname = window.location.hostname;
  
  // List of common platforms to analyze
  const commonPlatforms = [
    'reddit.com',
    'twitter.com',
    'x.com',
    'facebook.com',
    'news.google.com',
    'news.yahoo.com',
    'cnn.com',
    'foxnews.com',
    'bbc.com'
  ];
  
  return commonPlatforms.some(domain => hostname.includes(domain));
}

// Check if text contains offensive content
function containsOffensiveContent(text) {
  if (!text || typeof text !== 'string' || text.length < 5) {
    return false;
  }
  
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Apply different sensitivities
  let matchCount = 0;
  for (const word of offensiveWords) {
    // Check for whole word matches
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    
    if (matches) {
      matchCount += matches.length;
    }
  }
  
  // Determine threshold based on sensitivity (1=low, 2=medium, 3=high)
  const thresholds = [2, 1, 1]; // Low, Medium, High
  return matchCount >= thresholds[settings.contentSensitivity - 1];
}

// Analyze sentiment via background script
function analyzeSentiment(text) {
  return new Promise((resolve, reject) => {
    // Only analyze text of sufficient length
    if (!text || text.length < 20) {
      resolve({ isNegative: false });
      return;
    }
    
    chrome.runtime.sendMessage(
      { action: 'analyzeSentiment', text: text },
      response => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      }
    );
  });
}

// Rephrase content via background script
function rephraseContent(text, type) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'rephraseContent', text, type },
      response => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      }
    );
  });
}

// Save analysis result
function saveAnalysisResult(result) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'saveAnalysisResult', result },
      response => {
        resolve(response);
      }
    );
  });
}

// Analyze and process content in an element
async function processElement(element) {
  // Skip if already processed
  if (processedElements.has(element)) {
    return;
  }
  
  // Skip empty elements or very short text
  const text = element.textContent?.trim();
  if (!text || text.length < 10) {
    return;
  }
  
  // Mark as processed to avoid duplicate analysis
  processedElements.add(element);
  
  let type = null;
  let originalContent = text;
  let shouldRephrase = false;
  
  // Check for offensive content if enabled
  if (settings.contentDetection && containsOffensiveContent(text)) {
    type = "warning";
    shouldRephrase = true;
  }
  
  // Analyze sentiment if enabled and offensive content wasn't found
  if (!type && settings.sentimentAnalysis) {
    try {
      const sentimentResult = await analyzeSentiment(text);
      if (sentimentResult.isNegative) {
        type = "negative";
        shouldRephrase = true;
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
    }
  }
  
  // Rephrase if needed and enabled
  if (shouldRephrase && settings.contentRephrasing && type) {
    try {
      const rephraseResult = await rephraseContent(text, type);
      
      // Only replace if rephrasing was successful
      if (rephraseResult.rephrased) {
        // Save the result to storage
        await saveAnalysisResult({
          type,
          originalContent: text,
          rephrasedContent: rephraseResult.rephrased,
          url: window.location.href,
          domain: window.location.hostname
        });
        
        // Create wrapper for rephrase UI
        const wrapper = document.createElement('div');
        wrapper.className = 'cyberguard-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.width = '100%';
        
        // Add indicator icon
        const indicator = document.createElement('span');
        indicator.className = 'cyberguard-indicator';
        indicator.innerHTML = type === 'warning' ? '⚠️' : '⚠️';
        indicator.style.position = 'absolute';
        indicator.style.right = '0';
        indicator.style.top = '0';
        indicator.style.fontSize = '12px';
        indicator.style.background = type === 'warning' ? '#FFB74D' : '#E53935';
        indicator.style.borderRadius = '3px';
        indicator.style.padding = '2px 4px';
        indicator.style.color = 'white';
        indicator.style.zIndex = '9999';
        
        // Create rephrased content container
        const rephrased = document.createElement('span');
        rephrased.className = 'cyberguard-rephrased';
        rephrased.textContent = rephraseResult.rephrased;
        
        // Replace element content
        // Save original content for toggling
        element.originalContent = text;
        element.rephrasedContent = rephraseResult.rephrased;
        
        // Clear element and append new content
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.value = rephraseResult.rephrased;
        } else {
          element.textContent = '';
          element.appendChild(wrapper);
          wrapper.appendChild(rephrased);
          wrapper.appendChild(indicator);
          
          // Add toggle functionality
          indicator.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (rephrased.textContent === element.rephrasedContent) {
              rephrased.textContent = element.originalContent;
              indicator.textContent = '👁️';
              indicator.title = 'Viewing original content';
            } else {
              rephrased.textContent = element.rephrasedContent;
              indicator.textContent = type === 'warning' ? '⚠️' : '⚠️';
              indicator.title = 'Viewing rephrased content';
            }
          });
        }
      }
    } catch (error) {
      console.error("Error rephrasing content:", error);
    }
  }
}

// Analyze text content on the page
async function analyzePage() {
  // Skip analysis if all features are disabled
  if (!settings.contentDetection && !settings.sentimentAnalysis) {
    return;
  }
  
  // Target content elements 
  const contentElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, .comment, .post, article');
  
  for (const element of contentElements) {
    await processElement(element);
  }
}

// Set up mutation observer for real-time monitoring
function setupMutationObserver() {
  if (observerActive) {
    return;
  }
  
  observerActive = true;
  
  // Create a mutation observer
  mutationObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      // Process added nodes
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(async node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a content element
            if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'DIV'].includes(node.nodeName)) {
              await processElement(node);
            }
            
            // Also check children of the added node
            const contentElements = node.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, .comment, .post, article');
            for (const element of contentElements) {
              await processElement(element);
            }
          }
        });
      }
      // Process text changes
      else if (mutation.type === 'characterData' && mutation.target.parentElement) {
        await processElement(mutation.target.parentElement);
      }
    }
  });
  
  // Start observing the document
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

// Handle messages from popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startAnalysis') {
    settings = message.settings;
    analyzePage();
    
    if (settings.realTimeScraping && !observerActive) {
      setupMutationObserver();
    } else if (!settings.realTimeScraping && observerActive) {
      if (mutationObserver) {
        mutationObserver.disconnect();
        observerActive = false;
      }
    }
    
    sendResponse({ success: true });
  }
  
  if (message.action === 'settingsUpdated') {
    settings = message.settings;
    
    // Update observer based on new settings
    if (settings.realTimeScraping && !observerActive) {
      setupMutationObserver();
    } else if (!settings.realTimeScraping && observerActive) {
      if (mutationObserver) {
        mutationObserver.disconnect();
        observerActive = false;
      }
    }
    
    sendResponse({ success: true });
  }
});

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
