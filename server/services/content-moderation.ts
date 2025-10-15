import OpenAI from "openai";

// This is using OpenAI's API, which points to OpenAI's API servers and requires your own API key.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ModerationResult {
  isAppropriate: boolean;
  reason?: string;
  categories?: string[];
}

/**
 * Moderates text content for inappropriate language
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  try {
    // Use OpenAI's moderation endpoint
    const moderation = await openai.moderations.create({
      input: text,
    });

    const result = moderation.results[0];
    
    // Check if content is flagged
    if (result.flagged) {
      const flaggedCategories = Object.keys(result.categories).filter(
        key => result.categories[key as keyof typeof result.categories]
      );

      return {
        isAppropriate: false,
        reason: "Content contains inappropriate language or themes",
        categories: flaggedCategories
      };
    }

    return { isAppropriate: true };
  } catch (error) {
    console.error("Error moderating text:", error);
    // In case of error, allow content but log the error
    return { isAppropriate: true };
  }
}

/**
 * Moderates image content for inappropriate visuals
 */
export async function moderateImage(imageUrl: string): Promise<ModerationResult> {
  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a content moderation expert. Analyze the image and determine if it contains any inappropriate, explicit, violent, or offensive content. Respond with JSON in this format: { 'isAppropriate': boolean, 'reason': string, 'categories': string[] }"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Is this image appropriate for a fitness community platform? Check for nudity, violence, hate symbols, or other inappropriate content."
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || '{"isAppropriate": true}');
    
    return {
      isAppropriate: result.isAppropriate,
      reason: result.reason,
      categories: result.categories || []
    };
  } catch (error) {
    console.error("Error moderating image:", error);
    // In case of error, allow content but log the error
    return { isAppropriate: true };
  }
}
