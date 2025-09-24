import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Target, Zap, Award, BarChart3, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

interface WorkoutPerformanceData {
  workouts: Array<{
    id: string;
    name: string;
    date: string;
    difficultyLevel: number;
    perceivedExertion: number;
    completionRate: number;
    performanceScore: number;
    category: string;
  }>;
  trends: {
    difficultyTrend: "improving" | "declining" | "stable";
    consistencyScore: number;
    averageDifficulty: number;
    averageExertion: number;
    completionRate: number;
  };
}

export default function PerformanceAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");

  const { data: performanceData, isLoading } = useQuery<WorkoutPerformanceData>({
    queryKey: ["/api/performance-analytics", selectedTimeframe],
    enabled: true,
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "declining":
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-600 bg-green-50 border-green-200";
      case "declining":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <section className="relative bg-gradient-to-br from-black via-red-900/30 to-black rounded-3xl shadow-2xl border border-red-600/50 p-8 overflow-hidden hexagon-bg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-gradient-to-br from-black via-red-900/30 to-black rounded-3xl shadow-2xl border border-red-600/50 p-8 overflow-hidden hexagon-bg hexagon-pattern">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-32 h-28 opacity-25 animate-pulse" style={{animationDuration: '6s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#dc2626" strokeWidth="2" opacity="0.5"/>
          </svg>
        </div>
        <div className="absolute bottom-1/4 left-0 w-24 h-21 opacity-20 animate-bounce" style={{animationDuration: '8s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.7"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-red-400" />
              AI Performance Analytics
            </h2>
            <p className="text-red-200/80 mt-2">Track your progress with intelligent insights</p>
          </div>
          
          {/* Timeframe Selector */}
          <div className="w-40">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger 
                className="bg-black/50 border-red-600/30 text-white focus:ring-red-600 focus:border-red-600"
                data-testid="timeframe-selector"
              >
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-red-600/30">
                <SelectItem 
                  value="7d" 
                  className="text-white hover:bg-red-600/20 focus:bg-red-600/30"
                  data-testid="timeframe-7d"
                >
                  7 Days
                </SelectItem>
                <SelectItem 
                  value="30d" 
                  className="text-white hover:bg-red-600/20 focus:bg-red-600/30"
                  data-testid="timeframe-30d"
                >
                  30 Days
                </SelectItem>
                <SelectItem 
                  value="90d" 
                  className="text-white hover:bg-red-600/20 focus:bg-red-600/30"
                  data-testid="timeframe-90d"
                >
                  3 Months
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Performance Trend */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-red-600/30">
          <div className="flex items-center gap-3 mb-3">
            {getTrendIcon(performanceData?.trends.difficultyTrend || "stable")}
            <h3 className="font-semibold text-white">Performance Trend</h3>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTrendColor(performanceData?.trends.difficultyTrend || "stable")}`}>
            {performanceData?.trends.difficultyTrend ? 
              performanceData.trends.difficultyTrend.charAt(0).toUpperCase() + performanceData.trends.difficultyTrend.slice(1) : 
              "Stable"
            }
          </div>
        </div>

        {/* Consistency Score */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-red-600/30">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Consistency</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {performanceData?.trends.consistencyScore || 0}%
          </div>
          <div className={`text-sm font-medium ${getConsistencyColor(performanceData?.trends.consistencyScore || 0)}`}>
            {(performanceData?.trends.consistencyScore || 0) >= 80 ? "Excellent" : 
             (performanceData?.trends.consistencyScore || 0) >= 60 ? "Good" : "Needs Improvement"}
          </div>
        </div>

        {/* Average Difficulty */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-red-600/30">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-white">Avg Difficulty</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {performanceData?.trends.averageDifficulty?.toFixed(1) || "0.0"}/5.0
          </div>
          <div className="text-sm text-red-200/70">
            {(performanceData?.trends.averageDifficulty || 0) >= 4 ? "High Intensity" : 
             (performanceData?.trends.averageDifficulty || 0) >= 3 ? "Moderate" : "Light Training"}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-red-600/30">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-white">Completion Rate</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {performanceData?.trends.completionRate || 0}%
          </div>
          <div className="text-sm text-red-200/70">
            Workouts finished
          </div>
        </div>
      </div>

      {/* Recent Workouts Performance */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-red-400" />
          Recent Performance History
        </h3>
        
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {performanceData?.workouts?.length > 0 ? (
            performanceData.workouts.map((workout) => (
              <div key={workout.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-red-600/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{workout.name}</h4>
                    <p className="text-sm text-red-200/70">{workout.category} • {new Date(workout.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-yellow-400 font-semibold">{workout.difficultyLevel}/5</div>
                      <div className="text-red-200/60">Difficulty</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-semibold">{workout.perceivedExertion}/10</div>
                      <div className="text-red-200/60">RPE</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-semibold">{workout.completionRate}%</div>
                      <div className="text-red-200/60">Complete</div>
                    </div>
                    {workout.performanceScore && (
                      <div className="text-center">
                        <div className="text-purple-400 font-semibold">{workout.performanceScore}</div>
                        <div className="text-red-200/60">AI Score</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-red-200/60 mb-4">
                <BarChart3 className="w-12 h-12 mx-auto opacity-50" />
              </div>
              <p className="text-red-200/80">No performance data yet</p>
              <p className="text-sm text-red-200/60">Complete workouts to see your analytics</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="relative z-10 mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-600/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          🧠 AI Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="text-purple-200">
            <strong>Trend Analysis:</strong> {performanceData?.trends.difficultyTrend === "improving" ? 
              "You're progressively challenging yourself - great job!" :
              performanceData?.trends.difficultyTrend === "declining" ?
              "Consider gradually increasing workout intensity." :
              "Your performance is stable. Try varying difficulty levels."
            }
          </div>
          <div className="text-blue-200">
            <strong>Recommendation:</strong> {(performanceData?.trends.consistencyScore || 0) < 60 ?
              "Focus on consistency - aim for regular workout schedule." :
              "Excellent consistency! Consider progressive overload for continued growth."
            }
          </div>
        </div>
      </div>
    </section>
  );
}