import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Expand, Hand, Activity, ArrowUpDown, Leaf, Weight, Bike, Dumbbell, X, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { Exercise } from "@shared/schema";

export default function WorkoutLogger() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("strength");
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
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
    { id: "dumbbells", name: "Dumbbells", icon: Weight },
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
    
    // Dumbbell Exercises
    { name: "Dumbbell Press", category: "dumbbells", icon: Weight, color: "blue", description: "Chest development" },
    { name: "Dumbbell Rows", category: "dumbbells", icon: Weight, color: "green", description: "Back muscle building" },
    { name: "Dumbbell Curls", category: "dumbbells", icon: Weight, color: "blue", description: "Bicep isolation" },
    { name: "Dumbbell Flyes", category: "dumbbells", icon: Weight, color: "blue", description: "Chest isolation" },
    { name: "Dumbbell Squats", category: "dumbbells", icon: Weight, color: "purple", description: "Leg strength" },
    { name: "Dumbbell Lunges", category: "dumbbells", icon: Weight, color: "purple", description: "Single leg work" },
    { name: "Dumbbell Shoulder Press", category: "dumbbells", icon: Weight, color: "yellow", description: "Shoulder development" },
    { name: "Dumbbell Lateral Raises", category: "dumbbells", icon: Weight, color: "yellow", description: "Side deltoid focus" },
    { name: "Dumbbell Front Raises", category: "dumbbells", icon: Weight, color: "yellow", description: "Front deltoid work" },
    { name: "Dumbbell Shrugs", category: "dumbbells", icon: Weight, color: "green", description: "Trap muscle building" },
    { name: "Dumbbell Deadlifts", category: "dumbbells", icon: Weight, color: "red", description: "Posterior chain" },
    { name: "Dumbbell Step-ups", category: "dumbbells", icon: Weight, color: "purple", description: "Functional leg work" },
    { name: "Dumbbell Tricep Extensions", category: "dumbbells", icon: Weight, color: "blue", description: "Tricep isolation" },
    { name: "Dumbbell Hammer Curls", category: "dumbbells", icon: Weight, color: "blue", description: "Bicep variation" },
    { name: "Dumbbell Thrusters", category: "dumbbells", icon: Weight, color: "red", description: "Full body exercise" },
    { name: "Dumbbell Russian Twists", category: "dumbbells", icon: Weight, color: "purple", description: "Weighted core work" },
    { name: "Dumbbell Walking Lunges", category: "dumbbells", icon: Weight, color: "purple", description: "Dynamic leg exercise" },
    { name: "Dumbbell Renegade Rows", category: "dumbbells", icon: Weight, color: "red", description: "Core and back combo" },
    { name: "Dumbbell Goblet Squats", category: "dumbbells", icon: Weight, color: "purple", description: "Front-loaded squats" },
    { name: "Dumbbell Bulgarian Split Squats", category: "dumbbells", icon: Weight, color: "purple", description: "Single leg focus" },
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

  // Exercise instructions database
  const exerciseInstructions: Record<string, { steps: string[], tips: string[], muscles: string[] }> = {
    "Push-ups": {
      steps: [
        "Start in a plank position with hands shoulder-width apart",
        "Lower your body until chest nearly touches the floor",
        "Push back up to starting position",
        "Keep your core tight throughout the movement"
      ],
      tips: ["Keep your body in a straight line", "Don't let your hips sag", "Control the movement"],
      muscles: ["Chest", "Triceps", "Shoulders", "Core"]
    },
    "Squats": {
      steps: [
        "Stand with feet shoulder-width apart",
        "Lower your body by bending at hips and knees",
        "Go down until thighs are parallel to floor",
        "Push through heels to return to starting position"
      ],
      tips: ["Keep chest up", "Don't let knees cave inward", "Weight on heels"],
      muscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"]
    },
    "Deadlifts": {
      steps: [
        "Stand with feet hip-width apart, bar over mid-foot",
        "Bend at hips and knees to grip the bar",
        "Lift by driving through heels and extending hips",
        "Keep bar close to body throughout movement"
      ],
      tips: ["Keep back straight", "Don't round shoulders", "Engage core"],
      muscles: ["Hamstrings", "Glutes", "Lower Back", "Traps"]
    },
    "Plank": {
      steps: [
        "Start in push-up position on forearms",
        "Keep body in straight line from head to heels",
        "Hold position while breathing normally",
        "Don't let hips sag or pike up"
      ],
      tips: ["Engage core muscles", "Keep neck neutral", "Start with shorter holds"],
      muscles: ["Core", "Shoulders", "Glutes"]
    },
    "Pull-ups": {
      steps: [
        "Hang from bar with palms facing away",
        "Pull body up until chin clears the bar",
        "Lower with control to full arm extension",
        "Repeat without swinging"
      ],
      tips: ["Engage lats", "Don't use momentum", "Full range of motion"],
      muscles: ["Lats", "Biceps", "Rhomboids", "Core"]
    },
    "Bench Press": {
      steps: [
        "Lie on bench with eyes under the bar",
        "Grip bar slightly wider than shoulder-width",
        "Lower bar to chest with control",
        "Press bar back up to starting position"
      ],
      tips: ["Keep feet on floor", "Retract shoulder blades", "Don't bounce off chest"],
      muscles: ["Chest", "Triceps", "Front Deltoids"]
    },
    "Dumbbell Curls": {
      steps: [
        "Stand with dumbbells at your sides",
        "Keep elbows close to your body",
        "Curl weights up to shoulder level",
        "Lower with control to starting position"
      ],
      tips: ["Don't swing the weights", "Keep wrists straight", "Focus on bicep contraction"],
      muscles: ["Biceps", "Forearms"]
    },
    "Running": {
      steps: [
        "Start with proper warm-up and stretching",
        "Maintain upright posture with slight forward lean",
        "Land on midfoot, not heel or toes",
        "Keep arms relaxed with 90-degree bend"
      ],
      tips: ["Start slow and build endurance", "Breathe rhythmically", "Stay hydrated"],
      muscles: ["Legs", "Glutes", "Core", "Cardiovascular System"]
    }
  };

  const getExerciseInstructions = (exerciseName: string) => {
    return exerciseInstructions[exerciseName] || {
      steps: [
        "Position yourself in the starting stance",
        "Perform the movement with controlled form",
        "Focus on proper breathing throughout",
        "Return to starting position with control"
      ],
      tips: ["Start with lighter weight", "Focus on form over speed", "Listen to your body"],
      muscles: ["Target muscle groups", "Stabilizing muscles"]
    };
  };

  const handleExerciseClick = (exercise: any) => {
    setSelectedExercise(exercise);
  };

  const handleStartWorkout = (exerciseName: string) => {
    // This would typically open a workout tracking modal
    // For now, we'll create a simple workout entry
    createWorkoutMutation.mutate({
      name: exerciseName,
      category: "strength",
      duration: 30,
      caloriesBurned: 200,
    });
    setSelectedExercise(null);
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
      {(searchQuery || filteredExercises.length > 6) ? (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-muted">
            {searchQuery ? 
              (filteredExercises.length > 0 ? `Found ${filteredExercises.length} exercise${filteredExercises.length === 1 ? '' : 's'}` : 'No exercises found') :
              `Showing ${Math.min(filteredExercises.length, showAllExercises ? filteredExercises.length : 6)} of ${filteredExercises.length} exercises`
            }
          </p>
          {!searchQuery && filteredExercises.length > 6 && (
            <button
              onClick={() => setShowAllExercises(!showAllExercises)}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              data-testid="view-all-exercises-button"
            >
              {showAllExercises ? 'Show Less' : 'View All'}
            </button>
          )}
        </div>
      ) : null}
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filteredExercises.length > 0 ? 
          (searchQuery || showAllExercises ? filteredExercises : filteredExercises.slice(0, 6))
          .map((exercise) => {
          const IconComponent = exercise.icon;
          return (
            <button
              key={exercise.name}
              onClick={() => handleExerciseClick(exercise)}
              disabled={createWorkoutMutation.isPending}
              className={`bg-gradient-to-br from-${exercise.color}-50 to-${exercise.color}-100 border border-${exercise.color}-200 rounded-xl p-4 text-left hover:from-${exercise.color}-100 hover:to-${exercise.color}-200 transition-all group disabled:opacity-50`}
              data-testid={`exercise-${exercise.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <IconComponent className={`text-${exercise.color}-600 text-lg group-hover:scale-110 transition-transform`} />
                <span className="font-medium text-gray-800">{exercise.name}</span>
              </div>
              <p className="text-xs text-muted">{exercise.description}</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Play className="w-3 h-3 mr-1" />
                <span>View instructions</span>
              </div>
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

      {/* Exercise Instructions Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedExercise(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <selectedExercise.icon className={`text-${selectedExercise.color}-600 text-2xl`} />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedExercise.name}</h2>
                    <p className="text-muted capitalize">{selectedExercise.category} • {selectedExercise.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  data-testid="close-exercise-modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Exercise Instructions */}
              <div className="space-y-6">
                {/* Target Muscles */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Target Muscles</h3>
                  <div className="flex flex-wrap gap-2">
                    {getExerciseInstructions(selectedExercise.name).muscles.map((muscle, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Perform</h3>
                  <ol className="space-y-3">
                    {getExerciseInstructions(selectedExercise.name).steps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-gray-700">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tips */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Pro Tips</h3>
                  <ul className="space-y-2">
                    {getExerciseInstructions(selectedExercise.name).tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-500 mt-1">💡</span>
                        <p className="text-gray-700">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-8">
                <Button
                  onClick={() => handleStartWorkout(selectedExercise.name)}
                  disabled={createWorkoutMutation.isPending}
                  className="flex-1"
                  data-testid="start-workout-button"
                >
                  {createWorkoutMutation.isPending ? 'Starting...' : 'Start Workout'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedExercise(null)}
                  className="px-6"
                  data-testid="close-modal-button"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
