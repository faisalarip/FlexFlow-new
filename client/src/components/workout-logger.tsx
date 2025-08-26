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
    { name: "Push-ups", category: "strength", icon: Hand, color: "blue", description: "Upper body strength" },
    { name: "Running", category: "cardio", icon: Activity, color: "green", description: "Cardio endurance" },
    { name: "Squats", category: "strength", icon: ArrowUpDown, color: "purple", description: "Lower body power" },
    { name: "Yoga", category: "yoga", icon: Leaf, color: "pink", description: "Flexibility & mind" },
    { name: "Deadlifts", category: "strength", icon: Weight, color: "red", description: "Full body strength" },
    { name: "Cycling", category: "cardio", icon: Bike, color: "yellow", description: "Leg endurance" },
  ];

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

      {/* Quick Exercise Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quickExercises.map((exercise) => {
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
        })}
      </div>

      {createWorkoutMutation.isPending && (
        <p className="text-center text-muted mt-4">Creating workout...</p>
      )}
    </section>
  );
}
