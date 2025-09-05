import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Calendar, Target, Award, BarChart3, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgressMetrics {
  currentStreak: number;
  longestStreak: number;
  totalWorkoutDays: number;
  consistencyPercentage30Days: number;
  consistencyPercentage7Days: number;
  workoutFrequency: { date: string; count: number }[];
  streakHistory: { start: string; end: string; length: number }[];
}

export default function ProgressOverview() {
  const { data: metrics, isLoading } = useQuery<ProgressMetrics>({
    queryKey: ["/api/progress/metrics"],
  });

  if (isLoading) {
    return (
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-2xl shadow-lg border border-slate-200 p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Progress Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!metrics) {
    return (
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-2xl shadow-lg border border-slate-200 p-6 overflow-hidden">
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium mb-2">Unable to load progress data</p>
          <p className="text-sm">Start working out to see your progress overview!</p>
        </div>
      </section>
    );
  }

  // Get consistency status and color
  const getConsistencyStatus = (percentage: number) => {
    if (percentage >= 80) return { status: "Excellent", color: "text-green-600", bgColor: "bg-green-50" };
    if (percentage >= 60) return { status: "Good", color: "text-blue-600", bgColor: "bg-blue-50" };
    if (percentage >= 40) return { status: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    return { status: "Needs Work", color: "text-red-600", bgColor: "bg-red-50" };
  };

  const consistency30 = getConsistencyStatus(metrics.consistencyPercentage30Days);
  const consistency7 = getConsistencyStatus(metrics.consistencyPercentage7Days);

  // Get recent workout frequency for mini chart
  const recentWorkouts = metrics.workoutFrequency.slice(-14); // Last 14 days
  const maxWorkouts = Math.max(...recentWorkouts.map(w => w.count), 1);

  return (
    <section className="relative bg-gradient-to-br from-black via-red-900/30 to-black rounded-3xl shadow-2xl border border-red-600/50 p-8 overflow-hidden hexagon-bg hexagon-pattern" data-testid="progress-overview">
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
      
      {/* Content wrapper with relative positioning */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold text-white drop-shadow-lg">Progress Overview</h3>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
            <TrendingUp className="text-cyan-300 w-8 h-8" />
          </div>
        </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Streak */}
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-400/30 shadow-2xl backdrop-blur-md bg-white/10 hover:bg-white/15 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white drop-shadow-sm">Current Streak</h4>
            <Flame className="text-orange-300 w-6 h-6 drop-shadow-sm" />
          </div>
          <div className="text-4xl font-bold text-orange-200 mb-2 drop-shadow-lg" data-testid="current-streak">
            {metrics.currentStreak === 0 ? "Start today!" : `${metrics.currentStreak} ${metrics.currentStreak === 1 ? 'day' : 'days'}`}
          </div>
          <p className="text-sm text-orange-100/80 drop-shadow-sm">Keep the momentum going!</p>
        </div>

        {/* Longest Streak */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30 shadow-2xl backdrop-blur-md bg-white/10 hover:bg-white/15 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white drop-shadow-sm">Personal Best</h4>
            <Award className="text-green-300 w-6 h-6 drop-shadow-sm" />
          </div>
          <div className="text-4xl font-bold text-green-200 mb-2 drop-shadow-lg" data-testid="longest-streak">
            {metrics.longestStreak} days
          </div>
          <p className="text-sm text-green-100/80 drop-shadow-sm">Your longest streak</p>
        </div>

        {/* Total Workout Days */}
        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl p-6 border border-blue-400/30 shadow-2xl backdrop-blur-md bg-white/10 hover:bg-white/15 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white drop-shadow-sm">Total Active Days</h4>
            <Calendar className="text-blue-300 w-6 h-6 drop-shadow-sm" />
          </div>
          <div className="text-4xl font-bold text-blue-200 mb-2 drop-shadow-lg" data-testid="total-workout-days">
            {metrics.totalWorkoutDays}
          </div>
          <p className="text-sm text-blue-100/80 drop-shadow-sm">Days you've exercised</p>
        </div>
      </div>

      {/* Consistency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 7-Day Consistency */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30 shadow-2xl backdrop-blur-md bg-white/10 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white drop-shadow-sm">7-Day Consistency</h4>
            <Target className="text-purple-300 w-6 h-6 drop-shadow-sm" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold text-purple-200 drop-shadow-lg" data-testid="consistency-7-days">
              {metrics.consistencyPercentage7Days}%
            </span>
            <span className="text-sm font-medium text-purple-100/90 drop-shadow-sm">
              {consistency7.status}
            </span>
          </div>
          <Progress value={metrics.consistencyPercentage7Days} className="h-2" />
          <p className="text-sm text-purple-100/70 mt-2 drop-shadow-sm">Last 7 days performance</p>
        </div>

        {/* 30-Day Consistency */}
        <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl p-6 border border-cyan-400/30 shadow-2xl backdrop-blur-md bg-white/10 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white drop-shadow-sm">30-Day Consistency</h4>
            <Target className="text-cyan-300 w-6 h-6 drop-shadow-sm" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold text-cyan-200 drop-shadow-lg" data-testid="consistency-30-days">
              {metrics.consistencyPercentage30Days}%
            </span>
            <span className="text-sm font-medium text-cyan-100/90 drop-shadow-sm">
              {consistency30.status}
            </span>
          </div>
          <Progress value={metrics.consistencyPercentage30Days} className="h-2" />
          <p className="text-sm text-cyan-100/70 mt-2 drop-shadow-sm">Last 30 days performance</p>
        </div>
      </div>

      {/* Workout Frequency Chart */}
      <div className="bg-gradient-to-br from-slate-800/40 to-gray-800/40 rounded-2xl p-6 border border-slate-600/30 shadow-2xl backdrop-blur-md bg-black/20">
        <h4 className="font-semibold text-white drop-shadow-sm mb-6 text-lg">Recent Activity (Last 14 Days)</h4>
        <div className="flex items-end justify-between space-x-1" style={{ height: '60px' }}>
          {recentWorkouts.map((day, index) => {
            const height = Math.max((day.count / maxWorkouts) * 100, day.count > 0 ? 20 : 8);
            const date = new Date(day.date);
            const dayLabel = date.getDate();
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-md ${day.count > 0 ? 'bg-gradient-to-t from-cyan-500 to-blue-400 shadow-lg' : 'bg-slate-600/50'}`}
                  style={{ height: `${height}%` }}
                  data-testid={`workout-bar-${index}`}
                />
                <span className="text-xs text-slate-300 mt-2 font-medium">{dayLabel}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-4 text-xs text-slate-300">
          <span>2 weeks ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Progress Insights */}
      {metrics.currentStreak > 0 && metrics.longestStreak > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 rounded-2xl shadow-2xl backdrop-blur-md bg-white/10">
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-emerald-300 w-6 h-6" />
            <div>
              <p className="font-medium text-white drop-shadow-sm">
                {metrics.currentStreak === metrics.longestStreak 
                  ? "🎉 You're on your best streak ever!" 
                  : `${metrics.longestStreak - metrics.currentStreak} days away from your personal best!`
                }
              </p>
              <p className="text-sm text-emerald-100/80 drop-shadow-sm">
                Keep up the amazing consistency to reach new milestones.
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}