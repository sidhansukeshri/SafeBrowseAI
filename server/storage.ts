import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  userSettings,
  protectedWebsites,
  analysisResults,
  insertUserSettingsSchema,
  insertProtectedWebsiteSchema,
  insertAnalysisResultSchema,
  type UserSettings,
  type ProtectedWebsite,
  type AnalysisResult,
  type InsertUserSettings,
  type InsertProtectedWebsite,
  type InsertAnalysisResult
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User settings
  getUserSettings(): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(id: number, settings: Partial<UserSettings>): Promise<UserSettings | undefined>;
  
  // Protected websites
  getProtectedWebsites(): Promise<ProtectedWebsite[]>;
  createProtectedWebsite(website: InsertProtectedWebsite): Promise<ProtectedWebsite>;
  updateProtectedWebsite(id: number, website: Partial<ProtectedWebsite>): Promise<ProtectedWebsite | undefined>;
  deleteProtectedWebsite(id: number): Promise<boolean>;
  
  // Analysis results
  getAnalysisResults(): Promise<AnalysisResult[]>;
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  deleteAnalysisResult(id: number): Promise<boolean>;
  clearAnalysisResults(): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User settings methods
  async getUserSettings(): Promise<UserSettings | undefined> {
    const settings = await db.select().from(userSettings).limit(1);
    return settings.length > 0 ? settings[0] : undefined;
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [newSettings] = await db.insert(userSettings)
      .values(settings)
      .returning();
    return newSettings;
  }

  async updateUserSettings(id: number, settings: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const [updatedSettings] = await db.update(userSettings)
      .set({
        ...settings,
        updatedAt: new Date()
      })
      .where(eq(userSettings.id, id))
      .returning();
    return updatedSettings;
  }

  // Protected websites methods
  async getProtectedWebsites(): Promise<ProtectedWebsite[]> {
    return await db.select().from(protectedWebsites);
  }

  async createProtectedWebsite(website: InsertProtectedWebsite): Promise<ProtectedWebsite> {
    const [newWebsite] = await db.insert(protectedWebsites)
      .values(website)
      .returning();
    return newWebsite;
  }

  async updateProtectedWebsite(id: number, website: Partial<ProtectedWebsite>): Promise<ProtectedWebsite | undefined> {
    const [updatedWebsite] = await db.update(protectedWebsites)
      .set(website)
      .where(eq(protectedWebsites.id, id))
      .returning();
    return updatedWebsite;
  }

  async deleteProtectedWebsite(id: number): Promise<boolean> {
    const result = await db.delete(protectedWebsites)
      .where(eq(protectedWebsites.id, id))
      .returning({ id: protectedWebsites.id });
    return result.length > 0;
  }

  // Analysis results methods
  async getAnalysisResults(): Promise<AnalysisResult[]> {
    return await db.select()
      .from(analysisResults)
      .orderBy(desc(analysisResults.timestamp));
  }

  async createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult> {
    const [newResult] = await db.insert(analysisResults)
      .values(result)
      .returning();
    return newResult;
  }

  async deleteAnalysisResult(id: number): Promise<boolean> {
    const result = await db.delete(analysisResults)
      .where(eq(analysisResults.id, id))
      .returning({ id: analysisResults.id });
    return result.length > 0;
  }

  async clearAnalysisResults(): Promise<boolean> {
    await db.delete(analysisResults);
    return true;
  }
}

// Export instance
export const storage = new DatabaseStorage();
