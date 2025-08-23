import { Calendar, Plus, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarView from "@/components/calendar-view";
import { useQuery } from "@tanstack/react-query";
import type { Workout } from "@shared/schema";

export default function CalendarPage() {
  const { data: workouts } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const thisMonth = new Date();
  const thisMonthWorkouts = workouts?.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate.getMonth() === thisMonth.getMonth() && 
           workoutDate.getFullYear() === thisMonth.getFullYear();
  }) || [];

  const totalWorkouts = thisMonthWorkouts.length;
  const totalDuration = thisMonthWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
  const totalCalories = thisMonthWorkouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);

  return (
    <div className="font-inter bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="calendar-title">
                Workout Calendar
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View your workout schedule and track your consistency
              </p>
            </div>
          </div>
          <Button 
            onClick={() => {
              // Navigate to workouts page with focus on workout logger
              window.location.href = '/workouts';
            }}
            className="flex items-center gap-2"
            data-testid="schedule-workout-button"
          >
            <Plus className="w-4 h-4" />
            Schedule Workout
          </Button>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="monthly-workouts">
                  {totalWorkouts} Workouts
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="monthly-duration">
                  {Math.round(totalDuration / 60 * 10) / 10}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Calories Burned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="monthly-calories">
                  {totalCalories.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-3">
            <CalendarView />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Legend */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Workout Types</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Strength Training</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cardio</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Yoga</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Swimming</span>
                </div>
              </div>
            </section>

            {/* Upcoming Goals */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Calendar Tips</h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>💡 Click on any day to see your workout details</p>
                <p>🎯 Aim for 3-4 workouts per week for best results</p>
                <p>🔥 Colored dots indicate different workout types</p>
                <p>📅 Plan ahead by scheduling future workouts</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}