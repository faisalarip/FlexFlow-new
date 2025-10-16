import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
});

interface WorkoutPreferences {
  fitnessLevel: string;
  primaryGoals: string[];
  workoutDaysPerWeek: number;
  sessionDuration: number;
  availableEquipment: string[];
  preferredWorkoutTypes: string[];
  injuriesOrLimitations: string[];
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
}

interface DailyWorkout {
  dayOfWeek: number;
  weekNumber: number;
  workoutType: string;
  name: string;
  description: string;
  exercises: Exercise[];
  estimatedDuration: number;
  targetCalories: number;
  isRestDay: boolean;
}

export class AIWorkoutGenerator {
  async generatePersonalizedPlan(preferences: WorkoutPreferences): Promise<DailyWorkout[]> {
    try {
      const prompt = this.buildWorkoutPrompt(preferences);
      
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert personal trainer and exercise physiologist. Create safe, effective, and personalized workout plans based on user preferences, goals, and limitations. Always provide specific exercises with sets, reps, and proper form cues."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiPlan = JSON.parse(response.choices[0].message.content || '{}');
      return this.formatWorkoutPlan(aiPlan, preferences);
    } catch (error) {
      console.error("Error generating AI workout plan:", error);
      throw new Error("Failed to generate personalized workout plan");
    }
  }

  private buildWorkoutPrompt(preferences: WorkoutPreferences): string {
    const equipmentList = preferences.availableEquipment.join(', ') || 'bodyweight only';
    const goalsList = preferences.primaryGoals.join(', ');
    const limitations = preferences.injuriesOrLimitations.filter(l => l !== 'none').join(', ') || 'none';
    const workoutTypes = preferences.preferredWorkoutTypes.join(', ') || 'any';

    return `Create a personalized 4-week workout plan with the following requirements:

**User Profile:**
- Fitness Level: ${preferences.fitnessLevel}
- Primary Goals: ${goalsList}
- Workout Days Per Week: ${preferences.workoutDaysPerWeek}
- Session Duration: ${preferences.sessionDuration} minutes
- Available Equipment: ${equipmentList}
- Preferred Workout Types: ${workoutTypes}
- Injuries/Limitations: ${limitations}

**Requirements:**
1. Generate exactly ${preferences.workoutDaysPerWeek} workout days per week (distribute them properly throughout the week)
2. Each workout should fit within ${preferences.sessionDuration} minutes
3. Include specific exercises with sets, reps/duration, and rest periods
4. Consider the user's limitations and avoid exercises that may cause injury
5. Progressive overload - gradually increase difficulty over the 4 weeks
6. Balance muscle groups and workout types based on goals
7. Include rest days on non-workout days

**Output Format (JSON):**
{
  "plan": {
    "weeks": [
      {
        "weekNumber": 1,
        "workouts": [
          {
            "dayOfWeek": 1,  // 0=Sunday, 1=Monday, etc.
            "isRestDay": false,
            "workoutType": "strength|cardio|yoga|functional",
            "name": "Workout Name",
            "description": "Brief workout description",
            "estimatedDuration": ${preferences.sessionDuration},
            "targetCalories": 300,
            "exercises": [
              {
                "name": "Exercise name",
                "sets": 3,
                "reps": "12" or "30 seconds" for timed exercises,
                "restSeconds": 60,
                "notes": "Form cues and tips"
              }
            ]
          }
        ]
      }
    ]
  }
}

Focus on exercises that:
- Match available equipment: ${equipmentList}
- Are safe for limitations: ${limitations}
- Align with goals: ${goalsList}
- Suit fitness level: ${preferences.fitnessLevel}

Make the plan progressive, balanced, and achievable!`;
  }

  private formatWorkoutPlan(aiPlan: any, preferences: WorkoutPreferences): DailyWorkout[] {
    const formattedWorkouts: DailyWorkout[] = [];
    
    if (!aiPlan.plan?.weeks) {
      throw new Error("Invalid AI response format");
    }

    // Process all 4 weeks
    aiPlan.plan.weeks.forEach((week: any) => {
      const weekNumber = week.weekNumber;
      
      // Create a full week array (7 days)
      const weekDays = Array(7).fill(null).map((_, dayIndex) => {
        // Find if there's a workout for this day
        const workout = week.workouts?.find((w: any) => w.dayOfWeek === dayIndex);
        
        if (workout && !workout.isRestDay) {
          return {
            dayOfWeek: dayIndex,
            weekNumber,
            workoutType: workout.workoutType,
            name: workout.name,
            description: workout.description,
            exercises: workout.exercises || [],
            estimatedDuration: workout.estimatedDuration || preferences.sessionDuration,
            targetCalories: workout.targetCalories || this.estimateCalories(workout.estimatedDuration, workout.workoutType),
            isRestDay: false
          };
        } else {
          // Rest day
          return {
            dayOfWeek: dayIndex,
            weekNumber,
            workoutType: 'rest',
            name: 'Rest Day',
            description: 'Recovery day - light stretching or walking optional',
            exercises: [],
            estimatedDuration: 0,
            targetCalories: 0,
            isRestDay: true
          };
        }
      });

      formattedWorkouts.push(...weekDays);
    });

    return formattedWorkouts;
  }

  private estimateCalories(duration: number, workoutType: string): number {
    const caloriesPerMinute: { [key: string]: number } = {
      strength: 5,
      cardio: 8,
      yoga: 3,
      functional: 6,
      rest: 0
    };

    const rate = caloriesPerMinute[workoutType] || 5;
    return Math.round(duration * rate);
  }
}

export const aiWorkoutGenerator = new AIWorkoutGenerator();
