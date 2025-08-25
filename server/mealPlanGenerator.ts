import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MealPlanGenerationOptions {
  goal: "weight_loss" | "weight_gain" | "maintenance";
  dailyCalories: number;
  dietaryRestrictions?: string[];
  preferences?: string[];
  allergies?: string[];
  mealsPerDay?: number;
  duration?: number; // days
}

export interface GeneratedMealPlan {
  name: string;
  description: string;
  goal: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  duration: number;
  days: {
    dayNumber: number;
    name: string;
    meals: {
      mealType: "breakfast" | "lunch" | "dinner" | "snack";
      name: string;
      description: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      ingredients: string[];
      instructions: string[];
      prepTime: number;
      servings: number;
    }[];
  }[];
}

export async function generatePersonalizedMealPlan(options: MealPlanGenerationOptions): Promise<GeneratedMealPlan> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const {
    goal,
    dailyCalories,
    dietaryRestrictions = [],
    preferences = [],
    allergies = [],
    mealsPerDay = 4,
    duration = 7
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a certified nutritionist and meal planning expert. Create personalized meal plans based on user goals and preferences.

Key requirements:
1. Create balanced meals that meet the daily caloric and macro targets
2. Ensure meals are practical, affordable, and easy to prepare
3. Include variety across the week to prevent boredom
4. Consider dietary restrictions, allergies, and preferences
5. Provide detailed nutritional breakdowns for each meal
6. Include clear, step-by-step cooking instructions
7. Estimate realistic preparation times

Respond with JSON in this exact format:
{
  "name": "Descriptive meal plan name based on goal",
  "description": "Brief description of the meal plan and its benefits",
  "goal": "${goal}",
  "dailyCalories": ${dailyCalories},
  "dailyProtein": number (grams - target 20-30% of calories),
  "dailyCarbs": number (grams - adjust based on goal),
  "dailyFat": number (grams - 20-35% of calories),
  "duration": ${duration},
  "days": [
    {
      "dayNumber": 1,
      "name": "Day 1",
      "meals": [
        {
          "mealType": "breakfast/lunch/dinner/snack",
          "name": "Meal name",
          "description": "Brief description",
          "calories": number,
          "protein": number (grams),
          "carbs": number (grams),
          "fat": number (grams),
          "ingredients": ["ingredient 1", "ingredient 2"],
          "instructions": ["step 1", "step 2"],
          "prepTime": number (minutes),
          "servings": 1
        }
      ]
    }
  ]
}`
        },
        {
          role: "user",
          content: `Create a ${duration}-day meal plan with the following specifications:

Goal: ${goal}
Daily Calories: ${dailyCalories}
Meals per day: ${mealsPerDay}
${dietaryRestrictions.length > 0 ? `Dietary Restrictions: ${dietaryRestrictions.join(', ')}` : ''}
${allergies.length > 0 ? `Allergies: ${allergies.join(', ')}` : ''}
${preferences.length > 0 ? `Preferences: ${preferences.join(', ')}` : ''}

Guidelines based on goal:
${goal === 'weight_loss' ? '- Focus on high protein, moderate carbs, healthy fats\n- Include plenty of vegetables and lean proteins\n- Emphasize satiety and nutrient density' : ''}
${goal === 'weight_gain' ? '- Include calorie-dense, nutritious foods\n- Focus on healthy weight gain with adequate protein\n- Include healthy fats and complex carbohydrates' : ''}
${goal === 'maintenance' ? '- Create balanced meals for sustained energy\n- Focus on variety and nutritional completeness\n- Include all food groups in appropriate portions' : ''}

Please ensure each day's meals total approximately ${dailyCalories} calories and provide a good balance of macronutrients. Make the meals practical for someone with basic cooking skills.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the structure
    if (!result.name || !result.days || !Array.isArray(result.days)) {
      throw new Error("Invalid meal plan structure generated");
    }

    // Ensure we have the right number of days
    if (result.days.length !== duration) {
      throw new Error(`Expected ${duration} days, got ${result.days.length}`);
    }

    // Validate each day has meals
    for (const day of result.days) {
      if (!day.meals || !Array.isArray(day.meals) || day.meals.length === 0) {
        throw new Error(`Day ${day.dayNumber} has no meals`);
      }
    }

    return result as GeneratedMealPlan;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new Error("Failed to generate meal plan. Please try again.");
  }
}

export async function generateWeeklyMealPlan(
  userId: string,
  userPreferences: {
    goal: "weight_loss" | "weight_gain" | "maintenance";
    dailyCalories: number;
    dietaryRestrictions?: string[];
    preferences?: string[];
    allergies?: string[];
  }
): Promise<GeneratedMealPlan> {
  const options: MealPlanGenerationOptions = {
    ...userPreferences,
    duration: 7,
    mealsPerDay: 4
  };

  return generatePersonalizedMealPlan(options);
}