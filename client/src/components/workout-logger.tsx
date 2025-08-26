import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Expand, Hand, Activity, ArrowUpDown, Leaf, Weight, Bike, Dumbbell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { Exercise } from "@shared/schema";

export default function WorkoutLogger() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("strength");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises", { category: selectedCategory, search: searchQuery }],
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (workout: { name: string; category: string; duration: number; caloriesBurned: number }) => {
      const response = await apiRequest("POST", "/api/workouts", workout);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const categories = [
    { id: "strength", name: "Strength", icon: Dumbbell },
    { id: "cardio", name: "Cardio", icon: Activity },
    { id: "yoga", name: "Yoga", icon: Leaf },
    { id: "swimming", name: "Swimming", icon: Activity },
  ];

  const quickExercises = [
    // Strength Training - Upper Body
    { name: "Push-ups", category: "strength", icon: Hand, color: "blue", description: "Upper body strength" },
    { name: "Bench Press", category: "strength", icon: Weight, color: "blue", description: "Chest strength" },
    { name: "Pull-ups", category: "strength", icon: ArrowUpDown, color: "green", description: "Back and arms" },
    { name: "Chin-ups", category: "strength", icon: ArrowUpDown, color: "green", description: "Biceps and back" },
    { name: "Dips", category: "strength", icon: Hand, color: "blue", description: "Triceps and chest" },
    { name: "Overhead Press", category: "strength", icon: Weight, color: "purple", description: "Shoulder strength" },
    { name: "Bicep Curls", category: "strength", icon: Weight, color: "blue", description: "Arm muscle building" },
    { name: "Tricep Extensions", category: "strength", icon: Weight, color: "purple", description: "Tricep isolation" },
    { name: "Lat Pulldowns", category: "strength", icon: ArrowUpDown, color: "green", description: "Back width" },
    { name: "Rows", category: "strength", icon: Weight, color: "green", description: "Back thickness" },
    
    // Strength Training - Lower Body
    { name: "Squats", category: "strength", icon: ArrowUpDown, color: "purple", description: "Lower body power" },
    { name: "Deadlifts", category: "strength", icon: Weight, color: "red", description: "Full body strength" },
    { name: "Lunges", category: "strength", icon: ArrowUpDown, color: "purple", description: "Leg stability" },
    { name: "Leg Press", category: "strength", icon: Weight, color: "purple", description: "Quad development" },
    { name: "Calf Raises", category: "strength", icon: ArrowUpDown, color: "blue", description: "Calf muscle" },
    { name: "Romanian Deadlifts", category: "strength", icon: Weight, color: "red", description: "Hamstring focus" },
    { name: "Bulgarian Split Squats", category: "strength", icon: ArrowUpDown, color: "purple", description: "Single leg strength" },
    { name: "Hip Thrusts", category: "strength", icon: Weight, color: "pink", description: "Glute activation" },
    
    // Strength Training - Core
    { name: "Plank", category: "strength", icon: Hand, color: "purple", description: "Core strength" },
    { name: "Crunches", category: "strength", icon: Hand, color: "purple", description: "Abdominal focus" },
    { name: "Russian Twists", category: "strength", icon: Hand, color: "purple", description: "Oblique strength" },
    { name: "Mountain Climbers", category: "strength", icon: Activity, color: "red", description: "Core cardio" },
    { name: "Dead Bug", category: "strength", icon: Hand, color: "purple", description: "Core stability" },
    { name: "Hanging Leg Raises", category: "strength", icon: ArrowUpDown, color: "green", description: "Lower abs" },
    
    // Cardio Exercises
    { name: "Running", category: "cardio", icon: Activity, color: "green", description: "Cardio endurance" },
    { name: "Cycling", category: "cardio", icon: Bike, color: "yellow", description: "Leg endurance" },
    { name: "Burpees", category: "cardio", icon: Activity, color: "red", description: "Full body cardio" },
    { name: "Jumping Jacks", category: "cardio", icon: Activity, color: "green", description: "Quick cardio burst" },
    { name: "High Knees", category: "cardio", icon: Activity, color: "yellow", description: "Leg cardio" },
    { name: "Treadmill", category: "cardio", icon: Activity, color: "green", description: "Indoor running" },
    { name: "Elliptical", category: "cardio", icon: Activity, color: "blue", description: "Low impact cardio" },
    { name: "Rowing Machine", category: "cardio", icon: Activity, color: "red", description: "Full body cardio" },
    { name: "Stair Climber", category: "cardio", icon: Activity, color: "purple", description: "Leg cardio" },
    { name: "Battle Ropes", category: "cardio", icon: Activity, color: "red", description: "Upper body cardio" },
    { name: "Box Jumps", category: "cardio", icon: ArrowUpDown, color: "yellow", description: "Explosive power" },
    { name: "Sprint Intervals", category: "cardio", icon: Activity, color: "red", description: "High intensity" },
    
    // Yoga & Flexibility
    { name: "Yoga", category: "yoga", icon: Leaf, color: "pink", description: "Flexibility & mind" },
    { name: "Meditation", category: "yoga", icon: Leaf, color: "pink", description: "Mental wellness" },
    { name: "Sun Salutation", category: "yoga", icon: Leaf, color: "pink", description: "Flow sequence" },
    { name: "Warrior Pose", category: "yoga", icon: Leaf, color: "pink", description: "Strength & balance" },
    { name: "Downward Dog", category: "yoga", icon: Leaf, color: "pink", description: "Full body stretch" },
    { name: "Child's Pose", category: "yoga", icon: Leaf, color: "pink", description: "Relaxation pose" },
    { name: "Pigeon Pose", category: "yoga", icon: Leaf, color: "pink", description: "Hip flexibility" },
    { name: "Stretching", category: "yoga", icon: Leaf, color: "pink", description: "Muscle recovery" },
    
    // Swimming
    { name: "Swimming", category: "swimming", icon: Activity, color: "blue", description: "Full body cardio" },
    { name: "Freestyle", category: "swimming", icon: Activity, color: "blue", description: "Front crawl stroke" },
    { name: "Backstroke", category: "swimming", icon: Activity, color: "blue", description: "Back swimming" },
    { name: "Breaststroke", category: "swimming", icon: Activity, color: "blue", description: "Chest stroke" },
    { name: "Butterfly", category: "swimming", icon: Activity, color: "blue", description: "Advanced stroke" },
    { name: "Water Aerobics", category: "swimming", icon: Activity, color: "blue", description: "Low impact exercise" },
    { name: "Treading Water", category: "swimming", icon: Activity, color: "blue", description: "Core & leg workout" },
  ];

  // Filter exercises based on search query
  const getFilteredExercises = () => {
    if (!searchQuery.trim()) {
      return quickExercises.filter(exercise => exercise.category === selectedCategory);
    }
    
    return quickExercises.filter(exercise => 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredExercises = getFilteredExercises();

  const handleStartWorkout = (exerciseName: string) => {
    // This would typically open a workout tracking modal
    // For now, we'll create a simple workout entry
    createWorkoutMutation.mutate({
      name: exerciseName,
      category: "strength",
      duration: 30,
      caloriesBurned: 200,
    });
  };

  return (
    <section id="workout-logger" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Log Workout</h3>
        <button 
          className="text-primary hover:text-primary/80 transition-colors"
          onClick={() => setLocation('/workouts')}
          data-testid="expand-workouts-button"
          title="View all workouts"
        >
          <Expand />
        </button>
      </div>

      {/* Exercise Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={16} />
          <Input
            type="text"
            placeholder="Search exercises (e.g., push-ups, running, yoga)"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Workout Categories */}
      <div className="mb-6">
        <p className="text-sm font-medium text-muted mb-3">Popular Categories</p>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="transition-colors"
            >
              <category.icon className="mr-2" size={16} />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Exercise Results */}
      {searchQuery ? (
        <div className="mb-4">
          <p className="text-sm font-medium text-muted mb-3">
            {filteredExercises.length > 0 ? `Found ${filteredExercises.length} exercise${filteredExercises.length === 1 ? '' : 's'}` : 'No exercises found'}
          </p>
        </div>
      ) : null}
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filteredExercises.length > 0 ? filteredExercises.map((exercise) => {
          const IconComponent = exercise.icon;
          return (
            <button
              key={exercise.name}
              onClick={() => handleStartWorkout(exercise.name)}
              disabled={createWorkoutMutation.isPending}
              className={`bg-gradient-to-br from-${exercise.color}-50 to-${exercise.color}-100 border border-${exercise.color}-200 rounded-xl p-4 text-left hover:from-${exercise.color}-100 hover:to-${exercise.color}-200 transition-all group disabled:opacity-50`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <IconComponent className={`text-${exercise.color}-600 text-lg group-hover:scale-110 transition-transform`} />
                <span className="font-medium text-gray-800">{exercise.name}</span>
              </div>
              <p className="text-xs text-muted">{exercise.description}</p>
            </button>
          );
        }) : (
          <div className="col-span-full text-center py-8">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-500 mb-2">
              {searchQuery ? 'No exercises found' : 'Try searching for an exercise'}
            </p>
            <p className="text-sm text-gray-400">
              {searchQuery ? `No exercises match "${searchQuery}"` : 'Search for exercises like "push-ups", "running", or "yoga"'}
            </p>
          </div>
        )}
      </div>

      {createWorkoutMutation.isPending && (
        <p className="text-center text-muted mt-4">Creating workout...</p>
      )}
    </section>
  );
}
