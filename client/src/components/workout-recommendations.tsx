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
    <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 rounded-3xl shadow-2xl border border-indigo-700/50 p-8 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-2xl opacity-15 animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-28 h-28 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full blur-3xl opacity-10 animate-ping" style={{animationDuration: '4s'}}></div>
      </div>
      {/* Content wrapper */}
      <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">Recommended Workouts</h3>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-1 text-gray-300 hover:text-cyan-300 text-sm font-medium transition-colors disabled:opacity-50"
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
              className="flex items-center space-x-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/15 transition-all cursor-pointer border border-white/20"
              data-testid={`workout-recommendation-${index}`}
            >
              <div className="bg-white/20 rounded-lg p-2">
                <IconComponent className="text-cyan-300" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{recommendation.name}</h4>
                <p className="text-sm text-gray-300">{recommendation.details}</p>
              </div>
              <ChevronRight className="text-gray-300" />
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}