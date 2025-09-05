import { storage } from "./storage";
import { aiDifficultyService } from "./ai-difficulty-service";
import type { User, Exercise } from "../shared/schema";

export interface AutoAdjustmentResult {
  userId: string;
  exerciseId: string;
  currentDifficulty: number;
  suggestedDifficulty: number;
  adjustmentReason: string;
  confidence: number;
  shouldNotify: boolean;
}

export class AutoDifficultyAdjuster {
  /**
   * Analyzes all users and their workout patterns to suggest difficulty adjustments
   */
  async processAllUsers(): Promise<AutoAdjustmentResult[]> {
    const users = await storage.getUsers();
    const adjustmentResults: AutoAdjustmentResult[] = [];

    for (const user of users) {
      const userAdjustments = await this.processUserAdjustments(user.id);
      adjustmentResults.push(...userAdjustments);
    }

    return adjustmentResults;
  }

  /**
   * Processes difficulty adjustments for a specific user
   */
  async processUserAdjustments(userId: string): Promise<AutoAdjustmentResult[]> {
    try {
      // Get user's recent workouts to identify exercises they've been doing
      const recentWorkouts = await storage.getWorkouts(userId);
      
      if (recentWorkouts.length === 0) {
        return [];
      }

      // Get unique exercises from recent workouts
      const uniqueExerciseIds = new Set<string>();
      
      // Get workout exercises for each recent workout to find unique exercises
      for (const workout of recentWorkouts.slice(0, 10)) { // Last 10 workouts
        const workoutExercises = await storage.getWorkoutExercises(workout.id);
        workoutExercises.forEach(we => uniqueExerciseIds.add(we.exerciseId));
      }

      const adjustmentResults: AutoAdjustmentResult[] = [];

      // Analyze each exercise for potential difficulty adjustments
      for (const exerciseId of uniqueExerciseIds) {
        const analysis = await aiDifficultyService.analyzePerformanceAndSuggestDifficulty(
          userId,
          exerciseId
        );

        if (analysis && this.shouldSuggestAdjustment(analysis)) {
          const exercise = await storage.getExercise(exerciseId);
          
          adjustmentResults.push({
            userId,
            exerciseId,
            currentDifficulty: analysis.currentDifficulty,
            suggestedDifficulty: analysis.suggestedDifficulty,
            adjustmentReason: this.generateAdjustmentReason(analysis),
            confidence: analysis.confidenceScore,
            shouldNotify: analysis.confidenceScore >= 70, // Only notify for high-confidence suggestions
          });
        }
      }

      return adjustmentResults;
    } catch (error) {
      console.error(`Error processing user adjustments for ${userId}:`, error);
      return [];
    }
  }

  /**
   * Determines if an adjustment should be suggested based on AI analysis
   */
  private shouldSuggestAdjustment(analysis: any): boolean {
    // Don't suggest if confidence is too low
    if (analysis.confidenceScore < 50) return false;

    // Don't suggest if the change is minimal
    const difficultyChange = Math.abs(analysis.suggestedDifficulty - analysis.currentDifficulty);
    if (difficultyChange < 0.5) return false;

    // Don't suggest extreme changes
    if (difficultyChange > 2) return false;

    // Additional logic based on performance trends
    if (analysis.performanceTrend === "declining" && analysis.suggestedDifficulty > analysis.currentDifficulty) {
      // Don't increase difficulty if performance is declining unless confidence is very high
      return analysis.confidenceScore >= 80;
    }

    return true;
  }

  /**
   * Generates a human-readable reason for the difficulty adjustment
   */
  private generateAdjustmentReason(analysis: any): string {
    const { performanceTrend, currentDifficulty, suggestedDifficulty, reasoningFactors } = analysis;
    const isIncrease = suggestedDifficulty > currentDifficulty;
    
    if (performanceTrend === "improving") {
      if (isIncrease) {
        return `Your performance has been consistently improving! Time to challenge yourself with a higher difficulty.`;
      } else {
        return `You're improving steadily. Consider maintaining current difficulty for better consistency.`;
      }
    } else if (performanceTrend === "declining") {
      if (!isIncrease) {
        return `Recent workouts show some struggle. Let's dial back the difficulty to rebuild confidence and form.`;
      } else {
        return `Despite some challenges, your overall trend shows readiness for progression.`;
      }
    } else {
      // Stable performance
      if (isIncrease) {
        return `Your performance is stable and consistent. Ready to take on a new challenge!`;
      } else {
        return `Let's optimize your current level before progressing to maintain quality workouts.`;
      }
    }
  }

  /**
   * Applies automatic difficulty adjustments for a user (with their consent)
   */
  async applyAutomaticAdjustments(userId: string, exerciseIds: string[]): Promise<boolean[]> {
    const results: boolean[] = [];

    for (const exerciseId of exerciseIds) {
      try {
        // Get pending adjustments for this user and exercise
        const pendingAdjustments = await aiDifficultyService.getPendingAdjustments(userId);
        const relevantAdjustment = pendingAdjustments.find(adj => adj.exerciseId === exerciseId);

        if (relevantAdjustment) {
          const applied = await aiDifficultyService.applyDifficultyAdjustment(relevantAdjustment.id);
          results.push(applied);
        } else {
          results.push(false);
        }
      } catch (error) {
        console.error(`Error applying adjustment for exercise ${exerciseId}:`, error);
        results.push(false);
      }
    }

    return results;
  }

  /**
   * Gets intelligent workout recommendations based on user's performance patterns
   */
  async getIntelligentRecommendations(userId: string): Promise<{
    exercises: Array<{
      exerciseId: string;
      exerciseName: string;
      recommendedDifficulty: number;
      reason: string;
      confidence: number;
    }>;
    overallRecommendation: string;
  }> {
    try {
      const adjustments = await this.processUserAdjustments(userId);
      const exercises = [];

      for (const adjustment of adjustments) {
        const exercise = await storage.getExercise(adjustment.exerciseId);
        if (exercise) {
          exercises.push({
            exerciseId: adjustment.exerciseId,
            exerciseName: exercise.name,
            recommendedDifficulty: adjustment.suggestedDifficulty,
            reason: adjustment.adjustmentReason,
            confidence: adjustment.confidence,
          });
        }
      }

      // Generate overall recommendation
      let overallRecommendation = "Keep up the great work! ";
      
      const increasingCount = adjustments.filter(a => a.suggestedDifficulty > a.currentDifficulty).length;
      const decreasingCount = adjustments.filter(a => a.suggestedDifficulty < a.currentDifficulty).length;
      
      if (increasingCount > decreasingCount) {
        overallRecommendation += "You're ready to challenge yourself with higher difficulty levels across multiple exercises.";
      } else if (decreasingCount > increasingCount) {
        overallRecommendation += "Focus on form and consistency. Consider reducing difficulty to build a strong foundation.";
      } else {
        overallRecommendation += "Your training is well-balanced. Make selective adjustments based on individual exercise performance.";
      }

      return {
        exercises: exercises.slice(0, 5), // Limit to top 5 recommendations
        overallRecommendation,
      };
    } catch (error) {
      console.error(`Error generating recommendations for user ${userId}:`, error);
      return {
        exercises: [],
        overallRecommendation: "Unable to generate recommendations at this time. Please try again later.",
      };
    }
  }

  /**
   * Runs the daily auto-adjustment process for all users
   */
  async runDailyAdjustmentProcess(): Promise<{
    processed: number;
    adjustmentsSuggested: number;
    highConfidenceAdjustments: number;
  }> {
    console.log("Starting daily auto-adjustment process...");
    
    const allAdjustments = await this.processAllUsers();
    const highConfidenceAdjustments = allAdjustments.filter(adj => adj.shouldNotify);
    
    console.log(`Processed ${allAdjustments.length} potential adjustments`);
    console.log(`${highConfidenceAdjustments.length} high-confidence adjustments ready for notification`);

    return {
      processed: allAdjustments.length,
      adjustmentsSuggested: allAdjustments.length,
      highConfidenceAdjustments: highConfidenceAdjustments.length,
    };
  }
}

export const autoDifficultyAdjuster = new AutoDifficultyAdjuster();