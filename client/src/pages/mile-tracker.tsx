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
import FeatureGate from "@/components/feature-gate";
import type { MileTrackerSessionWithSplits } from "@shared/schema";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MileTracker() {
  const [selectedActivity, setSelectedActivity] = useState<"run" | "walk" | "bike">("run");
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentMile, setCurrentMile] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  
  // GPS tracking state
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsDistance, setGpsDistance] = useState(0); // in miles
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null); // in meters
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null); // in mph
  const [gpsPath, setGpsPath] = useState<[number, number][]>([]); // Array of [lat, lng] coordinates
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gpsWatchRef = useRef<number | null>(null);
  const previousPositionRef = useRef<{ lat: number; lon: number; timestamp: number } | null>(null);
  const lastMileDistanceRef = useRef(0); // Track distance at last mile completion
  
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
        return <Activity size={20} className="text-red-400" />;
      case "walk":
        return <Target size={20} className="text-blue-400" />;
      case "bike":
        return <Zap size={20} className="text-green-400" />;
      default:
        return <Activity size={20} className="text-red-400" />;
    }
  };

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case "run":
        return "bg-red-950/50 text-red-300 border-red-800";
      case "walk":
        return "bg-blue-950/50 text-blue-300 border-blue-800";
      case "bike":
        return "bg-green-950/50 text-green-300 border-green-800";
      default:
        return "bg-red-950/50 text-red-300 border-red-800";
    }
  };

  // GPS Functions - Haversine formula to calculate distance between two GPS points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3958.8; // Earth radius in miles
    
    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);
    const deltaLat = (lat2 - lat1) * (Math.PI / 180);
    const deltaLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleGPSPosition = (position: GeolocationPosition) => {
    const currentLat = position.coords.latitude;
    const currentLon = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    const speed = position.coords.speed; // in m/s
    
    setGpsAccuracy(accuracy);
    
    // Convert speed from m/s to mph
    if (speed !== null && speed >= 0) {
      setCurrentSpeed(speed * 2.237); // m/s to mph conversion
    }
    
    // Only process GPS data if accuracy is good (< 100m)
    if (accuracy < 100) {
      setCurrentPosition([currentLat, currentLon]);
      setGpsPath(prev => [...prev, [currentLat, currentLon]]);
      
      if (previousPositionRef.current) {
        const distance = calculateDistance(
          previousPositionRef.current.lat,
          previousPositionRef.current.lon,
          currentLat,
          currentLon
        );
        
        // Only add distance if movement is significant (> ~16 feet to filter GPS drift)
        if (distance > 0.003) {
          setGpsDistance(prev => {
            const newDistance = prev + distance;
            
            // Auto-complete mile if we've traveled 1 mile since last mile marker
            if (activeSession && isRunning && newDistance - lastMileDistanceRef.current >= 1.0) {
              completeMile();
              lastMileDistanceRef.current = newDistance;
            }
            
            return newDistance;
          });
        }
      }
      
      // Only update previous position if current accuracy is good
      previousPositionRef.current = {
        lat: currentLat,
        lon: currentLon,
        timestamp: position.timestamp
      };
    }
  };

  const handleGPSError = (error: GeolocationPositionError) => {
    let message = "GPS error occurred";
    
    switch(error.code) {
      case error.PERMISSION_DENIED:
        message = "Location access denied. Please enable location permissions.";
        break;
      case error.POSITION_UNAVAILABLE:
        message = "Location unavailable. Make sure GPS is enabled.";
        break;
      case error.TIMEOUT:
        message = "Location request timed out.";
        break;
    }
    
    toast({ title: "GPS Error", description: message, variant: "destructive" });
    setGpsEnabled(false);
  };

  const startGPSTracking = () => {
    if (!('geolocation' in navigator)) {
      toast({ 
        title: "GPS Not Available", 
        description: "Your device doesn't support GPS tracking.", 
        variant: "destructive" 
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      handleGPSPosition,
      handleGPSError,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
    
    gpsWatchRef.current = watchId;
    setGpsEnabled(true);
    toast({ title: "GPS Enabled", description: "Tracking your location in real-time" });
  };

  const stopGPSTracking = () => {
    if (gpsWatchRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchRef.current);
      gpsWatchRef.current = null;
    }
    setGpsEnabled(false);
    setGpsAccuracy(null);
    setCurrentSpeed(null);
  };

  const startSession = () => {
    startSessionMutation.mutate(selectedActivity);
    // Reset GPS tracking data
    setGpsDistance(0);
    setGpsPath([]);
    setCurrentPosition(null);
    previousPositionRef.current = null;
    lastMileDistanceRef.current = 0;
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
    stopGPSTracking(); // Stop GPS when session ends
  };

  // Clean up GPS tracking on unmount
  useEffect(() => {
    return () => {
      stopGPSTracking();
    };
  }, []);

  // Component to auto-center map on current position
  function MapUpdater({ center }: { center: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView(center, 16);
      }
    }, [center, map]);
    return null;
  }

  if (showHistory) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <History className="mr-3 text-red-500" size={32} />
                Session History
              </h1>
              <p className="text-gray-400">Your completed training sessions</p>
            </div>
            <Button onClick={() => setShowHistory(false)} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700">
              <MapPin className="mr-2" size={16} />
              Back to Tracker
            </Button>
          </div>

          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700">
                        {getActivityIcon(session.activityType)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg capitalize text-white">
                            {session.activityType}
                          </h3>
                          <Badge className={getActivityColor(session.activityType)}>
                            {session.splits.length} {session.splits.length === 1 ? 'mile' : 'miles'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          {new Date(session.startedAt).toLocaleDateString()} • {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white font-mono">
                        {formatTime(session.totalTime)}
                      </p>
                      <p className="text-sm text-gray-400">
                        Avg Pace: {session.averagePace ? formatPace(session.averagePace) : '--:--'}/mi
                      </p>
                    </div>
                  </div>
                  
                  {session.splits.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <h4 className="font-semibold text-gray-300 mb-3 flex items-center text-sm">
                        <Gauge className="mr-2" size={16} />
                        Mile Splits
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {session.splits.map((split, index) => (
                          <div key={split.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                            <p className="text-xs font-medium text-gray-400 mb-1">Mile {split.mileNumber}</p>
                            <p className="text-lg font-bold text-white font-mono">
                              {formatTime(split.splitTime)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatPace(split.pace)}/mi
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
              <Card className="bg-gray-900 border border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <History className="mx-auto mb-4 text-gray-600" size={48} />
                    <h3 className="text-xl font-semibold text-white mb-2">No Sessions Yet</h3>
                    <p className="text-gray-400">
                      Start your first session to begin tracking your progress
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
    <FeatureGate feature="mile_tracker">
      <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center mb-2">
                <MapPin className="mr-3 text-red-500" size={36} />
                Mile Tracker
              </h1>
              <p className="text-gray-400">GPS-powered distance tracking with live performance metrics</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowHistory(true)}
              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 w-full sm:w-auto"
            >
              <History className="mr-2" size={16} />
              View History
            </Button>
          </div>
        </div>

        {!activeSession ? (
          /* Start New Session */
          <div className="space-y-6">
            <Card className="bg-gray-900 border border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-white">
                  <Play className="mr-3 text-red-500" size={24} />
                  Start New Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Activity Type
                  </label>
                  <Select value={selectedActivity} onValueChange={(value: "run" | "walk" | "bike") => setSelectedActivity(value)}>
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="run" className="text-white">Running</SelectItem>
                      <SelectItem value="walk" className="text-white">Walking</SelectItem>
                      <SelectItem value="bike" className="text-white">Cycling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={startSession}
                  disabled={startSessionMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700 text-white border-0 font-semibold"
                  size="lg"
                >
                  <Play className="mr-2" size={20} />
                  {startSessionMutation.isPending ? "Starting..." : `Start ${selectedActivity.charAt(0).toUpperCase() + selectedActivity.slice(1)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Active Session */
          <div className="space-y-6">
            {/* Main Timer Display */}
            <Card className="bg-gray-900 border border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <Badge className={`${getActivityColor(activeSession.activityType)} px-4 py-2 flex items-center gap-2`}>
                      {getActivityIcon(activeSession.activityType)}
                      <span className="capitalize">{activeSession.activityType}</span>
                    </Badge>
                  </div>
                  
                  <div className="text-7xl font-bold text-white mb-4 font-mono">
                    {formatTime(currentTime)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Current Mile</p>
                      <p className="text-2xl font-bold text-white">{currentMile}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Pace</p>
                      <p className="text-2xl font-bold text-white">{getCurrentPace()}/mi</p>
                    </div>
                  </div>

                  {/* GPS Stats Display */}
                  {gpsEnabled && (
                    <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="text-blue-400" size={16} />
                          <span className="text-gray-300">
                            {gpsDistance.toFixed(2)} mi
                          </span>
                        </div>
                        {currentSpeed !== null && (
                          <div className="flex items-center gap-2">
                            <Gauge className="text-green-400" size={16} />
                            <span className="text-gray-300">
                              {currentSpeed.toFixed(1)} mph
                            </span>
                          </div>
                        )}
                        {gpsAccuracy !== null && (
                          <div className="flex items-center gap-2">
                            <Activity className={
                              gpsAccuracy < 20 ? 'text-green-400' : 
                              gpsAccuracy < 50 ? 'text-yellow-400' : 
                              'text-orange-400'
                            } size={16} />
                            <span className="text-gray-300">
                              ±{gpsAccuracy.toFixed(0)}m
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center space-x-3 flex-wrap gap-3">
                    <Button 
                      onClick={pauseResume}
                      className={isRunning ? 
                        "bg-yellow-600 hover:bg-yellow-700 text-white" :
                        "bg-green-600 hover:bg-green-700 text-white"
                      }
                      size="lg"
                    >
                      {isRunning ? <Pause className="mr-2" size={20} /> : <Play className="mr-2" size={20} />}
                      {isRunning ? "Pause" : "Resume"}
                    </Button>
                    
                    <Button 
                      onClick={gpsEnabled ? stopGPSTracking : startGPSTracking}
                      className={gpsEnabled ?
                        "bg-blue-600 hover:bg-blue-700 text-white" :
                        "bg-gray-700 hover:bg-gray-600 text-white"
                      }
                      size="lg"
                      data-testid={gpsEnabled ? "button-gps-stop" : "button-gps-start"}
                    >
                      <MapPin className="mr-2" size={20} />
                      {gpsEnabled ? "Stop GPS" : "Start GPS"}
                    </Button>
                    
                    <Button 
                      onClick={completeMile}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="lg"
                      disabled={!isRunning || completeMileMutation.isPending}
                    >
                      <Target className="mr-2" size={20} />
                      {completeMileMutation.isPending ? "Recording..." : `Complete Mile ${currentMile}`}
                    </Button>
                    
                    <Button 
                      onClick={finishSession}
                      className="bg-gray-700 hover:bg-gray-600 text-white"
                      size="lg"
                      disabled={finishSessionMutation.isPending}
                    >
                      <Square className="mr-2" size={20} />
                      {finishSessionMutation.isPending ? "Finishing..." : "Finish Session"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GPS Map */}
            {gpsEnabled && (
              <Card className="bg-gray-900 border border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-semibold text-white">
                    <MapPin className="mr-3 text-blue-500" size={24} />
                    Live GPS Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentPosition ? (
                    <>
                      <div className="h-[400px] rounded-lg overflow-hidden border border-gray-700">
                        <MapContainer
                          center={currentPosition}
                          zoom={16}
                          style={{ height: '100%', width: '100%' }}
                          className="z-0"
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <MapUpdater center={currentPosition} />
                          {gpsPath.length > 1 && (
                            <Polyline
                              positions={gpsPath}
                              color="#ef4444"
                              weight={4}
                              opacity={0.8}
                            />
                          )}
                          <Marker position={currentPosition} />
                        </MapContainer>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <p className="text-gray-300">
                          Total Distance: <span className="text-white font-semibold">{gpsDistance.toFixed(2)} miles</span>
                        </p>
                        {gpsPath.length > 0 && (
                          <p className="text-gray-500">
                            {gpsPath.length} points tracked
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-[400px] rounded-lg border border-gray-700 bg-gray-800 flex flex-col items-center justify-center">
                      <MapPin className="mb-4 text-gray-600 animate-pulse" size={48} />
                      <p className="text-white text-lg font-semibold mb-2">Acquiring GPS Signal</p>
                      <p className="text-gray-400 text-sm">Please wait while we locate you</p>
                      {gpsAccuracy !== null && (
                        <p className="text-gray-500 text-xs mt-2">
                          Accuracy: ±{gpsAccuracy.toFixed(0)}m
                          {gpsAccuracy >= 100 && " (waiting for better signal)"}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mile Splits */}
            {activeSession.splits.length > 0 && (
              <Card className="bg-gray-900 border border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-semibold text-white">
                    <Gauge className="mr-3 text-red-500" size={24} />
                    Mile Splits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeSession.splits.map((split, index) => (
                      <div
                        key={split.id}
                        className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-400 mb-2">
                          Mile {split.mileNumber}
                        </p>
                        <p className="text-2xl font-bold text-white mb-2 font-mono">
                          {formatTime(split.splitTime)}
                        </p>
                        <p className="text-sm text-gray-400">
                          Pace: {formatPace(split.pace)}/mi
                        </p>
                        {index === activeSession.splits.indexOf(activeSession.splits.reduce((fastest, current) => 
                          current.pace < fastest.pace ? current : fastest
                        )) && activeSession.splits.length > 1 && (
                          <div className="text-xs text-green-400 font-medium mt-2">
                            Fastest Split
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
              <Card className="bg-gray-900 border border-gray-800">
                <CardContent className="pt-6 text-center">
                  <MapPin className="mx-auto mb-2 text-gray-400" size={24} />
                  <p className="text-2xl font-bold text-white font-mono">
                    {activeSession.splits.length}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Miles Completed</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border border-gray-800">
                <CardContent className="pt-6 text-center">
                  <Gauge className="mx-auto mb-2 text-gray-400" size={24} />
                  <p className="text-2xl font-bold text-white font-mono">
                    {getCurrentPace()}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Avg Pace</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border border-gray-800">
                <CardContent className="pt-6 text-center">
                  <Trophy className="mx-auto mb-2 text-gray-400" size={24} />
                  <p className="text-2xl font-bold text-white font-mono">
                    {activeSession.splits.length > 0 
                      ? formatPace(Math.min(...activeSession.splits.map(s => s.pace)))
                      : "--:--"
                    }
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Best Pace</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border border-gray-800">
                <CardContent className="pt-6 text-center">
                  <Target className="mx-auto mb-2 text-gray-400" size={24} />
                  <p className="text-2xl font-bold text-white font-mono">
                    {currentMile}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Next Mile</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
    </FeatureGate>
  );
}