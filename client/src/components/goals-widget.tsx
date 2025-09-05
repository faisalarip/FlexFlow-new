import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Plus, Edit2, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import type { Goal, InsertGoal } from "@shared/schema";

export default function GoalsWidget() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalType, setGoalType] = useState<string>("workouts");
  const [goalTarget, setGoalTarget] = useState<string>("5");
  
  const queryClient = useQueryClient();
  
  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });
  
  // Get user stats to calculate current progress
  const { data: userStats } = useQuery<{totalWorkouts: number, totalHours: number, caloriesBurned: number}>({
    queryKey: ["/api/stats"],
  });
  
  // Mutation for creating goals
  const createGoalMutation = useMutation({
    mutationFn: async (goal: Omit<InsertGoal, 'userId'>) => {
      const response = await apiRequest("POST", "/api/goals", goal);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsEditDialogOpen(false);
      setGoalType("workouts");
      setGoalTarget("5");
    },
  });
  
  // Mutation for updating goals  
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, ...goal }: Partial<Goal> & { id: string }) => {
      const response = await apiRequest("PATCH", `/api/goals/${id}`, goal);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsEditDialogOpen(false);
      setEditingGoal(null);
    },
  });
  
  // Mutation for deleting goals
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/goals/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  if (isLoading) {
    return (
      <section className="relative bg-gradient-to-br from-black via-red-900/30 to-black rounded-3xl shadow-2xl border border-red-600/50 p-8 overflow-hidden hexagon-bg hexagon-pattern">
        {/* Animated red and black background elements */}
        <div className="absolute inset-0">
          {/* Floating red hexagons */}
          <div className="absolute top-0 left-0 w-32 h-28 opacity-30 animate-pulse" style={{animationDuration: '4s'}}>
            <svg viewBox="0 0 120 104" className="w-full h-full">
              <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
            </svg>
          </div>
          <div className="absolute top-1/4 right-0 w-24 h-21 opacity-20 animate-bounce" style={{animationDuration: '6s'}}>
            <svg viewBox="0 0 120 104" className="w-full h-full">
              <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.8"/>
            </svg>
          </div>
          <div className="absolute bottom-0 left-1/3 w-28 h-24 opacity-25 animate-ping" style={{animationDuration: '8s', animationDelay: '1s'}}>
            <svg viewBox="0 0 120 104" className="w-full h-full">
              <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#000000" stroke="#dc2626" strokeWidth="1" opacity="0.7"/>
            </svg>
          </div>
          <div className="absolute bottom-1/4 right-1/4 w-20 h-17 opacity-15 animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}}>
            <svg viewBox="0 0 120 104" className="w-full h-full">
              <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#000000" strokeWidth="1" opacity="0.5"/>
            </svg>
          </div>
          <div className="absolute top-1/2 left-10 w-22 h-19 opacity-20 animate-bounce" style={{animationDuration: '7s', animationDelay: '0.5s'}}>
            <svg viewBox="0 0 120 104" className="w-full h-full">
              <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.4"/>
            </svg>
          </div>
          
          {/* Animated red gradient orbs */}
          <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-gradient-to-br from-red-600/20 to-black/40 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDuration: '6s'}}></div>
          <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-gradient-to-br from-black/60 to-red-600/20 rounded-full blur-2xl opacity-20 animate-ping" style={{animationDuration: '10s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-28 h-28 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full blur-3xl opacity-10 animate-ping" style={{animationDuration: '4s'}}></div>
        </div>
        {/* Content wrapper */}
        <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">Weekly Goals</h3>
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
        </div>
      </section>
    );
  }

  // Calculate current progress based on user stats
  const getCurrentProgress = (type: string) => {
    if (!userStats) return 0;
    
    switch (type) {
      case "workouts":
        return userStats.totalWorkouts || 0;
      case "minutes":
        return (userStats.totalHours || 0) * 60; // Convert hours back to minutes
      case "calories":
        return userStats.caloriesBurned || 0;
      default:
        return 0;
    }
  };
  
  // Update goals with real progress data from user's actual workouts
  const displayGoals = goals && goals.length > 0 
    ? goals.map(goal => ({
        ...goal,
        current: getCurrentProgress(goal.type)
      }))
    : [];
    
  // Initialize default goals for new users
  const initializeDefaultGoals = async () => {
    const defaultGoalTypes = [
      { type: "workouts", target: 5 },
      { type: "minutes", target: 200 },
      { type: "calories", target: 1500 },
    ];
    
    for (const defaultGoal of defaultGoalTypes) {
      await createGoalMutation.mutateAsync({
        type: defaultGoal.type,
        target: defaultGoal.target,
        current: 0,
        period: "weekly",
        isActive: true
      });
    }
  };

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

  const isOnTrack = displayGoals.length > 0 && displayGoals.some(goal => calculateProgress(goal.current, goal.target) >= 80);
  
  const handleEditGoal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalType(goal.type);
      setGoalTarget(goal.target.toString());
    } else {
      setEditingGoal(null);
      setGoalType("workouts");
      setGoalTarget("5");
    }
    setIsEditDialogOpen(true);
  };
  
  const handleSaveGoal = () => {
    const target = parseInt(goalTarget);
    if (isNaN(target) || target <= 0) return;
    
    if (editingGoal) {
      updateGoalMutation.mutate({
        id: editingGoal.id,
        target,
        type: goalType,
      });
    } else {
      createGoalMutation.mutate({
        type: goalType,
        target,
        current: 0,
        period: "weekly",
        isActive: true
      });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-black via-red-900/30 to-black rounded-3xl shadow-2xl border border-red-600/50 p-8 overflow-hidden hexagon-bg hexagon-pattern">
      {/* Animated red and black background elements */}
      <div className="absolute inset-0">
        {/* Floating red hexagons */}
        <div className="absolute top-0 left-0 w-32 h-28 opacity-30 animate-pulse" style={{animationDuration: '4s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
          </svg>
        </div>
        <div className="absolute top-1/4 right-0 w-24 h-21 opacity-20 animate-bounce" style={{animationDuration: '6s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.8"/>
          </svg>
        </div>
        <div className="absolute bottom-0 left-1/3 w-28 h-24 opacity-25 animate-ping" style={{animationDuration: '8s', animationDelay: '1s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#000000" stroke="#dc2626" strokeWidth="1" opacity="0.7"/>
          </svg>
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-20 h-17 opacity-15 animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#000000" strokeWidth="1" opacity="0.5"/>
          </svg>
        </div>
        <div className="absolute top-1/2 left-10 w-22 h-19 opacity-20 animate-bounce" style={{animationDuration: '7s', animationDelay: '0.5s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.4"/>
          </svg>
        </div>
        
        {/* Animated red gradient orbs */}
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-gradient-to-br from-red-600/20 to-black/40 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-gradient-to-br from-black/60 to-red-600/20 rounded-full blur-2xl opacity-20 animate-ping" style={{animationDuration: '10s'}}></div>
        
        {/* Dynamic radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-red-900/10 to-black/60 animate-pulse" style={{animationDuration: '8s'}}></div>
      </div>
      {/* Content wrapper */}
      <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">Weekly Goals</h3>
        <div className="flex gap-2">
          {displayGoals.length === 0 && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={initializeDefaultGoals}
              disabled={createGoalMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-1" />
              Setup Goals
            </Button>
          )}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleEditGoal()}
                className="text-primary hover:text-primary/80"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                {displayGoals.length > 0 ? 'Edit' : 'Add Goal'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                </DialogTitle>
                <DialogDescription>
                  Set your weekly fitness target to stay motivated and track progress.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="goal-type" className="text-right">
                    Type
                  </Label>
                  <Select value={goalType} onValueChange={setGoalType}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workouts">Workouts</SelectItem>
                      <SelectItem value="minutes">Active Minutes</SelectItem>
                      <SelectItem value="calories">Calories Burned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="goal-target" className="text-right">
                    Target
                  </Label>
                  <Input
                    id="goal-target"
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., 5 workouts"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleSaveGoal}
                  disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {displayGoals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium mb-2">No goals set yet</p>
          <p className="text-sm mb-4">Set up your weekly fitness goals to track your progress!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayGoals.map((goal) => {
            const progress = calculateProgress(goal.current, goal.target);
            const colorClass = getGoalColor(goal.type);

            return (
              <div key={goal.id} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">
                    {getGoalLabel(goal.type)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">
                      {goal.current}/{goal.target}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-6 w-6"
                        onClick={() => handleEditGoal(goal)}
                        data-testid={`edit-goal-${goal.id}`}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteGoalMutation.mutate(goal.id)}
                        disabled={deleteGoalMutation.isPending}
                        data-testid={`delete-goal-${goal.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
                {progress >= 100 && (
                  <div className="flex items-center mt-2 text-green-600">
                    <Trophy className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">Goal achieved!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
      </div>
    </section>
  );
}
