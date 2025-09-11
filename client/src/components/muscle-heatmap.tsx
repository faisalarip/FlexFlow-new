import { useState } from "react";

interface MuscleData {
  name: string;
  intensity: number; // 0-3 scale: 0=inactive, 1=light, 2=moderate, 3=high
  color: string;
}

interface MuscleHeatmapProps {
  exerciseName: string;
  targetedMuscles?: string[];
  className?: string;
}

// Muscle name normalization mapping
const muscleNameMap: Record<string, string> = {
  "core": "abs",
  "abdominals": "abs",
  "stomach": "abs",
  "deltoids": "shoulders",
  "delts": "shoulders",
  "pecs": "chest",
  "pectorals": "chest",
  "quads": "quadriceps",
  "thighs": "quadriceps",
  "hams": "hamstrings",
  "glutes": "glutes",
  "butt": "glutes",
  "latissimus": "lats",
  "back": "lats",
  "traps": "traps",
  "trapezius": "traps",
  "calves": "calves",
  "shins": "calves",
  "triceps": "triceps",
  "biceps": "biceps",
  "forearms": "forearms",
  "obliques": "obliques",
};

// Function to normalize muscle names
const normalizeMuscle = (muscleName: string): string => {
  const normalized = muscleName.toLowerCase().trim();
  return muscleNameMap[normalized] || normalized;
};

// Define muscle groups and their positions on the body diagram
const muscleGroups = {
  // Upper body front
  chest: { name: "Chest", position: { x: 50, y: 25, width: 20, height: 15 } },
  shoulders: { name: "Shoulders", position: { x: 35, y: 20, width: 30, height: 12 } },
  biceps: { name: "Biceps", position: { x: 25, y: 35, width: 8, height: 12 } },
  triceps: { name: "Triceps", position: { x: 67, y: 35, width: 8, height: 12 } },
  forearms: { name: "Forearms", position: { x: 20, y: 50, width: 12, height: 15 } },
  abs: { name: "Abs", position: { x: 42, y: 45, width: 16, height: 20 } },
  obliques: { name: "Obliques", position: { x: 32, y: 50, width: 8, height: 15 } },
  
  // Lower body front
  quadriceps: { name: "Quadriceps", position: { x: 38, y: 70, width: 24, height: 20 } },
  calves: { name: "Calves", position: { x: 40, y: 92, width: 20, height: 8 } },
  
  // Full body (back muscles visible from front view)
  lats: { name: "Lats", position: { x: 25, y: 30, width: 10, height: 25 } },
  traps: { name: "Traps", position: { x: 42, y: 15, width: 16, height: 10 } },
  glutes: { name: "Glutes", position: { x: 40, y: 65, width: 20, height: 12 } },
  hamstrings: { name: "Hamstrings", position: { x: 38, y: 75, width: 24, height: 15 } },
};

// Exercise-to-muscle mapping with intensity levels
const exerciseMuscleMap: Record<string, Record<string, number>> = {
  // Strength Training - Upper Body
  "Push-ups": { chest: 3, triceps: 2, shoulders: 2, abs: 1 },
  "Pull-ups": { lats: 3, biceps: 3, traps: 2, abs: 1 },
  "Chin-ups": { biceps: 3, lats: 3, traps: 2, shoulders: 1 },
  "Dips": { triceps: 3, chest: 2, shoulders: 2 },
  "Bench Press": { chest: 3, triceps: 2, shoulders: 2 },
  "Overhead Press": { shoulders: 3, triceps: 2, chest: 1, abs: 1 },
  "Bicep Curls": { biceps: 3, forearms: 1 },
  "Tricep Extensions": { triceps: 3 },
  "Lat Pulldowns": { lats: 3, biceps: 2, traps: 2 },
  "Rows": { lats: 3, traps: 2, biceps: 2, shoulders: 1 },
  
  // Strength Training - Lower Body
  "Squats": { quadriceps: 3, glutes: 3, abs: 2 },
  "Deadlifts": { hamstrings: 3, glutes: 3, lats: 2, traps: 2, abs: 2 },
  "Lunges": { quadriceps: 3, glutes: 2, calves: 1 },
  "Leg Press": { quadriceps: 3, glutes: 2 },
  "Calf Raises": { calves: 3 },
  "Romanian Deadlifts": { hamstrings: 3, glutes: 2 },
  "Bulgarian Split Squats": { quadriceps: 3, glutes: 2 },
  "Hip Thrusts": { glutes: 3, hamstrings: 1 },
  
  // Strength Training - Core
  "Plank": { abs: 3, shoulders: 1 },
  "Crunches": { abs: 3 },
  "Russian Twists": { obliques: 3, abs: 2 },
  "Mountain Climbers": { abs: 2, shoulders: 2, quadriceps: 1 },
  "Dead Bug": { abs: 3 },
  "Hanging Leg Raises": { abs: 3 },
  
  // Cardio Exercises
  "Running": { quadriceps: 2, hamstrings: 2, calves: 2, glutes: 1 },
  "Cycling": { quadriceps: 3, hamstrings: 2, calves: 2, glutes: 2 },
  "Burpees": { chest: 2, triceps: 2, shoulders: 2, quadriceps: 2, abs: 2 },
  "Jumping Jacks": { shoulders: 1, quadriceps: 2, calves: 2 },
  "High Knees": { quadriceps: 2, calves: 1, abs: 1 },
  "Box Jumps": { quadriceps: 3, calves: 2, glutes: 2 },
  "Battle Ropes": { shoulders: 3, triceps: 2, abs: 2 },
  "Sprint Intervals": { quadriceps: 2, hamstrings: 2, calves: 2, glutes: 2 },
  "Treadmill": { quadriceps: 2, hamstrings: 2, calves: 2, glutes: 1 },
  "Elliptical": { quadriceps: 2, hamstrings: 1, calves: 1, glutes: 1 },
  "Rowing Machine": { lats: 3, biceps: 2, shoulders: 2, abs: 2, quadriceps: 2 },
  "Stair Climber": { quadriceps: 3, calves: 2, glutes: 2 },
  
  // Yoga & Flexibility
  "Yoga": { abs: 2, shoulders: 1, hamstrings: 1, glutes: 1 },
  "Meditation": { abs: 1 },
  "Sun Salutation": { abs: 2, shoulders: 2, chest: 1, hamstrings: 1 },
  "Warrior Pose": { quadriceps: 2, glutes: 2, abs: 2, shoulders: 1 },
  "Downward Dog": { shoulders: 2, triceps: 1, abs: 2, hamstrings: 2, calves: 1 },
  "Child's Pose": { abs: 1, shoulders: 1 },
  "Pigeon Pose": { glutes: 2, hamstrings: 2 },
  "Stretching": { hamstrings: 1, glutes: 1, shoulders: 1 },
  
  // Swimming
  "Swimming": { lats: 3, shoulders: 3, triceps: 2, abs: 2, quadriceps: 1 },
  "Freestyle": { lats: 3, shoulders: 3, triceps: 2, abs: 2 },
  "Backstroke": { lats: 3, shoulders: 3, biceps: 2, abs: 2 },
  "Breaststroke": { chest: 2, shoulders: 2, quadriceps: 2, abs: 2 },
  "Butterfly": { lats: 3, shoulders: 3, chest: 2, abs: 3 },
  "Water Aerobics": { shoulders: 2, quadriceps: 2, abs: 2 },
  "Treading Water": { quadriceps: 2, abs: 3, shoulders: 2 },
  
  // Dumbbell Exercises
  "Dumbbell Press": { chest: 3, triceps: 2, shoulders: 2 },
  "Dumbbell Rows": { lats: 3, traps: 2, biceps: 2, shoulders: 1 },
  "Dumbbell Curls": { biceps: 3, forearms: 1 },
  "Dumbbell Flyes": { chest: 3, shoulders: 1 },
  "Dumbbell Squats": { quadriceps: 3, glutes: 3, abs: 2 },
  "Dumbbell Lunges": { quadriceps: 3, glutes: 2, calves: 1 },
  "Dumbbell Shoulder Press": { shoulders: 3, triceps: 2, abs: 1 },
  "Dumbbell Lateral Raises": { shoulders: 3 },
  "Dumbbell Front Raises": { shoulders: 3, abs: 1 },
  "Dumbbell Shrugs": { traps: 3, shoulders: 1 },
  "Dumbbell Deadlifts": { hamstrings: 3, glutes: 3, lats: 2, traps: 2, abs: 2 },
  "Dumbbell Step-ups": { quadriceps: 3, glutes: 2, calves: 1 },
  "Dumbbell Tricep Extensions": { triceps: 3 },
  "Dumbbell Hammer Curls": { biceps: 3, forearms: 2 },
  "Dumbbell Thrusters": { shoulders: 3, quadriceps: 3, triceps: 2, abs: 2 },
  "Dumbbell Russian Twists": { obliques: 3, abs: 3 },
  "Dumbbell Walking Lunges": { quadriceps: 3, glutes: 2, calves: 1, abs: 1 },
  "Dumbbell Renegade Rows": { lats: 3, abs: 3, shoulders: 2, triceps: 1 },
  "Dumbbell Goblet Squats": { quadriceps: 3, glutes: 3, abs: 2 },
  "Dumbbell Bulgarian Split Squats": { quadriceps: 3, glutes: 2 },
};

const intensityColors = {
  0: "rgba(156, 163, 175, 0.3)", // gray - inactive
  1: "rgba(34, 197, 94, 0.4)",   // green - light
  2: "rgba(234, 179, 8, 0.6)",   // yellow - moderate  
  3: "rgba(239, 68, 68, 0.8)",   // red - high
};

const intensityLabels = {
  0: "Inactive",
  1: "Light",
  2: "Moderate", 
  3: "High",
};

export default function MuscleHeatmap({ exerciseName, targetedMuscles, className = "" }: MuscleHeatmapProps) {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Check if we have exercise mapping or need to use fallback
  const hasExerciseMapping = Boolean(exerciseMuscleMap[exerciseName]);
  const isEstimated = !hasExerciseMapping && targetedMuscles && targetedMuscles.length > 0;

  // Get muscle activation data for the current exercise
  const getMuscleIntensity = (muscleName: string): number => {
    const exerciseData = exerciseMuscleMap[exerciseName];
    
    // If we have exercise mapping, use it
    if (exerciseData) {
      return exerciseData[muscleName] || 0;
    }
    
    // Fallback: use targetedMuscles prop with default intensity
    if (targetedMuscles && targetedMuscles.length > 0) {
      const normalizedTargeted = targetedMuscles.map(normalizeMuscle);
      if (normalizedTargeted.includes(muscleName)) {
        return 2; // Default moderate intensity for estimated muscles
      }
    }
    
    return 0;
  };

  // Get color based on intensity
  const getMuscleColor = (muscleName: string): string => {
    const intensity = getMuscleIntensity(muscleName);
    return intensityColors[intensity as keyof typeof intensityColors];
  };

  // Check if any muscles are activated
  const hasActiveMuscles = Object.keys(muscleGroups).some(muscle => getMuscleIntensity(muscle) > 0);

  return (
    <div className={`relative ${className}`} data-testid="muscle-heatmap">
      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border">
        {/* Title */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Muscle Activation: {exerciseName}
          </h3>
          {isEstimated && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
              ⚠️ Estimated activation based on exercise type
            </p>
          )}
          {!hasActiveMuscles && (
            <p className="text-sm text-muted-foreground">
              No muscle activation data available for this exercise
            </p>
          )}
        </div>

        {/* Interactive muscle diagram */}
        <div className="relative mx-auto max-w-sm">
          <svg
            viewBox="0 0 100 100" 
            className="w-full h-auto"
            style={{ aspectRatio: "3/4" }}
          >
            {/* Background body outline */}
            <rect
              x="35" y="10" width="30" height="85"
              fill="rgba(156, 163, 175, 0.2)"
              stroke="rgba(156, 163, 175, 0.5)"
              strokeWidth="0.5"
              rx="15"
            />
            
            {/* Muscle groups */}
            {Object.entries(muscleGroups).map(([muscleKey, muscle]) => {
              const intensity = getMuscleIntensity(muscleKey);
              const isHovered = hoveredMuscle === muscleKey;
              const isSelected = selectedMuscle === muscleKey;
              
              return (
                <g key={muscleKey}>
                  <ellipse
                    cx={muscle.position.x}
                    cy={muscle.position.y}
                    rx={muscle.position.width / 2}
                    ry={muscle.position.height / 2}
                    fill={getMuscleColor(muscleKey)}
                    stroke={intensity > 0 ? "rgba(255, 255, 255, 0.8)" : "rgba(156, 163, 175, 0.5)"}
                    strokeWidth={isHovered || isSelected ? "1" : "0.5"}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      filter: isHovered ? "brightness(1.2)" : "none",
                      transform: isSelected ? "scale(1.05)" : "scale(1)",
                    }}
                    onMouseEnter={() => setHoveredMuscle(muscleKey)}
                    onMouseLeave={() => setHoveredMuscle(null)}
                    onClick={() => setSelectedMuscle(selectedMuscle === muscleKey ? null : muscleKey)}
                    data-testid={`muscle-${muscleKey}`}
                    aria-label={`${muscle.name} muscle - ${intensity > 0 ? intensityLabels[intensity as 0 | 1 | 2 | 3] + ' activation' : 'inactive'}`}
                    role="button"
                    tabIndex={0}
                  />
                  
                  {/* Muscle labels for activated muscles */}
                  {intensity > 0 && (
                    <text
                      x={muscle.position.x}
                      y={muscle.position.y + 1}
                      textAnchor="middle"
                      className="text-[3px] fill-white font-semibold pointer-events-none"
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                    >
                      {intensity}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2" data-testid="muscle-heatmap-legend">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Intensity Scale:</p>
            {Object.entries(intensityLabels).map(([level, label]) => (
              <div key={level} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-4 h-3 rounded border border-border"
                  style={{ backgroundColor: intensityColors[parseInt(level) as 0 | 1 | 2 | 3] }}
                  data-testid={`intensity-level-${level}`}
                />
                <span className="text-muted-foreground">{level}: {label}</span>
              </div>
            ))}
          </div>

          {/* Active muscles list */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Active Muscles:</p>
            <div className="text-xs text-muted-foreground max-h-20 overflow-y-auto" data-testid="active-muscles-list">
              {hasActiveMuscles ? (
                Object.entries(muscleGroups)
                  .filter(([key]) => getMuscleIntensity(key) > 0)
                  .sort(([a], [b]) => getMuscleIntensity(b) - getMuscleIntensity(a))
                  .map(([key, muscle]) => (
                    <div key={key} className="flex items-center justify-between" data-testid={`active-muscle-${key}`}>
                      <span>{muscle.name}</span>
                      <span className="font-medium">
                        {intensityLabels[getMuscleIntensity(key) as 0 | 1 | 2 | 3]}
                        {isEstimated && " (est.)"}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="text-center py-2 text-muted-foreground">
                  No active muscles detected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Muscle details when selected */}
        {selectedMuscle && (
          <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20" data-testid="muscle-details">
            <h4 className="font-medium text-primary mb-1">
              {muscleGroups[selectedMuscle as keyof typeof muscleGroups].name}
            </h4>
            <p className="text-sm text-muted-foreground">
              Activation Level: {intensityLabels[getMuscleIntensity(selectedMuscle) as 0 | 1 | 2 | 3]}
              {isEstimated && " (estimated)"}
            </p>
            {isEstimated && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                This is an estimated activation based on the exercise type. Actual activation may vary.
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Click muscle groups to learn more about their activation in this exercise.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}