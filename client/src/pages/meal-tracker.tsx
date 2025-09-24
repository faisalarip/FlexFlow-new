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
import { Loader2, Apple, Calendar, TrendingUp, ScanLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Apple className="w-8 h-8 text-primary" />
          Barcode Meal Tracker
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Scan barcodes to instantly add packaged foods to your meal diary with accurate nutrition data.
        </p>
      </div>

      <Tabs defaultValue="scan" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan">Scan Barcode</TabsTrigger>
          <TabsTrigger value="history">Daily History</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="w-5 h-5" />
                Scan Barcode
              </CardTitle>
              <CardDescription>
                Scan the barcode on packaged foods to get instant nutrition information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meal Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select 
                  value={barcodeForm.mealType} 
                  onValueChange={(value) => setBarcodeForm(prev => ({ ...prev, mealType: value }))}
                >
                  <SelectTrigger data-testid="select-meal-type">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                    <SelectItem value="lunch">☀️ Lunch</SelectItem>
                    <SelectItem value="dinner">🌙 Dinner</SelectItem>
                    <SelectItem value="snack">🍎 Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Barcode Scanner */}
              <div className="border-2 border-dashed rounded-lg p-8 text-center border-gray-300">
                <div className="space-y-4">
                  <ScanLine className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium">Scan Product Barcode</p>
                    <p className="text-sm text-gray-500">Point your camera at the barcode to get nutrition info</p>
                  </div>
                  <Button 
                    onClick={() => setIsScannerOpen(true)}
                    data-testid="button-scan-barcode"
                    className="flex items-center gap-2"
                    disabled={!barcodeForm.mealType}
                  >
                    <ScanLine className="w-4 h-4" />
                    {barcodeForm.mealType ? "Start Scanner" : "Select meal type first"}
                  </Button>
                </div>
              </div>

              {/* Custom Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Additional Notes (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Add any notes about preparation or portion size..."
                  value={barcodeForm.customDescription}
                  onChange={(e) => setBarcodeForm(prev => ({ ...prev, customDescription: e.target.value }))}
                  data-testid="input-meal-description"
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <Card data-testid="card-analysis-results">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Nutritional Analysis</span>
                  <Badge variant="secondary">
                    {Math.round(analysisResult.confidence * 100)}% confident
                  </Badge>
                </CardTitle>
                <CardDescription>{analysisResult.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Food Name Edit Section */}
                <div className="space-y-2">
                  <Label htmlFor="meal-name-edit">Food Name</Label>
                  <Input
                    id="meal-name-edit"
                    value={editingMealName}
                    onChange={(e) => setEditingMealName(e.target.value)}
                    placeholder="Enter food name"
                    data-testid="input-meal-name-edit"
                    className="font-medium"
                  />
                  <p className="text-sm text-gray-500">
                    You can edit the food name before saving to your diary
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-3">Macronutrients</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nutrient</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Calories</TableCell>
                          <TableCell className="font-medium">{analysisResult.totalCalories} kcal</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Protein</TableCell>
                          <TableCell>{analysisResult.protein}g</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Carbohydrates</TableCell>
                          <TableCell>{analysisResult.carbs}g</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Fat</TableCell>
                          <TableCell>{analysisResult.fat}g</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Additional Details</h3>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>Fiber</TableCell>
                          <TableCell>{analysisResult.fiber}g</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Sugar</TableCell>
                          <TableCell>{analysisResult.sugar}g</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Sodium</TableCell>
                          <TableCell>{analysisResult.sodium}mg</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Button
                  onClick={handleSaveMeal}
                  disabled={saveMutation.isPending}
                  className="w-full"
                  data-testid="button-save-meal"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save to Diary"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <Label htmlFor="date-select">Date:</Label>
            </div>
            <Input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
              data-testid="input-date-select"
            />
          </div>

          {/* Daily Summary */}
          {mealEntries.length > 0 && (
            <Card data-testid="card-daily-summary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Daily Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {(() => {
                    const totals = getTotalNutrition();
                    return (
                      <>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{totals.calories}</p>
                          <p className="text-sm text-gray-600">Calories</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{Math.round(totals.protein)}g</p>
                          <p className="text-sm text-gray-600">Protein</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{Math.round(totals.carbs)}g</p>
                          <p className="text-sm text-gray-600">Carbs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{Math.round(totals.fat)}g</p>
                          <p className="text-sm text-gray-600">Fat</p>
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
                <Card key={mealType} data-testid={`card-${mealType}-meals`}>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {mealType === 'breakfast' && '🌅'} 
                      {mealType === 'lunch' && '☀️'} 
                      {mealType === 'dinner' && '🌙'} 
                      {mealType === 'snack' && '🍎'} 
                      {' '}{mealType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {meals.length > 0 ? (
                      <div className="space-y-4">
                        {meals.map((meal) => (
                          <div key={meal.id} className="flex justify-between items-start p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{meal.mealName}</h4>
                              {meal.description && (
                                <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{meal.totalCalories} cal</p>
                              <p className="text-xs text-gray-500">
                                P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No {mealType} logged yet</p>
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
  );
}