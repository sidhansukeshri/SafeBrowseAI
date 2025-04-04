import { db } from "./db";
import { userSettings, protectedWebsites } from "@shared/schema";
import { count } from "drizzle-orm";

// Initialize database with default data
export async function initializeDatabase() {
  try {
    // Check if we already have user settings
    const settingsCountResult = await db.select({ value: count() }).from(userSettings);
    const settingsCount = settingsCountResult[0]?.value || 0;
    
    // If no settings exist, create default settings
    if (settingsCount === 0) {
      console.log("Creating default user settings");
      await db.insert(userSettings).values({
        contentDetection: true,
        sentimentAnalysis: true,
        contentRephrasing: true,
        realTimeScraping: true,
        contentSensitivity: 2,
        sentimentSensitivity: 2,
        backgroundProcessing: true,
        analyticsSharing: true,
        notifications: true
      });
    }

    // Check if we already have protected websites
    const websitesCountResult = await db.select({ value: count() }).from(protectedWebsites);
    const websitesCount = websitesCountResult[0]?.value || 0;
    
    // If no websites exist, create default websites
    if (websitesCount === 0) {
      console.log("Creating default protected websites");
      await db.insert(protectedWebsites).values([
        {
          domain: "reddit.com",
          features: { contentDetection: true, sentimentAnalysis: true, contentRephrasing: true }
        },
        {
          domain: "twitter.com",
          features: { contentDetection: true, sentimentAnalysis: true, contentRephrasing: true }
        },
        {
          domain: "facebook.com",
          features: { contentDetection: true, sentimentAnalysis: true, contentRephrasing: true }
        }
      ]);
    }
    
    console.log("Database initialization complete");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}