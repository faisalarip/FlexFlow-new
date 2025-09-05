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
    <section className="relative bg-gradient-to-br from-black via-red-900/30 to-black rounded-3xl shadow-2xl border border-red-600/50 p-8 overflow-hidden hexagon-bg hexagon-pattern">
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