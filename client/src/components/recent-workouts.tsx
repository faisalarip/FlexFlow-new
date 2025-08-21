import { useQuery } from "@tanstack/react-query";
import { Dumbbell, Activity, Leaf } from "lucide-react";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import type { Workout } from "@shared/schema";

export default function RecentWorkouts() {
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
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Recent Workouts</h3>
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
      </section>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Recent Workouts</h3>
        </div>
        <div className="text-center py-8">
          <Dumbbell className="mx-auto text-muted mb-4" size={48} />
          <p className="text-muted">No workouts yet. Start your first workout!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Recent Workouts</h3>
        <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {workouts.slice(0, 3).map((workout) => {
          const IconComponent = getWorkoutIcon(workout.category);
          const colorClass = getWorkoutColor(workout.category);

          return (
            <div
              key={workout.id}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className={`bg-${colorClass} bg-opacity-10 rounded-lg p-3`}>
                <IconComponent className={`text-${colorClass} text-lg`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{workout.name}</h4>
                <p className="text-sm text-muted">
                  {workout.duration} min • {workout.caloriesBurned} calories
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {formatWorkoutDate(new Date(workout.date))}
                </p>
                <p className="text-xs text-muted">
                  {format(new Date(workout.date), "h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
