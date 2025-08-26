import { useState, useEffect } from "react";
import { Dumbbell, Heart, Leaf, ChevronRight, RefreshCw, Activity, Weight, Bike } from "lucide-react";

export default function WorkoutRecommendations() {
  const [currentRecommendations, setCurrentRecommendations] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pool of all possible workouts
  const workoutPool = [
    { name: "Full Body HIIT", details: "30 min • High intensity", icon: Dumbbell, color: "primary", bgColor: "blue" },
    { name: "Cardio Blast", details: "20 min • Moderate intensity", icon: Heart, color: "secondary", bgColor: "green" },
    { name: "Recovery Yoga", details: "25 min • Low intensity", icon: Leaf, color: "purple-600", bgColor: "purple" },
    { name: "Strength Training", details: "45 min • High intensity", icon: Weight, color: "primary", bgColor: "red" },
    { name: "Morning Run", details: "25 min • Moderate intensity", icon: Activity, color: "secondary", bgColor: "green" },
    { name: "Cycling Adventure", details: "40 min • Moderate intensity", icon: Bike, color: "secondary", bgColor: "yellow" },
    { name: "Core Crusher", details: "15 min • High intensity", icon: Dumbbell, color: "primary", bgColor: "orange" },
    { name: "Flexibility Flow", details: "20 min • Low intensity", icon: Leaf, color: "purple-600", bgColor: "pink" },
    { name: "Upper Body Blast", details: "35 min • High intensity", icon: Weight, color: "primary", bgColor: "blue" },
    { name: "Dance Cardio", details: "30 min • Moderate intensity", icon: Heart, color: "secondary", bgColor: "purple" },
    { name: "Swimming Laps", details: "45 min • Low intensity", icon: Activity, color: "secondary", bgColor: "blue" },
    { name: "Pilates Power", details: "30 min • Moderate intensity", icon: Leaf, color: "purple-600", bgColor: "green" },
    { name: "Kettlebell Circuit", details: "25 min • High intensity", icon: Weight, color: "primary", bgColor: "red" },
    { name: "Beach Body Bootcamp", details: "35 min • High intensity", icon: Dumbbell, color: "primary", bgColor: "orange" },
    { name: "Mindful Stretching", details: "15 min • Low intensity", icon: Leaf, color: "purple-600", bgColor: "pink" }
  ];

  // Get daily seed based on date
  const getDailySeed = () => {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  };

  // Seeded random function for consistent daily recommendations
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Generate daily recommendations
  const generateDailyRecommendations = (forceRefresh = false) => {
    const seed = forceRefresh ? Date.now() : getDailySeed();
    const shuffled = [...workoutPool];
    
    // Shuffle array using seeded random
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, 3);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      const newRecommendations = generateDailyRecommendations(true);
      setCurrentRecommendations(newRecommendations);
      setIsRefreshing(false);
    }, 500);
  };

  // Initialize daily recommendations on component mount
  useEffect(() => {
    const dailyRecommendations = generateDailyRecommendations();
    setCurrentRecommendations(dailyRecommendations);
  }, []);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Recommended Workouts</h3>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-1 text-primary hover:text-primary/80 text-sm font-medium transition-colors disabled:opacity-50"
          data-testid="refresh-workouts-button"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {currentRecommendations.map((recommendation, index) => {
          const IconComponent = recommendation.icon;
          return (
            <div
              key={`${recommendation.name}-${index}`}
              className={`flex items-center space-x-4 p-3 bg-gradient-to-r from-${recommendation.bgColor}-50 to-${recommendation.bgColor}-100 rounded-xl hover:from-${recommendation.bgColor}-100 hover:to-${recommendation.bgColor}-200 transition-all cursor-pointer`}
              data-testid={`workout-recommendation-${index}`}
            >
              <div className={`bg-${recommendation.color} bg-opacity-20 rounded-lg p-2`}>
                <IconComponent className={`text-${recommendation.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{recommendation.name}</h4>
                <p className="text-sm text-muted">{recommendation.details}</p>
              </div>
              <ChevronRight className="text-muted" />
            </div>
          );
        })}
      </div>
    </section>
  );
}