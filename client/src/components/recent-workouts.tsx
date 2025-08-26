import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dumbbell, Activity, Leaf, ChevronUp, ChevronDown } from "lucide-react";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import type { Workout } from "@shared/schema";

export default function RecentWorkouts() {
  const [showAll, setShowAll] = useState(false);
  const { data: workouts, isLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const getWorkoutIcon = (category: string) => {
    switch (category) {
      case "strength":
        return Dumbbell;
      case "cardio":
        return Activity;
      case "yoga":
        return Leaf;
      default:
        return Activity;
    }
  };

  const getWorkoutColor = (category: string) => {
    switch (category) {
      case "strength":
        return "primary";
      case "cardio":
        return "secondary";
      case "yoga":
        return "pink-500";
      default:
        return "primary";
    }
  };

  const formatWorkoutDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (isLoading) {
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
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">Recent Workouts</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="bg-gray-200 rounded-lg p-3 w-12 h-12"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>
    );
  }

  if (!workouts || workouts.length === 0) {
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
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">Recent Workouts</h3>
        </div>
        <div className="text-center py-8">
          <Dumbbell className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-300">No workouts yet. Start your first workout!</p>
        </div>
        </div>
      </section>
    );
  }

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
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">Recent Workouts</h3>
        <button 
          onClick={() => setShowAll(!showAll)}
          className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition-colors flex items-center gap-1"
          data-testid="view-all-workouts-button"
        >
          {showAll ? 'Show Less' : 'View All'}
          {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="space-y-4">
        {(showAll ? workouts : workouts.slice(0, 3)).map((workout) => {
          const IconComponent = getWorkoutIcon(workout.category);
          const colorClass = getWorkoutColor(workout.category);

          return (
            <div
              key={workout.id}
              className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/15 transition-colors border border-white/20"
            >
              <div className={`bg-${colorClass} bg-opacity-10 rounded-lg p-3`}>
                <IconComponent className={`text-${colorClass} text-lg`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{workout.name}</h4>
                <p className="text-sm text-gray-300">
                  {workout.duration} min • {workout.caloriesBurned} calories
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {formatWorkoutDate(new Date(workout.date))}
                </p>
                <p className="text-xs text-gray-300">
                  {format(new Date(workout.date), "h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {workouts.length > 3 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-300">
            {showAll ? `Showing all ${workouts.length} workouts` : `Showing 3 of ${workouts.length} workouts`}
          </p>
        </div>
      )}
      </div>
    </section>
  );
}
