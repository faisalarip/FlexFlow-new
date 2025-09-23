import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, BellRing, CheckCircle, X, TrendingUp, Zap, Brain, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PendingAdjustment {
  id: string;
  exerciseId: string;
  currentDifficulty: number;
  suggestedDifficulty: number;
  confidenceScore: number;
  reasoningFactors: any;
  performanceTrend: "improving" | "declining" | "stable";
  createdAt: string;
}

interface AIRecommendation {
  exerciseId: string;
  exerciseName: string;
  recommendedDifficulty: number;
  reason: string;
  confidence: number;
}

interface RecommendationsData {
  exercises: AIRecommendation[];
  overallRecommendation: string;
}

export default function DifficultyNotifications() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending AI adjustments
  const { data: pendingAdjustments, isLoading: loadingPending } = useQuery<PendingAdjustment[]>({
    queryKey: ["/api/ai-adjustments/pending"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch AI recommendations
  const { data: recommendations, isLoading: loadingRecommendations } = useQuery<RecommendationsData>({
    queryKey: ["/api/ai-recommendations"],
    refetchInterval: 60000, // Refetch every minute
  });

  // Apply adjustments mutation
  const applyAdjustmentsMutation = useMutation({
    mutationFn: async (exerciseIds: string[]) => {
      const response = await apiRequest("POST", "/api/ai-adjustments/apply", { exerciseIds });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-adjustments/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-recommendations"] });
      toast({
        title: "🎯 Adjustments Applied!",
        description: `Successfully applied ${data.appliedCount} difficulty adjustments`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to apply difficulty adjustments. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleApplyAll = () => {
    if (pendingAdjustments && pendingAdjustments.length > 0) {
      const exerciseIds = pendingAdjustments.map(adj => adj.exerciseId);
      applyAdjustmentsMutation.mutate(exerciseIds);
    }
  };

  const handleApplySpecific = (exerciseId: string) => {
    applyAdjustmentsMutation.mutate([exerciseId]);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "declining":
        return <Target className="w-4 h-4 text-red-500" />;
      default:
        return <Zap className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100 text-green-800 border-green-300";
    if (confidence >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-blue-100 text-blue-800 border-blue-300";
  };

  const getDifficultyBadge = (current: number, suggested: number) => {
    const isIncrease = suggested > current;
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-gray-100">
          Level {current}
        </Badge>
        <span className="text-gray-400">→</span>
        <Badge 
          variant="outline" 
          className={isIncrease ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
        >
          Level {suggested}
        </Badge>
      </div>
    );
  };

  const totalNotifications = (pendingAdjustments?.length || 0) + (recommendations?.exercises?.length || 0);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative p-2 rounded-full transition-colors ${
          totalNotifications > 0
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        data-testid="notification-bell"
      >
        {totalNotifications > 0 ? <BellRing className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
        
        {totalNotifications > 0 && (
          <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalNotifications > 9 ? "9+" : totalNotifications}
          </div>
        )}
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute -right-4 sm:right-0 top-12 w-72 sm:w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 max-h-[50vh] md:max-h-[70vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-3 md:p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 md:w-5 md:h-5" />
                <h3 className="font-semibold text-sm md:text-base">AI Fitness Coach</h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-white/80 hover:text-white"
                data-testid="close-notifications"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            <p className="text-red-100 text-xs md:text-sm mt-1">
              {totalNotifications > 0 
                ? `${totalNotifications} intelligent suggestions waiting`
                : "No new suggestions"
              }
            </p>
          </div>

          <div className="max-h-64 md:max-h-80 overflow-y-auto">
            {/* Overall Recommendation */}
            {recommendations?.overallRecommendation && (
              <div className="p-3 md:p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <h4 className="font-medium text-purple-800 mb-2 text-sm md:text-base">🎯 Overall Assessment</h4>
                <p className="text-xs md:text-sm text-purple-700">{recommendations.overallRecommendation}</p>
              </div>
            )}

            {/* Pending Adjustments */}
            {pendingAdjustments && pendingAdjustments.length > 0 && (
              <div className="border-b">
                <div className="p-3 md:p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800 flex items-center gap-2 text-sm md:text-base">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Ready to Apply ({pendingAdjustments.length})
                    </h4>
                    <Button
                      size="sm"
                      onClick={handleApplyAll}
                      disabled={applyAdjustmentsMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-xs md:text-sm"
                      data-testid="apply-all-button"
                    >
                      Apply All
                    </Button>
                  </div>
                </div>

                <div className="space-y-0">
                  {pendingAdjustments.map((adjustment) => (
                    <div key={adjustment.id} className="p-3 md:p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTrendIcon(adjustment.performanceTrend)}
                            <span className="font-medium text-gray-800 text-sm md:text-base">Exercise Adjustment</span>
                            <Badge 
                              variant="outline" 
                              className={`${getConfidenceColor(adjustment.confidenceScore)} text-xs`}
                            >
                              {adjustment.confidenceScore}% confident
                            </Badge>
                          </div>
                          
                          {getDifficultyBadge(adjustment.currentDifficulty, adjustment.suggestedDifficulty)}
                          
                          <p className="text-xs md:text-sm text-gray-600 mt-2">
                            Performance trend: <strong>{adjustment.performanceTrend}</strong>
                          </p>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplySpecific(adjustment.exerciseId)}
                          disabled={applyAdjustmentsMutation.isPending}
                          className="ml-2 shrink-0 text-xs md:text-sm"
                          data-testid={`apply-${adjustment.exerciseId}`}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {recommendations?.exercises && recommendations.exercises.length > 0 && (
              <div>
                <div className="p-3 md:p-4 bg-blue-50">
                  <h4 className="font-medium text-blue-800 flex items-center gap-2 text-sm md:text-base">
                    <Brain className="w-4 h-4" />
                    Smart Recommendations ({recommendations.exercises.length})
                  </h4>
                  <p className="text-xs text-blue-600 mt-1">Based on your performance patterns</p>
                </div>

                <div className="space-y-0">
                  {recommendations.exercises.map((rec) => (
                    <div key={rec.exerciseId} className="p-3 md:p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-800 text-sm md:text-base">{rec.exerciseName}</h5>
                          <div className="flex items-center gap-2 mt-1 mb-2">
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                              Level {rec.recommendedDifficulty}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`${getConfidenceColor(rec.confidence)} text-xs`}
                            >
                              {rec.confidence}% match
                            </Badge>
                          </div>
                          <p className="text-xs md:text-sm text-gray-600">{rec.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Notifications */}
            {totalNotifications === 0 && !loadingPending && !loadingRecommendations && (
              <div className="p-6 md:p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Brain className="w-10 h-10 md:w-12 md:h-12 mx-auto opacity-50" />
                </div>
                <h4 className="font-medium text-gray-600 mb-2 text-sm md:text-base">All Caught Up!</h4>
                <p className="text-xs md:text-sm text-gray-500">
                  Complete more workouts for personalized difficulty suggestions.
                </p>
              </div>
            )}

            {/* Loading State */}
            {(loadingPending || loadingRecommendations) && (
              <div className="p-6 md:p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-xs md:text-sm text-gray-500">Loading AI suggestions...</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 md:p-3 bg-gray-50 rounded-b-2xl border-t text-center">
            <p className="text-xs text-gray-500">
              🤖 Powered by AI • Updates automatically based on your workouts
            </p>
          </div>
        </div>
      )}
    </div>
  );
}