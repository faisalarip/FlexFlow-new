import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useNewAuth } from "@/hooks/useNewAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Target, 
  TrendingUp, 
  Users, 
  Camera, 
  Calendar,
  Trophy,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Home
} from "lucide-react";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to FlexFlow!",
    description: "Your complete fitness companion is ready to help you achieve your health goals.",
    icon: <Dumbbell className="h-12 w-12 text-red-500" />,
    features: [
      "AI-powered workout recommendations",
      "Personalized meal planning",
      "Progress tracking and analytics",
      "Community support and challenges"
    ]
  },
  {
    id: 2,
    title: "Track Your Workouts",
    description: "Log exercises, sets, reps, and weights. Track your progress over time with detailed analytics.",
    icon: <TrendingUp className="h-12 w-12 text-blue-500" />,
    features: [
      "Extensive exercise database with instructions",
      "Custom workout creation",
      "Progress photos and measurements",
      "Performance analytics and charts"
    ]
  },
  {
    id: 3,
    title: "Set and Achieve Goals",
    description: "Create specific fitness goals and track your progress with smart reminders and milestones.",
    icon: <Target className="h-12 w-12 text-green-500" />,
    features: [
      "Weight loss/gain targets",
      "Strength improvement goals",
      "Consistency tracking",
      "Achievement badges and rewards"
    ]
  },
  {
    id: 4,
    title: "AI-Powered Meal Planning",
    description: "Get personalized meal plans based on your goals, preferences, and dietary restrictions.",
    icon: <Camera className="h-12 w-12 text-orange-500" />,
    features: [
      "Food scanning and nutrition tracking",
      "Custom meal plan generation",
      "Dietary restriction support",
      "Calorie and macro tracking"
    ]
  },
  {
    id: 5,
    title: "Community & Trainers",
    description: "Connect with other fitness enthusiasts and find professional trainers to guide your journey.",
    icon: <Users className="h-12 w-12 text-purple-500" />,
    features: [
      "Community challenges and leaderboards",
      "Share progress and achievements",
      "Book sessions with certified trainers",
      "Get expert advice and motivation"
    ]
  },
  {
    id: 6,
    title: "Ready to Start!",
    description: "You're all set to begin your fitness journey. Let's explore your personalized dashboard.",
    icon: <Trophy className="h-12 w-12 text-yellow-500" />,
    features: [
      "Access your personalized dashboard",
      "View your fitness plan and goals",
      "Start logging workouts today",
      "Explore all features at your own pace"
    ]
  }
];

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useNewAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/auth');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const currentTutorial = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      // Complete tutorial and go to dashboard
      setLocation('/');
    } else {
      setCurrentStep(prev => Math.min(prev + 1, tutorialSteps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="bg-black/20 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">FlexFlow</span>
            </div>
            <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
              Tutorial
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="text-gray-400 hover:text-white"
            data-testid="button-skip-tutorial"
          >
            Skip Tutorial
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Tutorial Content */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              {currentTutorial.icon}
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              {currentTutorial.title}
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 max-w-2xl mx-auto">
              {currentTutorial.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {currentTutorial.features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                >
                  <PlayCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-200">{feature}</span>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-700">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                data-testid="button-previous-step"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex space-x-2">
                {tutorialSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentStep 
                        ? 'bg-red-500' 
                        : index < currentStep 
                          ? 'bg-green-500' 
                          : 'bg-gray-600'
                    }`}
                    data-testid={`button-step-${index + 1}`}
                  />
                ))}
              </div>

              <Button 
                onClick={handleNext}
                className="bg-red-500 hover:bg-red-600 text-white"
                data-testid={isLastStep ? "button-go-to-dashboard" : "button-next-step"}
              >
                {isLastStep ? (
                  <>
                    Go to Dashboard
                    <Home className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Preview */}
        {isLastStep && (
          <Card className="mt-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  🎉 You're Ready to Begin!
                </h3>
                <p className="text-gray-300 mb-4">
                  Your personalized fitness dashboard is waiting. Start by setting your first goal or logging a workout.
                </p>
                <div className="flex justify-center space-x-3">
                  <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                    <Target className="h-3 w-3 mr-1" />
                    Set Goals
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    <Dumbbell className="h-3 w-3 mr-1" />
                    Log Workouts
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                    <Calendar className="h-3 w-3 mr-1" />
                    Plan Meals
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}