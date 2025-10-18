import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Pause, Square, Timer, Activity, Target, History, MapPin, Zap, Flame, Trophy, Gauge, Music, Volume2, VolumeX, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
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
  
  // Music player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
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

  // Audio player functions
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid File",
          description: "Please upload an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Revoke previous object URL to prevent memory leak
      if (audioFile) {
        URL.revokeObjectURL(audioFile);
      }

      const url = URL.createObjectURL(file);
      setAudioFile(url);
      setAudioFileName(file.name);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.volume = audioVolume; // Set initial volume
        audioRef.current.load();
      }

      toast({
        title: "Music Loaded",
        description: `${file.name} ready to play!`,
      });
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current || !audioFile) return;

    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play();
      setIsAudioPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = audioVolume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setAudioVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  // Audio ended event handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioEnd = () => {
      setIsAudioPlaying(false);
      audio.currentTime = 0; // Reset to beginning
    };

    const handleAudioPlay = () => setIsAudioPlaying(true);
    const handleAudioPause = () => setIsAudioPlaying(false);

    audio.addEventListener('ended', handleAudioEnd);
    audio.addEventListener('play', handleAudioPlay);
    audio.addEventListener('pause', handleAudioPause);

    return () => {
      audio.removeEventListener('ended', handleAudioEnd);
      audio.removeEventListener('play', handleAudioPlay);
      audio.removeEventListener('pause', handleAudioPause);
    };
  }, []);

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
    if (!isRunning) {
      // Starting the session - automatically enable GPS
      if (!gpsEnabled) {
        startGPSTracking();
      }
    }
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

  // Clean up audio object URL on unmount
  useEffect(() => {
    return () => {
      if (audioFile) {
        URL.revokeObjectURL(audioFile);
      }
    };
  }, [audioFile]);

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
    <FeatureGate feature="mile_tracker">
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
                  
                  <div className="text-2xl text-red-300 mb-4 font-bold">
                    🏃‍♂️ MILE {currentMile} • ⚡ SPEED: {getCurrentPace()}/mile 💨
                  </div>

                  {/* GPS Stats Display */}
                  {gpsEnabled && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-500/30">
                      <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="text-blue-400" size={16} />
                          <span className="text-blue-300 font-semibold">
                            GPS: {gpsDistance.toFixed(2)} mi
                          </span>
                        </div>
                        {currentSpeed !== null && (
                          <div className="flex items-center gap-2">
                            <Gauge className="text-green-400" size={16} />
                            <span className="text-green-300 font-semibold">
                              {currentSpeed.toFixed(1)} mph
                            </span>
                          </div>
                        )}
                        {gpsAccuracy !== null && (
                          <div className="flex items-center gap-2">
                            <Activity className="text-yellow-400" size={16} />
                            <span className={`font-semibold ${
                              gpsAccuracy < 20 ? 'text-green-300' : 
                              gpsAccuracy < 50 ? 'text-yellow-300' : 
                              'text-orange-300'
                            }`}>
                              ±{gpsAccuracy.toFixed(0)}m
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center space-x-4 flex-wrap gap-4">
                    <Button 
                      onClick={pauseResume}
                      className={isRunning ? 
                        "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white border border-yellow-500 shadow-lg shadow-yellow-500/25" :
                        "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border border-green-500 shadow-lg shadow-green-500/25"
                      }
                      size="lg"
                      data-testid={isRunning ? "button-pause" : "button-unleash"}
                    >
                      {isRunning ? <Pause className="mr-2 animate-pulse" size={20} /> : <Play className="mr-2 animate-bounce" size={20} />}
                      {isRunning ? "⏸️ CHILL" : "▶️ UNLEASH!"}
                    </Button>
                    
                    <Button 
                      onClick={completeMile}
                      className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white border border-red-500 shadow-lg shadow-red-500/25"
                      size="lg"
                      disabled={!isRunning || completeMileMutation.isPending}
                      data-testid="button-complete-mile"
                    >
                      <Target className="mr-2 animate-spin" size={20} />
                      {completeMileMutation.isPending ? "🔥 RECORDING..." : `🏁 CRUSH MILE ${currentMile}!`}
                    </Button>
                    
                    <Button 
                      onClick={finishSession}
                      className="bg-gradient-to-r from-gray-700 to-black hover:from-gray-800 hover:to-gray-900 text-red-400 border border-red-500 shadow-lg shadow-red-500/25"
                      size="lg"
                      disabled={finishSessionMutation.isPending}
                      data-testid="button-finish-session"
                    >
                      <Square className="mr-2" size={20} />
                      {finishSessionMutation.isPending ? "🔥 WRAPPING UP..." : "🏆 VICTORY LAP!"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Music Player */}
            <Card className="bg-gradient-to-br from-purple-950 via-black to-gray-900 border border-purple-500/50 shadow-xl shadow-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold text-purple-400">
                  <Music className="mr-3 text-purple-500 animate-pulse" size={28} />
                  🎵 WORKOUT BEATS 🎧
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hidden audio element */}
                <audio ref={audioRef} loop />

                {!audioFile ? (
                  <div className="text-center py-6">
                    <div className="text-5xl mb-4">🎵</div>
                    <p className="text-purple-300 font-semibold mb-4">
                      Upload your favorite music to keep you pumped!
                    </p>
                    <label htmlFor="audio-upload">
                      <Button 
                        className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border border-purple-500"
                        onClick={() => document.getElementById('audio-upload')?.click()}
                        data-testid="upload-music-button"
                      >
                        <Upload className="mr-2" size={20} />
                        Upload Music
                      </Button>
                    </label>
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                      data-testid="audio-file-input"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                      <div className="flex items-center space-x-3">
                        <Music className="text-purple-400" size={20} />
                        <div>
                          <p className="text-purple-300 font-semibold text-sm truncate max-w-[200px]">
                            {audioFileName}
                          </p>
                          <p className="text-purple-400/70 text-xs">Now Playing</p>
                        </div>
                      </div>
                      <label htmlFor="audio-upload-change">
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-purple-500/50 text-purple-300"
                          onClick={() => document.getElementById('audio-upload-change')?.click()}
                        >
                          Change
                        </Button>
                      </label>
                      <input
                        id="audio-upload-change"
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        onClick={toggleAudioPlayback}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border border-purple-500"
                        size="lg"
                        data-testid="toggle-audio-playback"
                      >
                        {isAudioPlaying ? (
                          <>
                            <Pause className="mr-2" size={20} />
                            Pause Music
                          </>
                        ) : (
                          <>
                            <Play className="mr-2" size={20} />
                            Play Music
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center space-x-3 bg-purple-900/20 rounded-lg p-3 border border-purple-500/20">
                      <Button
                        onClick={toggleMute}
                        variant="ghost"
                        size="sm"
                        className="text-purple-300"
                        data-testid="toggle-mute"
                      >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : audioVolume * 100]}
                        onValueChange={([value]) => handleVolumeChange(value / 100)}
                        max={100}
                        step={1}
                        className="flex-1"
                        data-testid="volume-slider"
                      />
                      <span className="text-purple-300 text-sm font-mono w-12 text-right">
                        {Math.round((isMuted ? 0 : audioVolume) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* GPS Map */}
            {gpsEnabled && (
              <Card className="bg-gradient-to-br from-gray-900 to-black border border-blue-500/50 shadow-xl shadow-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl font-bold text-blue-400">
                    <MapPin className="mr-3 text-blue-500 animate-pulse" size={28} />
                    🗺️ LIVE GPS TRACKING 📍
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentPosition ? (
                    <>
                      <div className="h-[400px] rounded-lg overflow-hidden border-2 border-blue-500/30">
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
                      <div className="mt-4 text-center">
                        <p className="text-blue-300 font-semibold">
                          🎯 Total Distance: <span className="text-blue-400 text-lg font-bold">{gpsDistance.toFixed(2)} miles</span>
                        </p>
                        {gpsPath.length > 0 && (
                          <p className="text-sm text-blue-400/70 mt-1">
                            📊 {gpsPath.length} GPS points tracked
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-[400px] rounded-lg border-2 border-blue-500/30 bg-gray-800/50 flex flex-col items-center justify-center">
                      <div className="animate-pulse text-6xl mb-4">🛰️</div>
                      <p className="text-blue-400 text-xl font-bold mb-2">Acquiring GPS Signal...</p>
                      <p className="text-blue-300 text-sm">Please wait while we locate you</p>
                      {gpsAccuracy !== null && (
                        <p className="text-yellow-400 text-xs mt-2">
                          Signal accuracy: ±{gpsAccuracy.toFixed(0)}m
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
    </FeatureGate>
  );
}