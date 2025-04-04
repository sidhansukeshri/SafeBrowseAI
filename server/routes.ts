import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeSentiment } from "./sentimentAnalysis";
import { rephraseContent } from "./rephraser";
import { rephrasingSchema, sentimentAnalysisSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for content analysis and rephrasing
  
  // Analyze sentiment endpoint
  app.post("/api/analyze/sentiment", async (req, res) => {
    try {
      // Validate request body
      const { text, threshold = 0.5 } = sentimentAnalysisSchema.parse(req.body);
      
      // Analyze sentiment
      const result = await analyzeSentiment(text, threshold);
      
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          message: "Invalid request data", 
          details: validationError.message 
        });
      } else {
        console.error("Sentiment analysis error:", error);
        res.status(500).json({ 
          message: "Failed to analyze sentiment" 
        });
      }
    }
  });

  // Rephrase content endpoint
  app.post("/api/rephrase", async (req, res) => {
    try {
      // Validate request body
      const { text, type = "negative" } = rephrasingSchema.parse(req.body);
      
      // Rephrase content
      const result = await rephraseContent(text, type);
      
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          message: "Invalid request data", 
          details: validationError.message 
        });
      } else {
        console.error("Rephrasing error:", error);
        res.status(500).json({ 
          message: "Failed to rephrase content" 
        });
      }
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
