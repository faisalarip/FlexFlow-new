import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChefHat, Heart } from "lucide-react";
import { FoodPreferences } from "@/components/food-preferences";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FeatureGate from "@/components/feature-gate";
import type { UserMealPlanWithDetails } from "@shared/schema";

export default function MealPlans() {
  const [activeTab, setActiveTab] = useState<string>("current");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's current meal plan
  const { data: userMealPlan, isLoading } = useQuery<UserMealPlanWithDetails>({
    queryKey: ["/api/user-meal-plan"],
    retry: false,
  });

  const generatePersonalizedMealPlanMutation = useMutation({
    mutationFn: async (data: { goal: string; dailyCalories: number; duration?: number }) => {
      const response = await apiRequest("POST", "/api/generate-personalized-meal-plan", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-meal-plan"] });
      toast({ 
        title: "Personalized Meal Plan Created!", 
        description: "Your meal plan has been generated based on your food preferences and is now active." 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to generate personalized meal plan", 
        variant: "destructive" 
      });
    }
  });

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case "weight_loss":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "weight_gain":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatGoalName = (goal: string) => {
    return goal.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleFoodPreferencesComplete = (preferences: any[], estimatedCalories: number = 2000) => {
    const defaultGoal = "maintenance";
    const defaultDuration = 7;

    generatePersonalizedMealPlanMutation.mutate({
      goal: defaultGoal,
      dailyCalories: estimatedCalories,
      duration: defaultDuration
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <FeatureGate feature="meal_plans">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meal Plans</h1>
          <p className="text-gray-600 dark:text-gray-400">Choose a meal plan to support your fitness goals</p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-2xl mx-auto">
            <TabsTrigger value="current">My Current Plan</TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Food Preferences
            </TabsTrigger>
          </TabsList>


          {/* Current Plan Tab */}
          <TabsContent value="current" className="space-y-6">
            {userMealPlan ? (
              <Card>
                <CardContent className="p-6">
                  <div>
                    <h3 className="text-lg font-semibold">{userMealPlan.mealPlan.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {userMealPlan.mealPlan.description}
                    </p>
                    <div className="flex items-center mt-3 space-x-4">
                      <Badge className={getGoalColor(userMealPlan.mealPlan.goal)}>
                        {formatGoalName(userMealPlan.mealPlan.goal)}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {userMealPlan.mealPlan.dailyCalories} cal/day
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Meal Plan</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You don't have an active meal plan yet. Browse our meal plans or create a personalized one based on your food preferences.
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("preferences")} data-testid="button-set-food-preferences">
                    Set Food Preferences
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Food Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <FoodPreferences 
                  onComplete={handleFoodPreferencesComplete}
                  showCalorieCalculator={true}
                />
                {generatePersonalizedMealPlanMutation.isPending && (
                  <div className="mt-6 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Generating your personalized meal plan based on your food preferences...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </FeatureGate>
  );
}