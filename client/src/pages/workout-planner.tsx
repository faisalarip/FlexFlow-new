import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FeatureGate from "@/components/feature-gate";
import { PageMedicalDisclaimer, AIGeneratedDisclaimer } from "@/components/medical-disclaimer";
import { HealthSources } from "@/components/health-sources";
import { 
  Target, 
  Clock, 
  Dumbbell, 
  Activity, 
  Calendar,
  CheckCircle2,
  Play,
  RotateCcw,
  TrendingUp,
  Users,
  Award,
  Loader2
} from "lucide-react";
import { WorkoutPreferences, WorkoutPlan, PlannedWorkout } from "@shared/schema";

interface QuestionnaireData {
  fitnessLevel: string;
  primaryGoals: string[];
  workoutDaysPerWeek: number;
  sessionDuration: number;
  availableEquipment: string[];
  preferredWorkoutTypes: string[];
  injuriesOrLimitations: string[];
}

export default function WorkoutPlannerPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    fitnessLevel: "",
    primaryGoals: [],
    workoutDaysPerWeek: 3,
    sessionDuration: 45,
    availableEquipment: [],
    preferredWorkoutTypes: [],
    injuriesOrLimitations: []
  });
  const [showPlan, setShowPlan] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has existing preferences
  const { data: preferences } = useQuery<WorkoutPreferences>({
    queryKey: ["/api/workout-preferences"],
  });

  // Get user's workout plan
  const { data: workoutPlan } = useQuery<WorkoutPlan & { plannedWorkouts: PlannedWorkout[] }>({
    queryKey: ["/api/workout-plan"],
    enabled: !!preferences || showPlan,
  });

  // Load existing preferences into questionnaire
  useEffect(() => {
    if (preferences) {
      setQuestionnaire({
        fitnessLevel: preferences.fitnessLevel,
        primaryGoals: preferences.primaryGoals,
        workoutDaysPerWeek: preferences.workoutDaysPerWeek,
        sessionDuration: preferences.sessionDuration,
        availableEquipment: preferences.availableEquipment,
        preferredWorkoutTypes: preferences.preferredWorkoutTypes,
        injuriesOrLimitations: preferences.injuriesOrLimitations || []
      });
      setShowPlan(true);
    }
  }, [preferences]);

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (data: QuestionnaireData) => {
      const response = await apiRequest("POST", "/api/workout-preferences", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-preferences"] });
      toast({
        title: "Preferences Saved! 🎯",
        description: "Your workout preferences have been saved successfully.",
      });
      // After saving preferences, generate the plan
      generatePlanMutation.mutate();
    },
  });

  // Generate plan mutation
  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/workout-plan/generate", {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate workout plan");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plan"] });
      setShowPlan(true);
      toast({
        title: "Workout Plan Generated! 🏋️‍♂️",
        description: "Your personalized workout plan is ready!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate workout plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const questions = [
    {
      title: "What's your current fitness level?",
      key: "fitnessLevel",
      type: "radio",
      options: [
        { value: "beginner", label: "Beginner", description: "New to working out or returning after a long break" },
        { value: "intermediate", label: "Intermediate", description: "Regular workouts for 6+ months" },
        { value: "advanced", label: "Advanced", description: "Consistent training for 2+ years" }
      ]
    },
    {
      title: "What are your primary fitness goals?",
      key: "primaryGoals",
      type: "checkbox",
      options: [
        { value: "lose_weight", label: "Lose Weight", description: "Burn calories and reduce body fat" },
        { value: "build_muscle", label: "Build Muscle", description: "Increase muscle mass and strength" },
        { value: "improve_endurance", label: "Improve Endurance", description: "Better cardiovascular fitness" },
        { value: "general_fitness", label: "General Fitness", description: "Overall health and wellness" },
        { value: "sport_specific", label: "Sport-Specific", description: "Training for a particular sport" }
      ]
    },
    {
      title: "How many days per week can you workout?",
      key: "workoutDaysPerWeek",
      type: "radio",
      options: [
        { value: "2", label: "2 days", description: "Minimal time commitment" },
        { value: "3", label: "3 days", description: "Balanced approach" },
        { value: "4", label: "4 days", description: "Dedicated routine" },
        { value: "5", label: "5 days", description: "High commitment" },
        { value: "6", label: "6 days", description: "Very high commitment" }
      ]
    },
    {
      title: "How long can each workout session be?",
      key: "sessionDuration",
      type: "radio",
      options: [
        { value: "30", label: "30 minutes", description: "Quick and efficient" },
        { value: "45", label: "45 minutes", description: "Standard length" },
        { value: "60", label: "60 minutes", description: "Comprehensive workout" },
        { value: "90", label: "90 minutes", description: "Extended training" }
      ]
    },
    {
      title: "What equipment do you have access to?",
      key: "availableEquipment",
      type: "checkbox",
      options: [
        { value: "bodyweight", label: "Bodyweight", description: "No equipment needed" },
        { value: "dumbbells", label: "Dumbbells", description: "Various weights" },
        { value: "barbell", label: "Barbell", description: "Olympic or standard" },
        { value: "resistance_bands", label: "Resistance Bands", description: "Portable resistance" },
        { value: "pull_up_bar", label: "Pull-up Bar", description: "For upper body" },
        { value: "gym_access", label: "Full Gym", description: "Complete gym facility" }
      ]
    },
    {
      title: "What types of workouts do you prefer?",
      key: "preferredWorkoutTypes",
      type: "checkbox",
      options: [
        { value: "strength", label: "Strength Training", description: "Weight lifting and resistance" },
        { value: "cardio", label: "Cardio", description: "Running, cycling, HIIT" },
        { value: "yoga", label: "Yoga", description: "Flexibility and mindfulness" },
        { value: "pilates", label: "Pilates", description: "Core strength and stability" },
        { value: "functional", label: "Functional Training", description: "Real-world movement patterns" }
      ]
    },
    {
      key: "injuriesOrLimitations",
      title: "Do you have any injuries or physical limitations?",
      type: "checkbox",
      options: [
        { value: "none", label: "No injuries or limitations", description: "I can do all exercises" },
        { value: "knee", label: "Knee issues", description: "Knee pain or limitations" },
        { value: "back", label: "Back problems", description: "Lower or upper back issues" },
        { value: "shoulder", label: "Shoulder issues", description: "Shoulder pain or mobility limits" },
        { value: "ankle", label: "Ankle problems", description: "Ankle instability or pain" },
        { value: "wrist", label: "Wrist/hand issues", description: "Wrist pain or grip limitations" },
        { value: "other", label: "Other limitations", description: "Other physical restrictions" }
      ]
    }
  ];

  const handleAnswerChange = (key: string, value: any, isCheckbox = false) => {
    setQuestionnaire(prev => ({
      ...prev,
      [key]: isCheckbox 
        ? (prev[key as keyof QuestionnaireData] as string[]).includes(value)
          ? (prev[key as keyof QuestionnaireData] as string[]).filter((item: string) => item !== value)
          : [...(prev[key as keyof QuestionnaireData] as string[]), value]
        : value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save preferences (which will trigger plan generation)
      savePreferencesMutation.mutate(questionnaire);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    const question = questions[currentStep];
    const value = questionnaire[question.key as keyof QuestionnaireData];
    
    if (question.type === "checkbox") {
      return Array.isArray(value) && value.length > 0;
    }
    
    return value !== "" && value !== undefined;
  };

  const renderWeeklySchedule = () => {
    if (!workoutPlan?.plannedWorkouts) {
      return (
        <Card className="bg-black/80 border-red-800/30">
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto">
              <Dumbbell className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">No Workout Plan Generated Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Click the "Generate New Plan" button below to create your personalized AI-powered workout plan.
            </p>
            <Button 
              onClick={() => generatePlanMutation.mutate()} 
              disabled={generatePlanMutation.isPending}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              data-testid="button-generate-initial-plan"
            >
              {generatePlanMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Your Plan...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate My Workout Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      );
    }

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentWeek = 1; // For now, show first week
    
    const weekWorkouts = workoutPlan.plannedWorkouts.filter(w => w.weekNumber === currentWeek);
    
    return (
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
          <Calendar className="w-5 h-5" />
          Weekly Schedule - Week {currentWeek}
        </h3>
        <div className="grid gap-3">
          {daysOfWeek.map((day, index) => {
            const dayWorkout = weekWorkouts.find(w => w.dayOfWeek === index);
            
            return (
              <Card key={day} className={`p-4 ${dayWorkout?.isRestDay ? 'bg-gray-900/50' : 'bg-gray-900/70'}`} data-testid={`workout-card-${day.toLowerCase()}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium text-white">{day}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {dayWorkout ? (
                      dayWorkout.isRestDay ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" />
                          Rest Day
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="flex items-center gap-1">
                            <Dumbbell className="w-3 h-3" />
                            {dayWorkout.workoutType}
                          </Badge>
                          <span className="text-sm text-gray-400">
                            {dayWorkout.estimatedDuration}min
                          </span>
                        </div>
                      )
                    ) : (
                      <Badge variant="outline">No workout</Badge>
                    )}
                  </div>
                </div>
                {dayWorkout && !dayWorkout.isRestDay && (
                  <div className="mt-3 space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white">{dayWorkout.name}</h4>
                      <p className="text-sm text-gray-400">{dayWorkout.description}</p>
                    </div>
                    
                    {dayWorkout.exercises && Array.isArray(dayWorkout.exercises) && dayWorkout.exercises.length > 0 ? (
                      <div className="space-y-2 mt-4 pt-3 border-t border-gray-700">
                        <h5 className="text-sm font-medium text-white flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          Exercises ({dayWorkout.exercises.length})
                        </h5>
                        <div className="space-y-3">
                          {(dayWorkout.exercises as any[]).map((exercise: any, idx: number) => (
                            <div key={idx} className="bg-gray-800/50 rounded-lg p-3 space-y-1" data-testid={`exercise-${idx}`}>
                              <div className="flex items-start justify-between">
                                <span className="font-medium text-white text-sm">{exercise.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {exercise.sets} × {exercise.reps}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span>Rest: {exercise.restSeconds}s</span>
                              </div>
                              {exercise.notes && (
                                <p className="text-xs text-gray-500 mt-1 italic">{exercise.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  if (showPlan && preferences) {
    return (
      <FeatureGate feature="workout_planner">
        <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Your Personalized Workout Plan
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Based on your preferences, we've created a customized workout plan with rest days included.
          </p>
        </div>

        <PageMedicalDisclaimer type="exercise" />
        <AIGeneratedDisclaimer />

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="preferences">Your Preferences</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            {renderWeeklySchedule()}
            
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => generatePlanMutation.mutate()} 
                disabled={generatePlanMutation.isPending}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {generatePlanMutation.isPending ? "Generating..." : "Generate New Plan"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPlan(false)}
                className="flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Retake Quiz
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Workout Preferences</CardTitle>
                <CardDescription>These settings were used to create your plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-white">Fitness Level</Label>
                    <Badge variant="outline" className="mt-1 capitalize">{preferences.fitnessLevel}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-white">Workout Days</Label>
                    <Badge variant="outline" className="mt-1">{preferences.workoutDaysPerWeek} days/week</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-white">Session Duration</Label>
                    <Badge variant="outline" className="mt-1">{preferences.sessionDuration} minutes</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-white">Primary Goals</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {preferences.primaryGoals.map(goal => (
                        <Badge key={goal} variant="secondary" className="text-xs">
                          {goal.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Weekly Progress
                </CardTitle>
                <CardDescription>Track your workout completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="text-sm font-medium">0/{preferences.workoutDaysPerWeek} completed</span>
                  </div>
                  <Progress value={0} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <HealthSources />
      </div>
      </FeatureGate>
    );
  }

  // Questionnaire flow
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <FeatureGate feature="workout_planner">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Target className="w-8 h-8 text-primary" />
          Workout Planner
        </h1>
        <p className="text-gray-600">
          Let's create a personalized workout plan tailored to your goals and preferences
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      <PageMedicalDisclaimer type="exercise" />
      <AIGeneratedDisclaimer />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.type === "radio" ? (
            <RadioGroup
              value={questionnaire[currentQuestion.key as keyof QuestionnaireData] as string}
              onValueChange={(value) => handleAnswerChange(currentQuestion.key, value)}
            >
              {currentQuestion.options.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isChecked = (questionnaire[currentQuestion.key as keyof QuestionnaireData] as string[]).includes(option.value);
                return (
                  <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id={option.value}
                      checked={isChecked}
                      onCheckedChange={() => handleAnswerChange(currentQuestion.key, option.value, true)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="font-medium cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isStepValid() || savePreferencesMutation.isPending || generatePlanMutation.isPending}
          className="flex items-center gap-2"
          data-testid="next-button"
        >
          {currentStep === questions.length - 1 ? (
            savePreferencesMutation.isPending || generatePlanMutation.isPending ? (
              "Creating Plan..."
            ) : (
              "Create My Plan"
            )
          ) : (
            "Next"
          )}
        </Button>
      </div>
      
      <HealthSources />
    </div>
    </FeatureGate>
  );
}