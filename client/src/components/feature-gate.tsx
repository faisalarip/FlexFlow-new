import { Lock, Crown, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface FeatureGateProps {
  feature: 'workout_planner' | 'mile_tracker' | 'meal_plans' | 'meal_tracker' | 'progress_photos';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const FEATURE_INFO = {
  workout_planner: {
    name: "AI Workout Planner",
    description: "Get personalized workout plans tailored to your fitness level and goals",
    icon: <Zap className="w-5 h-5" />
  },
  mile_tracker: {
    name: "Mile Tracker",
    description: "Track your running progress with detailed split times and performance analytics",
    icon: <Calendar className="w-5 h-5" />
  },
  meal_plans: {
    name: "AI Meal Plans",
    description: "Generate customized meal plans based on your dietary preferences and goals",
    icon: <Crown className="w-5 h-5" />
  },
  meal_tracker: {
    name: "Meal Tracker",
    description: "Log and analyze your meals with AI-powered nutrition tracking",
    icon: <Crown className="w-5 h-5" />
  },
  progress_photos: {
    name: "Progress Photos",
    description: "Track your physical transformation with before/after photo comparisons",
    icon: <Camera className="w-5 h-5" />
  }
} as const;

function Camera({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Check if user has access to the feature
  const hasAccess = (() => {
    if (!user) return false;
    
    // Active premium subscription has access to everything
    if (user.subscriptionStatus === "active") return true;
    
    // Free trial users have access if trial hasn't expired
    if (user.subscriptionStatus === "free_trial") {
      if (!user.trialEndDate) return false;
      const trialEndDate = new Date(user.trialEndDate);
      const now = new Date();
      return now <= trialEndDate;
    }
    
    // All other statuses (expired, inactive, etc.) don't have access
    return false;
  })();

  // Calculate remaining trial days
  const trialDaysRemaining = (() => {
    if (!user?.trialEndDate || user.subscriptionStatus !== "free_trial") return 0;
    const trialEndDate = new Date(user.trialEndDate);
    const now = new Date();
    const diffTime = trialEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  })();

  // If user has access, render children normally
  if (hasAccess) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked feature UI
  const featureInfo = FEATURE_INFO[feature];
  const isTrialUser = user?.subscriptionStatus === "free_trial";

  return (
    <div className="relative" data-testid={`feature-gate-${feature}`}>
      {/* Backdrop blur effect for locked content */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/80 to-gray-200/90 backdrop-blur-sm z-10 rounded-lg" />
        <div className="filter blur-sm opacity-50 pointer-events-none">
          {children}
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm border-2 border-red-200 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="flex items-center gap-2 justify-center text-xl">
              {featureInfo.icon}
              {featureInfo.name}
            </CardTitle>
            <CardDescription className="text-base">
              {featureInfo.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Trial status */}
            {isTrialUser && trialDaysRemaining > 0 && (
              <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Badge variant="secondary" className="mb-2 bg-amber-100 text-amber-800">
                  <Calendar className="w-3 h-3 mr-1" />
                  Trial: {trialDaysRemaining} days left
                </Badge>
                <p className="text-sm text-amber-700">
                  Your free trial expires soon. Upgrade now to keep using premium features!
                </p>
              </div>
            )}

            {/* Expired trial message */}
            {(!isTrialUser || trialDaysRemaining === 0) && (
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <Badge variant="destructive" className="mb-2">
                  <Lock className="w-3 h-3 mr-1" />
                  Premium Required
                </Badge>
                <p className="text-sm text-red-700">
                  {isTrialUser 
                    ? "Your free trial has expired. Upgrade to continue using this feature."
                    : "This feature requires a premium subscription."
                  }
                </p>
              </div>
            )}

            {/* Upgrade buttons */}
            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3"
                data-testid="upgrade-to-premium"
              >
                <Link href="/subscription">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="w-full"
                data-testid="learn-more-premium"
              >
                <Link href="/subscription">
                  Learn More About Premium Features
                </Link>
              </Button>
            </div>

            {/* Premium benefits */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Premium includes all features, unlimited access, and priority support
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}