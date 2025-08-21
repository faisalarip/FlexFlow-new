import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Goal } from "@shared/schema";

export default function GoalsWidget() {
  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Weekly Goals</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Default goals if none exist
  const defaultGoals = [
    { type: "workouts", current: 4, target: 5, color: "primary" },
    { type: "minutes", current: 180, target: 200, color: "secondary" },
    { type: "calories", current: 1420, target: 1500, color: "accent" },
  ];

  const displayGoals = goals && goals.length > 0 ? goals : defaultGoals.map(g => ({
    ...g,
    id: g.type,
    userId: "",
    period: "weekly" as const,
    isActive: true,
    createdAt: new Date()
  }));

  const getGoalLabel = (type: string) => {
    switch (type) {
      case "workouts": return "Workouts";
      case "minutes": return "Active Minutes";
      case "calories": return "Calories Burned";
      default: return type;
    }
  };

  const getGoalColor = (type: string) => {
    switch (type) {
      case "workouts": return "primary";
      case "minutes": return "secondary";
      case "calories": return "accent";
      default: return "primary";
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const isOnTrack = displayGoals.some(goal => calculateProgress(goal.current, goal.target) >= 80);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Weekly Goals</h3>
        <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
          Edit
        </button>
      </div>

      <div className="space-y-4">
        {displayGoals.map((goal) => {
          const progress = calculateProgress(goal.current, goal.target);
          const colorClass = getGoalColor(goal.type);

          return (
            <div key={goal.id || goal.type}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">
                  {getGoalLabel(goal.type)}
                </span>
                <span className="text-sm text-muted">
                  {goal.current}/{goal.target}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
      </div>

      {isOnTrack && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <Trophy className="text-green-500 text-lg" />
            <div>
              <p className="font-medium text-green-800">Great progress!</p>
              <p className="text-sm text-green-600">You're on track to exceed your weekly goals.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
