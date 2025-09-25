import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Plus, Calendar, Trash2, Edit3, X, Check, Grid3X3, Eye, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ProgressPhotoWithWorkout, Workout } from "@shared/schema";
import { format } from "date-fns";

export default function ProgressPhotos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [photoDescription, setPhotoDescription] = useState("");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | undefined>();
  const [photoType, setPhotoType] = useState<"before" | "after">("before");
  const [editingPhoto, setEditingPhoto] = useState<ProgressPhotoWithWorkout | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "comparison">("grid");
  const [currentComparisonIndex, setCurrentComparisonIndex] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch progress photos
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ["/api/progress-photos"],
  });

  // Fetch workouts for selection
  const { data: workouts = [] } = useQuery({
    queryKey: ["/api/workouts"],
  });

  // Organize photos into before/after comparison pairs
  const comparisonPairs = useMemo(() => {
    const beforePhotos = photos.filter((p: ProgressPhotoWithWorkout) => p.photoType === 'before');
    const afterPhotos = photos.filter((p: ProgressPhotoWithWorkout) => p.photoType === 'after');
    
    const pairs: Array<{
      before: ProgressPhotoWithWorkout | null;
      after: ProgressPhotoWithWorkout | null;
      timeSpan?: string;
    }> = [];
    
    // Create pairs by matching photos with similar dates or workout links
    beforePhotos.forEach(beforePhoto => {
      // Try to find a matching after photo
      let matchingAfter = null;
      
      // First priority: same workout
      if (beforePhoto.workoutId) {
        matchingAfter = afterPhotos.find(afterPhoto => 
          afterPhoto.workoutId === beforePhoto.workoutId
        );
      }
      
      // Second priority: closest date after the before photo
      if (!matchingAfter) {
        const beforeDate = new Date(beforePhoto.createdAt);
        matchingAfter = afterPhotos
          .filter(afterPhoto => new Date(afterPhoto.createdAt) > beforeDate)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
      }
      
      if (matchingAfter) {
        const timeDiff = Math.abs(
          new Date(matchingAfter.createdAt).getTime() - new Date(beforePhoto.createdAt).getTime()
        );
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        pairs.push({
          before: beforePhoto,
          after: matchingAfter,
          timeSpan: days > 0 ? `${days} days` : 'Same day'
        });
        
        // Remove the used after photo from the array
        const afterIndex = afterPhotos.indexOf(matchingAfter);
        if (afterIndex > -1) {
          afterPhotos.splice(afterIndex, 1);
        }
      } else {
        // Add unpaired before photo
        pairs.push({
          before: beforePhoto,
          after: null
        });
      }
    });
    
    // Add remaining unpaired after photos
    afterPhotos.forEach(afterPhoto => {
      pairs.push({
        before: null,
        after: afterPhoto
      });
    });
    
    return pairs.filter(pair => pair.before || pair.after);
  }, [photos]);

  // Create progress photo mutation
  const createPhotoMutation = useMutation({
    mutationFn: async (data: { description: string; workoutId?: string; photoType: string; imageUrl?: string }) => {
      return apiRequest("/api/progress-photos", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-photos"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success!",
        description: "Progress photo saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save progress photo.",
        variant: "destructive",
      });
    },
  });

  // Update progress photo mutation
  const updatePhotoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest(`/api/progress-photos/${id}`, {
        method: "PUT",
        body: updates,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-photos"] });
      setEditingPhoto(null);
      toast({
        title: "Success!",
        description: "Progress photo updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update progress photo.",
        variant: "destructive",
      });
    },
  });

  // Delete progress photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/progress-photos/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-photos"] });
      toast({
        title: "Success!",
        description: "Progress photo deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete progress photo.",
        variant: "destructive",
      });
    },
  });

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const resetForm = () => {
    setCapturedImage(null);
    setPhotoDescription("");
    setSelectedWorkoutId(undefined);
    setPhotoType("before");
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSavePhoto = async () => {
    if (!capturedImage) {
      toast({
        title: "Error",
        description: "Please take a photo or upload an image first.",
        variant: "destructive",
      });
      return;
    }

    if (!photoDescription.trim()) {
      toast({
        title: "Error",
        description: "Please add a description for your progress photo.",
        variant: "destructive",
      });
      return;
    }

    try {
      // For now, we'll save without uploading to object storage
      // In a real implementation, you'd upload the image first
      createPhotoMutation.mutate({
        description: photoDescription,
        workoutId: selectedWorkoutId,
        photoType,
        imageUrl: capturedImage, // This would be the uploaded URL in production
      });
    } catch (error) {
      console.error("Error saving photo:", error);
    }
  };

  const handleEditPhoto = (photo: ProgressPhotoWithWorkout) => {
    setEditingPhoto(photo);
  };

  const handleUpdatePhoto = () => {
    if (!editingPhoto) return;
    
    updatePhotoMutation.mutate({
      id: editingPhoto.id,
      updates: {
        description: editingPhoto.description,
        photoType: editingPhoto.photoType,
      },
    });
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm("Are you sure you want to delete this progress photo?")) {
      deletePhotoMutation.mutate(id);
    }
  };

  if (photosLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading progress photos...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No progress photos yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start tracking your transformation by adding your first progress photo
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-red-600 hover:bg-red-700"
            data-testid="button-add-first-photo"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Photo
          </Button>
        </div>
      ) : (
        photos.map((photo: ProgressPhotoWithWorkout) => (
          <Card key={photo.id} className="overflow-hidden" data-testid={`card-photo-${photo.id}`}>
            {photo.imageUrl && (
              <div className="aspect-square overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.description}
                  className="w-full h-full object-cover"
                  data-testid={`img-photo-${photo.id}`}
                />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge
                    variant={photo.photoType === 'before' ? 'secondary' : 'default'}
                    className={photo.photoType === 'before' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                    data-testid={`badge-type-${photo.id}`}
                  >
                    {photo.photoType === 'before' ? 'Before' : 'After'}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditPhoto(photo)}
                    data-testid={`button-edit-${photo.id}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="text-red-600 hover:text-red-700"
                    data-testid={`button-delete-${photo.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {editingPhoto?.id === photo.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={editingPhoto.description}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                    className="text-sm"
                    data-testid={`input-edit-description-${photo.id}`}
                  />
                  <Select
                    value={editingPhoto.photoType}
                    onValueChange={(value: "before" | "after") => 
                      setEditingPhoto({ ...editingPhoto, photoType: value })
                    }
                  >
                    <SelectTrigger className="text-sm" data-testid={`select-edit-type-${photo.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before</SelectItem>
                      <SelectItem value="after">After</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleUpdatePhoto}
                      disabled={updatePhotoMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      data-testid={`button-save-edit-${photo.id}`}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPhoto(null)}
                      className="flex-1"
                      data-testid={`button-cancel-edit-${photo.id}`}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2" data-testid={`text-description-${photo.id}`}>
                    {photo.description}
                  </p>
                  {photo.workout && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1" data-testid={`text-workout-${photo.id}`}>
                      Linked to: {photo.workout.name}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span data-testid={`text-date-${photo.id}`}>
                      {format(new Date(photo.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderComparisonView = () => (
    <div className="space-y-6">
      {comparisonPairs.length === 0 ? (
        <div className="text-center py-12">
          <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No photos to compare</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add both "before" and "after" photos to start comparing your progress
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-red-600 hover:bg-red-700"
            data-testid="button-add-comparison-photo"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Photos for Comparison
          </Button>
        </div>
      ) : (
        <>
          {/* Comparison Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentComparisonIndex(Math.max(0, currentComparisonIndex - 1))}
                disabled={currentComparisonIndex === 0}
                data-testid="button-prev-comparison"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-comparison-counter">
                {currentComparisonIndex + 1} of {comparisonPairs.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentComparisonIndex(Math.min(comparisonPairs.length - 1, currentComparisonIndex + 1))}
                disabled={currentComparisonIndex === comparisonPairs.length - 1}
                data-testid="button-next-comparison"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentComparisonIndex(0)}
              data-testid="button-reset-comparison"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
          </div>

          {/* Current Comparison Pair */}
          {comparisonPairs[currentComparisonIndex] && (
            <Card className="p-6" data-testid={`card-comparison-${currentComparisonIndex}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Before Photo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2" data-testid="badge-before-comparison">
                      Before
                    </Badge>
                  </div>
                  {comparisonPairs[currentComparisonIndex].before ? (
                    <div className="space-y-3">
                      {comparisonPairs[currentComparisonIndex].before?.imageUrl && (
                        <div className="aspect-square overflow-hidden rounded-lg border-2 border-blue-200">
                          <img
                            src={comparisonPairs[currentComparisonIndex].before!.imageUrl}
                            alt={comparisonPairs[currentComparisonIndex].before!.description}
                            className="w-full h-full object-cover"
                            data-testid="img-before-comparison"
                          />
                        </div>
                      )}
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-before-description">
                          {comparisonPairs[currentComparisonIndex].before!.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400" data-testid="text-before-date">
                          {format(new Date(comparisonPairs[currentComparisonIndex].before!.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square border-2 border-dashed border-blue-200 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Camera className="mx-auto h-12 w-12 mb-2" />
                        <p className="text-sm">No "before" photo</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* After Photo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2" data-testid="badge-after-comparison">
                      After
                    </Badge>
                  </div>
                  {comparisonPairs[currentComparisonIndex].after ? (
                    <div className="space-y-3">
                      {comparisonPairs[currentComparisonIndex].after?.imageUrl && (
                        <div className="aspect-square overflow-hidden rounded-lg border-2 border-green-200">
                          <img
                            src={comparisonPairs[currentComparisonIndex].after!.imageUrl}
                            alt={comparisonPairs[currentComparisonIndex].after!.description}
                            className="w-full h-full object-cover"
                            data-testid="img-after-comparison"
                          />
                        </div>
                      )}
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-after-description">
                          {comparisonPairs[currentComparisonIndex].after!.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400" data-testid="text-after-date">
                          {format(new Date(comparisonPairs[currentComparisonIndex].after!.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square border-2 border-dashed border-green-200 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Camera className="mx-auto h-12 w-12 mb-2" />
                        <p className="text-sm">No "after" photo</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comparison Info */}
              {comparisonPairs[currentComparisonIndex].timeSpan && (
                <div className="mt-6 text-center">
                  <Badge variant="outline" className="text-sm px-4 py-2" data-testid="badge-timespan">
                    Time Difference: {comparisonPairs[currentComparisonIndex].timeSpan}
                  </Badge>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6" data-testid="progress-photos-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Progress Photos</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your transformation journey with before and after photos</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`${
                viewMode === "grid" 
                  ? "bg-white dark:bg-gray-700 shadow-sm" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              data-testid="button-grid-view"
            >
              <Grid3X3 className="mr-2 h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === "comparison" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("comparison")}
              className={`${
                viewMode === "comparison" 
                  ? "bg-white dark:bg-gray-700 shadow-sm" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              data-testid="button-comparison-view"
            >
              <Eye className="mr-2 h-4 w-4" />
              Compare
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white" data-testid="button-add-photo">
                <Plus className="mr-2 h-4 w-4" />
                Add Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Progress Photo</DialogTitle>
                <DialogDescription>
                  Capture or upload a photo to track your fitness progress
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Camera/Upload Section */}
                <div className="space-y-4">
                  <Label>Photo Capture</Label>
                  
                  {!capturedImage && !isCameraActive && (
                    <div className="flex gap-4">
                      <Button
                        onClick={startCamera}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-start-camera"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                      </Button>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-upload-photo"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Photo
                      </Button>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {isCameraActive && (
                    <div className="space-y-4">
                      <div className="relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full rounded-lg"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                      <div className="flex gap-4">
                        <Button
                          onClick={capturePhoto}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          data-testid="button-capture-photo"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Capture
                        </Button>
                        <Button
                          onClick={stopCamera}
                          variant="outline"
                          className="flex-1"
                          data-testid="button-cancel-camera"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {capturedImage && (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={capturedImage}
                          alt="Captured progress photo"
                          className="w-full rounded-lg"
                          style={{ maxHeight: '400px', objectFit: 'cover' }}
                          data-testid="img-captured-photo"
                        />
                      </div>
                      <Button
                        onClick={() => setCapturedImage(null)}
                        variant="outline"
                        className="w-full"
                        data-testid="button-retake-photo"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Retake Photo
                      </Button>
                    </div>
                  )}
                  
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="photo-description">Description</Label>
                    <Textarea
                      id="photo-description"
                      placeholder="Describe your progress, goals, or what this photo represents..."
                      value={photoDescription}
                      onChange={(e) => setPhotoDescription(e.target.value)}
                      className="mt-1"
                      data-testid="input-photo-description"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="photo-type">Photo Type</Label>
                    <Select value={photoType} onValueChange={(value: "before" | "after") => setPhotoType(value)}>
                      <SelectTrigger className="mt-1" data-testid="select-photo-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before</SelectItem>
                        <SelectItem value="after">After</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="workout-selection">Link to Workout (Optional)</Label>
                    <Select value={selectedWorkoutId} onValueChange={setSelectedWorkoutId}>
                      <SelectTrigger className="mt-1" data-testid="select-workout">
                        <SelectValue placeholder="Choose a workout to link..." />
                      </SelectTrigger>
                      <SelectContent>
                        {workouts.map((workout: Workout) => (
                          <SelectItem key={workout.id} value={workout.id}>
                            {workout.name} - {format(new Date(workout.date), 'MMM d, yyyy')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  variant="outline"
                  data-testid="button-cancel-photo"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePhoto}
                  disabled={createPhotoMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="button-save-photo"
                >
                  {createPhotoMutation.isPending ? "Saving..." : "Save Photo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "grid" ? renderGridView() : renderComparisonView()}
    </div>
  );
}