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
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-2xl shadow-lg border border-slate-200 p-6 overflow-hidden" data-testid="progress-overview">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-10 w-24 h-24 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-20 w-28 h-28 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content wrapper with relative positioning */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Progress Overview</h3>
          <div className="p-2 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
            <TrendingUp className="text-primary w-6 h-6" />
          </div>
        </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Streak */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100 shadow-md backdrop-blur-sm bg-white/40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Current Streak</h4>
            <Flame className="text-orange-500 w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-1" data-testid="current-streak">
            {metrics.currentStreak === 0 ? "Start today!" : `${metrics.currentStreak} ${metrics.currentStreak === 1 ? 'day' : 'days'}`}
          </div>
          <p className="text-sm text-gray-600">Keep the momentum going!</p>
        </div>

        {/* Longest Streak */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 shadow-md backdrop-blur-sm bg-white/40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Personal Best</h4>
            <Award className="text-green-500 w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1" data-testid="longest-streak">
            {metrics.longestStreak} days
          </div>
          <p className="text-sm text-gray-600">Your longest streak</p>
        </div>

        {/* Total Workout Days */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-md backdrop-blur-sm bg-white/40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Total Active Days</h4>
            <Calendar className="text-blue-500 w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1" data-testid="total-workout-days">
            {metrics.totalWorkoutDays}
          </div>
          <p className="text-sm text-gray-600">Days you've exercised</p>
        </div>
      </div>

      {/* Consistency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 7-Day Consistency */}
        <div className={`${consistency7.bgColor} rounded-xl p-4 border shadow-md backdrop-blur-sm bg-white/50`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">7-Day Consistency</h4>
            <Target className="text-gray-600 w-5 h-5" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-2xl font-bold ${consistency7.color}`} data-testid="consistency-7-days">
              {metrics.consistencyPercentage7Days}%
            </span>
            <span className={`text-sm font-medium ${consistency7.color}`}>
              {consistency7.status}
            </span>
          </div>
          <Progress value={metrics.consistencyPercentage7Days} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">Last 7 days performance</p>
        </div>

        {/* 30-Day Consistency */}
        <div className={`${consistency30.bgColor} rounded-xl p-4 border shadow-md backdrop-blur-sm bg-white/50`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">30-Day Consistency</h4>
            <Target className="text-gray-600 w-5 h-5" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-2xl font-bold ${consistency30.color}`} data-testid="consistency-30-days">
              {metrics.consistencyPercentage30Days}%
            </span>
            <span className={`text-sm font-medium ${consistency30.color}`}>
              {consistency30.status}
            </span>
          </div>
          <Progress value={metrics.consistencyPercentage30Days} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">Last 30 days performance</p>
        </div>
      </div>

      {/* Workout Frequency Chart */}
      <div className="bg-gradient-to-br from-white/60 to-slate-100/60 rounded-xl p-4 border border-slate-200 shadow-md backdrop-blur-sm">
        <h4 className="font-semibold text-gray-800 mb-4">Recent Activity (Last 14 Days)</h4>
        <div className="flex items-end justify-between space-x-1" style={{ height: '60px' }}>
          {recentWorkouts.map((day, index) => {
            const height = Math.max((day.count / maxWorkouts) * 100, day.count > 0 ? 20 : 8);
            const date = new Date(day.date);
            const dayLabel = date.getDate();
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-sm ${day.count > 0 ? 'bg-primary' : 'bg-gray-300'}`}
                  style={{ height: `${height}%` }}
                  data-testid={`workout-bar-${index}`}
                />
                <span className="text-xs text-gray-500 mt-1">{dayLabel}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>2 weeks ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Progress Insights */}
      {metrics.currentStreak > 0 && metrics.longestStreak > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50/80 to-indigo-100/80 border border-blue-200/50 rounded-xl shadow-md backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-blue-500" />
            <div>
              <p className="font-medium text-blue-800">
                {metrics.currentStreak === metrics.longestStreak 
                  ? "🎉 You're on your best streak ever!" 
                  : `${metrics.longestStreak - metrics.currentStreak} days away from your personal best!`
                }
              </p>
              <p className="text-sm text-blue-600">
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