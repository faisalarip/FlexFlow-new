import { storage } from "./storage";
import type { InsertUserActivityLog } from "@shared/schema";
import { badgeService } from "./badge-service";

export class ActivityLogger {
  static async logActivity({
    userId,
    actionType,
    actionDetails,
    ipAddress,
    userAgent,
    sessionId
  }: {
    userId: string;
    actionType: string;
    actionDetails?: object;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<void> {
    try {
      const activityData: InsertUserActivityLog = {
        userId,
        actionType,
        actionDetails: actionDetails ? JSON.stringify(actionDetails) : null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        sessionId: sessionId || null,
      };

      await storage.createUserActivity(activityData);
    } catch (error) {
      console.error('Failed to log user activity:', error);
      // Don't throw - logging should not break the main functionality
    }
  }

  static async getUserActivities(userId: string, limit: number = 100): Promise<any[]> {
    try {
      return await storage.getUserActivities(userId, limit);
    } catch (error) {
      console.error('Failed to get user activities:', error);
      return [];
    }
  }

  // Common activity logging methods
  static async logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    return this.logActivity({
      userId,
      actionType: 'login',
      actionDetails: { timestamp: new Date().toISOString() },
      ipAddress,
      userAgent
    });
  }

  static async logLogout(userId: string, sessionId?: string): Promise<void> {
    return this.logActivity({
      userId,
      actionType: 'logout',
      actionDetails: { timestamp: new Date().toISOString() },
      sessionId
    });
  }

  static async logWorkout(userId: string, workoutData: any): Promise<void> {
    await this.logActivity({
      userId,
      actionType: 'workout_logged',
      actionDetails: {
        workoutName: workoutData.name,
        duration: workoutData.duration,
        caloriesBurned: workoutData.caloriesBurned,
        exerciseCount: workoutData.exercises?.length || 0
      }
    });
    
    // Check for new badge achievements after workout
    await this.checkForBadges(userId);
  }

  static async checkForBadges(userId: string): Promise<void> {
    try {
      await badgeService.checkAndAwardBadges(userId);
    } catch (error) {
      console.error('Failed to check for badge achievements:', error);
      // Don't throw - badge checking should not break the main functionality
    }
  }

  static async logGoalSet(userId: string, goalData: any): Promise<void> {
    return this.logActivity({
      userId,
      actionType: 'goal_set',
      actionDetails: {
        goalType: goalData.type,
        target: goalData.target,
        period: goalData.period
      }
    });
  }

  static async logProfileUpdate(userId: string, updatedFields: string[]): Promise<void> {
    return this.logActivity({
      userId,
      actionType: 'profile_updated',
      actionDetails: {
        updatedFields,
        timestamp: new Date().toISOString()
      }
    });
  }

  static async logSubscriptionChange(userId: string, subscriptionData: any): Promise<void> {
    return this.logActivity({
      userId,
      actionType: 'subscription_changed',
      actionDetails: {
        newStatus: subscriptionData.status,
        previousStatus: subscriptionData.previousStatus,
        plan: subscriptionData.plan
      }
    });
  }

  static async logMealLogged(userId: string, mealData: any): Promise<void> {
    return this.logActivity({
      userId,
      actionType: 'meal_logged',
      actionDetails: {
        foodName: mealData.name,
        calories: mealData.calories,
        mealType: mealData.mealType
      }
    });
  }

  static async logPersonalPlanCreated(userId: string, planData: any): Promise<void> {
    return this.logActivity({
      userId,
      actionType: 'personal_plan_created',
      actionDetails: {
        planType: planData.type,
        workoutsPerWeek: planData.workoutsPerWeek,
        sessionDuration: planData.sessionDuration,
        goals: planData.goals
      }
    });
  }
}