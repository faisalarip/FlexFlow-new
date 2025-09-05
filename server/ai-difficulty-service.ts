import OpenAI from "openai";
import { storage } from "./storage";
import type { 
  Workout, 
  WorkoutExercise, 
  AiDifficultyAdjustment, 
  InsertAiDifficultyAdjustment 
} from "../shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PerformanceAnalysis {
  userId: string;
  exerciseId: string;
  currentDifficulty: number;
  suggestedDifficulty: number;
  confidenceScore: number;
  performanceTrend: "improving" | "declining" | "stable";
  reasoningFactors: {
    recentCompletionRate: number;
    progressTrend: string;
    consistencyScore: number;
    exertionPattern: string;
    recommendations: string[];
  };
}

export class AiDifficultyService {
  /**
   * Analyzes user performance data for a specific exercise and suggests difficulty adjustments
   */
  async analyzePerformanceAndSuggestDifficulty(
    userId: string, 
    exerciseId: string
  ): Promise<PerformanceAnalysis | null> {
    try {
      // Get recent workout data for this user and exercise (last 10 workouts)
      const recentWorkouts = await storage.getRecentWorkoutsForExercise(userId, exerciseId, 10);
      
      if (recentWorkouts.length < 3) {
        // Need at least 3 workouts to make meaningful analysis
        return null;
      }

      // Prepare performance data for AI analysis
      const performanceData = this.preparePerformanceData(recentWorkouts);
      
      // Use AI to analyze the data and suggest improvements
      const aiAnalysis = await this.getAiAnalysis(performanceData);
      
      // Calculate confidence score based on data quality and consistency
      const confidenceScore = this.calculateConfidenceScore(recentWorkouts);
      
      const analysis: PerformanceAnalysis = {
        userId,
        exerciseId,
        currentDifficulty: recentWorkouts[0].difficultyLevel || 3,
        suggestedDifficulty: aiAnalysis.suggestedDifficulty,
        confidenceScore,
        performanceTrend: aiAnalysis.performanceTrend,
        reasoningFactors: {
          recentCompletionRate: this.calculateCompletionRate(recentWorkouts),
          progressTrend: aiAnalysis.progressTrend,
          consistencyScore: this.calculateConsistencyScore(recentWorkouts),
          exertionPattern: aiAnalysis.exertionPattern,
          recommendations: aiAnalysis.recommendations
        }
      };

      // Store the AI suggestion in the database
      await this.storeDifficultyAdjustment(analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing performance:', error);
      return null;
    }
  }

  /**
   * Gets AI analysis using OpenAI GPT
   */
  private async getAiAnalysis(performanceData: any) {
    const prompt = `Analyze this fitness performance data and suggest difficulty adjustments:

${JSON.stringify(performanceData, null, 2)}

Please provide your analysis in the following JSON format:
{
  "suggestedDifficulty": number (1-5 scale),
  "performanceTrend": "improving" | "declining" | "stable",
  "progressTrend": "string describing the trend",
  "exertionPattern": "string describing exertion patterns",
  "recommendations": ["array", "of", "specific", "recommendations"]
}

Consider factors like:
- Completion rates over time
- Perceived exertion ratings
- Performance consistency
- Progressive overload principles
- Recovery and adaptation patterns

Provide specific, actionable recommendations for difficulty adjustment.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert fitness coach and exercise physiologist. Analyze workout performance data to suggest optimal difficulty adjustments for progressive training."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3 // Lower temperature for more consistent analysis
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Prepares workout data for AI analysis
   */
  private preparePerformanceData(workouts: (Workout & { exercises: WorkoutExercise[] })[]) {
    return {
      totalWorkouts: workouts.length,
      timeSpan: {
        start: workouts[workouts.length - 1].date,
        end: workouts[0].date
      },
      workouts: workouts.map((workout, index) => ({
        date: workout.date,
        difficultyLevel: workout.difficultyLevel,
        perceivedExertion: workout.perceivedExertion,
        completionRate: workout.completionRate,
        duration: workout.duration,
        exercises: workout.exercises.map(ex => ({
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          targetWeight: ex.targetWeight,
          completed: ex.completed,
          difficultyAdjustment: ex.difficultyAdjustment
        })),
        workoutNumber: workouts.length - index // Most recent is #1
      }))
    };
  }

  /**
   * Calculates completion rate from recent workouts
   */
  private calculateCompletionRate(workouts: (Workout & { exercises: WorkoutExercise[] })[]): number {
    if (workouts.length === 0) return 100;
    
    const totalCompletionRate = workouts.reduce((sum, workout) => sum + (workout.completionRate || 100), 0);
    return Math.round(totalCompletionRate / workouts.length);
  }

  /**
   * Calculates consistency score based on performance variance
   */
  private calculateConsistencyScore(workouts: (Workout & { exercises: WorkoutExercise[] })[]): number {
    if (workouts.length < 2) return 100;

    // Calculate variance in completion rates
    const completionRates = workouts.map(w => w.completionRate || 100);
    const mean = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
    const variance = completionRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / completionRates.length;
    
    // Convert variance to consistency score (lower variance = higher consistency)
    const consistencyScore = Math.max(0, Math.min(100, 100 - (variance / 10)));
    return Math.round(consistencyScore);
  }

  /**
   * Calculates confidence score for AI recommendation
   */
  private calculateConfidenceScore(workouts: (Workout & { exercises: WorkoutExercise[] })[]): number {
    let score = 50; // Base score
    
    // More workouts = higher confidence
    score += Math.min(30, workouts.length * 3);
    
    // Recent data = higher confidence
    const daysSinceLastWorkout = (Date.now() - new Date(workouts[0].date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastWorkout <= 7) score += 15;
    else if (daysSinceLastWorkout <= 14) score += 10;
    
    // Consistent data = higher confidence
    const consistency = this.calculateConsistencyScore(workouts);
    score += consistency * 0.05;
    
    return Math.min(100, Math.max(10, Math.round(score)));
  }

  /**
   * Stores the difficulty adjustment suggestion in the database
   */
  private async storeDifficultyAdjustment(analysis: PerformanceAnalysis): Promise<void> {
    const adjustment: InsertAiDifficultyAdjustment = {
      userId: analysis.userId,
      exerciseId: analysis.exerciseId,
      currentDifficulty: analysis.currentDifficulty,
      suggestedDifficulty: analysis.suggestedDifficulty,
      confidenceScore: analysis.confidenceScore,
      reasoningFactors: analysis.reasoningFactors,
      performanceTrend: analysis.performanceTrend,
      applied: false
    };

    await storage.createAiDifficultyAdjustment(adjustment);
  }

  /**
   * Gets pending difficulty adjustments for a user
   */
  async getPendingAdjustments(userId: string): Promise<AiDifficultyAdjustment[]> {
    return await storage.getPendingAiAdjustments(userId);
  }

  /**
   * Applies a difficulty adjustment suggestion
   */
  async applyDifficultyAdjustment(adjustmentId: string): Promise<boolean> {
    try {
      await storage.applyAiDifficultyAdjustment(adjustmentId);
      return true;
    } catch (error) {
      console.error('Error applying difficulty adjustment:', error);
      return false;
    }
  }
}

export const aiDifficultyService = new AiDifficultyService();