import { SentimentResponse } from "@shared/schema";

/**
 * Simple sentiment analysis service
 * 
 * In a production environment, this would use a proper NLP model.
 * Here we're implementing a basic lexicon-based approach.
 */

// Negative words lexicon
const negativeWords = [
  "angry", "hate", "terrible", "awful", "horrible", "bad", "worst",
  "stupid", "dumb", "idiot", "moron", "jerk", "ugly", "nasty",
  "disgusting", "pathetic", "miserable", "useless", "worthless",
  "disaster", "failure", "failed", "disappointing", "disappointed",
  "sucks", "suck", "damn", "hell", "crap", "shit", "fuck",
  "kill", "die", "death", "dead", "hurt", "pain", "suffer",
  "cruel", "evil", "vile", "wicked", "sick", "gross", "creepy",
  "scared", "afraid", "fear", "worry", "anxious", "stress", "sad",
  "depressed", "depressing", "gloomy", "misery", "despair", "hopeless"
];

// Positive words lexicon
const positiveWords = [
  "good", "great", "excellent", "amazing", "wonderful", "fantastic",
  "terrific", "outstanding", "exceptional", "incredible", "brilliant",
  "superb", "fabulous", "perfect", "awesome", "impressive", "remarkable",
  "love", "happy", "joy", "joyful", "delighted", "pleased", "glad",
  "satisfied", "content", "proud", "excited", "thrilled", "enthusiastic",
  "positive", "optimistic", "hopeful", "encouraging", "inspired", "inspiring",
  "kind", "caring", "generous", "helpful", "supportive", "thoughtful",
  "beautiful", "pretty", "handsome", "lovely", "gorgeous", "attractive",
  "smart", "intelligent", "clever", "wise", "insightful", "innovative"
];

/**
 * Analyze sentiment of text
 */
export async function analyzeSentiment(
  text: string, 
  threshold: number = 0.5
): Promise<SentimentResponse> {
  // Normalize text
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\W+/);
  
  // Count positive and negative words
  let negativeCount = 0;
  let positiveCount = 0;
  
  for (const word of words) {
    if (negativeWords.includes(word)) {
      negativeCount++;
    } else if (positiveWords.includes(word)) {
      positiveCount++;
    }
  }
  
  // Calculate score (0 = very negative, 1 = very positive)
  const totalWords = words.length;
  const negativeScore = negativeCount / totalWords;
  const positiveScore = positiveCount / totalWords;
  
  // Overall score (0-1 scale)
  const score = 0.5 + (positiveScore - negativeScore) * 2;
  const clampedScore = Math.max(0, Math.min(1, score));
  
  // Determine label
  let label: "positive" | "negative" | "neutral";
  if (clampedScore > 0.6) {
    label = "positive";
  } else if (clampedScore < 0.4) {
    label = "negative";
  } else {
    label = "neutral";
  }
  
  // Determine if negative based on threshold
  const isNegative = clampedScore < threshold;
  
  return {
    score: clampedScore,
    label,
    isNegative
  };
}
