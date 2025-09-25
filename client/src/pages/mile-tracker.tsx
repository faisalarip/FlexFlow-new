import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Pause, Square, Timer, Activity, Target, History, MapPin, Zap, Flame, Trophy, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MileTrackerSessionWithSplits } from "@shared/schema";

export default function MileTracker() {
  const [selectedActivity, setSelectedActivity] = useState<"run" | "walk" | "bike">("run");
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentMile, setCurrentMile] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeSession, refetch: refetchActiveSession } = useQuery<MileTrackerSessionWithSplits>({
    queryKey: ["/api/mile-tracker/sessions/active"],
    retry: false,
  });

  const { data: sessions = [] } = useQuery<MileTrackerSessionWithSplits[]>({
    queryKey: ["/api/mile-tracker/sessions"],
    enabled: showHistory,
  });

  const startSessionMutation = useMutation({
    mutationFn: async (activityType: string) => {
      const response = await apiRequest("POST", "/api/mile-tracker/sessions", {
        activityType,
        totalDistance: 0,
        totalTime: 0,
        averagePace: null,
      });
      return response.json();
    },
    onSuccess: () => {
      refetchActiveSession();
      setIsRunning(true);
      setCurrentTime(0);
      setCurrentMile(1);
      toast({ title: "Session Started!", description: `Started tracking your ${selectedActivity}` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start session", variant: "destructive" });
    }
  });

  const completeMileMutation = useMutation({
    mutationFn: async ({ sessionId, mileNumber, splitTime, cumulativeTime }: {
      sessionId: string;
      mileNumber: number;
      splitTime: number;
      cumulativeTime: number;
    }) => {
      const pace = splitTime; // pace in seconds per mile
      const response = await apiRequest("POST", `/api/mile-tracker/sessions/${sessionId}/splits`, {
        mileNumber,
        splitTime,
        cumulativeTime,
        pace,
      });
      return response.json();
    },
    onSuccess: () => {
      refetchActiveSession();
      queryClient.invalidateQueries({ queryKey: ["/api/mile-tracker/sessions"] });
      toast({ 
        title: "Mile Completed!", 
        description: `Mile ${currentMile} completed in ${formatTime(getLastMileTime())}`
      });
      setCurrentMile(prev => prev + 1);
    }
  });

  const finishSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const totalDistance = currentMile > 1 ? (currentMile - 1) * 1000 : 0; // Convert to meters * 1000 for precision
      const averagePace = currentTime > 0 && currentMile > 1 ? Math.round(currentTime / (currentMile - 1)) : null;
      
      const response = await apiRequest("PATCH", `/api/mile-tracker/sessions/${sessionId}`, {
        status: "completed",
        totalDistance,
        totalTime: currentTime,
        averagePace,
        completedAt: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      setIsRunning(false);
      setCurrentTime(0);
      setCurrentMile(0);
      refetchActiveSession();
      queryClient.invalidateQueries({ queryKey: ["/api/mile-tracker/sessions"] });
      toast({ title: "Session Completed!", description: "Great job on your workout!" });
    }
  });

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  // Load active session on component mount
  useEffect(() => {
    if (activeSession && activeSession.status === "active") {
      setIsRunning(false); // Will be set to true by user
      setCurrentMile(activeSession.splits.length + 1);
      
      // Calculate current time based on splits
      const lastSplit = activeSession.splits[activeSession.splits.length - 1];
      if (lastSplit) {
        setCurrentTime(lastSplit.cumulativeTime);
      }
    }
  }, [activeSession]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getLastMileTime = (): number => {
    if (!activeSession || activeSession.splits.length === 0) return 0;
    const lastSplit = activeSession.splits[activeSession.splits.length - 1];
    return lastSplit.splitTime;
  };

  const getCurrentPace = (): string => {
    if (currentMile <= 1 || currentTime === 0) return "--:--";
    const averageSecondsPerMile = currentTime / (currentMile - 1);
    return formatPace(Math.round(averageSecondsPerMile));
  };

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case "run":
        return "🔥🏃‍♂️💨";
      case "walk":
        return "⚡🚶‍♂️💪";
      case "bike":
        return "🏁🚴‍♂️🔥";
      default:
        return "🔥🏃‍♂️💨";
    }
  };

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case "run":
        return "bg-gradient-to-r from-red-600 to-red-800 text-white border-red-500 shadow-lg shadow-red-500/25";
      case "walk":
        return "bg-gradient-to-r from-red-700 to-black text-white border-red-600 shadow-lg shadow-red-600/25";
      case "bike":
        return "bg-gradient-to-r from-black to-red-700 text-white border-red-500 shadow-lg shadow-red-500/25";
      default:
        return "bg-gradient-to-r from-red-600 to-red-800 text-white border-red-500 shadow-lg shadow-red-500/25";
    }
  };

  const startSession = () => {
    startSessionMutation.mutate(selectedActivity);
  };

  const pauseResume = () => {
    setIsRunning(!isRunning);
  };

  const completeMile = () => {
    if (!activeSession) return;
    
    const lastSplitTime = activeSession.splits.length > 0 
      ? activeSession.splits[activeSession.splits.length - 1].cumulativeTime 
      : 0;
    const splitTime = currentTime - lastSplitTime;
    
    completeMileMutation.mutate({
      sessionId: activeSession.id,
      mileNumber: currentMile,
      splitTime,
      cumulativeTime: currentTime,
    });
  };

  const finishSession = () => {
    if (!activeSession) return;
    finishSessionMutation.mutate(activeSession.id);
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent mb-2 flex items-center">
                <Trophy className="mr-3 text-red-500" size={40} />
                🔥 SPEED HISTORY 🔥
              </h1>
              <p className="text-red-300 font-semibold">Your legendary racing sessions and conquests</p>
            </div>
            <Button onClick={() => setShowHistory(false)} className="bg-red-600 hover:bg-red-700 text-white border border-red-500">
              <Zap className="mr-2" size={16} />
              Back to Action
            </Button>
          </div>

          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="bg-gradient-to-r from-gray-900 to-black border border-red-500/30 shadow-xl shadow-red-500/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl animate-pulse">
                        {getActivityIcon(session.activityType)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-xl capitalize text-red-400 flex items-center">
                            <Flame className="mr-1" size={18} />
                            EPIC {session.activityType.toUpperCase()}
                          </h3>
                          <Badge className={getActivityColor(session.activityType)}>
                            🏁 {session.splits.length} {session.splits.length === 1 ? 'MILE' : 'MILES'} 🏁
                          </Badge>
                        </div>
                        <p className="text-red-300 font-medium">
                          ⚡ {new Date(session.startedAt).toLocaleDateString()} at{' '}
                          {new Date(session.startedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-red-400 font-mono">
                        {formatTime(session.totalTime)}
                      </p>
                      <p className="text-sm text-red-300 font-semibold">
                        💨 Avg Speed: {session.averagePace ? formatPace(session.averagePace) : '--:--'}/mile
                      </p>
                    </div>
                  </div>
                  
                  {session.splits.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-red-500/30">
                      <h4 className="font-bold text-red-400 mb-2 flex items-center">
                        <Gauge className="mr-2" size={18} />
                        🔥 SPEED SPLITS 🔥
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {session.splits.map((split, index) => (
                          <div key={split.id} className="bg-gradient-to-br from-red-900 to-black rounded-lg p-3 text-center border border-red-500/40 shadow-lg">
                            <p className="text-sm font-bold text-red-300">🏃‍♂️ MILE {split.mileNumber}</p>
                            <p className="text-xl font-bold text-red-400 font-mono">
                              {formatTime(split.splitTime)}
                            </p>
                            <p className="text-xs text-red-300 font-semibold">
                              ⚡ {formatPace(split.pace)}/mile
                            </p>
                            {index === 0 && session.splits.length > 1 && (
                              <div className="text-xs text-yellow-400 font-bold">💫 FASTEST</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {sessions.length === 0 && (
              <Card className="bg-gradient-to-r from-gray-900 to-black border border-red-500/30 shadow-xl">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🏁💨</div>
                    <h3 className="text-2xl font-bold text-red-400 mb-2">🔥 NO LEGENDS YET 🔥</h3>
                    <p className="text-red-300 font-semibold">
                      Your racing legacy starts with the first mile. Ready to become a speed demon?
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent animate-pulse"></div>
      <div className="absolute top-10 left-10 text-red-500/20 text-9xl">🔥</div>
      <div className="absolute bottom-10 right-10 text-red-500/20 text-9xl">⚡</div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-yellow-400 bg-clip-text text-transparent flex items-center animate-pulse">
              <Flame className="mr-2 sm:mr-3 text-red-500" size={40} />
              🏁 SPEED DEMON TRACKER 🔥
            </h1>
            <Button 
              variant="outline" 
              onClick={() => setShowHistory(true)}
              className="bg-gradient-to-r from-red-600 to-red-800 text-white border border-red-500 hover:from-red-700 hover:to-red-900 shadow-lg shadow-red-500/25 w-full sm:w-auto"
            >
              <Trophy className="mr-2" size={16} />
              📜 Hall of Fame
            </Button>
          </div>
          <p className="text-red-300 font-bold text-base sm:text-lg">⚡ Unleash your inner speed demon and dominate every mile! 💨</p>
        </div>

        {!activeSession ? (
          /* Start New Session */
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 to-black border border-red-500/50 shadow-2xl shadow-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold text-red-400">
                  <Zap className="mr-3 text-red-500 animate-pulse" size={32} />
                  🔥 IGNITE YOUR SPEED 🔥
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-red-300 mb-3">
                    ⚡ Choose Your Racing Mode ⚡
                  </label>
                  <Select value={selectedActivity} onValueChange={(value: "run" | "walk" | "bike") => setSelectedActivity(value)}>
                    <SelectTrigger className="w-full bg-gray-800 border-red-500/50 text-white text-lg font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-red-500/50">
                      <SelectItem value="run" className="text-white font-bold text-lg">🔥🏃‍♂️💨 BLAZING RUN</SelectItem>
                      <SelectItem value="walk" className="text-white font-bold text-lg">⚡🚶‍♂️💪 POWER WALK</SelectItem>
                      <SelectItem value="bike" className="text-white font-bold text-lg">🏁🚴‍♂️🔥 SPEED CYCLING</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={startSession}
                  disabled={startSessionMutation.isPending}
                  className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white border border-red-500 shadow-lg shadow-red-500/50 text-xl font-bold py-6"
                  size="lg"
                >
                  <Flame className="mr-3 animate-bounce" size={24} />
                  {startSessionMutation.isPending ? "🔥 IGNITING..." : `🏁 START ${selectedActivity.toUpperCase()} DOMINATION! 💨`}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Active Session */
          <div className="space-y-6">
            {/* Main Timer Display */}
            <Card className="bg-gradient-to-br from-red-950 via-black to-gray-900 border border-red-500/50 shadow-2xl shadow-red-500/30">
              <CardContent className="pt-6">
                <div className="text-center relative">
                  {/* Animated fire effects */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-6xl animate-bounce">🔥</div>
                  
                  <div className="flex items-center justify-center mb-6 mt-8">
                    <Badge className={`${getActivityColor(activeSession.activityType)} text-xl px-4 py-2 animate-pulse`}>
                      {getActivityIcon(activeSession.activityType)} BEAST MODE {activeSession.activityType.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="text-9xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-yellow-400 bg-clip-text text-transparent mb-4 font-mono tracking-wider animate-pulse drop-shadow-lg">
                    {formatTime(currentTime)}
                  </div>
                  
                  <div className="text-2xl text-red-300 mb-8 font-bold">
                    🏃‍♂️ MILE {currentMile} • ⚡ SPEED: {getCurrentPace()}/mile 💨
                  </div>

                  <div className="flex justify-center space-x-4 flex-wrap gap-4">
                    <Button 
                      onClick={pauseResume}
                      className={isRunning ? 
                        "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white border border-yellow-500 shadow-lg shadow-yellow-500/25" :
                        "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border border-green-500 shadow-lg shadow-green-500/25"
                      }
                      size="lg"
                    >
                      {isRunning ? <Pause className="mr-2 animate-pulse" size={20} /> : <Play className="mr-2 animate-bounce" size={20} />}
                      {isRunning ? "⏸️ CHILL" : "▶️ UNLEASH!"}
                    </Button>
                    
                    <Button 
                      onClick={completeMile}
                      className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white border border-red-500 shadow-lg shadow-red-500/25"
                      size="lg"
                      disabled={!isRunning || completeMileMutation.isPending}
                    >
                      <Target className="mr-2 animate-spin" size={20} />
                      {completeMileMutation.isPending ? "🔥 RECORDING..." : `🏁 CRUSH MILE ${currentMile}!`}
                    </Button>
                    
                    <Button 
                      onClick={finishSession}
                      className="bg-gradient-to-r from-gray-700 to-black hover:from-gray-800 hover:to-gray-900 text-red-400 border border-red-500 shadow-lg shadow-red-500/25"
                      size="lg"
                      disabled={finishSessionMutation.isPending}
                    >
                      <Square className="mr-2" size={20} />
                      {finishSessionMutation.isPending ? "🔥 WRAPPING UP..." : "🏆 VICTORY LAP!"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mile Splits */}
            {activeSession.splits.length > 0 && (
              <Card className="bg-gradient-to-br from-gray-900 to-black border border-red-500/50 shadow-xl shadow-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl font-bold text-red-400">
                    <Gauge className="mr-3 text-red-500 animate-spin" size={28} />
                    🔥 SPEED DEMON SPLITS 💨
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeSession.splits.map((split, index) => (
                      <div
                        key={split.id}
                        className="bg-gradient-to-br from-red-900 to-black rounded-lg p-4 text-center border border-red-500/40 shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                      >
                        <p className="text-lg font-bold text-red-300 mb-2">
                          🏃‍♂️ MILE {split.mileNumber} 🔥
                        </p>
                        <p className="text-3xl font-bold text-red-400 mb-2 font-mono">
                          {formatTime(split.splitTime)}
                        </p>
                        <p className="text-sm text-red-300 font-semibold">
                          ⚡ PACE: {formatPace(split.pace)}/mile
                        </p>
                        {index === activeSession.splits.indexOf(activeSession.splits.reduce((fastest, current) => 
                          current.pace < fastest.pace ? current : fastest
                        )) && activeSession.splits.length > 1 && (
                          <div className="text-sm text-yellow-400 font-bold mt-2 animate-pulse">
                            💫 FASTEST SPLIT! 💫
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-red-900 to-black border border-red-500/40 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <MapPin className="mx-auto mb-2 text-red-400 animate-pulse" size={28} />
                  <p className="text-3xl font-bold text-red-400 font-mono">
                    {activeSession.splits.length}
                  </p>
                  <p className="text-sm text-red-300 font-bold">🏁 MILES CRUSHED</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-900 to-black border border-red-500/40 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <Gauge className="mx-auto mb-2 text-red-400 animate-spin" size={28} />
                  <p className="text-3xl font-bold text-red-400 font-mono">
                    {getCurrentPace()}
                  </p>
                  <p className="text-sm text-red-300 font-bold">⚡ CURRENT SPEED</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-900 to-black border border-red-500/40 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <Trophy className="mx-auto mb-2 text-yellow-400 animate-bounce" size={28} />
                  <p className="text-3xl font-bold text-yellow-400 font-mono">
                    {activeSession.splits.length > 0 
                      ? formatPace(Math.min(...activeSession.splits.map(s => s.pace)))
                      : "--:--"
                    }
                  </p>
                  <p className="text-sm text-yellow-300 font-bold">💫 BEAST MILE</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-900 to-black border border-red-500/40 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <Flame className="mx-auto mb-2 text-red-500 animate-pulse" size={28} />
                  <p className="text-3xl font-bold text-red-400 font-mono">
                    {currentMile}
                  </p>
                  <p className="text-sm text-red-300 font-bold">🔥 NEXT TARGET</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}