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

// Mock meal plan generator for testing/fallback
function generateMockMealPlan(options: MealPlanGenerationOptions): GeneratedMealPlan {
  const {
    goal,
    dailyCalories,
    dietaryRestrictions = [],
    preferences = [],
    allergies = [],
    duration = 7
  } = options;

  // Calculate macros based on goal
  let proteinPercent = 0.25; // 25% protein
  let carbPercent = 0.45; // 45% carbs
  let fatPercent = 0.30; // 30% fat

  if (goal === 'weight_loss') {
    proteinPercent = 0.30;
    carbPercent = 0.35;
    fatPercent = 0.35;
  } else if (goal === 'weight_gain') {
    proteinPercent = 0.25;
    carbPercent = 0.50;
    fatPercent = 0.25;
  }

  const dailyProtein = Math.round((dailyCalories * proteinPercent) / 4);
  const dailyCarbs = Math.round((dailyCalories * carbPercent) / 4);
  const dailyFat = Math.round((dailyCalories * fatPercent) / 9);

  const goalNames = {
    weight_loss: "Weight Loss Meal Plan",
    weight_gain: "Weight Gain Meal Plan", 
    maintenance: "Balanced Maintenance Plan"
  };

  const goalDescriptions = {
    weight_loss: "A balanced meal plan designed to support healthy weight loss with high protein and nutrient-dense foods.",
    weight_gain: "A calorie-rich meal plan focused on healthy weight gain with nutritious, energy-dense foods.",
    maintenance: "A well-balanced meal plan to maintain your current weight while supporting overall health and wellness."
  };

  // Sample meals based on dietary restrictions
  const isVegetarian = dietaryRestrictions.some(r => r.toLowerCase().includes('vegetarian'));
  const isVegan = dietaryRestrictions.some(r => r.toLowerCase().includes('vegan'));
  const isGlutenFree = dietaryRestrictions.some(r => r.toLowerCase().includes('gluten'));

  const sampleMeals = {
    breakfast: [
      {
        name: isVegan ? "Oatmeal with Berries and Nuts" : "Greek Yogurt Parfait",
        description: isVegan ? "Creamy oatmeal topped with fresh berries and almonds" : "Protein-rich yogurt with granola and fresh fruit",
        calories: Math.round(dailyCalories * 0.25),
        protein: Math.round(dailyProtein * 0.25),
        carbs: Math.round(dailyCarbs * 0.30),
        fat: Math.round(dailyFat * 0.20),
        ingredients: isVegan ? ["Rolled oats", "Almond milk", "Mixed berries", "Almonds", "Maple syrup"] : ["Greek yogurt", "Granola", "Fresh berries", "Honey"],
        instructions: ["Prepare base ingredient", "Add toppings", "Mix and enjoy"],
        prepTime: 10,
        servings: 1
      }
    ],
    lunch: [
      {
        name: isVegan ? "Quinoa Buddha Bowl" : (isVegetarian ? "Caprese Salad with Quinoa" : "Grilled Chicken Salad"),
        description: "Nutritious and filling midday meal",
        calories: Math.round(dailyCalories * 0.30),
        protein: Math.round(dailyProtein * 0.35),
        carbs: Math.round(dailyCarbs * 0.35),
        fat: Math.round(dailyFat * 0.30),
        ingredients: isVegan ? ["Quinoa", "Chickpeas", "Mixed vegetables", "Tahini dressing"] : (isVegetarian ? ["Quinoa", "Fresh mozzarella", "Tomatoes", "Basil"] : ["Grilled chicken", "Mixed greens", "Vegetables", "Olive oil dressing"]),
        instructions: ["Prepare main ingredient", "Add accompaniments", "Dress and serve"],
        prepTime: 20,
        servings: 1
      }
    ],
    dinner: [
      {
        name: isVegan ? "Lentil Curry with Brown Rice" : (isVegetarian ? "Vegetable Stir-fry with Tofu" : "Baked Salmon with Quinoa"),
        description: "Satisfying and nutritious dinner",
        calories: Math.round(dailyCalories * 0.35),
        protein: Math.round(dailyProtein * 0.30),
        carbs: Math.round(dailyCarbs * 0.25),
        fat: Math.round(dailyFat * 0.35),
        ingredients: isVegan ? ["Red lentils", "Coconut milk", "Spices", "Brown rice"] : (isVegetarian ? ["Tofu", "Mixed vegetables", "Soy sauce", "Brown rice"] : ["Salmon fillet", "Quinoa", "Vegetables", "Herbs"]),
        instructions: ["Prepare protein", "Cook grains/base", "Combine and season"],
        prepTime: 30,
        servings: 1
      }
    ],
    snack: [
      {
        name: "Healthy Snack",
        description: "Nutritious snack to keep energy stable",
        calories: Math.round(dailyCalories * 0.10),
        protein: Math.round(dailyProtein * 0.10),
        carbs: Math.round(dailyCarbs * 0.10),
        fat: Math.round(dailyFat * 0.15),
        ingredients: isVegan ? ["Apple", "Almond butter"] : ["Greek yogurt", "Berries"],
        instructions: ["Prepare snack", "Enjoy"],
        prepTime: 5,
        servings: 1
      }
    ]
  };

  // Generate days
  const days = [];
  for (let i = 1; i <= duration; i++) {
    days.push({
      dayNumber: i,
      name: `Day ${i}`,
      meals: [
        { mealType: "breakfast" as const, ...sampleMeals.breakfast[0] },
        { mealType: "lunch" as const, ...sampleMeals.lunch[0] },
        { mealType: "dinner" as const, ...sampleMeals.dinner[0] },
        { mealType: "snack" as const, ...sampleMeals.snack[0] }
      ]
    });
  }

  return {
    name: goalNames[goal],
    description: goalDescriptions[goal],
    goal,
    dailyCalories,
    dailyProtein,
    dailyCarbs,
    dailyFat,
    duration,
    days
  };
}

export async function generatePersonalizedMealPlan(options: MealPlanGenerationOptions): Promise<GeneratedMealPlan> {
  if (!process.env.OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY not configured, using mock meal plan");
    return generateMockMealPlan(options);
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
    
    // Fallback to mock data if OpenAI API fails
    console.log("OpenAI API failed, falling back to mock meal plan");
    return generateMockMealPlan(options);
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