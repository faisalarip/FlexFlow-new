import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Expand, Hand, Activity, ArrowUpDown, Leaf, Weight, Bike, Dumbbell, X, Play, Star, TrendingUp, Camera, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Exercise } from "@shared/schema";
import dumbbellExercisesImage from "@assets/IMG_6694_1758675702051.jpeg";
import pushUpExerciseImage from "@assets/generated_images/Man_performing_push-up_exercise_19b36844.png";
import benchPressImage from "@assets/generated_images/Man_performing_bench_press_60a51258.png";
import pullUpExerciseImage from "@assets/generated_images/Black_man_performing_pull-ups_3605874d.png";
import chinUpExerciseImage from "@assets/generated_images/Black_man_and_woman_chin-ups_7848bb87.png";
import dipExerciseImage from "@assets/generated_images/Man_and_woman_dips_e6984611.png";
import overheadPressImage from "@assets/generated_images/Man_and_woman_dumbbell_shoulder_press_0adea308.png";
import bicepCurlsImage from "@assets/generated_images/Man_and_woman_dumbbell_curls_f43bb36e.png";
import dumbbellFlyesImage from "@assets/generated_images/Man_and_woman_dumbbell_flyes_de771e8c.png";
import dumbbellRollsImage from "@assets/stock_images/black_woman_performi_21123039.jpg";
import tricepExtensionsImage from "@assets/generated_images/Black_guy_and_lady_tricep_extensions_3cce0d7d.png";
import latPulldownImage from "@assets/generated_images/Man_and_woman_lat_pulldown_dbce7bd1.png";
import rowsImage from "@assets/IMG_6694_1758675702051.jpeg";
import squatsImage from "@assets/generated_images/Man_and_woman_dumbbell_squats_2743b80a.png";
import deadliftsImage from "@assets/generated_images/Black_guy_and_lady_deadlifts_3066fc1b.png";
import lungesImage from "@assets/generated_images/Man_and_woman_dumbbell_lunges_c5474eaf.png";
import legPressImage from "@assets/generated_images/Black_woman_leg_press_exercise_c612272f.png";
import calfRaisesImage from "@assets/generated_images/Black_guy_and_lady_calf_raises_3cb5cf18.png";
import romanianDeadliftsImage from "@assets/generated_images/Black_guy_and_lady_Romanian_deadlifts_cba72218.png";
import hipThrustsImage from "@assets/generated_images/Black_woman_performing_hip_thrusts_ebc9e75c.png";
import plankImage from "@assets/generated_images/Man_performing_plank_exercise_5bcbc71c.png";
import crunchesImage from "@assets/generated_images/Woman_performing_crunches_exercise_2d16cfd0.png";
import russianTwistsImage from "@assets/generated_images/Man_performing_Russian_twists_ca261386.png";
import mountainClimbersImage from "@assets/generated_images/Woman_performing_mountain_climbers_35705bbe.png";
import deadBugImage from "@assets/generated_images/Man_performing_dead_bug_7bdcdb1e.png";
import hangingLegRaisesImage from "@assets/generated_images/Woman_performing_hanging_leg_raises_ef4d5db2.png";
import lateralRaisesImage from "@assets/generated_images/Man_and_woman_dumbbell_lateral_raises_a9e51d80.png";
import frontRaisesImage from "@assets/generated_images/Man_and_woman_dumbbell_front_raises_f19c02ce.png";
import dumbbellShrugsImage from "@assets/generated_images/Woman_performing_dumbbell_shrugs_ac5db82c.png";
import dumbbellStepUpsImage from "@assets/generated_images/Man_performing_dumbbell_step-ups_da98f98d.png";
import dumbbellRenegadeRowsImage from "@assets/generated_images/Man_performing_dumbbell_renegade_rows_195725be.png";
import dumbbellThrustersImage from "@assets/generated_images/Woman_performing_dumbbell_thrusters_e6b4460d.png";
import workoutBgImage from "@assets/stock_images/men_and_women_workin_dbbf742b.jpg";

export default function WorkoutLogger() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("strength");
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [difficultyLevel, setDifficultyLevel] = useState([3]);
  const [perceivedExertion, setPerceivedExertion] = useState([5]);
  const [workoutDuration, setWorkoutDuration] = useState([30]);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showProgressPhotoPrompt, setShowProgressPhotoPrompt] = useState(false);
  const [lastCompletedWorkout, setLastCompletedWorkout] = useState<any>(null);
  
  // Exercise-specific input states
  const [exerciseSets, setExerciseSets] = useState(3);
  const [exerciseReps, setExerciseReps] = useState(10);
  const [exerciseWeight, setExerciseWeight] = useState(0);
  const [exerciseDuration, setExerciseDuration] = useState(0);
  const [exerciseNotes, setExerciseNotes] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Helper function to calculate calories based on exercise details
  const calculateExerciseCalories = (exercise: any, sets: number, reps: number, weight: number, duration: number, difficultyLevel: number) => {
    let baseCalories = 0;
    const exerciseName = exercise.name.toLowerCase();
    const category = exercise.category.toLowerCase();

    // Base calorie calculation by exercise category
    if (category === 'strength') {
      // Strength training: ~5-8 calories per minute, plus weight factor
      baseCalories = (sets * reps * 0.5) + (weight * 0.1) + (workoutDuration[0] * 6);
      if (exerciseName.includes('squat') || exerciseName.includes('deadlift')) {
        baseCalories *= 1.3; // Compound movements burn more
      }
    } else if (category === 'cardio') {
      // Cardio: ~8-12 calories per minute based on intensity
      baseCalories = workoutDuration[0] * (8 + difficultyLevel * 0.8);
      if (duration > 0) {
        baseCalories = duration / 60 * (8 + difficultyLevel * 0.8); // Use actual duration if provided
      }
    } else if (category === 'yoga' || category === 'flexibility') {
      // Yoga/Flexibility: ~3-5 calories per minute
      baseCalories = workoutDuration[0] * (3 + difficultyLevel * 0.4);
    } else {
      // Default: moderate intensity
      baseCalories = workoutDuration[0] * (5 + difficultyLevel * 0.6);
    }

    // Apply difficulty multiplier
    baseCalories *= (0.8 + difficultyLevel * 0.1);
    
    return Math.round(baseCalories);
  };

  // Helper function to get the appropriate demo image based on exercise name
  const getDemoImage = (exerciseName: string) => {
    const exerciseNameLower = exerciseName.toLowerCase();
    if (exerciseNameLower.includes('push-up') || exerciseNameLower.includes('pushup')) {
      return pushUpExerciseImage;
    }
    if (exerciseNameLower.includes('bench press') || exerciseNameLower.includes('dumbbell press')) {
      return benchPressImage;
    }
    if (exerciseNameLower.includes('chin-up') || exerciseNameLower.includes('chinup')) {
      return chinUpExerciseImage;
    }
    if (exerciseNameLower.includes('pull-up') || exerciseNameLower.includes('pullup')) {
      return pullUpExerciseImage;
    }
    if (exerciseNameLower.includes('dip') && !exerciseNameLower.includes('dumbbell')) {
      return dipExerciseImage;
    }
    if (exerciseNameLower.includes('overhead press') || exerciseNameLower.includes('military press') || exerciseNameLower.includes('shoulder press')) {
      return overheadPressImage;
    }
    if (exerciseNameLower.includes('lateral raise') || exerciseNameLower.includes('lateral raises')) {
      return lateralRaisesImage;
    }
    if (exerciseNameLower.includes('front raise') || exerciseNameLower.includes('front raises')) {
      return frontRaisesImage;
    }
    if (exerciseNameLower.includes('bicep') && (exerciseNameLower.includes('curl') || exerciseNameLower.includes('curls'))) {
      return bicepCurlsImage;
    }
    if (exerciseNameLower.includes('dumbbell') && (exerciseNameLower.includes('curl') || exerciseNameLower.includes('curls'))) {
      return bicepCurlsImage;
    }
    if (exerciseNameLower.includes('dumbbell') && (exerciseNameLower.includes('fly') || exerciseNameLower.includes('flyes') || exerciseNameLower.includes('flys'))) {
      return dumbbellFlyesImage;
    }
    if (exerciseNameLower.includes('dumbbell') && (exerciseNameLower.includes('roll') || exerciseNameLower.includes('rolls'))) {
      return dumbbellRollsImage;
    }
    if (exerciseNameLower.includes('tricep') && (exerciseNameLower.includes('extension') || exerciseNameLower.includes('extensions'))) {
      return tricepExtensionsImage;
    }
    if (exerciseNameLower.includes('lat pulldown') || exerciseNameLower.includes('lat pull down') || exerciseNameLower.includes('pulldown')) {
      return latPulldownImage;
    }
    if (exerciseNameLower.includes('row') && !exerciseNameLower.includes('barrow')) {
      return rowsImage;
    }
    if (exerciseNameLower.includes('squat') || exerciseNameLower.includes('squats')) {
      return squatsImage;
    }
    if (exerciseNameLower.includes('dumbbell') && (exerciseNameLower.includes('squat') || exerciseNameLower.includes('squats'))) {
      return squatsImage;
    }
    if (exerciseNameLower.includes('deadlift') && !exerciseNameLower.includes('romanian')) {
      return deadliftsImage;
    }
    if (exerciseNameLower.includes('romanian deadlift')) {
      return romanianDeadliftsImage;
    }
    if (exerciseNameLower.includes('lunge') || exerciseNameLower.includes('lunges')) {
      return lungesImage;
    }
    if (exerciseNameLower.includes('dumbbell') && (exerciseNameLower.includes('lunge') || exerciseNameLower.includes('lunges'))) {
      return lungesImage;
    }
    if (exerciseNameLower.includes('leg press')) {
      return legPressImage;
    }
    if (exerciseNameLower.includes('calf raise') || exerciseNameLower.includes('calf raises')) {
      return calfRaisesImage;
    }
    if (exerciseNameLower.includes('hip thrust') || exerciseNameLower.includes('hip thrusts')) {
      return hipThrustsImage;
    }
    if (exerciseNameLower.includes('plank')) {
      return plankImage;
    }
    if (exerciseNameLower.includes('crunch') || exerciseNameLower.includes('crunches')) {
      return crunchesImage;
    }
    if (exerciseNameLower.includes('russian twist') || exerciseNameLower.includes('russian twists')) {
      return russianTwistsImage;
    }
    if (exerciseNameLower.includes('mountain climber') || exerciseNameLower.includes('mountain climbers')) {
      return mountainClimbersImage;
    }
    if (exerciseNameLower.includes('dead bug')) {
      return deadBugImage;
    }
    if (exerciseNameLower.includes('hanging leg raise') || exerciseNameLower.includes('hanging leg raises')) {
      return hangingLegRaisesImage;
    }
    if (exerciseNameLower.includes('dumbbell') && (exerciseNameLower.includes('shrug') || exerciseNameLower.includes('shrugs'))) {
      return dumbbellShrugsImage;
    }
    if (exerciseNameLower.includes('dumbbell') && (exerciseNameLower.includes('step-up') || exerciseNameLower.includes('step up') || exerciseNameLower.includes('stepup'))) {
      return dumbbellStepUpsImage;
    }
    if (exerciseNameLower.includes('renegade') && (exerciseNameLower.includes('row') || exerciseNameLower.includes('rows'))) {
      return dumbbellRenegadeRowsImage;
    }
    if (exerciseNameLower.includes('dumbbell') && (exerciseNameLower.includes('thruster') || exerciseNameLower.includes('thrusters'))) {
      return dumbbellThrustersImage;
    }
    // Default to dumbbell exercises image for other exercises
    return dumbbellExercisesImage;
  };

  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises", { category: selectedCategory, search: searchQuery }],
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (workout: { 
      name: string; 
      category: string; 
      duration: number; 
      caloriesBurned: number;
      difficultyLevel?: number;
      perceivedExertion?: number;
      completionRate?: number;
    }) => {
      const response = await apiRequest("POST", "/api/workouts", workout);
      return response.json();
    },
    onSuccess: (workoutData) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress/weight"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance-analytics"] });
      
      // Store completed workout data and show progress photo prompt
      setLastCompletedWorkout(workoutData);
      setShowProgressPhotoPrompt(true);
      toast({
        title: "Workout Logged! 🔥",
        description: "Your workout has been successfully recorded with AI difficulty tracking.",
      });
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
    // Use quickExercises as the base and enrich with API data if available
    const exercisesWithProps = quickExercises.map(quickEx => {
      // Find matching API exercise for additional data
      const apiExercise = (exercises || []).find(ex => ex.name === quickEx.name);
      return {
        ...quickEx,
        ...(apiExercise || {}), // Merge API data if available
        icon: quickEx.icon,
        color: quickEx.color,
        description: apiExercise?.description || quickEx.description
      };
    });
    
    if (!searchQuery.trim()) {
      return exercisesWithProps.filter(exercise => exercise.category === selectedCategory);
    }
    
    return exercisesWithProps.filter(exercise => 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exercise.description && exercise.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredExercises = getFilteredExercises();

  // Exercise instructions database
  const exerciseInstructions: Record<string, { steps: string[], tips: string[], muscles: string[] }> = {
    // Strength Training - Upper Body
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
    "Chin-ups": {
      steps: [
        "Grab bar with palms facing toward you, hands shoulder-width apart",
        "Start from dead hang with arms fully extended",
        "Pull yourself up until chin goes over the bar",
        "Lower yourself slowly to starting position"
      ],
      tips: ["Palms toward you targets biceps more", "Don't kip or swing", "Squeeze shoulder blades"],
      muscles: ["Biceps", "Lats", "Middle Traps", "Rear Deltoids"]
    },
    "Dips": {
      steps: [
        "Position hands on parallel bars or bench behind you",
        "Start with arms extended, supporting your body weight",
        "Lower body by bending elbows until shoulders are below elbows",
        "Push back up to starting position"
      ],
      tips: ["Keep torso upright", "Don't go too low if shoulders hurt", "Control the descent"],
      muscles: ["Triceps", "Lower Chest", "Front Deltoids"]
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
    "Overhead Press": {
      steps: [
        "Stand with feet shoulder-width apart, bar at shoulder level",
        "Grip bar with hands slightly wider than shoulders",
        "Press bar straight overhead until arms are locked out",
        "Lower bar back to shoulder level with control"
      ],
      tips: ["Keep core tight", "Don't arch back excessively", "Press in straight line"],
      muscles: ["Shoulders", "Triceps", "Upper Chest", "Core"]
    },
    "Bicep Curls": {
      steps: [
        "Stand holding barbell or dumbbells with underhand grip",
        "Keep elbows close to your sides",
        "Curl weight up by flexing biceps",
        "Lower weight slowly to starting position"
      ],
      tips: ["Don't swing or use momentum", "Squeeze at the top", "Control the negative"],
      muscles: ["Biceps", "Forearms"]
    },
    "Tricep Extensions": {
      steps: [
        "Lie on bench holding weight with both hands overhead",
        "Lower weight behind head by bending only at elbows",
        "Keep upper arms stationary throughout movement",
        "Extend arms back to starting position"
      ],
      tips: ["Keep elbows pointing forward", "Don't let elbows flare", "Use controlled movement"],
      muscles: ["Triceps"]
    },
    "Lat Pulldowns": {
      steps: [
        "Sit at lat pulldown machine with thighs under pads",
        "Grab bar with wide overhand grip",
        "Pull bar down to upper chest while leaning slightly back",
        "Slowly return bar to starting position"
      ],
      tips: ["Pull with your back, not arms", "Squeeze shoulder blades", "Don't lean too far back"],
      muscles: ["Lats", "Rhomboids", "Middle Traps", "Biceps"]
    },
    "Rows": {
      steps: [
        "Stand with feet hip-width apart, holding barbell",
        "Hinge at hips and lean forward 45 degrees",
        "Pull bar to lower chest/upper stomach",
        "Lower bar with control to starting position"
      ],
      tips: ["Keep back straight", "Pull elbows back, not out", "Squeeze shoulder blades"],
      muscles: ["Lats", "Rhomboids", "Middle Traps", "Rear Deltoids"]
    },
    
    // Strength Training - Lower Body
    "Squats": {
      steps: [
        "Stand with feet shoulder-width apart, toes slightly out",
        "Lower body by pushing hips back and bending knees",
        "Descend until thighs are parallel to floor",
        "Drive through heels to return to standing"
      ],
      tips: ["Keep chest up and core tight", "Knees track over toes", "Weight on heels"],
      muscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"]
    },
    "Deadlifts": {
      steps: [
        "Stand with feet hip-width apart, bar over mid-foot",
        "Bend at hips and knees to grip the bar",
        "Keep chest up and back straight",
        "Drive through heels to stand up, extending hips and knees"
      ],
      tips: ["Bar stays close to body", "Don't round back", "Push floor away with feet"],
      muscles: ["Hamstrings", "Glutes", "Lower Back", "Traps"]
    },
    "Lunges": {
      steps: [
        "Stand upright with feet hip-width apart",
        "Step forward into a lunge position",
        "Lower back knee toward ground while keeping front shin vertical",
        "Push off front foot to return to starting position"
      ],
      tips: ["Keep torso upright", "Don't let front knee drift forward", "Step out far enough"],
      muscles: ["Quadriceps", "Glutes", "Hamstrings", "Calves"]
    },
    "Leg Press": {
      steps: [
        "Sit in leg press machine with back flat against pad",
        "Place feet on platform shoulder-width apart",
        "Lower weight by bending knees to 90 degrees",
        "Press through heels to extend legs back up"
      ],
      tips: ["Don't let knees cave inward", "Keep core engaged", "Full range of motion"],
      muscles: ["Quadriceps", "Glutes", "Hamstrings"]
    },
    "Calf Raises": {
      steps: [
        "Stand on balls of feet on raised platform or step",
        "Let heels drop below the level of the platform",
        "Rise up onto toes as high as possible",
        "Lower heels back down slowly for a stretch"
      ],
      tips: ["Go for full range of motion", "Pause at the top", "Control the descent"],
      muscles: ["Calves", "Soleus"]
    },
    "Romanian Deadlifts": {
      steps: [
        "Hold barbell with overhand grip, feet hip-width apart",
        "Start with slight bend in knees throughout movement",
        "Push hips back and lower bar while keeping it close to legs",
        "Feel stretch in hamstrings, then drive hips forward to return"
      ],
      tips: ["This is a hip hinge, not a squat", "Feel the stretch in hamstrings", "Keep bar close"],
      muscles: ["Hamstrings", "Glutes", "Lower Back"]
    },
    "Bulgarian Split Squats": {
      steps: [
        "Stand 2-3 feet in front of bench or step",
        "Place top of rear foot on bench behind you",
        "Lower into lunge position by bending front knee",
        "Push through front heel to return to starting position"
      ],
      tips: ["Most weight on front foot", "Keep torso upright", "Don't push off back foot"],
      muscles: ["Quadriceps", "Glutes", "Hamstrings"]
    },
    "Hip Thrusts": {
      steps: [
        "Sit with upper back against bench, barbell over hips",
        "Plant feet firmly on ground, knees bent 90 degrees",
        "Drive through heels to lift hips up",
        "Squeeze glutes at top, then lower with control"
      ],
      tips: ["Focus on glute squeeze at top", "Keep ribs down", "Don't overarch back"],
      muscles: ["Glutes", "Hamstrings", "Core"]
    },
    
    // Strength Training - Core
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
    "Crunches": {
      steps: [
        "Lie on back with knees bent, feet flat on floor",
        "Place hands behind head or across chest",
        "Lift shoulder blades off ground by contracting abs",
        "Lower back down slowly without fully relaxing"
      ],
      tips: ["Don't pull on neck", "Focus on ab contraction", "Small range of motion"],
      muscles: ["Upper Abdominals"]
    },
    "Russian Twists": {
      steps: [
        "Sit on floor with knees bent, lean back slightly",
        "Lift feet off ground and balance on tailbone",
        "Rotate torso side to side, touching ground beside hips",
        "Keep chest up and core engaged throughout"
      ],
      tips: ["Move with control, not speed", "Keep feet elevated", "Look forward"],
      muscles: ["Obliques", "Core", "Hip Flexors"]
    },
    "Mountain Climbers": {
      steps: [
        "Start in plank position with arms extended",
        "Bring one knee toward chest",
        "Quickly switch legs, bringing other knee forward",
        "Continue alternating legs at a quick pace"
      ],
      tips: ["Keep hips level", "Don't let form break down", "This is cardio and core combined"],
      muscles: ["Core", "Shoulders", "Hip Flexors"]
    },
    "Dead Bug": {
      steps: [
        "Lie on back with arms extended toward ceiling",
        "Bring knees up to 90 degrees (tabletop position)",
        "Lower opposite arm and leg slowly toward floor",
        "Return to starting position and repeat other side"
      ],
      tips: ["Keep lower back pressed to floor", "Move slowly and controlled", "Don't let ribs flare"],
      muscles: ["Deep Core", "Hip Flexors"]
    },
    "Hanging Leg Raises": {
      steps: [
        "Hang from pull-up bar with arms fully extended",
        "Keep legs straight or slightly bent",
        "Raise legs up until parallel to ground or higher",
        "Lower legs slowly back to starting position"
      ],
      tips: ["Control the swing", "Don't use momentum", "Focus on ab contraction"],
      muscles: ["Lower Abs", "Hip Flexors"]
    },
    
    // Cardio Exercises
    "Running": {
      steps: [
        "Start with 5-10 minute warm-up walk",
        "Begin running at comfortable conversational pace",
        "Land on midfoot with slight forward lean",
        "Keep arms relaxed, swing naturally at 90-degree angle"
      ],
      tips: ["Build distance gradually", "Breathe rhythmically", "Good shoes are essential"],
      muscles: ["Legs", "Glutes", "Core", "Cardiovascular System"]
    },
    "Cycling": {
      steps: [
        "Adjust bike seat height so leg is slightly bent at bottom",
        "Start pedaling at moderate resistance",
        "Keep steady cadence between 80-100 RPM",
        "Maintain upright posture with relaxed shoulders"
      ],
      tips: ["Start with shorter rides", "Stay hydrated", "Use gears appropriately"],
      muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves"]
    },
    "Burpees": {
      steps: [
        "Start standing, then squat down and place hands on floor",
        "Jump feet back into plank position",
        "Do a push-up (optional for beginners)",
        "Jump feet back to squat, then jump up with arms overhead"
      ],
      tips: ["Modify by stepping instead of jumping", "Keep core tight in plank", "This is high intensity"],
      muscles: ["Full Body", "Cardiovascular System"]
    },
    "Jumping Jacks": {
      steps: [
        "Stand with feet together, arms at sides",
        "Jump feet apart while raising arms overhead",
        "Jump feet back together while lowering arms",
        "Continue at steady, quick pace"
      ],
      tips: ["Land softly on balls of feet", "Keep core engaged", "Great for warm-up"],
      muscles: ["Calves", "Shoulders", "Core", "Cardiovascular System"]
    },
    "High Knees": {
      steps: [
        "Stand in place with feet hip-width apart",
        "Lift one knee up toward chest",
        "Quickly alternate legs, bringing knees as high as possible",
        "Pump arms naturally as you run in place"
      ],
      tips: ["Stay on balls of feet", "Keep torso upright", "Drive knees up high"],
      muscles: ["Hip Flexors", "Calves", "Core"]
    },
    "Treadmill": {
      steps: [
        "Start with 5-minute warm-up at walking pace",
        "Gradually increase speed to jogging/running pace",
        "Maintain good posture, look straight ahead",
        "Cool down with 5-minute walk at end"
      ],
      tips: ["Don't hold handrails while running", "Start with flat incline", "Listen to your body"],
      muscles: ["Legs", "Glutes", "Cardiovascular System"]
    },
    "Elliptical": {
      steps: [
        "Step onto machine and grab handles",
        "Start moving legs in elliptical motion",
        "Use arms to push and pull handles",
        "Maintain steady rhythm throughout workout"
      ],
      tips: ["Keep feet flat on pedals", "Stand upright", "Low impact alternative to running"],
      muscles: ["Legs", "Arms", "Core", "Cardiovascular System"]
    },
    "Rowing Machine": {
      steps: [
        "Sit on seat with feet secured in foot straps",
        "Grab handle with both hands, arms extended",
        "Push with legs first, then pull handle to lower ribs",
        "Reverse the motion: extend arms, then bend legs"
      ],
      tips: ["Legs, core, then arms", "Keep back straight", "It's 60% legs, 40% upper body"],
      muscles: ["Full Body", "Lats", "Legs", "Core"]
    },
    "Stair Climber": {
      steps: [
        "Step onto machine and grab handrails lightly",
        "Start stepping at comfortable pace",
        "Keep full foot on pedal, don't just use toes",
        "Maintain upright posture throughout"
      ],
      tips: ["Don't lean heavily on rails", "Take full steps", "Great for glute activation"],
      muscles: ["Glutes", "Quadriceps", "Calves"]
    },
    "Battle Ropes": {
      steps: [
        "Stand with feet shoulder-width apart, hold rope ends",
        "Create waves by alternating arms up and down",
        "Keep core tight and knees slightly bent",
        "Work in intervals: 30 seconds on, 30 seconds rest"
      ],
      tips: ["Use whole body, not just arms", "Stay light on feet", "High intensity workout"],
      muscles: ["Arms", "Shoulders", "Core", "Legs"]
    },
    "Box Jumps": {
      steps: [
        "Stand arm's length from sturdy box or platform",
        "Swing arms back and squat down slightly",
        "Jump explosively onto box, landing softly",
        "Step down carefully, don't jump down"
      ],
      tips: ["Start with lower box", "Land softly with bent knees", "Focus on safe landing"],
      muscles: ["Glutes", "Quadriceps", "Calves", "Core"]
    },
    "Sprint Intervals": {
      steps: [
        "Warm up with 5-10 minutes of light jogging",
        "Sprint at near-maximum effort for 30 seconds",
        "Recover with light jogging or walking for 1-2 minutes",
        "Repeat sprint-recovery cycle 6-8 times"
      ],
      tips: ["Build up gradually", "Focus on form even when tired", "Cool down properly"],
      muscles: ["Full Body", "Cardiovascular System"]
    },
    
    // Yoga & Flexibility Exercises
    "Yoga": {
      steps: [
        "Begin in Mountain Pose with feet hip-width apart",
        "Flow through Sun Salutation sequence",
        "Hold each pose for 5-8 breaths",
        "End in relaxation pose (Savasana)"
      ],
      tips: ["Focus on breath awareness", "Don't force poses", "Use props if needed"],
      muscles: ["Full Body", "Flexibility", "Mind-Body Connection"]
    },
    "Meditation": {
      steps: [
        "Sit comfortably with spine straight",
        "Close eyes and focus on your breath",
        "When mind wanders, gently return to breath",
        "Start with 5-10 minutes, gradually increase"
      ],
      tips: ["Find a quiet space", "Be patient with wandering thoughts", "Consistency matters more than duration"],
      muscles: ["Mind", "Stress Relief", "Mental Focus"]
    },
    "Sun Salutation": {
      steps: [
        "Mountain Pose → Forward Fold → Half Lift → Chaturanga",
        "Upward Dog → Downward Dog (hold 5 breaths)",
        "Forward Fold → Half Lift → Mountain Pose",
        "Repeat sequence 3-5 times with breath coordination"
      ],
      tips: ["Coordinate movement with breath", "Modify poses as needed", "This is a complete flow sequence"],
      muscles: ["Full Body", "Flexibility", "Core Strength"]
    },
    "Warrior Pose": {
      steps: [
        "Step left foot back 3-4 feet, turn out 45 degrees",
        "Bend right knee directly over ankle",
        "Raise arms overhead, square hips forward",
        "Hold for 30 seconds to 1 minute, switch sides"
      ],
      tips: ["Keep front knee over ankle", "Ground through back foot", "Engage core for stability"],
      muscles: ["Legs", "Core", "Shoulders", "Balance"]
    },
    "Downward Dog": {
      steps: [
        "Start on hands and knees, tuck toes under",
        "Lift hips up and back, straightening legs",
        "Create inverted V shape with body",
        "Hold for 5-10 breaths, pedal feet to stretch"
      ],
      tips: ["Press hands firmly into mat", "Lengthen spine", "Bend knees if hamstrings are tight"],
      muscles: ["Shoulders", "Arms", "Hamstrings", "Calves"]
    },
    "Child's Pose": {
      steps: [
        "Kneel on mat with big toes touching",
        "Sit back on heels, open knees wide",
        "Fold forward, extending arms in front",
        "Rest forehead on mat, breathe deeply"
      ],
      tips: ["Use bolster under torso if needed", "This is a resting pose", "Focus on releasing tension"],
      muscles: ["Hip Flexors", "Shoulders", "Back", "Relaxation"]
    },
    "Pigeon Pose": {
      steps: [
        "From downward dog, bring right knee to right wrist",
        "Lower right shin parallel to front of mat",
        "Extend left leg straight back",
        "Fold forward over front leg, hold 1-2 minutes each side"
      ],
      tips: ["Use props under hip if needed", "This is an intense hip opener", "Breathe through discomfort"],
      muscles: ["Hip Flexors", "Glutes", "IT Band"]
    },
    "Stretching": {
      steps: [
        "Target major muscle groups systematically",
        "Hold each stretch for 20-30 seconds",
        "Breathe deeply and relax into the stretch",
        "Don't bounce or force the stretch"
      ],
      tips: ["Stretch after workouts when muscles are warm", "Focus on tight areas", "Stretch both sides equally"],
      muscles: ["Full Body", "Flexibility", "Recovery"]
    },
    
    // Swimming Exercises
    "Swimming": {
      steps: [
        "Enter water and do 5-10 minutes easy warm-up",
        "Alternate between different strokes",
        "Focus on technique over speed",
        "Cool down with easy swimming or walking"
      ],
      tips: ["Start with shorter distances", "Focus on breathing technique", "Great low-impact exercise"],
      muscles: ["Full Body", "Cardiovascular System", "Core"]
    },
    "Freestyle": {
      steps: [
        "Float face-down, extend one arm forward while other pulls",
        "Rotate body slightly with each stroke",
        "Breathe by turning head to side every 2-3 strokes",
        "Kick steadily with straight legs from hips"
      ],
      tips: ["High elbow catch", "Rotate from core, not shoulders", "Practice bilateral breathing"],
      muscles: ["Shoulders", "Lats", "Core", "Legs"]
    },
    "Backstroke": {
      steps: [
        "Float on back with arms at sides",
        "Alternate arm strokes in windmill motion",
        "Keep hips up and head still",
        "Flutter kick with straight legs"
      ],
      tips: ["Keep ears underwater", "Don't let hips sink", "Imagine lying on a pillow"],
      muscles: ["Shoulders", "Lats", "Core", "Hip Flexors"]
    },
    "Breaststroke": {
      steps: [
        "Start face-down, arms extended forward",
        "Pull arms out and back in heart shape",
        "Lift head to breathe as arms finish pull",
        "Bring knees to chest, kick legs out and together"
      ],
      tips: ["Coordinate arm pull with breathing", "Kick with feet flexed", "Glide between strokes"],
      muscles: ["Chest", "Arms", "Inner Thighs", "Glutes"]
    },
    "Butterfly": {
      steps: [
        "Start face-down with arms extended forward",
        "Pull both arms simultaneously in circular motion",
        "Use dolphin kick with both legs together",
        "Breathe forward when arms exit water"
      ],
      tips: ["This is the most challenging stroke", "Focus on rhythm", "Use core for dolphin kick"],
      muscles: ["Shoulders", "Core", "Chest", "Legs"]
    },
    "Water Aerobics": {
      steps: [
        "Stand in chest-deep water for resistance",
        "Perform exercises like jumping jacks, leg lifts",
        "Use water resistance for strength movements",
        "Move continuously for 20-45 minutes"
      ],
      tips: ["Water provides natural resistance", "Great for joint-friendly exercise", "Stay hydrated even in water"],
      muscles: ["Full Body", "Low Impact", "Cardiovascular System"]
    },
    "Treading Water": {
      steps: [
        "Stay vertical in deep water",
        "Use eggbeater kick to maintain position",
        "Keep arms moving in sculling motion",
        "Start with 30-second intervals"
      ],
      tips: ["Relax and stay calm", "Use small, efficient movements", "Great core and leg workout"],
      muscles: ["Core", "Legs", "Arms", "Endurance"]
    },
    // Dumbbell Specific Instructions
    "Dumbbell Press": {
      steps: [
        "Lie on bench holding dumbbells at chest level",
        "Position dumbbells with palms facing forward",
        "Press weights straight up until arms are fully extended",
        "Lower dumbbells slowly to starting position with control"
      ],
      tips: ["Keep wrists straight and stable", "Don't let dumbbells drift inward", "Use full range of motion"],
      muscles: ["Chest", "Front Deltoids", "Triceps"]
    },
    "Dumbbell Rows": {
      steps: [
        "Place one knee and hand on bench for support",
        "Hold dumbbell in opposite hand with arm hanging straight",
        "Pull dumbbell up to your ribcage by squeezing shoulder blade",
        "Lower weight slowly while maintaining back position"
      ],
      tips: ["Keep back flat and parallel to floor", "Pull with your back, not your arm", "Don't rotate your torso"],
      muscles: ["Lats", "Rhomboids", "Middle Traps", "Rear Deltoids"]
    },
    "Dumbbell Flyes": {
      steps: [
        "Lie on bench with dumbbells held above chest",
        "Lower weights in wide arc with slight bend in elbows",
        "Feel stretch in chest at bottom position",
        "Bring dumbbells back together in same arc motion"
      ],
      tips: ["Keep slight bend in elbows throughout", "Focus on chest squeeze at top", "Control the weight on the way down"],
      muscles: ["Chest", "Front Deltoids"]
    },
    "Dumbbell Squats": {
      steps: [
        "Hold dumbbells at shoulder height or at your sides",
        "Stand with feet shoulder-width apart",
        "Squat down by pushing hips back and bending knees",
        "Drive through heels to return to standing position"
      ],
      tips: ["Keep chest up and core engaged", "Don't let knees cave inward", "Go as deep as mobility allows"],
      muscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"]
    },
    "Dumbbell Lunges": {
      steps: [
        "Hold dumbbells at your sides or shoulders",
        "Step forward into a lunge position",
        "Lower back knee toward ground while keeping front knee over ankle",
        "Push off front foot to return to starting position"
      ],
      tips: ["Keep torso upright", "Don't let front knee go past toes", "Alternate legs or complete all reps on one side"],
      muscles: ["Quadriceps", "Glutes", "Hamstrings", "Calves"]
    },
    "Dumbbell Shoulder Press": {
      steps: [
        "Sit or stand with dumbbells at shoulder level",
        "Position palms facing forward with elbows at 90 degrees",
        "Press weights straight overhead until arms are fully extended",
        "Lower dumbbells back to shoulder level with control"
      ],
      tips: ["Keep core tight to avoid arching back", "Don't press weights behind your head", "Maintain neutral wrist position"],
      muscles: ["Deltoids", "Triceps", "Upper Traps"]
    },
    "Dumbbell Lateral Raises": {
      steps: [
        "Stand with dumbbells at your sides, palms facing body",
        "Raise weights out to sides until arms are parallel to floor",
        "Keep slight bend in elbows throughout movement",
        "Lower weights slowly back to starting position"
      ],
      tips: ["Don't raise weights above shoulder height", "Lead with your pinkies", "Use lighter weight and focus on form"],
      muscles: ["Middle Deltoids", "Supraspinatus"]
    },
    "Dumbbell Front Raises": {
      steps: [
        "Stand with dumbbells in front of thighs, palms facing back",
        "Raise one or both dumbbells forward to shoulder height",
        "Keep arms straight with slight bend in elbows",
        "Lower weights slowly back to starting position"
      ],
      tips: ["Don't swing or use momentum", "Keep shoulders down and back", "Alternate arms for better control"],
      muscles: ["Front Deltoids", "Upper Chest"]
    },
    "Dumbbell Shrugs": {
      steps: [
        "Stand with dumbbells at your sides, arms hanging straight",
        "Shrug shoulders straight up toward your ears",
        "Hold briefly at the top position",
        "Lower shoulders back down slowly"
      ],
      tips: ["Don't roll shoulders forward or backward", "Use heavy weight with slow, controlled movement", "Keep arms straight throughout"],
      muscles: ["Upper Traps", "Levator Scapulae"]
    },
    "Dumbbell Deadlifts": {
      steps: [
        "Stand with feet hip-width apart, dumbbells in front of thighs",
        "Hinge at hips and push glutes back while lowering weights",
        "Keep dumbbells close to legs as you lower them",
        "Drive hips forward to return to standing position"
      ],
      tips: ["Keep back straight and chest up", "Feel stretch in hamstrings at bottom", "Lead with your hips, not your knees"],
      muscles: ["Hamstrings", "Glutes", "Lower Back", "Core"]
    },
    "Dumbbell Step-ups": {
      steps: [
        "Stand facing a bench or box with dumbbells at your sides",
        "Step up onto platform with one foot, placing entire foot on surface",
        "Push through heel to lift your body up onto the platform",
        "Step down with control and repeat on same leg or alternate"
      ],
      tips: ["Use a platform that puts your knee at 90 degrees", "Don't push off back foot", "Keep torso upright throughout"],
      muscles: ["Quadriceps", "Glutes", "Hamstrings", "Calves"]
    },
    "Dumbbell Tricep Extensions": {
      steps: [
        "Hold one dumbbell with both hands overhead",
        "Lower weight behind head by bending only at elbows",
        "Keep upper arms stationary and elbows pointing forward",
        "Extend arms back to starting position"
      ],
      tips: ["Keep elbows close together", "Don't let elbows flare out", "Use lighter weight to maintain form"],
      muscles: ["Triceps"]
    },
    "Dumbbell Hammer Curls": {
      steps: [
        "Stand with dumbbells at sides, palms facing each other",
        "Curl weights up while keeping palms facing each other",
        "Squeeze biceps at the top of the movement",
        "Lower weights slowly back to starting position"
      ],
      tips: ["Keep elbows stationary at your sides", "Don't swing or use momentum", "Neutral grip targets different muscle fibers"],
      muscles: ["Biceps", "Brachialis", "Forearms"]
    },
    "Dumbbell Thrusters": {
      steps: [
        "Hold dumbbells at shoulder level in squat position",
        "Squat down by pushing hips back and bending knees",
        "Drive up explosively through heels while pressing weights overhead",
        "Lower weights back to shoulders and repeat"
      ],
      tips: ["Use momentum from legs to help press", "Keep core tight throughout", "This is a compound power movement"],
      muscles: ["Full Body", "Shoulders", "Legs", "Core"]
    },
    "Dumbbell Russian Twists": {
      steps: [
        "Sit on floor holding one dumbbell with both hands",
        "Lean back slightly and lift feet off ground",
        "Rotate torso to one side, touching weight to floor",
        "Rotate to opposite side and repeat"
      ],
      tips: ["Keep feet elevated throughout", "Move with control, not speed", "Look forward, not at the weight"],
      muscles: ["Obliques", "Core", "Hip Flexors"]
    },
    "Dumbbell Walking Lunges": {
      steps: [
        "Hold dumbbells at your sides or shoulders",
        "Step forward into lunge position",
        "Instead of returning to start, step forward with back leg",
        "Continue alternating legs while moving forward"
      ],
      tips: ["Take larger steps for better glute activation", "Keep torso upright throughout", "Ensure adequate space to walk"],
      muscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"]
    },
    "Dumbbell Renegade Rows": {
      steps: [
        "Start in plank position with hands on dumbbells",
        "Row one dumbbell to your ribcage while balancing on other arm",
        "Keep hips square and core tight",
        "Lower weight and repeat on opposite side"
      ],
      tips: ["Use hexagonal dumbbells for stability", "Don't let hips rotate", "This combines core and back training"],
      muscles: ["Lats", "Core", "Shoulders", "Triceps"]
    },
    "Dumbbell Goblet Squats": {
      steps: [
        "Hold one dumbbell vertically against your chest",
        "Stand with feet slightly wider than shoulder-width",
        "Squat down while keeping dumbbell close to body",
        "Drive through heels to return to standing"
      ],
      tips: ["Elbows should point down toward floor", "This position helps maintain upright torso", "Great for learning squat form"],
      muscles: ["Quadriceps", "Glutes", "Core"]
    },
    "Dumbbell Bulgarian Split Squats": {
      steps: [
        "Hold dumbbells at sides with rear foot elevated on bench",
        "Lower into lunge position by bending front knee",
        "Keep most weight on front foot",
        "Push through front heel to return to starting position"
      ],
      tips: ["Don't put too much weight on back foot", "Keep torso upright", "This targets one leg at a time"],
      muscles: ["Quadriceps", "Glutes", "Hamstrings"]
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
    setShowWorkoutForm(true);
  };

  const handleSubmitWorkout = () => {
    const estimatedCalories = selectedExercise ? 
      calculateExerciseCalories(selectedExercise, exerciseSets, exerciseReps, exerciseWeight, exerciseDuration, difficultyLevel[0]) :
      Math.round(workoutDuration[0] * (2 + difficultyLevel[0] * 0.8));
    
    createWorkoutMutation.mutate({
      name: selectedExercise.name,
      category: selectedCategory,
      duration: workoutDuration[0],
      caloriesBurned: estimatedCalories,
      difficultyLevel: difficultyLevel[0],
      perceivedExertion: perceivedExertion[0],
      completionRate: 100, // Default to 100% for completed workouts
      // Include exercise details for workout exercise creation
      exerciseData: {
        exerciseId: selectedExercise.id,
        sets: exerciseSets,
        reps: exerciseReps,
        weight: exerciseWeight || null,
        duration: exerciseDuration > 0 ? exerciseDuration * 60 : null, // Convert minutes to seconds
        notes: exerciseNotes || null,
      }
    });
    
    setSelectedExercise(null);
    setShowWorkoutForm(false);
    // Reset form values
    setDifficultyLevel([3]);
    setPerceivedExertion([5]);
    setWorkoutDuration([30]);
    // Reset exercise-specific values
    setExerciseSets(3);
    setExerciseReps(10);
    setExerciseWeight(0);
    setExerciseDuration(0);
    setExerciseNotes("");
  };

  const getDifficultyLabel = (level: number) => {
    const labels = ["", "Very Easy", "Easy", "Moderate", "Hard", "Very Hard"];
    return labels[level] || "Moderate";
  };

  const getExertionLabel = (level: number) => {
    if (level <= 2) return "Very Light";
    if (level <= 4) return "Light";
    if (level <= 6) return "Moderate";
    if (level <= 8) return "Hard";
    return "Maximum Effort";
  };

  // Exercise animation definitions
  const getExerciseAnimation = (exerciseName: string) => {
    const animations: Record<string, { movement: string, description: string, keypoints: string[] }> = {
      // Dumbbell Exercises
      "Dumbbell Press": {
        movement: "press-animation",
        description: "Chest press with controlled movement",
        keypoints: ["Keep feet flat on ground", "Lower weights to chest level", "Press up with control", "Maintain neutral wrist position"]
      },
      "Dumbbell Curls": {
        movement: "curl-animation", 
        description: "Bicep curl with steady tempo",
        keypoints: ["Keep elbows at sides", "Curl weights up smoothly", "Squeeze at the top", "Lower with control"]
      },
      "Dumbbell Shoulder Press": {
        movement: "shoulder-press-animation",
        description: "Overhead press movement",
        keypoints: ["Start at shoulder level", "Press straight up", "Don't arch back", "Lower with control"]
      },
      "Dumbbell Rows": {
        movement: "row-animation",
        description: "Rowing motion for back muscles",
        keypoints: ["Hinge at hips", "Pull weights to ribs", "Squeeze shoulder blades", "Lower with control"]
      },
      "Dumbbell Squats": {
        movement: "squat-animation",
        description: "Squat holding dumbbells",
        keypoints: ["Feet shoulder-width apart", "Lower hips back and down", "Keep chest up", "Drive through heels"]
      },
      "Dumbbell Lunges": {
        movement: "lunge-animation",
        description: "Alternating lunge movement",
        keypoints: ["Step forward into lunge", "Lower back knee down", "Push back to start", "Alternate legs"]
      },
      
      // Strength Exercises
      "Push-ups": {
        movement: "pushup-animation",
        description: "Upper body bodyweight exercise",
        keypoints: ["Keep body straight", "Lower chest to ground", "Push up with control", "Engage core throughout"]
      },
      "Squats": {
        movement: "squat-animation",
        description: "Lower body compound movement",
        keypoints: ["Feet shoulder-width apart", "Lower hips back and down", "Keep chest up", "Drive through heels"]
      },
      "Pull-ups": {
        movement: "pullup-animation",
        description: "Upper body pulling exercise",
        keypoints: ["Hang with straight arms", "Pull chin over bar", "Lower with control", "Engage lats and biceps"]
      },
      "Plank": {
        movement: "plank-animation",
        description: "Core stability exercise",
        keypoints: ["Keep body straight", "Engage core muscles", "Hold steady position", "Breathe normally"]
      },
      "Deadlifts": {
        movement: "deadlift-animation",
        description: "Full body compound lift",
        keypoints: ["Keep back straight", "Lift with legs", "Stand tall at top", "Lower with control"]
      },
      
      // Cardio Exercises
      "Running": {
        movement: "running-animation",
        description: "Cardiovascular endurance exercise",
        keypoints: ["Land on midfoot", "Keep arms relaxed", "Maintain steady rhythm", "Breathe rhythmically"]
      },
      "Burpees": {
        movement: "burpee-animation",
        description: "Full body cardio movement",
        keypoints: ["Drop to pushup position", "Jump feet back in", "Stand and jump up", "Move with control"]
      },
      "Jumping Jacks": {
        movement: "jumping-jacks-animation",
        description: "Quick cardio burst",
        keypoints: ["Jump feet apart", "Raise arms overhead", "Jump feet together", "Keep light on feet"]
      },
      "Mountain Climbers": {
        movement: "mountain-climbers-animation",
        description: "Core cardio exercise",
        keypoints: ["Start in plank position", "Alternate knee drives", "Keep hips level", "Maintain fast pace"]
      },
      
      // Yoga Exercises
      "Yoga": {
        movement: "yoga-flow-animation",
        description: "Flexibility and mindfulness practice",
        keypoints: ["Move with breath", "Hold poses steadily", "Focus on alignment", "Stay present and calm"]
      },
      "Sun Salutation": {
        movement: "yoga-flow-animation",
        description: "Classic yoga flow sequence",
        keypoints: ["Coordinate with breath", "Flow between poses", "Keep movements smooth", "Stay centered"]
      },
      "Warrior Pose": {
        movement: "warrior-pose-animation",
        description: "Strength and balance pose",
        keypoints: ["Ground through feet", "Extend through arms", "Keep front thigh parallel", "Breathe deeply"]
      },
      "Downward Dog": {
        movement: "downward-dog-animation",
        description: "Full body stretch pose",
        keypoints: ["Press hands down", "Lift hips up", "Straighten legs", "Create inverted V shape"]
      },
      
      // Swimming Exercises
      "Swimming": {
        movement: "swimming-animation",
        description: "Full body cardio exercise",
        keypoints: ["Streamline body position", "Coordinate breathing", "Maintain steady rhythm", "Use whole body"]
      },
      "Freestyle": {
        movement: "swimming-animation",
        description: "Front crawl swimming stroke",
        keypoints: ["Rotate body side to side", "High elbow catch", "Breathe to one side", "Kick from hips"]
      },
      "Backstroke": {
        movement: "swimming-animation",
        description: "Back swimming stroke",
        keypoints: ["Keep body flat", "Rotate shoulders", "Breathe freely", "Keep head still"]
      },
      "Breaststroke": {
        movement: "swimming-animation",
        description: "Chest stroke technique",
        keypoints: ["Pull, breathe, kick, glide", "Keep head in line", "Symmetric movements", "Time the rhythm"]
      }
    };
    
    return animations[exerciseName] || {
      movement: "generic-animation",
      description: "Controlled movement pattern",
      keypoints: ["Maintain proper form", "Control the movement", "Breathe steadily", "Focus on target muscles"]
    };
  };

  return (
    <section id="workout-logger" className="relative bg-gradient-to-br from-black via-red-900/30 to-black rounded-3xl shadow-2xl border border-red-600/50 p-8 overflow-hidden hexagon-bg hexagon-pattern">
      {/* Animated red and black background elements */}
      <div className="absolute inset-0">
        {/* Floating red hexagons */}
        <div className="absolute top-0 left-0 w-32 h-28 opacity-30 animate-pulse" style={{animationDuration: '4s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
          </svg>
        </div>
        <div className="absolute top-1/4 right-0 w-24 h-21 opacity-20 animate-bounce" style={{animationDuration: '6s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.8"/>
          </svg>
        </div>
        <div className="absolute bottom-0 left-1/3 w-28 h-24 opacity-25 animate-ping" style={{animationDuration: '8s', animationDelay: '1s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#000000" stroke="#dc2626" strokeWidth="1" opacity="0.7"/>
          </svg>
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-20 h-17 opacity-15 animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#000000" strokeWidth="1" opacity="0.5"/>
          </svg>
        </div>
        <div className="absolute top-1/2 left-10 w-22 h-19 opacity-20 animate-bounce" style={{animationDuration: '7s', animationDelay: '0.5s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.4"/>
          </svg>
        </div>
        
        {/* Animated red gradient orbs */}
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-gradient-to-br from-red-600/20 to-black/40 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-gradient-to-br from-black/60 to-red-600/20 rounded-full blur-2xl opacity-20 animate-ping" style={{animationDuration: '10s'}}></div>
        
        {/* Dynamic radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-red-900/10 to-black/60 animate-pulse" style={{animationDuration: '8s'}}></div>
      </div>
      {/* Content wrapper */}
      <div className="relative z-10">
      {/* Header with background image */}
      <div className="relative mb-6 rounded-2xl overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img 
            src={workoutBgImage} 
            alt="Workout background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>
        
        {/* Header content */}
        <div className="relative flex items-center justify-between p-6">
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent drop-shadow-lg">Log Workout</h3>
            <p className="text-gray-300 text-sm mt-1">Track your exercises, sets, reps, and weight</p>
          </div>
          <button 
            className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-all border border-red-500/30"
            onClick={() => setLocation('/workouts')}
            data-testid="expand-workouts-button"
            title="View all workouts"
          >
            <Expand />
          </button>
        </div>
      </div>

      {/* Exercise Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" size={16} />
          <Input
            type="text"
            placeholder="Search exercises (e.g., push-ups, running, yoga)"
            className="pl-10 bg-black/50 border-red-500/30 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Workout Categories */}
      <div className="mb-6">
        <p className="text-sm font-medium text-red-400 mb-3">Popular Categories</p>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id 
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-lg shadow-red-500/50" 
                : "border-red-500/30 text-gray-300 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/50"}
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
          <p className="text-sm font-medium text-gray-300">
            {searchQuery ? 
              (filteredExercises.length > 0 ? `Found ${filteredExercises.length} exercise${filteredExercises.length === 1 ? '' : 's'}` : 'No exercises found') :
              `Showing ${Math.min(filteredExercises.length, showAllExercises ? filteredExercises.length : 6)} of ${filteredExercises.length} exercises`
            }
          </p>
          {!searchQuery && filteredExercises.length > 6 && (
            <button
              onClick={() => setShowAllExercises(!showAllExercises)}
              className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
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
            <div
              key={exercise.name}
              className={`bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-xl p-4 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/20 transition-all group ${createWorkoutMutation.isPending ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
              data-testid={`exercise-${exercise.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <IconComponent className="text-red-500 text-lg group-hover:scale-110 transition-transform" />
                <span className="font-medium text-white">{exercise.name}</span>
              </div>
              <p className="text-xs text-gray-400">{exercise.description}</p>
              
              {/* Always Show Exercise Demo for strength and dumbbell exercises */}
              {["strength", "dumbbells"].includes(exercise.category) && (
                <div className="mt-3 pt-3 border-t border-red-500/30" id={`demo-content-${exercise.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="bg-black/50 rounded-lg p-2">
                    <img 
                      src={getDemoImage(exercise.name)}
                      alt={`${exercise.name} demonstration`}
                      className="w-auto max-w-full h-auto max-h-32 object-contain rounded-md mx-auto"
                      data-testid={`demo-image-${exercise.name.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-center mt-2 text-xs text-gray-400">
                <button
                  onClick={() => handleExerciseClick(exercise)}
                  disabled={createWorkoutMutation.isPending}
                  className="flex items-center hover:text-red-400 transition-colors"
                  data-testid={`instructions-${exercise.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Play className="w-3 h-3 mr-1" />
                  <span>Start Workout</span>
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full text-center py-8">
            <Search className="mx-auto h-12 w-12 text-red-500/50 mb-4" />
            <p className="text-lg font-medium text-gray-400 mb-2">
              {searchQuery ? 'No exercises found' : 'Try searching for an exercise'}
            </p>
            <p className="text-sm text-gray-500">
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedExercise(null)}>
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/50 rounded-2xl max-w-md w-full max-h-[70vh] overflow-y-auto shadow-2xl shadow-red-500/20" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <selectedExercise.icon className="text-red-500 text-2xl" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedExercise.name}</h2>
                    <p className="text-gray-400 capitalize">{selectedExercise.category} • {selectedExercise.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  data-testid="close-exercise-modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Exercise Instructions */}
              <div className="space-y-6">
                {/* Target Muscles */}
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-3">Target Muscles</h3>
                  <div className="flex flex-wrap gap-2">
                    {getExerciseInstructions(selectedExercise.name).muscles.map((muscle, index) => (
                      <span key={index} className="bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-sm font-medium">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-3">How to Perform</h3>
                  <ol className="space-y-3">
                    {getExerciseInstructions(selectedExercise.name).steps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-gray-300">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tips */}
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-3">Pro Tips</h3>
                  <ul className="space-y-2">
                    {getExerciseInstructions(selectedExercise.name).tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">💡</span>
                        <p className="text-gray-300">{tip}</p>
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
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/50"
                  data-testid="start-workout-button"
                >
                  {createWorkoutMutation.isPending ? 'Starting...' : 'Start Workout'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedExercise(null)}
                  className="px-6 border-red-500/30 text-gray-300 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/50"
                  data-testid="close-modal-button"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI-Powered Workout Form with Difficulty Tracking */}
      {showWorkoutForm && selectedExercise && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-red-500/20">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Log Your Workout</h2>
                  <p className="text-gray-400 mt-1">{selectedExercise.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowWorkoutForm(false);
                    setSelectedExercise(null);
                  }}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  data-testid="close-workout-form"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Workout Form */}
              <div className="space-y-6">
                {/* Exercise Details Section */}
                <div className="bg-gradient-to-r from-red-900/30 to-black/50 border border-red-500/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-red-500" />
                    Exercise Details for {selectedExercise.name}
                  </h3>
                  
                  {/* Exercise Input Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Sets Input */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-300">Sets</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={exerciseSets}
                        onChange={(e) => setExerciseSets(parseInt(e.target.value) || 1)}
                        className="mt-1 bg-black/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/50"
                        data-testid="input-sets"
                      />
                    </div>

                    {/* Reps Input */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-300">Reps per Set</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={exerciseReps}
                        onChange={(e) => setExerciseReps(parseInt(e.target.value) || 1)}
                        className="mt-1 bg-black/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/50"
                        data-testid="input-reps"
                      />
                    </div>

                    {/* Weight Input */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-300">Weight (lbs)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="1000"
                        value={exerciseWeight}
                        onChange={(e) => setExerciseWeight(parseInt(e.target.value) || 0)}
                        placeholder="0 for bodyweight"
                        className="mt-1 bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/50"
                        data-testid="input-weight"
                      />
                    </div>

                    {/* Exercise Duration Input */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-300">Duration (minutes)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="60"
                        value={exerciseDuration}
                        onChange={(e) => setExerciseDuration(parseInt(e.target.value) || 0)}
                        placeholder="0 for rep-based"
                        className="mt-1 bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/50"
                        data-testid="input-exercise-duration"
                      />
                    </div>
                  </div>

                  {/* Exercise Notes */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-300">Exercise Notes (optional)</Label>
                    <Input
                      type="text"
                      value={exerciseNotes}
                      onChange={(e) => setExerciseNotes(e.target.value)}
                      placeholder="e.g., form notes, modifications, how it felt..."
                      className="mt-1 bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/50"
                      data-testid="input-exercise-notes"
                    />
                  </div>
                </div>

                {/* Workout Duration */}
                <div>
                  <Label className="text-base font-semibold text-gray-300">Workout Duration: {workoutDuration[0]} minutes</Label>
                  <div className="mt-2">
                    <Slider
                      value={workoutDuration}
                      onValueChange={setWorkoutDuration}
                      min={5}
                      max={120}
                      step={5}
                      className="w-full"
                      data-testid="duration-slider"
                    />
                  </div>
                </div>

                {/* Estimated Calories Display */}
                <div className="p-4 bg-gradient-to-r from-red-900/30 to-black/50 rounded-lg border border-red-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-300">Estimated Calories</h3>
                      <p className="text-xs text-gray-400">Based on your workout</p>
                    </div>
                    <div className="text-2xl font-bold text-red-500">
                      {selectedExercise ? calculateExerciseCalories(selectedExercise, exerciseSets, exerciseReps, exerciseWeight, exerciseDuration, difficultyLevel[0]) : 0} kcal
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-8">
                <Button
                  onClick={handleSubmitWorkout}
                  disabled={createWorkoutMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                  data-testid="submit-workout-button"
                >
                  {createWorkoutMutation.isPending ? 'Logging...' : 'Log Workout'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowWorkoutForm(false);
                    setSelectedExercise(null);
                  }}
                  className="px-6"
                  data-testid="cancel-workout-button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Photo Prompt Modal */}
      {showProgressPhotoPrompt && lastCompletedWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Workout Complete! 🎉</h2>
                <p className="text-gray-600">
                  Great job on completing "{lastCompletedWorkout.name}"! 
                  Want to capture your progress with a photo?
                </p>
              </div>

              {/* Workout Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">{lastCompletedWorkout.duration} min</div>
                    <div className="text-gray-600">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">{lastCompletedWorkout.caloriesBurned} kcal</div>
                    <div className="text-gray-600">Calories</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowProgressPhotoPrompt(false);
                    setLocation("/progress-photos");
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  data-testid="button-add-progress-photo"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Progress Photo
                </Button>
                <Button
                  onClick={() => setShowProgressPhotoPrompt(false)}
                  variant="outline"
                  className="w-full"
                  data-testid="button-skip-photo"
                >
                  Skip for Now
                </Button>
              </div>

              {/* Tip */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Regular progress photos help you see changes that the scale might not show!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </section>
  );
}
