// Image service for fetching relevant food and ingredient images
// Uses Pixabay API for food-specific images

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const PIXABAY_BASE_URL = 'https://pixabay.com/api/';

interface PixabayImage {
  id: number;
  pageURL: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
}

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

// In-memory cache to avoid duplicate API calls
const imageCache = new Map<string, string>();

// Normalize query for better search results
function normalizeQuery(text: string, type: 'meal' | 'ingredient'): string {
  // Clean up the text
  let cleaned = text
    .toLowerCase()
    .replace(/\([^)]*\)/g, '') // Remove parentheses and content
    .replace(/,.*/, '') // Remove anything after comma
    .replace(/\d+\s*(oz|cup|tbsp|tsp|gram|g|ml|lb)/gi, '') // Remove measurements
    .trim();
  
  // For ingredients, just use the core ingredient name
  if (type === 'ingredient') {
    // Take first 2-3 words max
    const words = cleaned.split(/\s+/).slice(0, 2);
    return words.join(' ');
  }
  
  // For meals, extract key food terms
  // Remove common cooking words
  cleaned = cleaned.replace(/\b(with|and|or|grilled|baked|roasted|steamed|fried)\b/gi, '');
  return cleaned.trim();
}

// Fetch image from Pixabay
async function fetchPixabayImage(query: string, type: 'meal' | 'ingredient'): Promise<string | null> {
  if (!PIXABAY_API_KEY) {
    console.warn('PIXABAY_API_KEY not set, using fallback images');
    return null;
  }

  try {
    const normalizedQuery = normalizeQuery(query, type);
    const searchQuery = type === 'meal' 
      ? `${normalizedQuery} food meal` 
      : `${normalizedQuery} ingredient food`;

    const url = new URL(PIXABAY_BASE_URL);
    url.searchParams.set('key', PIXABAY_API_KEY);
    url.searchParams.set('q', searchQuery);
    url.searchParams.set('image_type', 'photo');
    url.searchParams.set('category', 'food');
    url.searchParams.set('orientation', 'horizontal');
    url.searchParams.set('per_page', '3');
    url.searchParams.set('safesearch', 'true');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`Pixabay API error: ${response.status}`);
      return null;
    }

    const data: PixabayResponse = await response.json();
    
    if (data.hits && data.hits.length > 0) {
      // Return the first result's medium-sized image
      return data.hits[0].webformatURL;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching from Pixabay:', error);
    return null;
  }
}

// Get fallback image based on type
function getFallbackImage(type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'ingredient', seed: string): string {
  // Use Picsum with seed for consistent placeholder images when API fails
  const dimensions = type === 'ingredient' ? '200/200' : '400/300';
  return `https://picsum.photos/seed/${seed}-${type}/` + dimensions;
}

// Main function to get meal image
export async function getMealImageUrl(mealType: string, mealName: string): Promise<string> {
  const cacheKey = `meal-${mealName.toLowerCase()}`;
  
  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // Try Pixabay
  const pixabayUrl = await fetchPixabayImage(mealName, 'meal');
  
  if (pixabayUrl) {
    imageCache.set(cacheKey, pixabayUrl);
    return pixabayUrl;
  }

  // Fallback to placeholder
  const seed = mealName.toLowerCase().replace(/\s+/g, '-');
  const fallbackUrl = getFallbackImage(mealType as any, seed);
  imageCache.set(cacheKey, fallbackUrl);
  return fallbackUrl;
}

// Main function to get ingredient image
export async function getIngredientImageUrl(ingredientName: string): Promise<string> {
  const cacheKey = `ingredient-${ingredientName.toLowerCase()}`;
  
  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // Try Pixabay
  const pixabayUrl = await fetchPixabayImage(ingredientName, 'ingredient');
  
  if (pixabayUrl) {
    imageCache.set(cacheKey, pixabayUrl);
    return pixabayUrl;
  }

  // Fallback to placeholder
  const seed = ingredientName.toLowerCase().replace(/\s+/g, '-');
  const fallbackUrl = getFallbackImage('ingredient', seed);
  imageCache.set(cacheKey, fallbackUrl);
  return fallbackUrl;
}
