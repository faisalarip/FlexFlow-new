import OpenAI from "openai";

// IMPORTANT: from the OpenAI blueprint:
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface NutritionalAnalysis {
  mealName: string;
  description: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  confidence: number;
}

export async function analyzeMealImage(base64Image: string, mealType: string, customDescription?: string): Promise<NutritionalAnalysis> {
  try {
    const prompt = `Analyze this ${mealType} image and provide detailed nutritional information. ${customDescription ? `Additional context: ${customDescription}` : ''}

Please provide your response in JSON format with these exact fields:
{
  "mealName": "descriptive name of the meal",
  "description": "brief description of the meal and its components",
  "totalCalories": number (estimated total calories),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "sugar": number (grams),
  "sodium": number (milligrams),
  "confidence": number (confidence score between 0.1 and 1.0)
}

Guidelines:
- Be as accurate as possible with portion size estimation
- Consider typical serving sizes for the meal type
- If multiple items are visible, analyze the entire meal
- Provide realistic nutritional values based on visible ingredients
- Set confidence lower if the image quality is poor or ingredients are unclear
- For ${mealType}, consider appropriate portion sizes for that meal type`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a professional nutritionist and food analysis expert. Analyze food images and provide accurate nutritional information in JSON format."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    // Validate and sanitize the response
    const analysis: NutritionalAnalysis = {
      mealName: result.mealName || 'Unknown Meal',
      description: result.description || 'Nutritional analysis of uploaded meal',
      totalCalories: Math.max(0, Math.round(result.totalCalories || 0)),
      protein: Math.max(0, Math.round((result.protein || 0) * 100) / 100),
      carbs: Math.max(0, Math.round((result.carbs || 0) * 100) / 100),
      fat: Math.max(0, Math.round((result.fat || 0) * 100) / 100),
      fiber: Math.max(0, Math.round((result.fiber || 0) * 100) / 100),
      sugar: Math.max(0, Math.round((result.sugar || 0) * 100) / 100),
      sodium: Math.max(0, Math.round(result.sodium || 0)),
      confidence: Math.min(1.0, Math.max(0.1, result.confidence || 0.85))
    };

    return analysis;
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error('Failed to analyze meal image. Please try again.');
  }
}