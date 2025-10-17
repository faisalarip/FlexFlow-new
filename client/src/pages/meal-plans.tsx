import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Users, Target, TrendingUp, TrendingDown, Calendar, ChefHat, Sparkles, Settings, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { FoodPreferences } from "@/components/food-preferences";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import FeatureGate from "@/components/feature-gate";
import type { MealPlanWithDetails, UserMealPlanWithDetails, UserMealPreferences } from "@shared/schema";
import { PageMedicalDisclaimer, AIGeneratedDisclaimer } from "@/components/medical-disclaimer";
import { HealthSources } from "@/components/health-sources";

const mealPlanGenerationSchema = z.object({
  goal: z.enum(["weight_loss", "weight_gain", "maintenance"]),
  dailyCalories: z.number().min(1200).max(4000),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  preferences: z.array(z.string()).optional(),
  duration: z.number().min(3).max(14).default(7),
});

type MealPlanGenerationForm = z.infer<typeof mealPlanGenerationSchema>;

export default function MealPlans() {
  const [selectedPlan, setSelectedPlan] = useState<MealPlanWithDetails | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showFoodPreferences, setShowFoodPreferences] = useState(false);
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("plans");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  
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

  // Fetch user meal preferences
  const { data: userPreferences } = useQuery<UserMealPreferences>({
    queryKey: ["/api/user-meal-preferences"],
    retry: false,
  });

  // Fetch user food preferences to check if they exist
  const { data: userFoodPreferences = [] } = useQuery<any[]>({
    queryKey: ["/api/user-food-preferences"],
    retry: false,
  });

  // AI Meal Plan Generation Form
  const form = useForm<MealPlanGenerationForm>({
    resolver: zodResolver(mealPlanGenerationSchema),
    defaultValues: {
      goal: "maintenance",
      dailyCalories: 2000,
      dietaryRestrictions: [],
      allergies: [],
      preferences: [],
      duration: 7,
    },
  });

  // Update form when userPreferences loads
  useEffect(() => {
    if (userPreferences) {
      form.reset({
        goal: userPreferences.goal as "weight_loss" | "weight_gain" | "maintenance",
        dailyCalories: userPreferences.dailyCalories,
        dietaryRestrictions: userPreferences.dietaryRestrictions || [],
        allergies: userPreferences.allergies || [],
        preferences: userPreferences.preferences || [],
        duration: 7,
      });
    }
  }, [userPreferences, form]);

  const assignMealPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      console.log("Assigning meal plan:", planId);
      const response = await apiRequest("POST", "/api/user-meal-plan", {
        mealPlanId: planId,
        startDate: new Date().toISOString(),
        isActive: true,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Meal plan assigned successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/user-meal-plan"] });
      toast({ 
        title: "Meal Plan Assigned!", 
        description: "Your new meal plan is now active." 
      });
    },
    onError: (error: any) => {
      console.error("Assignment error:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to assign meal plan", 
        variant: "destructive" 
      });
    }
  });

  const generateMealPlanMutation = useMutation({
    mutationFn: async (data: MealPlanGenerationForm) => {
      const response = await apiRequest("POST", "/api/generate-meal-plan", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-meal-plan"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-meal-preferences"] });
      setShowAIDialog(false);
      form.reset();
      toast({ 
        title: "AI Meal Plan Generated!", 
        description: "Your personalized meal plan has been created and assigned." 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to generate meal plan", 
        variant: "destructive" 
      });
    }
  });

  const generatePersonalizedMealPlanMutation = useMutation({
    mutationFn: async (data: { goal: string; dailyCalories: number; duration?: number }) => {
      const response = await apiRequest("POST", "/api/generate-personalized-meal-plan", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-meal-plan"] });
      setShowFoodPreferences(false);
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

  const filteredPlans = mealPlans;

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

  const onSubmitAIMealPlan = (data: MealPlanGenerationForm) => {
    generateMealPlanMutation.mutate(data);
  };

  const handleFoodPreferencesComplete = (preferences: any[], estimatedCalories: number = 2000) => {
    // Default values
    const defaultGoal = "maintenance";
    const defaultDuration = 7;

    generatePersonalizedMealPlanMutation.mutate({
      goal: defaultGoal,
      dailyCalories: estimatedCalories,
      duration: defaultDuration
    });
  };

  const toggleIngredients = (mealId: string) => {
    setExpandedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mealId)) {
        newSet.delete(mealId);
      } else {
        newSet.add(mealId);
      }
      return newSet;
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

        <PageMedicalDisclaimer type="nutrition" />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="plans">Available Plans</TabsTrigger>
            <TabsTrigger value="current">My Current Plan</TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Food Preferences
            </TabsTrigger>
          </TabsList>

          {/* Available Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="flex justify-center">
              <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" data-testid="generate-ai-meal-plan">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Meal Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate Personalized Meal Plan</DialogTitle>
              </DialogHeader>
              <AIGeneratedDisclaimer />
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitAIMealPlan)} className="space-y-6">
                  {userFoodPreferences.length > 0 && (
                    <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-blue-800 dark:text-blue-200">
                        Your saved food preferences will be automatically incorporated into this meal plan.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fitness Goal</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your goal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weight_loss">Weight Loss</SelectItem>
                              <SelectItem value="weight_gain">Weight Gain</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dailyCalories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Calories</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Duration (days)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="7" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 7)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dietaryRestrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dietary Restrictions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., vegetarian, gluten-free, dairy-free (separate with commas)"
                            value={field.value?.join(", ") || ""}
                            onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., nuts, shellfish, eggs (separate with commas)"
                            value={field.value?.join(", ") || ""}
                            onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Food Preferences</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., Mediterranean, low-carb, high-protein (separate with commas)"
                            value={field.value?.join(", ") || ""}
                            onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAIDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={generateMealPlanMutation.isPending}>
                      {generateMealPlanMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Meal Plan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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

        {/* Meal Plan Selector */}
        <div className="max-w-2xl mx-auto mb-8">
          <Select value={selectedPlanId} onValueChange={(value) => {
            setSelectedPlanId(value);
            const plan = filteredPlans.find(p => p.id === value);
            if (plan) {
              setSelectedPlan(plan);
            }
          }}>
            <SelectTrigger className="w-full" data-testid="select-meal-plan">
              <SelectValue placeholder="Select a meal plan" />
            </SelectTrigger>
            <SelectContent>
              {filteredPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Plan Details */}
        {selectedPlanId && filteredPlans.find(p => p.id === selectedPlanId) && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getGoalIcon(filteredPlans.find(p => p.id === selectedPlanId)!.goal)}
                  <CardTitle className="ml-2">{filteredPlans.find(p => p.id === selectedPlanId)!.name}</CardTitle>
                </div>
                <Badge className={getGoalColor(filteredPlans.find(p => p.id === selectedPlanId)!.goal)} variant="secondary">
                  {formatGoalName(filteredPlans.find(p => p.id === selectedPlanId)!.goal)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400">
                {filteredPlans.find(p => p.id === selectedPlanId)!.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{filteredPlans.find(p => p.id === selectedPlanId)!.dailyCalories}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Calories/day</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{filteredPlans.find(p => p.id === selectedPlanId)!.dailyProtein}g</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Protein/day</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{filteredPlans.find(p => p.id === selectedPlanId)!.dailyCarbs}g</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Carbs/day</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{filteredPlans.find(p => p.id === selectedPlanId)!.dailyFat}g</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Fat/day</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setSelectedPlan(filteredPlans.find(p => p.id === selectedPlanId)!)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-view-details"
                >
                  View Full Details
                </Button>
                <Button
                  onClick={() => handleAssignPlan(selectedPlanId)}
                  disabled={assignMealPlanMutation.isPending || userMealPlan?.mealPlanId === selectedPlanId}
                  className="flex-1"
                  data-testid="button-start-plan"
                >
                  {userMealPlan?.mealPlanId === selectedPlanId ? "Active Plan" : "Start This Plan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                                        <button
                                          onClick={() => toggleIngredients(meal.id)}
                                          className="flex items-center justify-between w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                                          data-testid={`ingredients-toggle-${meal.id}`}
                                        >
                                          <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            Ingredients ({meal.ingredients.length})
                                          </h6>
                                          {expandedIngredients.has(meal.id) ? (
                                            <ChevronUp size={14} className="text-gray-500" />
                                          ) : (
                                            <ChevronDown size={14} className="text-gray-500" />
                                          )}
                                        </button>
                                        <ul className="text-xs text-gray-600 dark:text-gray-400">
                                          {expandedIngredients.has(meal.id) ? (
                                            // Show all ingredients when expanded
                                            meal.ingredients.map((ingredient: string, idx: number) => (
                                              <li key={idx} className="py-0.5">• {ingredient}</li>
                                            ))
                                          ) : (
                                            // Show only first 3 when collapsed
                                            <>
                                              {meal.ingredients.slice(0, 3).map((ingredient: string, idx: number) => (
                                                <li key={idx} className="py-0.5">• {ingredient}</li>
                                              ))}
                                              {meal.ingredients.length > 3 && (
                                                <li className="py-0.5 italic text-blue-600 dark:text-blue-400">
                                                  • Click to see {meal.ingredients.length - 3} more ingredients...
                                                </li>
                                              )}
                                            </>
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
        
        <HealthSources />
          </TabsContent>

          {/* Current Plan Tab */}
          <TabsContent value="current" className="space-y-6">
            {userMealPlan ? (
              <Card>
                <CardContent className="p-6">
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
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Meal Plan</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You don't have an active meal plan yet. Browse our meal plans or create a personalized one based on your food preferences.
                  </p>
                  <div className="space-x-3">
                    <Button onClick={() => setShowAIDialog(true)} data-testid="button-generate-ai-plan">
                      Generate AI Plan
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("preferences")} data-testid="button-set-food-preferences">
                      Set Food Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <HealthSources />
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