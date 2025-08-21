import { useQuery } from "@tanstack/react-query";
import { Dumbbell, Clock, Flame, Trophy } from "lucide-react";
import type { UserStats } from "@shared/schema";

export default function QuickStats() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-200 rounded-lg p-2 w-10 h-10"></div>
                <div>
                  <div className="h-8 w-8 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-center text-muted">Unable to load stats</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-primary bg-opacity-10 rounded-lg p-2">
              <Dumbbell className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.totalWorkouts}</p>
              <p className="text-sm text-muted">Workouts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-secondary bg-opacity-10 rounded-lg p-2">
              <Clock className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{stats.totalHours}</p>
              <p className="text-sm text-muted">Hours</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-accent bg-opacity-10 rounded-lg p-2">
              <Flame className="text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{stats.caloriesBurned.toLocaleString()}</p>
              <p className="text-sm text-muted">Calories</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 bg-opacity-10 rounded-lg p-2">
              <Trophy className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{stats.personalRecords}</p>
              <p className="text-sm text-muted">PRs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
