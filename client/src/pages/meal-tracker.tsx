import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Apple, Calendar, TrendingUp, ScanLine, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FeatureGate from "@/components/feature-gate";
import type { MealEntry, InsertMealEntry } from "@shared/schema";
import BarcodeScanner from "@/components/barcode-scanner";

interface NutritionalAnalysis {
  mealName: string;
  description: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  confidence: number;
}

interface BarcodeFormData {
  mealType: string;
  customDescription: string;
}

export default function MealTrackerPage() {
  const [barcodeForm, setBarcodeForm] = useState<BarcodeFormData>({
    mealType: "",
    customDescription: ""
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [analysisResult, setAnalysisResult] = useState<NutritionalAnalysis | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingMealName, setEditingMealName] = useState<string>("");
  
  const lastBarcodeRef = useRef<string | null>(null);
  const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get meal entries for selected date
  const { data: mealEntries = [], isLoading: entriesLoading } = useQuery<MealEntry[]>({
    queryKey: ["/api/meal-entries", selectedDate],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/meal-entries?date=${selectedDate}`);
      return response.json();
    }
  });


  // Barcode lookup mutation
  const barcodeLookupMutation = useMutation({
    mutationFn: async (barcode: string) => {
      const response = await apiRequest("POST", "/api/meal-entries/barcode-lookup", { barcode });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.product) {
        const nutritionData: NutritionalAnalysis = {
          mealName: data.product.name,
          description: `${data.product.brand} - ${data.product.servingSize}`,
          totalCalories: data.product.calories,
          protein: data.product.protein,
          carbs: data.product.carbs,
          fat: data.product.fat,
          fiber: data.product.fiber,
          sugar: data.product.sugar,
          sodium: data.product.sodium,
          confidence: 0.95 // High confidence for barcode lookup
        };
        setAnalysisResult(nutritionData);
        setEditingMealName(nutritionData.mealName);
        toast({
          title: "Barcode Found! 📊",
          description: `${data.product.name} - ${data.product.calories} calories`,
        });
      } else {
        toast({
          title: "Barcode Not Found",
          description: "This barcode is not in our database. Try manual entry instead.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      if (error?.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to use the barcode scanner.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Scanner Error",
          description: "Could not lookup barcode. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Save meal entry mutation
  const saveMutation = useMutation({
    mutationFn: async (mealData: InsertMealEntry) => {
      const response = await apiRequest("POST", "/api/meal-entries", mealData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-entries"] });
      setAnalysisResult(null);
      setBarcodeForm({ mealType: "", customDescription: "" });
      toast({
        title: "Meal Saved! ✅",
        description: "Your meal has been added to your diary.",
      });
    }
  });

  // Delete meal entry mutation
  const deleteMutation = useMutation({
    mutationFn: async (mealId: string) => {
      const response = await apiRequest("DELETE", `/api/meal-entries/${mealId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-entries"] });
      toast({
        title: "Meal Deleted! 🗑️",
        description: "The meal entry has been removed from your diary.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete meal entry. Please try again.",
        variant: "destructive",
      });
    }
  });


  const handleBarcodeScanned = (barcode: string) => {
    setIsScannerOpen(false);
    
    // Prevent spam by checking for duplicate barcodes within a short time window
    if (lastBarcodeRef.current === barcode) {
      return;
    }
    
    // Clear any pending timeout and set a new one
    if (barcodeTimeoutRef.current) {
      clearTimeout(barcodeTimeoutRef.current);
    }
    
    lastBarcodeRef.current = barcode;
    
    // Reset after 3 seconds to allow scanning the same barcode again later
    barcodeTimeoutRef.current = setTimeout(() => {
      lastBarcodeRef.current = null;
    }, 3000);
    
    barcodeLookupMutation.mutate(barcode);
  };

  const handleSaveMeal = () => {
    if (!analysisResult) return;

    const mealData: InsertMealEntry = {
      userId: "current-user", // Will be set by backend auth
      mealType: barcodeForm.mealType,
      mealName: editingMealName || analysisResult.mealName,
      description: analysisResult.description || barcodeForm.customDescription,
      imageUrl: null,
      totalCalories: analysisResult.totalCalories,
      protein: analysisResult.protein.toString(),
      carbs: analysisResult.carbs.toString(),
      fat: analysisResult.fat.toString(),
      fiber: analysisResult.fiber.toString(),
      sugar: analysisResult.sugar.toString(),
      sodium: analysisResult.sodium.toString(),
      confidence: analysisResult.confidence.toString(),
      analysisRaw: JSON.stringify(analysisResult),
      loggedAt: new Date()
    };

    saveMutation.mutate(mealData);
  };

  const getTotalNutrition = () => {
    return mealEntries.reduce((totals, entry) => ({
      calories: totals.calories + entry.totalCalories,
      protein: totals.protein + parseFloat(entry.protein),
      carbs: totals.carbs + parseFloat(entry.carbs),
      fat: totals.fat + parseFloat(entry.fat)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const getMealsByType = (type: string) => {
    return mealEntries.filter(meal => meal.mealType === type);
  };

  return (
    <FeatureGate feature="meal_tracker">
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-lg">
              <ScanLine className="w-8 h-8 text-white" />
            </div>
            Professional Barcode Scanner
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Advanced barcode scanning technology for precise nutritional tracking and professional meal management.
          </p>
        </div>

        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-red-800/30">
            <TabsTrigger value="scan" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-colors">
              <ScanLine className="w-4 h-4 mr-2" />
              Scan Barcode
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-colors">
              <Calendar className="w-4 h-4 mr-2" />
              Daily History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-6">
            <Card className="bg-black/80 border-red-800/30 shadow-2xl">
              <CardHeader className="border-b border-red-800/20">
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="p-1 bg-red-600 rounded">
                    <ScanLine className="w-5 h-5 text-white" />
                  </div>
                  Professional Barcode Scanner
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Advanced scanning technology for instant, accurate nutritional analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Meal Type Selection */}
                <div className="space-y-3">
                  <Label htmlFor="meal-type" className="text-white font-semibold">Meal Category</Label>
                  <Select 
                    value={barcodeForm.mealType} 
                    onValueChange={(value) => setBarcodeForm(prev => ({ ...prev, mealType: value }))}
                  >
                    <SelectTrigger data-testid="select-meal-type" className="bg-gray-900 border-red-800/30 text-white hover:border-red-600 focus:border-red-500">
                      <SelectValue placeholder="Select meal category" className="text-gray-400" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-red-800/30">
                      <SelectItem value="breakfast" className="text-white hover:bg-red-900/50">🌅 Breakfast</SelectItem>
                      <SelectItem value="lunch" className="text-white hover:bg-red-900/50">☀️ Lunch</SelectItem>
                      <SelectItem value="dinner" className="text-white hover:bg-red-900/50">🌙 Dinner</SelectItem>
                      <SelectItem value="snack" className="text-white hover:bg-red-900/50">🍎 Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Barcode Scanner */}
                <div className="border-2 border-dashed rounded-xl p-8 text-center border-red-600/40 bg-gradient-to-br from-red-950/20 to-black/20">
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="mx-auto h-16 w-16 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg">
                        <ScanLine className="h-8 w-8 text-white animate-pulse" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white mb-2">Professional Barcode Scanner</p>
                      <p className="text-gray-300">Advanced camera technology for instant product identification</p>
                    </div>
                    <Button 
                      onClick={() => setIsScannerOpen(true)}
                      data-testid="button-scan-barcode"
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
                      disabled={!barcodeForm.mealType}
                    >
                      <ScanLine className="w-5 h-5" />
                      {barcodeForm.mealType ? "Launch Scanner" : "Select meal category first"}
                    </Button>
                  </div>
                </div>

                {/* Custom Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-white font-semibold">Additional Notes (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Add preparation details, portion adjustments, or special notes..."
                    value={barcodeForm.customDescription}
                    onChange={(e) => setBarcodeForm(prev => ({ ...prev, customDescription: e.target.value }))}
                    data-testid="input-meal-description"
                    className="bg-gray-900 border-red-800/30 text-white placeholder:text-gray-500 hover:border-red-600 focus:border-red-500"
                  />
                </div>
            </CardContent>
          </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <Card data-testid="card-analysis-results" className="bg-black/90 border-red-600/50 shadow-2xl">
                <CardHeader className="border-b border-red-800/30">
                  <CardTitle className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-2">
                      <div className="p-1 bg-green-600 rounded">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Nutritional Analysis
                    </span>
                    <Badge className="bg-red-600 text-white hover:bg-red-700">
                      {Math.round(analysisResult.confidence * 100)}% confidence
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-300">{analysisResult.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Food Name Edit Section */}
                  <div className="space-y-3">
                    <Label htmlFor="meal-name-edit" className="text-white font-semibold">Product Name</Label>
                    <Input
                      id="meal-name-edit"
                      value={editingMealName}
                      onChange={(e) => setEditingMealName(e.target.value)}
                      placeholder="Enter product name"
                      data-testid="input-meal-name-edit"
                      className="font-medium bg-gray-900 border-red-800/30 text-white hover:border-red-600 focus:border-red-500"
                    />
                    <p className="text-sm text-gray-400">
                      Customize the product name before saving to your diary
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-red-800/20">
                      <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Macronutrients
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-red-800/20">
                            <TableHead className="text-gray-300">Nutrient</TableHead>
                            <TableHead className="text-gray-300">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="border-red-800/10">
                            <TableCell className="text-gray-300">Calories</TableCell>
                            <TableCell className="font-medium text-red-400">{analysisResult.totalCalories} kcal</TableCell>
                          </TableRow>
                          <TableRow className="border-red-800/10">
                            <TableCell className="text-gray-300">Protein</TableCell>
                            <TableCell className="text-white">{analysisResult.protein}g</TableCell>
                          </TableRow>
                          <TableRow className="border-red-800/10">
                            <TableCell className="text-gray-300">Carbohydrates</TableCell>
                            <TableCell className="text-white">{analysisResult.carbs}g</TableCell>
                          </TableRow>
                          <TableRow className="border-red-800/10">
                            <TableCell className="text-gray-300">Fat</TableCell>
                            <TableCell className="text-white">{analysisResult.fat}g</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4 border border-red-800/20">
                      <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Additional Details
                      </h3>
                      <Table>
                        <TableBody>
                          <TableRow className="border-red-800/10">
                            <TableCell className="text-gray-300">Fiber</TableCell>
                            <TableCell className="text-white">{analysisResult.fiber}g</TableCell>
                          </TableRow>
                          <TableRow className="border-red-800/10">
                            <TableCell className="text-gray-300">Sugar</TableCell>
                            <TableCell className="text-white">{analysisResult.sugar}g</TableCell>
                          </TableRow>
                          <TableRow className="border-red-800/10">
                            <TableCell className="text-gray-300">Sodium</TableCell>
                            <TableCell className="text-white">{analysisResult.sodium}mg</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveMeal}
                    disabled={saveMutation.isPending}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                    data-testid="button-save-meal"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving to Diary...
                      </>
                    ) : (
                      <>
                        <Apple className="mr-2 h-4 w-4" />
                        Save to Diary
                      </>
                    )}
                  </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-black/60 rounded-lg border border-red-800/30">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-red-600 rounded">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <Label htmlFor="date-select" className="text-white font-semibold">Select Date:</Label>
              </div>
              <Input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto bg-gray-900 border-red-800/30 text-white hover:border-red-600 focus:border-red-500"
                data-testid="input-date-select"
              />
            </div>

            {/* Daily Summary */}
            {mealEntries.length > 0 && (
              <Card data-testid="card-daily-summary" className="bg-black/90 border-red-600/50 shadow-2xl">
                <CardHeader className="border-b border-red-800/30">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <div className="p-1 bg-red-600 rounded">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    Daily Nutrition Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-4">
                    {(() => {
                      const totals = getTotalNutrition();
                      return (
                        <>
                          <div className="text-center bg-gray-900/50 p-4 rounded-lg border border-red-800/20">
                            <p className="text-3xl font-bold text-red-400 mb-1">{totals.calories}</p>
                            <p className="text-sm text-gray-300 font-medium">Calories</p>
                          </div>
                          <div className="text-center bg-gray-900/50 p-4 rounded-lg border border-red-800/20">
                            <p className="text-3xl font-bold text-blue-400 mb-1">{Math.round(totals.protein)}g</p>
                            <p className="text-sm text-gray-300 font-medium">Protein</p>
                          </div>
                          <div className="text-center bg-gray-900/50 p-4 rounded-lg border border-red-800/20">
                            <p className="text-3xl font-bold text-green-400 mb-1">{Math.round(totals.carbs)}g</p>
                            <p className="text-sm text-gray-300 font-medium">Carbs</p>
                          </div>
                          <div className="text-center bg-gray-900/50 p-4 rounded-lg border border-red-800/20">
                            <p className="text-3xl font-bold text-orange-400 mb-1">{Math.round(totals.fat)}g</p>
                            <p className="text-sm text-gray-300 font-medium">Fat</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meal History by Type */}
            <div className="grid gap-6">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                const meals = getMealsByType(mealType);
                return (
                  <Card key={mealType} data-testid={`card-${mealType}-meals`} className="bg-black/80 border-red-800/30 shadow-xl">
                    <CardHeader className="border-b border-red-800/20">
                      <CardTitle className="capitalize text-white flex items-center gap-2">
                        <span className="text-xl">
                          {mealType === 'breakfast' && '🌅'} 
                          {mealType === 'lunch' && '☀️'} 
                          {mealType === 'dinner' && '🌙'} 
                          {mealType === 'snack' && '🍎'}
                        </span>
                        <span className="font-semibold">{mealType}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {meals.length > 0 ? (
                        <div className="space-y-4">
                          {meals.map((meal) => (
                            <div key={meal.id} className="flex justify-between items-start p-4 bg-gray-900/50 border border-red-800/20 rounded-lg hover:border-red-600/40 transition-colors">
                              <div className="flex-1">
                                <h4 className="font-medium text-white">{meal.mealName}</h4>
                                {meal.description && (
                                  <p className="text-sm text-gray-400 mt-1">{meal.description}</p>
                                )}
                              </div>
                              <div className="text-right flex items-start gap-3">
                                <div>
                                  <p className="font-semibold text-red-400">{meal.totalCalories} cal</p>
                                  <p className="text-xs text-gray-400">
                                    P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteMutation.mutate(meal.id)}
                                  disabled={deleteMutation.isPending}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  data-testid={`button-delete-meal-${meal.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl opacity-50">
                              {mealType === 'breakfast' && '🌅'} 
                              {mealType === 'lunch' && '☀️'} 
                              {mealType === 'dinner' && '🌙'} 
                              {mealType === 'snack' && '🍎'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-center">No {mealType} logged yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
        </TabsContent>
        </Tabs>
        
        {/* Barcode Scanner Modal */}
        <BarcodeScanner
          isOpen={isScannerOpen}
          onScan={handleBarcodeScanned}
          onClose={() => setIsScannerOpen(false)}
        />
      </div>
    </div>
    </FeatureGate>
  );
}