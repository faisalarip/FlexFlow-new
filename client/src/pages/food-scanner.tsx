import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { FoodEntry } from "@shared/schema";
import type { FoodAnalysisResult } from "../../../server/foodRecognition";

export default function FoodScanner() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todayEntries } = useQuery<FoodEntry[]>({
    queryKey: ["/api/food-entries", { date: new Date().toISOString().split('T')[0] }],
  });

  const createFoodEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/food-entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-entries"] });
      toast({ title: "Food entry saved successfully!" });
      resetForm();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to save food entry", 
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setShowManualEntry(false);
    stopCamera();
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setIsUsingCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please try uploading an image instead.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsUsingCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setSelectedImage(imageData);
        stopCamera();
      }
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    try {
      const response = await apiRequest("POST", "/api/food/analyze", {
        imageData: selectedImage
      });
      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the food image. Please try again or enter manually.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveEntry = (data: FoodAnalysisResult) => {
    createFoodEntryMutation.mutate({
      name: data.name,
      description: data.description,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber,
      sugar: data.sugar,
      sodium: data.sodium,
      servingSize: data.servingSize,
      confidence: data.confidence,
      imageUrl: selectedImage,
      loggedAt: new Date().toISOString()
    });
  };

  const handleManualSave = (formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      calories: parseInt(formData.get('calories') as string) || 0,
      protein: parseInt(formData.get('protein') as string) || 0,
      carbs: parseInt(formData.get('carbs') as string) || 0,
      fat: parseInt(formData.get('fat') as string) || 0,
      servingSize: formData.get('servingSize') as string,
      loggedAt: new Date().toISOString()
    };
    createFoodEntryMutation.mutate(data);
  };

  const getTodayCalories = () => {
    return todayEntries?.reduce((sum, entry) => sum + entry.calories, 0) || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Scanner</h1>
          <p className="text-gray-600">Scan your food to get instant nutrition information</p>
        </div>

        {/* Today's Summary */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{getTodayCalories()}</p>
              <p className="text-sm text-gray-600">calories today</p>
              <p className="text-xs text-gray-500 mt-1">
                {todayEntries?.length || 0} food entries logged
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Camera/Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Capture Food</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedImage && !isUsingCamera && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={startCamera} className="h-24">
                    <Camera className="mr-2" size={24} />
                    Use Camera
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24"
                  >
                    <Upload className="mr-2" size={24} />
                    Upload Image
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowManualEntry(true)}
                    className="text-sm"
                  >
                    Or enter nutrition information manually
                  </Button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}

            {isUsingCamera && (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full rounded-lg"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex justify-center space-x-4">
                  <Button onClick={capturePhoto}>
                    <Camera className="mr-2" size={16} />
                    Capture Photo
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {selectedImage && !analysisResult && !isAnalyzing && (
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={selectedImage} 
                    alt="Selected food" 
                    className="w-full rounded-lg max-h-64 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <Button onClick={analyzeImage} className="w-full">
                  Analyze Food
                </Button>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-8">
                <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                <p className="text-gray-600">Analyzing your food...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 text-green-500" size={20} />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{analysisResult.name}</h3>
                  <p className="text-sm text-gray-600">{analysisResult.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Serving size: {analysisResult.servingSize} 
                    {analysisResult.confidence && (
                      <span className="ml-2">
                        (Confidence: {analysisResult.confidence}%)
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{analysisResult.calories}</p>
                    <p className="text-xs text-gray-600">Calories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold">{analysisResult.protein}g</p>
                    <p className="text-xs text-gray-600">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold">{analysisResult.carbs}g</p>
                    <p className="text-xs text-gray-600">Carbs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold">{analysisResult.fat}g</p>
                    <p className="text-xs text-gray-600">Fat</p>
                  </div>
                </div>

                {(analysisResult.fiber || analysisResult.sugar || analysisResult.sodium) && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    {analysisResult.fiber > 0 && (
                      <div className="text-center">
                        <p className="font-medium">{analysisResult.fiber}g</p>
                        <p className="text-xs text-gray-600">Fiber</p>
                      </div>
                    )}
                    {analysisResult.sugar > 0 && (
                      <div className="text-center">
                        <p className="font-medium">{analysisResult.sugar}g</p>
                        <p className="text-xs text-gray-600">Sugar</p>
                      </div>
                    )}
                    {analysisResult.sodium > 0 && (
                      <div className="text-center">
                        <p className="font-medium">{analysisResult.sodium}mg</p>
                        <p className="text-xs text-gray-600">Sodium</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button 
                    onClick={() => handleSaveEntry(analysisResult)}
                    disabled={createFoodEntryMutation.isPending}
                    className="flex-1"
                  >
                    {createFoodEntryMutation.isPending ? (
                      <Loader2 className="animate-spin mr-2" size={16} />
                    ) : null}
                    Save Entry
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Entry Form */}
        {showManualEntry && (
          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleManualSave(new FormData(e.target as HTMLFormElement));
              }} className="space-y-4">
                <div>
                  <Label htmlFor="name">Food Name</Label>
                  <Input id="name" name="name" required />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea id="description" name="description" rows={2} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calories">Calories</Label>
                    <Input id="calories" name="calories" type="number" min="0" required />
                  </div>
                  <div>
                    <Label htmlFor="servingSize">Serving Size</Label>
                    <Input id="servingSize" name="servingSize" placeholder="e.g., 1 cup" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input id="protein" name="protein" type="number" min="0" step="0.1" />
                  </div>
                  <div>
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input id="carbs" name="carbs" type="number" min="0" step="0.1" />
                  </div>
                  <div>
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input id="fat" name="fat" type="number" min="0" step="0.1" />
                  </div>
                  <div>
                    <Label htmlFor="fiber">Fiber (g)</Label>
                    <Input id="fiber" name="fiber" type="number" min="0" step="0.1" />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="submit"
                    disabled={createFoodEntryMutation.isPending}
                    className="flex-1"
                  >
                    {createFoodEntryMutation.isPending ? (
                      <Loader2 className="animate-spin mr-2" size={16} />
                    ) : null}
                    Save Entry
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowManualEntry(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Today's Entries */}
        {todayEntries && todayEntries.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Today's Food Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{entry.name}</h4>
                      {entry.description && (
                        <p className="text-sm text-gray-600">{entry.description}</p>
                      )}
                      {entry.servingSize && (
                        <p className="text-xs text-gray-500">{entry.servingSize}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{entry.calories} cal</p>
                      <div className="text-xs text-gray-600">
                        {entry.protein && `${entry.protein}g protein`}
                        {entry.protein && (entry.carbs || entry.fat) && " • "}
                        {entry.carbs && `${entry.carbs}g carbs`}
                        {entry.carbs && entry.fat && " • "}
                        {entry.fat && `${entry.fat}g fat`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}