import { Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkoutLogger from "@/components/workout-logger";
import RecentWorkouts from "@/components/recent-workouts";
import WorkoutRecommendations from "@/components/workout-recommendations";
import QuickStats from "@/components/quick-stats";

export default function WorkoutsPage() {
  return (
    <div className="font-inter bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="workouts-title">
                Workouts
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your fitness journey and log your workouts
              </p>
            </div>
          </div>
          <Button 
            onClick={() => {
              const workoutLogger = document.getElementById('workout-logger');
              if (workoutLogger) {
                workoutLogger.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start' 
                });
              }
            }}
            className="flex items-center gap-2"
            data-testid="start-workout-button"
          >
            <Plus className="w-4 h-4" />
            Start Workout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <QuickStats />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Workout Logger & Recent Workouts */}
          <div className="lg:col-span-2 space-y-8">
            <WorkoutLogger />
            <RecentWorkouts />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            <WorkoutRecommendations />
          </div>
        </div>
      </main>
    </div>
  );
}