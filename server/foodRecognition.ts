import OpenAI from "openai";

const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "";
const openai = apiKey ? new OpenAI({ apiKey, baseURL: 'https://api.openai.com/v1' }) : null;

export interface FoodAnalysisResult {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: string;
  confidence: number;
}

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResult> {
  try {
    if (!openai) {
      return {
        name: "Food",
        description: "Mock analysis",
        calories: 450,
        protein: 20,
        carbs: 50,
        fat: 18,
        fiber: 6,
        sugar: 12,
        sodium: 700,
        servingSize: "1 serving",
        confidence: 20,
      };
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a nutrition expert AI that analyzes food images. When given an image of food, you should:
1. Identify the food items in the image
2. Estimate the serving size/portion
3. Provide detailed nutritional information per serving
4. Rate your confidence in the analysis (0-100)

Respond with JSON in this exact format:
{
  "name": "Food name (e.g., 'Grilled Chicken Breast')",
  "description": "Brief description of the food and preparation method",
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "sugar": number (grams),
  "sodium": number (milligrams),
  "servingSize": "Estimated serving size (e.g., '1 medium piece', '1 cup', '150g')",
  "confidence": number (0-100, how confident you are in this analysis)
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this food image and provide detailed nutritional information."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium', 'servingSize', 'confidence'];
    for (const field of requiredFields) {
      if (!(field in result)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Ensure numeric fields are numbers and within reasonable ranges
    result.calories = Math.max(0, Math.min(5000, Number(result.calories) || 0));
    result.protein = Math.max(0, Math.min(300, Number(result.protein) || 0));
    result.carbs = Math.max(0, Math.min(500, Number(result.carbs) || 0));
    result.fat = Math.max(0, Math.min(200, Number(result.fat) || 0));
    result.fiber = Math.max(0, Math.min(100, Number(result.fiber) || 0));
    result.sugar = Math.max(0, Math.min(300, Number(result.sugar) || 0));
    result.sodium = Math.max(0, Math.min(10000, Number(result.sodium) || 0));
    result.confidence = Math.max(0, Math.min(100, Number(result.confidence) || 0));

    return result as FoodAnalysisResult;
  } catch (error) {
    console.error("Error analyzing food image:", error);
    return {
      name: "Food",
      description: "Unable to analyze image",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      servingSize: "Unknown",
      confidence: 0,
    };
  }
}
