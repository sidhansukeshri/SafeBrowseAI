import { SentimentResponse, RephrasingResponse } from "@shared/schema";

/**
 * Content analyzer utilities for analyzing and rephrasing text
 */

// Basic content filtering using a small list of offensive words
const offensiveWords = [
  "hate", "stupid", "idiot", "dumb", "moron", "loser",
  "fool", "jerk", "ass", "damn", "hell", "crap", "suck"
];

// Check if text contains offensive content
export function containsOffensiveContent(text: string, sensitivity: number = 2): boolean {
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
  
  // Determine threshold based on sensitivity
  const thresholds = [2, 1, 1]; // Low, Medium, High
  return matchCount >= thresholds[sensitivity - 1];
}

// Analyze sentiment of text (uses server endpoint)
export async function analyzeSentiment(text: string): Promise<SentimentResponse> {
  try {
    // Don't analyze very short text
    if (text.length < 10) {
      return {
        score: 0.5,
        label: "neutral",
        isNegative: false
      };
    }
    
    const response = await fetch("/api/analyze/sentiment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error(`Sentiment analysis failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    // Return a default neutral response on error
    return {
      score: 0.5,
      label: "neutral",
      isNegative: false
    };
  }
}

// Rephrase content (uses server endpoint)
export async function rephraseContent(
  text: string, 
  type: "warning" | "negative" | "info"
): Promise<RephrasingResponse> {
  try {
    const response = await fetch("/api/rephrase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, type }),
    });
    
    if (!response.ok) {
      throw new Error(`Rephrasing failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Rephrasing error:", error);
    // Return the original text if rephrasing fails
    return {
      original: text,
      rephrased: "Unable to rephrase content. The original text may contain language that could be improved.",
      type
    };
  }
}

// Extract text content from DOM nodes
export function extractTextFromNode(node: Node): string[] {
  const texts: string[] = [];
  
  // Skip script and style elements
  if (
    node.nodeType === Node.ELEMENT_NODE && 
    (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE' || node.nodeName === 'NOSCRIPT')
  ) {
    return texts;
  }
  
  // Extract text from text nodes
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (text && text.length > 3) {
      texts.push(text);
    }
  }
  
  // Process child nodes
  node.childNodes.forEach(child => {
    texts.push(...extractTextFromNode(child));
  });
  
  return texts;
}

// Scrape and analyze webpage content
export async function analyzeWebpageContent(
  sensitivity: number = 2,
  excludeSelectors: string[] = ['header', 'footer', 'nav', '.navigation']
) {
  const results = [];
  
  // Skip elements matching exclude selectors
  const excludeElements = document.querySelectorAll(excludeSelectors.join(','));
  const excludeSet = new Set(Array.from(excludeElements));
  
  // Get all paragraphs, headings, and list items
  const contentElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, div');
  
  for (const element of Array.from(contentElements)) {
    // Skip if this element is in the exclude set or is a child of an excluded element
    let parent = element.parentElement;
    let shouldSkip = false;
    
    while (parent) {
      if (excludeSet.has(parent)) {
        shouldSkip = true;
        break;
      }
      parent = parent.parentElement;
    }
    
    if (shouldSkip) continue;
    
    // Get text content
    const text = element.textContent?.trim();
    if (!text || text.length < 10) continue;
    
    // Check for offensive content
    if (containsOffensiveContent(text, sensitivity)) {
      results.push({
        type: "warning",
        originalContent: text,
        element
      });
      continue;
    }
    
    // Analyze sentiment (if text is long enough)
    if (text.length >= 20) {
      try {
        const sentiment = await analyzeSentiment(text);
        if (sentiment.isNegative) {
          results.push({
            type: "negative",
            originalContent: text,
            element
          });
        }
      } catch (error) {
        console.error("Error analyzing sentiment:", error);
      }
    }
  }
  
  return results;
}
