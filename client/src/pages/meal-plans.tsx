import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Users, Target, TrendingUp, TrendingDown, Calendar, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MealPlanWithDetails, UserMealPlanWithDetails } from "@shared/schema";

export default function MealPlans() {
  const [selectedGoal, setSelectedGoal] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<MealPlanWithDetails | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch meal plans
  const { data: mealPlans = [], isLoading } = useQuery<MealPlanWithDetails[]>({
    queryKey: ["/api/meal-plans"],
  });

  // Fetch user's current meal plan
  const { data: userMealPlan } = useQuery<UserMealPlanWithDetails>({
    queryKey: ["/api/user-meal-plan"],
    retry: false,
  });

  const assignMealPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("POST", "/api/user-meal-plan", {
        mealPlanId: planId,
        startDate: new Date().toISOString(),
        isActive: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-meal-plan"] });
      toast({ 
        title: "Meal Plan Assigned!", 
        description: "Your new meal plan is now active." 
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to assign meal plan", 
        variant: "destructive" 
      });
    }
  });

  const filteredPlans = selectedGoal === "all" 
    ? mealPlans 
    : mealPlans.filter(plan => plan.goal === selectedGoal);

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case "weight_loss":
        return <TrendingDown className="text-blue-500" size={20} />;
      case "weight_gain":
        return <TrendingUp className="text-green-500" size={20} />;
      default:
        return <Target className="text-gray-500" size={20} />;
    }
  };

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

  const getMealsByType = (day: any, type: string) => {
    return day.meals.filter((meal: any) => meal.mealType === type);
  };

  const handleAssignPlan = (planId: string) => {
    assignMealPlanMutation.mutate(planId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meal Plans</h1>
            <p className="text-gray-600 dark:text-gray-400">Choose a meal plan to support your fitness goals</p>
          </div>
        </div>

        {/* Current Meal Plan */}
        {userMealPlan && (
          <Card className="mb-8 border-primary dark:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChefHat className="mr-2" size={20} />
                Your Active Meal Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
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
                <Button 
                  onClick={() => setSelectedPlan(userMealPlan.mealPlan)} 
                  variant="outline"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goal Filter */}
        <div className="mb-6">
          <Tabs value={selectedGoal} onValueChange={setSelectedGoal}>
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="all">All Plans</TabsTrigger>
              <TabsTrigger value="weight_loss">Weight Loss</TabsTrigger>
              <TabsTrigger value="weight_gain">Weight Gain</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Meal Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {getGoalIcon(plan.goal)}
                </div>
                <Badge className={getGoalColor(plan.goal)} variant="secondary">
                  {formatGoalName(plan.goal)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Daily Calories:</span>
                    <span className="font-semibold">{plan.dailyCalories}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Protein:</span>
                    <span className="font-semibold">{plan.dailyProtein}g</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-semibold">{plan.duration} days</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => setSelectedPlan(plan)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => handleAssignPlan(plan.id)}
                    disabled={assignMealPlanMutation.isPending || userMealPlan?.mealPlanId === plan.id}
                    size="sm"
                    className="flex-1"
                  >
                    {userMealPlan?.mealPlanId === plan.id ? "Active" : "Start Plan"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Meal Plan Details Dialog */}
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedPlan && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    {getGoalIcon(selectedPlan.goal)}
                    <span className="ml-2">{selectedPlan.name}</span>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {selectedPlan.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedPlan.dailyCalories}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Calories/day</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedPlan.dailyProtein}g</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Protein/day</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedPlan.dailyCarbs}g</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Carbs/day</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{selectedPlan.dailyFat}g</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Fat/day</div>
                      </div>
                    </div>
                  </div>

                  {/* Day Selector */}
                  <div>
                    <div className="flex items-center mb-4">
                      <Calendar className="mr-2" size={20} />
                      <span className="font-semibold">Daily Meal Plan</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedPlan.days.map((day) => (
                        <Button
                          key={day.id}
                          variant={selectedDay === day.dayNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedDay(day.dayNumber)}
                        >
                          {day.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Meals for Selected Day */}
                  {selectedPlan.days
                    .filter(day => day.dayNumber === selectedDay)
                    .map(day => (
                      <div key={day.id} className="space-y-4">
                        {["breakfast", "lunch", "dinner", "snack"].map(mealType => {
                          const meals = getMealsByType(day, mealType);
                          if (meals.length === 0) return null;
                          
                          return (
                            <div key={mealType} className="border rounded-lg p-4 dark:border-gray-700">
                              <h4 className="font-semibold text-lg mb-3 capitalize">
                                {mealType}
                              </h4>
                              <div className="grid md:grid-cols-2 gap-4">
                                {meals.map((meal: any) => (
                                  <div key={meal.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium">{meal.name}</h5>
                                      {meal.prepTime && (
                                        <Badge variant="outline" className="text-xs">
                                          <Clock size={12} className="mr-1" />
                                          {meal.prepTime}min
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                      {meal.description}
                                    </p>
                                    
                                    <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                                      <div className="text-center">
                                        <div className="font-semibold">{meal.calories}</div>
                                        <div className="text-gray-500">cal</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="font-semibold">{meal.protein}g</div>
                                        <div className="text-gray-500">protein</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="font-semibold">{meal.carbs}g</div>
                                        <div className="text-gray-500">carbs</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="font-semibold">{meal.fat}g</div>
                                        <div className="text-gray-500">fat</div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div>
                                        <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                          Ingredients:
                                        </h6>
                                        <ul className="text-xs text-gray-600 dark:text-gray-400">
                                          {meal.ingredients.slice(0, 3).map((ingredient: string, idx: number) => (
                                            <li key={idx}>• {ingredient}</li>
                                          ))}
                                          {meal.ingredients.length > 3 && (
                                            <li>• +{meal.ingredients.length - 3} more...</li>
                                          )}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}

                  <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPlan(null)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => handleAssignPlan(selectedPlan.id)}
                      disabled={assignMealPlanMutation.isPending || userMealPlan?.mealPlanId === selectedPlan.id}
                    >
                      {userMealPlan?.mealPlanId === selectedPlan.id ? "Currently Active" : "Start This Plan"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}