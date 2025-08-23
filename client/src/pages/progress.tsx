import { TrendingUp, Target, Award } from "lucide-react";
import ProgressOverview from "@/components/progress-overview";
import ProgressCharts from "@/components/progress-charts";
import GoalsWidget from "@/components/goals-widget";
import QuickStats from "@/components/quick-stats";

export default function ProgressPage() {
  return (
    <div className="font-inter bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="progress-title">
              Progress
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your fitness achievements and analyze your performance
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <QuickStats />
        </div>

        {/* Progress Overview */}
        <div className="mb-8">
          <ProgressOverview />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progress Charts */}
          <div className="lg:col-span-2">
            <ProgressCharts />
          </div>
          
          {/* Goals Sidebar */}
          <div className="space-y-8">
            <GoalsWidget />
            
            {/* Progress Insights */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Progress Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Weekly Streak</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Keep up the great work! Consistent workouts lead to better results.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Strength Progress</h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Your weight progress shows steady improvement in strength training.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Goal Achievement</h4>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    You're making excellent progress toward your fitness goals!
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}