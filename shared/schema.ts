import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User settings schema
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  contentDetection: boolean("content_detection").notNull().default(true),
  sentimentAnalysis: boolean("sentiment_analysis").notNull().default(true),
  contentRephrasing: boolean("content_rephrasing").notNull().default(true),
  realTimeScraping: boolean("real_time_scraping").notNull().default(true),
  contentSensitivity: integer("content_sensitivity").notNull().default(2),
  sentimentSensitivity: integer("sentiment_sensitivity").notNull().default(2),
  backgroundProcessing: boolean("background_processing").notNull().default(true),
  analyticsSharing: boolean("analytics_sharing").notNull().default(true),
  notifications: boolean("notifications").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Protected websites schema
export const protectedWebsites = pgTable("protected_websites", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull().unique(),
  features: jsonb("features").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Analysis results schema
export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "warning", "negative", "info"
  originalContent: text("original_content").notNull(),
  rephrasedContent: text("rephrased_content"),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Settings insert schema
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Protected website insert schema
export const insertProtectedWebsiteSchema = createInsertSchema(protectedWebsites).omit({
  id: true,
  createdAt: true,
});

// Analysis result insert schema
export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
  timestamp: true,
});

// Type definitions
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export type InsertProtectedWebsite = z.infer<typeof insertProtectedWebsiteSchema>;
export type ProtectedWebsite = typeof protectedWebsites.$inferSelect;

export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;

// Sentiment analysis input schema
export const sentimentAnalysisSchema = z.object({
  text: z.string().min(1),
  threshold: z.number().min(0).max(1).default(0.5),
});

// Rephrasing input schema
export const rephrasingSchema = z.object({
  text: z.string().min(1),
  type: z.enum(["warning", "negative", "info"]).default("negative"),
});

// API response types
export type SentimentResponse = {
  score: number;
  label: "positive" | "negative" | "neutral";
  isNegative: boolean;
};

export type RephrasingResponse = {
  original: string;
  rephrased: string;
  type: "warning" | "negative" | "info";
};
