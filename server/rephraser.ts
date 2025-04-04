import { RephrasingResponse } from "@shared/schema";

/**
 * Content rephrasing service
 * 
 * In a production environment, this would connect to an LLM or NLP service.
 * This implementation uses rule-based replacement as a fallback.
 */

/**
 * Rephrase negative or harmful content to be more neutral or constructive
 */
export async function rephraseContent(
  text: string,
  type: "warning" | "negative" | "info"
): Promise<RephrasingResponse> {
  // Attempt to use HuggingFace API for rephrasing
  try {
    if (process.env.HUGGINGFACE_API_KEY) {
      return await huggingFaceRephrase(text, type);
    }
  } catch (error) {
    console.error("HuggingFace rephrasing failed:", error);
    // Fall back to rule-based rephrasing on API failure
  }
  
  // Rule-based fallback rephrasing
  return ruleBasedRephrase(text, type);
}

/**
 * Rephrase content using HuggingFace Inference API
 */
async function huggingFaceRephrase(
  text: string,
  type: "warning" | "negative" | "info"
): Promise<RephrasingResponse> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY not set");
  }
  
  // Create prompt based on type
  let prompt = "";
  
  switch (type) {
    case "warning":
      prompt = `Rephrase the following text to remove offensive language and make it more respectful, while preserving the core message: "${text}"`;
      break;
    case "negative":
      prompt = `Rephrase the following highly negative text to be more constructive and balanced, while preserving the core message: "${text}"`;
      break;
    case "info":
      prompt = `Rephrase the following potentially misleading information to be more accurate and neutral: "${text}"`;
      break;
  }
  
  // Call HuggingFace API
  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 150,
          min_length: 30
        }
      })
    }
  );
  
  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.statusText}`);
  }
  
  const result = await response.json();
  
  // Extract generated text from response
  const rephrased = Array.isArray(result) && result.length > 0 
    ? result[0].generated_text 
    : result.generated_text;
  
  return {
    original: text,
    rephrased: rephrased || text,
    type
  };
}

/**
 * Rule-based rephrasing as a fallback method
 */
function ruleBasedRephrase(
  text: string,
  type: "warning" | "negative" | "info"
): RephrasingResponse {
  let rephrased = text;
  
  // Common offensive word replacements
  const offensiveReplacements: Record<string, string> = {
    "stupid": "misguided",
    "idiot": "person",
    "dumb": "uninformed",
    "moron": "individual",
    "hate": "dislike",
    "suck": "is inadequate",
    "sucks": "is inadequate",
    "crap": "poor quality",
    "jerk": "difficult person",
    "fool": "mistaken person",
    "loser": "struggling person",
    "ass": "person",
    "damn": "darn",
    "hell": "heck"
  };
  
  // Common negative phrase replacements
  const negativeReplacements: Record<string, string> = {
    "this is terrible": "this could be improved",
    "i hate this": "I'm not fond of this",
    "worst thing ever": "disappointing experience",
    "complete disaster": "significant issue",
    "absolutely useless": "not currently effective",
    "never works": "inconsistently functions",
    "waste of time": "not the best use of time",
    "waste of money": "questionable value"
  };
  
  // Common misinformation phrase patterns
  const misinfoReplacements: Record<string, string> = {
    "everyone knows": "some believe",
    "scientists have proven": "some research suggests",
    "undeniable proof": "evidence that suggests",
    "definitely causes": "may be associated with",
    "always": "sometimes",
    "never": "rarely",
    "100% certain": "possible",
    "guaranteed": "potential"
  };
  
  switch (type) {
    case "warning":
      // Replace offensive words
      for (const [offensive, replacement] of Object.entries(offensiveReplacements)) {
        rephrased = rephrased.replace(
          new RegExp(`\\b${offensive}\\b`, 'gi'),
          replacement
        );
      }
      
      // Add constructive framing
      rephrased = `${rephrased}`;
      break;
      
    case "negative":
      // Replace negative phrases
      for (const [negative, replacement] of Object.entries(negativeReplacements)) {
        rephrased = rephrased.replace(
          new RegExp(`\\b${negative}\\b`, 'gi'),
          replacement
        );
      }
      
      // Replace offensive words too (often in negative content)
      for (const [offensive, replacement] of Object.entries(offensiveReplacements)) {
        rephrased = rephrased.replace(
          new RegExp(`\\b${offensive}\\b`, 'gi'),
          replacement
        );
      }
      
      // Add balanced perspective
      if (rephrased.length < 100) {
        rephrased = `While there are challenges with ${rephrased}, there may also be opportunities for improvement.`;
      }
      break;
      
    case "info":
      // Replace misinformation patterns
      for (const [misinfo, replacement] of Object.entries(misinfoReplacements)) {
        rephrased = rephrased.replace(
          new RegExp(`\\b${misinfo}\\b`, 'gi'),
          replacement
        );
      }
      
      // Add context qualifier
      rephrased = `This perspective is one viewpoint: ${rephrased}. Consider consulting multiple sources.`;
      break;
  }
  
  return {
    original: text,
    rephrased,
    type
  };
}
