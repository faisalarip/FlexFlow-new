import { storage } from "./storage";
import type { Badge, UserBadge, InsertBadge } from "@shared/schema";

export interface BadgeAward {
  badgeId: string;
  badgeName: string;
  description: string;
  isNew: boolean;
}

export class BadgeService {
  // Consistency badges definition
  private static readonly CONSISTENCY_BADGES: InsertBadge[] = [
    {
      name: "Week Warrior",
      description: "Used the app every day for 1 week",
      iconName: "flame",
      category: "consistency",
      requiredDays: 7,
    },
    {
      name: "Fortnight Champion",
      description: "Used the app every day for 2 weeks",
      iconName: "zap",
      category: "consistency",
      requiredDays: 14,
    },
    {
      name: "Monthly Master",
      description: "Used the app every day for 1 month",
      iconName: "trophy",
      category: "consistency",
      requiredDays: 30,
    },
  ];

  /**
   * Initialize default badges in the database
   * Should be called once during app setup
   */
  static async initializeBadges(): Promise<void> {
    try {
      for (const badgeData of this.CONSISTENCY_BADGES) {
        await storage.createBadgeIfNotExists(badgeData);
      }
    } catch (error) {
      console.error("Failed to initialize badges:", error);
    }
  }

  /**
   * Check and award badges to a user based on their current streak
   * Returns array of newly earned badges
   */
  static async checkAndAwardBadges(userId: string, currentStreak: number): Promise<BadgeAward[]> {
    try {
      const awardedBadges: BadgeAward[] = [];
      
      // Get all consistency badges
      const allBadges = await storage.getAllBadges();
      const consistencyBadges = allBadges.filter(b => b.category === "consistency");
      
      // Get user's existing badges
      const userBadges = await storage.getUserBadges(userId);
      const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
      
      // Check each consistency badge
      for (const badge of consistencyBadges) {
        // Skip if user already has this badge
        if (earnedBadgeIds.has(badge.id)) {
          continue;
        }
        
        // Check if user's streak qualifies for this badge
        if (badge.requiredDays && currentStreak >= badge.requiredDays) {
          // Award the badge
          await storage.awardBadge(userId, badge.id);
          
          awardedBadges.push({
            badgeId: badge.id,
            badgeName: badge.name,
            description: badge.description,
            isNew: true,
          });
        }
      }
      
      return awardedBadges;
    } catch (error) {
      console.error("Failed to check and award badges:", error);
      return [];
    }
  }

  /**
   * Get all badges earned by a user
   */
  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      return await storage.getUserBadges(userId);
    } catch (error) {
      console.error("Failed to get user badges:", error);
      return [];
    }
  }

  /**
   * Get all available badges
   */
  static async getAllBadges(): Promise<Badge[]> {
    try {
      return await storage.getAllBadges();
    } catch (error) {
      console.error("Failed to get all badges:", error);
      return [];
    }
  }
}
