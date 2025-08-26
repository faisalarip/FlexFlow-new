import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ThumbsUp, ThumbsDown, X, Calculator, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FoodItemWithPreference } from "@shared/schema";

interface FoodPreferencesProps {
  onComplete?: (preferences: any[]) => void;
  showCalorieCalculator?: boolean;
}

const preferenceIcons = {
  love: { icon: Heart, color: "text-red-500", bg: "bg-red-50 border-red-200" },
  like: { icon: ThumbsUp, color: "text-green-500", bg: "bg-green-50 border-green-200" },
  dislike: { icon: ThumbsDown, color: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
  never: { icon: X, color: "text-red-600", bg: "bg-red-100 border-red-300" },
};

const categories = [
  { id: "proteins", name: "Proteins", icon: "🥩" },
  { id: "grains", name: "Grains", icon: "🌾" },
  { id: "vegetables", name: "Vegetables", icon: "🥬" },
  { id: "fruits", name: "Fruits", icon: "🍎" },
  { id: "dairy", name: "Dairy", icon: "🥛" },
  { id: "fats", name: "Healthy Fats", icon: "🥑" },
  { id: "nuts", name: "Nuts & Seeds", icon: "🥜" },
  { id: "legumes", name: "Legumes", icon: "🫘" },
];

export function FoodPreferences({ onComplete, showCalorieCalculator = true }: FoodPreferencesProps) {
  const [selectedCategory, setSelectedCategory] = useState("proteins");
  const [selectedFoods, setSelectedFoods] = useState<{[key: string]: string}>({});
  const [estimatedCalories, setEstimatedCalories] = useState(2000);
  const { toast } = useToast();

  // Fetch food items with user preferences
  const { data: foodItems = [], isLoading } = useQuery<FoodItemWithPreference[]>({
    queryKey: ["/api/food-items-with-preferences", selectedCategory],
    queryFn: () => apiRequest("GET", `/api/food-items-with-preferences?category=${selectedCategory}`).then(res => res.json()),
  });

  // Set preference mutation
  const setPreferenceMutation = useMutation({
    mutationFn: async ({ foodItemId, preference }: { foodItemId: string; preference: string }) => {
      const response = await apiRequest("POST", "/api/user-food-preference", {
        foodItemId,
        preference,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items-with-preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-food-preferences"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save food preference",
        variant: "destructive",
      });
    }
  });

  const handlePreferenceChange = (foodItemId: string, preference: string) => {
    setSelectedFoods(prev => ({ ...prev, [foodItemId]: preference }));
    setPreferenceMutation.mutate({ foodItemId, preference });
  };

  const calculateEstimatedCalories = () => {
    const likedFoods = Object.entries(selectedFoods).filter(([_, pref]) => pref === "like" || pref === "love");
    if (likedFoods.length === 0) return 2000;

    const totalCalories = likedFoods.reduce((sum, [foodId]) => {
      const food = foodItems.find(item => item.id === foodId);
      return sum + (food?.caloriesPer100g || 0);
    }, 0);

    // Rough estimate: assume user eats variety of liked foods
    const averageCaloriesPer100g = totalCalories / likedFoods.length;
    // Assume ~6-8 servings per day of various foods
    return Math.round(averageCaloriesPer100g * 7); // 700g total food per day
  };

  const getSelectedPreference = (foodItem: FoodItemWithPreference) => {
    return selectedFoods[foodItem.id] || foodItem.userPreference?.preference || null;
  };

  const completedCategories = categories.filter(category => {
    return foodItems.some(item => 
      item.category === category.id && getSelectedPreference(item)
    );
  }).length;

  React.useEffect(() => {
    const newEstimate = calculateEstimatedCalories();
    setEstimatedCalories(newEstimate);
  }, [selectedFoods, foodItems]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Food Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tell us which foods you like to get personalized meal plans
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Badge variant="outline">{completedCategories}/{categories.length} categories completed</Badge>
          {showCalorieCalculator && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calculator className="w-3 h-3" />
              Est. {estimatedCalories} cal/day
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              <span className="mr-1">{category.icon}</span>
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{category.icon} {category.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rate these {category.name.toLowerCase()} to personalize your meal plans
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded mb-3"></div>
                      <div className="flex gap-2">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className="w-8 h-8 bg-gray-100 rounded"></div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {foodItems
                  .filter(item => item.category === category.id)
                  .map((foodItem) => {
                    const selectedPref = getSelectedPreference(foodItem);
                    return (
                      <Card key={foodItem.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium">{foodItem.name}</h4>
                              <p className="text-xs text-gray-500">
                                {foodItem.caloriesPer100g} cal per 100g
                              </p>
                              <p className="text-xs text-gray-400">
                                {foodItem.commonServingSize}
                              </p>
                            </div>

                            <div className="flex gap-1">
                              {Object.entries(preferenceIcons).map(([pref, config]) => {
                                const Icon = config.icon;
                                const isSelected = selectedPref === pref;
                                return (
                                  <button
                                    key={pref}
                                    onClick={() => handlePreferenceChange(foodItem.id, pref)}
                                    className={`p-2 rounded-md border transition-all ${
                                      isSelected 
                                        ? `${config.bg} ${config.color} border-current scale-110` 
                                        : "border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600"
                                    }`}
                                    title={pref.charAt(0).toUpperCase() + pref.slice(1)}
                                    data-testid={`preference-${pref}-${foodItem.id}`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </button>
                                );
                              })}
                            </div>

                            {selectedPref && (
                              <Badge variant="outline" className="text-xs">
                                {selectedPref.charAt(0).toUpperCase() + selectedPref.slice(1)}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {completedCategories >= 3 && onComplete && (
        <div className="text-center pt-4">
          <Button 
            onClick={() => onComplete(Object.entries(selectedFoods))}
            size="lg"
            className="min-w-48"
            data-testid="complete-preferences"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate My Meal Plan
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            You've completed {completedCategories} categories. You can continue or generate your plan now.
          </p>
        </div>
      )}
    </div>
  );
}