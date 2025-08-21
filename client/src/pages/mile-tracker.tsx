import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Pause, Square, Timer, Activity, Target, History, MapPin } from "lucide-react";
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
        return "🏃‍♂️";
      case "walk":
        return "🚶‍♂️";
      case "bike":
        return "🚴‍♂️";
      default:
        return "🏃‍♂️";
    }
  };

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case "run":
        return "bg-red-100 text-red-800 border-red-200";
      case "walk":
        return "bg-green-100 text-green-800 border-green-200";
      case "bike":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Activity History</h1>
              <p className="text-gray-600 dark:text-gray-400">Your completed mile tracking sessions</p>
            </div>
            <Button onClick={() => setShowHistory(false)}>
              Back to Tracker
            </Button>
          </div>

          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {getActivityIcon(session.activityType)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg capitalize">{session.activityType}</h3>
                          <Badge className={getActivityColor(session.activityType)}>
                            {session.splits.length} {session.splits.length === 1 ? 'mile' : 'miles'}
                          </Badge>
                        </div>
                        <p className="text-gray-600">
                          {new Date(session.startedAt).toLocaleDateString()} at{' '}
                          {new Date(session.startedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatTime(session.totalTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Avg Pace: {session.averagePace ? formatPace(session.averagePace) : '--:--'}/mile
                      </p>
                    </div>
                  </div>
                  
                  {session.splits.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Mile Splits</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {session.splits.map((split) => (
                          <div key={split.id} className="bg-gray-50 rounded p-2 text-center">
                            <p className="text-sm font-medium">Mile {split.mileNumber}</p>
                            <p className="text-lg font-bold text-primary">
                              {formatTime(split.splitTime)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatPace(split.pace)}/mile
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {sessions.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <History className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
                    <p className="text-gray-600">
                      Start your first mile tracking session to see your history here.
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mile Tracker</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your running, walking, and biking miles with precision timing</p>
          </div>
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            <History className="mr-2" size={16} />
            History
          </Button>
        </div>

        {!activeSession ? (
          /* Start New Session */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2" />
                  Start New Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Activity Type
                  </label>
                  <Select value={selectedActivity} onValueChange={(value: "run" | "walk" | "bike") => setSelectedActivity(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="run">🏃‍♂️ Running</SelectItem>
                      <SelectItem value="walk">🚶‍♂️ Walking</SelectItem>
                      <SelectItem value="bike">🚴‍♂️ Biking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={startSession}
                  disabled={startSessionMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  <Play className="mr-2" size={20} />
                  {startSessionMutation.isPending ? "Starting..." : `Start ${selectedActivity.charAt(0).toUpperCase() + selectedActivity.slice(1)}ing`}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Active Session */
          <div className="space-y-6">
            {/* Main Timer Display */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Badge className={`${getActivityColor(activeSession.activityType)} text-lg px-3 py-1`}>
                      {getActivityIcon(activeSession.activityType)} {activeSession.activityType.charAt(0).toUpperCase() + activeSession.activityType.slice(1)}ing
                    </Badge>
                  </div>
                  
                  <div className="text-8xl font-bold text-primary mb-2 font-mono tracking-wider">
                    {formatTime(currentTime)}
                  </div>
                  
                  <div className="text-lg text-gray-600 mb-6">
                    Mile {currentMile} • Pace: {getCurrentPace()}/mile
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={pauseResume}
                      variant={isRunning ? "secondary" : "default"}
                      size="lg"
                    >
                      {isRunning ? <Pause className="mr-2" size={20} /> : <Play className="mr-2" size={20} />}
                      {isRunning ? "Pause" : "Resume"}
                    </Button>
                    
                    <Button 
                      onClick={completeMile}
                      variant="outline"
                      size="lg"
                      disabled={!isRunning || completeMileMutation.isPending}
                    >
                      <Target className="mr-2" size={20} />
                      {completeMileMutation.isPending ? "Recording..." : `Complete Mile ${currentMile}`}
                    </Button>
                    
                    <Button 
                      onClick={finishSession}
                      variant="destructive"
                      size="lg"
                      disabled={finishSessionMutation.isPending}
                    >
                      <Square className="mr-2" size={20} />
                      {finishSessionMutation.isPending ? "Finishing..." : "Finish"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mile Splits */}
            {activeSession.splits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Timer className="mr-2" />
                    Mile Splits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeSession.splits.map((split) => (
                      <div
                        key={split.id}
                        className="bg-gray-50 rounded-lg p-4 text-center"
                      >
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Mile {split.mileNumber}
                        </p>
                        <p className="text-2xl font-bold text-primary mb-1">
                          {formatTime(split.splitTime)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Pace: {formatPace(split.pace)}/mile
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <MapPin className="mx-auto mb-2 text-primary" size={24} />
                  <p className="text-2xl font-bold text-gray-900">
                    {activeSession.splits.length}
                  </p>
                  <p className="text-sm text-gray-600">Miles Completed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <Timer className="mx-auto mb-2 text-primary" size={24} />
                  <p className="text-2xl font-bold text-gray-900">
                    {getCurrentPace()}
                  </p>
                  <p className="text-sm text-gray-600">Current Pace</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <Activity className="mx-auto mb-2 text-primary" size={24} />
                  <p className="text-2xl font-bold text-gray-900">
                    {activeSession.splits.length > 0 
                      ? formatPace(Math.min(...activeSession.splits.map(s => s.pace)))
                      : "--:--"
                    }
                  </p>
                  <p className="text-sm text-gray-600">Best Mile</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="mx-auto mb-2 text-primary" size={24} />
                  <p className="text-2xl font-bold text-gray-900">
                    Mile {currentMile}
                  </p>
                  <p className="text-sm text-gray-600">Current Mile</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}