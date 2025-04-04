import {
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

// In-memory storage implementation
export class MemStorage implements IStorage {
  private userSettings: Map<number, UserSettings>;
  private websites: Map<number, ProtectedWebsite>;
  private results: Map<number, AnalysisResult>;
  private settingsId: number;
  private websiteId: number;
  private resultId: number;

  constructor() {
    this.userSettings = new Map();
    this.websites = new Map();
    this.results = new Map();
    this.settingsId = 1;
    this.websiteId = 1;
    this.resultId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default user settings
    const defaultSettings: UserSettings = {
      id: this.settingsId++,
      contentDetection: true,
      sentimentAnalysis: true,
      contentRephrasing: true,
      realTimeScraping: true,
      contentSensitivity: 2,
      sentimentSensitivity: 2,
      backgroundProcessing: true,
      analyticsSharing: true,
      notifications: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userSettings.set(defaultSettings.id, defaultSettings);
    
    // Default protected websites
    const defaultWebsites: InsertProtectedWebsite[] = [
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
    ];
    
    defaultWebsites.forEach(website => {
      const newWebsite: ProtectedWebsite = {
        ...website,
        id: this.websiteId++,
        createdAt: new Date()
      };
      this.websites.set(newWebsite.id, newWebsite);
    });
  }

  // User settings methods
  async getUserSettings(): Promise<UserSettings | undefined> {
    if (this.userSettings.size > 0) {
      return Array.from(this.userSettings.values())[0];
    }
    return undefined;
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const id = this.settingsId++;
    const now = new Date();
    const newSettings: UserSettings = {
      ...settings,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.userSettings.set(id, newSettings);
    return newSettings;
  }

  async updateUserSettings(id: number, settings: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const existingSettings = this.userSettings.get(id);
    if (!existingSettings) return undefined;
    
    const updatedSettings: UserSettings = {
      ...existingSettings,
      ...settings,
      updatedAt: new Date()
    };
    this.userSettings.set(id, updatedSettings);
    return updatedSettings;
  }

  // Protected websites methods
  async getProtectedWebsites(): Promise<ProtectedWebsite[]> {
    return Array.from(this.websites.values());
  }

  async createProtectedWebsite(website: InsertProtectedWebsite): Promise<ProtectedWebsite> {
    const id = this.websiteId++;
    const newWebsite: ProtectedWebsite = {
      ...website,
      id,
      createdAt: new Date()
    };
    this.websites.set(id, newWebsite);
    return newWebsite;
  }

  async updateProtectedWebsite(id: number, website: Partial<ProtectedWebsite>): Promise<ProtectedWebsite | undefined> {
    const existingWebsite = this.websites.get(id);
    if (!existingWebsite) return undefined;
    
    const updatedWebsite: ProtectedWebsite = {
      ...existingWebsite,
      ...website
    };
    this.websites.set(id, updatedWebsite);
    return updatedWebsite;
  }

  async deleteProtectedWebsite(id: number): Promise<boolean> {
    return this.websites.delete(id);
  }

  // Analysis results methods
  async getAnalysisResults(): Promise<AnalysisResult[]> {
    return Array.from(this.results.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = this.resultId++;
    const newResult: AnalysisResult = {
      ...result,
      id,
      timestamp: new Date()
    };
    this.results.set(id, newResult);
    return newResult;
  }

  async deleteAnalysisResult(id: number): Promise<boolean> {
    return this.results.delete(id);
  }

  async clearAnalysisResults(): Promise<boolean> {
    this.results.clear();
    return true;
  }
}

// Export instance
export const storage = new MemStorage();
