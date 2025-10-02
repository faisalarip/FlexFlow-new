import { TrendingUp, Target, Award } from "lucide-react";
import ProgressOverview from "@/components/progress-overview";
import ProgressCharts from "@/components/progress-charts";
import GoalsWidget from "@/components/goals-widget";
import QuickStats from "@/components/quick-stats";

export default function ProgressPage() {
  return (
    <div className="font-inter bg-gradient-to-br from-black via-gray-900 to-black text-white min-h-screen">      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-red-500/30 pb-6">
          <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-lg shadow-red-500/30">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="progress-title">
              Progress
            </h1>
            <p className="text-gray-400">
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
            <section className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl shadow-red-500/20 border-2 border-red-500/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-white">Progress Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-red-900/40 to-black/60 border border-red-500/30 rounded-lg hover:border-red-500/50 transition-colors">
                  <h4 className="font-medium text-red-400 mb-1">Weekly Streak</h4>
                  <p className="text-sm text-gray-300">
                    Keep up the great work! Consistent workouts lead to better results.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-red-900/30 to-black/60 border border-red-500/30 rounded-lg hover:border-red-500/50 transition-colors">
                  <h4 className="font-medium text-red-400 mb-1">Strength Progress</h4>
                  <p className="text-sm text-gray-300">
                    Your weight progress shows steady improvement in strength training.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-red-900/40 to-black/60 border border-red-500/30 rounded-lg hover:border-red-500/50 transition-colors">
                  <h4 className="font-medium text-red-400 mb-1">Goal Achievement</h4>
                  <p className="text-sm text-gray-300">
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