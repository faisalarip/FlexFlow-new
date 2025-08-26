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

// Enhanced meal plan generator with user food preferences
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

  // Create diverse meal database with various options
  const proteinFoods = ["Chicken breast", "Salmon", "Eggs", "Greek yogurt", "Tofu", "Lentils", "Chickpeas", "Turkey", "Cottage cheese", "Quinoa"];
  const carbFoods = ["Brown rice", "Quinoa", "Oats", "Sweet potato", "Whole grain bread", "Pasta", "Barley", "Buckwheat"];
  const vegetables = ["Broccoli", "Spinach", "Bell peppers", "Carrots", "Tomatoes", "Cucumber", "Kale", "Zucchini", "Brussels sprouts"];
  const fruits = ["Berries", "Apple", "Banana", "Orange", "Avocado", "Grapes", "Mango", "Pineapple"];
  const fats = ["Olive oil", "Almonds", "Walnuts", "Seeds", "Avocado oil", "Coconut oil"];

  // Filter foods based on preferences
  const likedFoods = preferences.map(p => p.toLowerCase());
  const availableProteins = proteinFoods.filter(food => 
    likedFoods.length === 0 || likedFoods.some(liked => food.toLowerCase().includes(liked) || liked.includes(food.toLowerCase()))
  );
  const availableCarbs = carbFoods.filter(food => 
    likedFoods.length === 0 || likedFoods.some(liked => food.toLowerCase().includes(liked) || liked.includes(food.toLowerCase()))
  );
  const availableVeggies = vegetables.filter(food => 
    likedFoods.length === 0 || likedFoods.some(liked => food.toLowerCase().includes(liked) || liked.includes(food.toLowerCase()))
  );
  const availableFruits = fruits.filter(food => 
    likedFoods.length === 0 || likedFoods.some(liked => food.toLowerCase().includes(liked) || liked.includes(food.toLowerCase()))
  );

  // Dietary restrictions
  const isVegetarian = dietaryRestrictions.some(r => r.toLowerCase().includes('vegetarian'));
  const isVegan = dietaryRestrictions.some(r => r.toLowerCase().includes('vegan'));

  // Filter proteins based on dietary restrictions
  const finalProteins = isVegan 
    ? availableProteins.filter(p => !["Chicken breast", "Salmon", "Eggs", "Greek yogurt", "Turkey", "Cottage cheese"].includes(p))
    : isVegetarian 
    ? availableProteins.filter(p => !["Chicken breast", "Salmon", "Turkey"].includes(p))
    : availableProteins;

  // Generate varied meal options for each day
  const generateMealVariations = (mealType: string, dayIndex: number) => {
    const baseCalories = {
      breakfast: Math.round(dailyCalories * 0.25),
      lunch: Math.round(dailyCalories * 0.30),
      dinner: Math.round(dailyCalories * 0.35),
      snack: Math.round(dailyCalories * 0.10)
    };

    const mealCalories = baseCalories[mealType as keyof typeof baseCalories];
    const mealProtein = Math.round((mealCalories * proteinPercent) / 4);
    const mealCarbs = Math.round((mealCalories * carbPercent) / 4);
    const mealFat = Math.round((mealCalories * fatPercent) / 9);

    // Create unique meals for each day based on available ingredients
    const proteinIndex = dayIndex % finalProteins.length;
    const carbIndex = dayIndex % availableCarbs.length;
    const veggieIndex = dayIndex % availableVeggies.length;
    const fruitIndex = dayIndex % availableFruits.length;

    const protein = finalProteins[proteinIndex] || "Tofu";
    const carb = availableCarbs[carbIndex] || "Brown rice";
    const veggie = availableVeggies[veggieIndex] || "Mixed vegetables";
    const fruit = availableFruits[fruitIndex] || "Berries";

    const mealTemplates = {
      breakfast: [
        {
          name: `${protein} and ${fruit} Bowl`,
          description: `Nutritious breakfast with ${protein.toLowerCase()} and fresh ${fruit.toLowerCase()}`,
          ingredients: [protein, fruit, carb === "Oats" ? "Oats" : "Whole grain toast", "Almond milk", "Honey"],
          instructions: ["Prepare base ingredients", "Add toppings", "Serve fresh"]
        },
        {
          name: `${fruit} ${carb} Parfait`,
          description: `Layered breakfast with ${fruit.toLowerCase()} and ${carb.toLowerCase()}`,
          ingredients: [fruit, carb, protein, "Nuts", "Greek yogurt alternative"],
          instructions: ["Layer ingredients", "Add nuts on top", "Enjoy immediately"]
        }
      ],
      lunch: [
        {
          name: `${protein} and ${veggie} ${carb} Bowl`,
          description: `Power lunch bowl with ${protein.toLowerCase()}, ${veggie.toLowerCase()}, and ${carb.toLowerCase()}`,
          ingredients: [protein, veggie, carb, "Olive oil", "Lemon", "Herbs"],
          instructions: ["Cook protein and grain", "Prepare vegetables", "Combine with dressing"]
        },
        {
          name: `Mediterranean ${protein} Salad`,
          description: `Fresh Mediterranean salad featuring ${protein.toLowerCase()}`,
          ingredients: [protein, veggie, "Mixed greens", "Cucumber", "Olive oil", "Lemon"],
          instructions: ["Prepare protein", "Mix salad ingredients", "Dress and serve"]
        }
      ],
      dinner: [
        {
          name: `Herb-Crusted ${protein} with ${carb}`,
          description: `Flavorful dinner featuring ${protein.toLowerCase()} with ${carb.toLowerCase()}`,
          ingredients: [protein, carb, veggie, "Herbs", "Garlic", "Olive oil"],
          instructions: ["Season and cook protein", "Prepare grain", "Steam vegetables", "Combine and serve"]
        },
        {
          name: `${veggie} and ${protein} Stir-Fry`,
          description: `Quick and healthy stir-fry with ${veggie.toLowerCase()} and ${protein.toLowerCase()}`,
          ingredients: [protein, veggie, carb, "Soy sauce", "Ginger", "Garlic"],
          instructions: ["Heat pan", "Stir-fry ingredients", "Season to taste", "Serve hot"]
        }
      ],
      snack: [
        {
          name: `${fruit} with Protein`,
          description: `Simple and nutritious snack`,
          ingredients: [fruit, protein === "Greek yogurt" ? "Greek yogurt" : "Nuts", "Honey"],
          instructions: ["Combine ingredients", "Enjoy fresh"]
        }
      ]
    };

    const templates = mealTemplates[mealType as keyof typeof mealTemplates];
    const template = templates[dayIndex % templates.length];

    return {
      mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      name: template.name,
      description: template.description,
      calories: mealCalories,
      protein: mealProtein,
      carbs: mealCarbs,
      fat: mealFat,
      ingredients: template.ingredients,
      instructions: template.instructions,
      prepTime: mealType === "breakfast" ? 10 : mealType === "snack" ? 5 : mealType === "lunch" ? 20 : 30,
      servings: 1
    };
  };

  // Generate days with varied meals
  const days = [];
  for (let i = 1; i <= duration; i++) {
    days.push({
      dayNumber: i,
      name: `Day ${i}`,
      meals: [
        generateMealVariations("breakfast", i - 1),
        generateMealVariations("lunch", i - 1),
        generateMealVariations("dinner", i - 1),
        generateMealVariations("snack", i - 1)
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

// New interface for personalized meal plans with food preferences
interface PersonalizedMealPlanParams {
  goal: string; 
  dailyCalories: number;
  duration: number;
  likedFoods: string[];
  dislikedFoods: string[];
  userId: string;
}

export async function generatePersonalizedMealPlan(params: PersonalizedMealPlanParams | MealPlanGenerationOptions): Promise<GeneratedMealPlan> {
  // Handle both old and new interface
  if ('likedFoods' in params) {
    return generatePersonalizedMealPlanWithFoodPreferences(params as PersonalizedMealPlanParams);
  }
  
  const options = params as MealPlanGenerationOptions;
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

async function generatePersonalizedMealPlanWithFoodPreferences(params: PersonalizedMealPlanParams): Promise<GeneratedMealPlan> {
  const { goal, dailyCalories, duration, likedFoods, dislikedFoods, userId } = params;

  console.log(`Generating personalized meal plan for user ${userId}:`, {
    goal,
    dailyCalories,
    duration,
    likedFoodsCount: likedFoods.length,
    dislikedFoodsCount: dislikedFoods.length
  });

  if (!process.env.OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY not configured, using mock meal plan");
    return generateMockMealPlan({
      goal: goal as any,
      dailyCalories,
      duration,
      preferences: likedFoods,
      dietaryRestrictions: dislikedFoods.map(food => `Avoid ${food}`)
    });
  }

  // Calculate macronutrient targets based on goal
  const proteinPercentage = goal === "weight_gain" ? 0.25 : goal === "weight_loss" ? 0.30 : 0.25;
  const fatPercentage = goal === "weight_gain" ? 0.30 : 0.25;
  const carbPercentage = 1 - proteinPercentage - fatPercentage;

  const dailyProtein = Math.round((dailyCalories * proteinPercentage) / 4); // 4 cal per gram
  const dailyFat = Math.round((dailyCalories * fatPercentage) / 9); // 9 cal per gram  
  const dailyCarbs = Math.round((dailyCalories * carbPercentage) / 4); // 4 cal per gram

  const goalDescription = goal === "weight_loss" ? 
    "weight loss with moderate calorie deficit" : 
    goal === "weight_gain" ? 
    "healthy weight gain with calorie surplus" : 
    "weight maintenance and overall health";

  const prompt = `Create a ${duration}-day personalized meal plan for ${goalDescription}.

REQUIREMENTS:
- Daily calories: ${dailyCalories}
- Daily protein: ${dailyProtein}g
- Daily carbs: ${dailyCarbs}g  
- Daily fat: ${dailyFat}g
- 4 meals per day: breakfast, lunch, dinner, snack

FOOD PREFERENCES:
Preferred foods (use these heavily): ${likedFoods.length > 0 ? likedFoods.join(", ") : "No specific preferences"}
Foods to avoid: ${dislikedFoods.length > 0 ? dislikedFoods.join(", ") : "None"}

CONSTRAINTS:
- Focus on whole, minimally processed foods
- Include variety across all food groups
- Ensure adequate micronutrient coverage
- Make meals practical and realistic
- Each meal should have clear portions and instructions

Respond with JSON in this exact format:
{
  "name": "string",
  "description": "string", 
  "goal": "${goal}",
  "dailyCalories": ${dailyCalories},
  "dailyProtein": ${dailyProtein},
  "dailyCarbs": ${dailyCarbs},
  "dailyFat": ${dailyFat},
  "duration": ${duration},
  "days": [
    {
      "dayNumber": 1,
      "name": "Day 1",
      "meals": [
        {
          "mealType": "breakfast",
          "name": "string",
          "description": "string",
          "calories": number,
          "protein": number,
          "carbs": number, 
          "fat": number,
          "ingredients": ["string"],
          "instructions": ["string"],
          "prepTime": number,
          "servings": 1
        }
      ]
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a professional nutritionist and meal planning expert. Create detailed, nutritionally balanced meal plans based on user preferences and goals. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const generatedPlan = JSON.parse(response.choices[0].message.content);
    
    // Validate the response structure
    if (!generatedPlan.name || !generatedPlan.days || !Array.isArray(generatedPlan.days)) {
      throw new Error("Invalid meal plan structure received from AI");
    }

    // Ensure each day has the required meal types
    generatedPlan.days.forEach((day: any, dayIndex: number) => {
      if (!day.meals || !Array.isArray(day.meals)) {
        throw new Error(`Day ${dayIndex + 1} is missing meals array`);
      }
      
      const mealTypes = day.meals.map((meal: any) => meal.mealType);
      const requiredTypes = ["breakfast", "lunch", "dinner", "snack"];
      
      requiredTypes.forEach(type => {
        if (!mealTypes.includes(type)) {
          console.warn(`Day ${dayIndex + 1} is missing ${type} meal`);
        }
      });
    });

    console.log(`Successfully generated ${duration}-day meal plan: "${generatedPlan.name}"`);
    return generatedPlan as GeneratedMealPlan;

  } catch (error: any) {
    console.error("Error generating personalized meal plan:", error);
    
    if (error.message?.includes("API key")) {
      throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.");
    }
    
    if (error.message?.includes("JSON")) {
      throw new Error("Failed to parse AI response. Please try again.");
    }
    
    throw new Error(`Failed to generate meal plan: ${error.message}`);
  }
}