import { storage } from "./storage";
import { generateWeeklyMealPlan } from "./mealPlanGenerator";

export class WeeklyMealPlanScheduler {
  private isRunning = false;

  // Generate meal plans for all users who have auto-generation enabled
  async generateWeeklyMealPlans(): Promise<{ success: number; failed: number; results: any[] }> {
    if (this.isRunning) {
      console.log("Weekly meal plan generation already running, skipping...");
      return { success: 0, failed: 0, results: [] };
    }

    this.isRunning = true;
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    try {
      console.log("Starting weekly meal plan generation...");
      const usersForGeneration = await storage.getUsersForWeeklyMealPlanGeneration();
      
      console.log(`Found ${usersForGeneration.length} users for meal plan generation`);

      for (const { userId, preferences } of usersForGeneration) {
        try {
          console.log(`Generating meal plan for user ${userId}`);
          
          const generatedPlan = await generateWeeklyMealPlan(userId, {
            goal: preferences.goal as "weight_loss" | "weight_gain" | "maintenance",
            dailyCalories: preferences.dailyCalories,
            dietaryRestrictions: preferences.dietaryRestrictions || [],
            preferences: preferences.preferences || [],
            allergies: preferences.allergies || []
          });

          // Save the generated meal plan
          const mealPlan = await storage.createAIMealPlan(
            {
              name: `${generatedPlan.name} (Auto-Generated)`,
              description: `${generatedPlan.description} - Auto-generated weekly meal plan`,
              goal: generatedPlan.goal,
              dailyCalories: generatedPlan.dailyCalories,
              dailyProtein: generatedPlan.dailyProtein,
              dailyCarbs: generatedPlan.dailyCarbs,
              dailyFat: generatedPlan.dailyFat,
              duration: generatedPlan.duration,
            },
            generatedPlan.days
          );

          // Assign to user
          await storage.assignMealPlan({
            userId,
            mealPlanId: mealPlan.id,
            startDate: new Date(),
            isActive: true
          });

          // Update last generation date
          await storage.updateUserMealPreferences(userId, {
            lastGeneratedAt: new Date()
          });

          results.push({ userId, success: true, mealPlanId: mealPlan.id, mealPlanName: mealPlan.name });
          successCount++;
          
          console.log(`Successfully generated meal plan for user ${userId}: ${mealPlan.name}`);
        } catch (error) {
          console.error(`Error generating meal plan for user ${userId}:`, error);
          results.push({ userId, success: false, error: error.message });
          failedCount++;
        }
      }

      console.log(`Weekly meal plan generation completed: ${successCount} successful, ${failedCount} failed`);
      return { success: successCount, failed: failedCount, results };
    } finally {
      this.isRunning = false;
    }
  }

  // Start a simple interval-based scheduler (runs every 7 days)
  startScheduler(): void {
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    // Run immediately on startup
    setTimeout(() => {
      this.generateWeeklyMealPlans().catch(error => {
        console.error("Error in scheduled weekly meal plan generation:", error);
      });
    }, 5000); // Wait 5 seconds after startup

    // Then run every 7 days
    setInterval(() => {
      this.generateWeeklyMealPlans().catch(error => {
        console.error("Error in scheduled weekly meal plan generation:", error);
      });
    }, SEVEN_DAYS);

    console.log("Weekly meal plan scheduler started - will run every 7 days");
  }

  // For testing - generate immediately for a specific user
  async generateForUser(userId: string): Promise<any> {
    const preferences = await storage.getUserMealPreferences(userId);
    if (!preferences) {
      throw new Error("User meal preferences not found");
    }

    const generatedPlan = await generateWeeklyMealPlan(userId, {
      goal: preferences.goal as "weight_loss" | "weight_gain" | "maintenance",
      dailyCalories: preferences.dailyCalories,
      dietaryRestrictions: preferences.dietaryRestrictions || [],
      preferences: preferences.preferences || [],
      allergies: preferences.allergies || []
    });

    const mealPlan = await storage.createAIMealPlan(
      {
        name: `${generatedPlan.name} (Manual Generation)`,
        description: `${generatedPlan.description} - Manually generated meal plan`,
        goal: generatedPlan.goal,
        dailyCalories: generatedPlan.dailyCalories,
        dailyProtein: generatedPlan.dailyProtein,
        dailyCarbs: generatedPlan.dailyCarbs,
        dailyFat: generatedPlan.dailyFat,
        duration: generatedPlan.duration,
      },
      generatedPlan.days
    );

    await storage.assignMealPlan({
      userId,
      mealPlanId: mealPlan.id,
      startDate: new Date(),
      isActive: true
    });

    await storage.updateUserMealPreferences(userId, {
      lastGeneratedAt: new Date()
    });

    return { mealPlan, message: "Meal plan generated successfully!" };
  }
}

export const weeklyMealPlanScheduler = new WeeklyMealPlanScheduler();