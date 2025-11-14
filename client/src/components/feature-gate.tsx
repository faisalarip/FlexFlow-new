import { Lock, Crown, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useNewAuth } from "@/hooks/useNewAuth";

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
    name: "Professional Barcode Scanner",
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

// Premium-only features that require active subscription (no trial access)
const PREMIUM_ONLY_FEATURES = ['workout_planner', 'meal_tracker'];

export default function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { user } = useNewAuth();

  // Check if user has access to the feature
  const hasAccess = (() => {
    if (!user) return false;
    
    // Active premium subscription has access to everything
    if (user.subscriptionStatus === "active") return true;
    
    // Check if feature is premium-only (requires subscription, no trial access)
    if (PREMIUM_ONLY_FEATURES.includes(feature)) return false;
    
    // For non-premium-only features, free trial users have access if trial hasn't expired
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

  // Default locked feature UI - Full screen lock page
  const featureInfo = FEATURE_INFO[feature];
  const isTrialUser = user?.subscriptionStatus === "free_trial";
  const isExpired = user?.subscriptionStatus === "expired";
  const isPremiumOnly = PREMIUM_ONLY_FEATURES.includes(feature);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" data-testid={`feature-gate-${feature}`}>
      {/* Animated lock icon background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-5">
          <Lock className="w-full h-full text-red-500 animate-pulse" />
        </div>
      </div>

      {/* Lock Page Content */}
      <div className="relative w-full max-w-2xl">
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/30 shadow-2xl shadow-red-500/20">
          <CardHeader className="text-center pb-6">
            {/* Lock Icon */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <Lock className="w-12 h-12 text-white" />
            </div>

            {/* Feature Title */}
            <CardTitle className="flex items-center gap-3 justify-center text-3xl text-white mb-3">
              {featureInfo.icon}
              {featureInfo.name}
            </CardTitle>
            
            <CardDescription className="text-lg text-gray-300">
              {featureInfo.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Subscription Status Message */}
            {isPremiumOnly && isTrialUser && (
              <div className="text-center p-6 bg-gradient-to-r from-purple-900/50 to-red-900/50 rounded-xl border-2 border-purple-500/50">
                <Badge className="mb-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-base">
                  <Crown className="w-4 h-4 mr-2" />
                  Premium Subscription Required
                </Badge>
                <p className="text-xl font-bold text-white mb-2">
                  This Feature Requires an Active Subscription
                </p>
                <p className="text-base text-gray-300">
                  {featureInfo.name} is a premium-only feature. Subscribe now to unlock this and other exclusive features.
                </p>
              </div>
            )}

            {isExpired && (
              <div className="text-center p-6 bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-xl border-2 border-red-500/50">
                <Badge className="mb-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-base">
                  <Lock className="w-4 h-4 mr-2" />
                  Subscription Expired
                </Badge>
                <p className="text-xl font-bold text-white mb-2">
                  Your Premium Access Has Ended
                </p>
                <p className="text-base text-gray-300">
                  Renew your subscription to continue using {featureInfo.name} and all other premium features.
                </p>
              </div>
            )}

            {!isPremiumOnly && isTrialUser && trialDaysRemaining > 0 && (
              <div className="text-center p-6 bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-xl border-2 border-amber-500/50">
                <Badge className="mb-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-base">
                  <Calendar className="w-4 h-4 mr-2" />
                  Trial Ending Soon
                </Badge>
                <p className="text-xl font-bold text-white mb-2">
                  {trialDaysRemaining} {trialDaysRemaining === 1 ? 'Day' : 'Days'} Left in Your Trial
                </p>
                <p className="text-base text-gray-300">
                  Upgrade now to keep using premium features after your trial expires!
                </p>
              </div>
            )}

            {!isPremiumOnly && isTrialUser && trialDaysRemaining === 0 && (
              <div className="text-center p-6 bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-xl border-2 border-red-500/50">
                <Badge className="mb-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-base">
                  <Lock className="w-4 h-4 mr-2" />
                  Trial Expired
                </Badge>
                <p className="text-xl font-bold text-white mb-2">
                  Your Free Trial Has Ended
                </p>
                <p className="text-base text-gray-300">
                  Upgrade to premium to continue using {featureInfo.name} and all advanced features.
                </p>
              </div>
            )}

            {!isPremiumOnly && !isTrialUser && !isExpired && (
              <div className="text-center p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border-2 border-purple-500/50">
                <Badge className="mb-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-base">
                  <Crown className="w-4 h-4 mr-2" />
                  Premium Feature
                </Badge>
                <p className="text-xl font-bold text-white mb-2">
                  This Feature Requires Premium Access
                </p>
                <p className="text-base text-gray-300">
                  Upgrade to unlock {featureInfo.name} and all other premium features.
                </p>
              </div>
            )}

            {/* Upgrade Buttons */}
            {!Capacitor.isNativePlatform() && (
              <div className="flex flex-col gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-6 text-lg shadow-lg shadow-red-500/50 border-2 border-red-500/50"
                  data-testid="upgrade-to-premium"
                >
                  <Link href="/subscription">
                    <Crown className="w-5 h-5 mr-3" />
                    {isExpired ? "Renew Premium Subscription" : "Upgrade to Premium Now"}
                  </Link>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-gray-600 text-white hover:bg-gray-800 hover:text-white py-6 text-lg"
                  data-testid="learn-more-premium"
                >
                  <Link href="/subscription">
                    View Premium Features & Pricing
                  </Link>
                </Button>
              </div>
            )}

            {/* Premium Benefits */}
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-3">
                Premium includes:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">AI Workout Plans</Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">Mile Tracker</Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">Meal Planning</Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">Meal Tracking</Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">Priority Support</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}