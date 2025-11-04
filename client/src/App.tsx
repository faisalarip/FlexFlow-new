import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import Dashboard from "@/pages/dashboard";
import Home from "@/pages/home";
import UserSubscription from "@/pages/user-subscription";
import MileTracker from "@/pages/mile-tracker";
import Community from "@/pages/community";
import MealPlans from "@/pages/meal-plans";
import WorkoutPlanner from "@/pages/workout-planner";
import MealTracker from "@/pages/meal-tracker";
import Landing from "@/pages/landing";
import Settings from "@/pages/settings";
import Workouts from "@/pages/workouts";
import Progress from "@/pages/progress";
import ProgressPhotos from "@/pages/progress-photos";
import Calendar from "@/pages/calendar";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/navbar";
import BottomNav from "@/components/bottom-nav";
import Onboarding from "@/pages/onboarding";
import OnboardingPlan from "@/pages/onboarding-plan";
import TrialSuccess from "@/pages/trial-success";
import ProfileCompletionGuard from "@/components/profile-completion-guard";
import AuthSelection from "@/pages/auth-selection";
import Tutorial from "@/pages/tutorial";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import { useNewAuth } from "@/hooks/useNewAuth";
import NotificationManager from "@/components/notification-manager";

function Router() {
  const { isAuthenticated, isLoading } = useNewAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {isAuthenticated && (
        <>
          <Navbar />
          <NotificationManager />
        </>
      )}
      
      <main className="pb-safe">
        <Switch>
        {/* Legal pages - accessible to all users */}
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        
        {/* Tutorial page - always available but checks auth internally */}
        <Route path="/tutorial" component={Tutorial} />
        
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/auth-selection" component={AuthSelection} />
            <Route path="/onboarding" component={Onboarding} />
            <Route path="/onboarding/plan" component={OnboardingPlan} />
            <Route path="/trial-success" component={TrialSuccess} />
          </>
        ) : (
          <ProfileCompletionGuard>
            <Route path="/" component={Home} />
            <Route path="/home" component={Home} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/subscription" component={UserSubscription} />
            <Route path="/user/subscription" component={UserSubscription} />
            <Route path="/mile-tracker" component={MileTracker} />
            <Route path="/community" component={Community} />
            <Route path="/meal-plans" component={MealPlans} />
            <Route path="/workout-planner" component={WorkoutPlanner} />
            <Route path="/meal-tracker" component={MealTracker} />
            <Route path="/settings" component={Settings} />
            <Route path="/workouts" component={Workouts} />
            <Route path="/progress" component={Progress} />
            <Route path="/progress-photos" component={ProgressPhotos} />
            <Route path="/calendar" component={Calendar} />
          </ProfileCompletionGuard>
        )}
        <Route component={NotFound} />
      </Switch>
      </main>
      
      {isAuthenticated && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
