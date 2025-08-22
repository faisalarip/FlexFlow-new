import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import Trainers from "@/pages/trainers";
import TrainerProfile from "@/pages/trainer-profile";
import Bookings from "@/pages/bookings";
import TrainerSubscription from "@/pages/trainer-subscription";
import UserSubscription from "@/pages/user-subscription";
import FoodScanner from "@/pages/food-scanner";
import Leaderboard from "@/pages/leaderboard";
import MileTracker from "@/pages/mile-tracker";
import Community from "@/pages/community";
import MealPlans from "@/pages/meal-plans";
import Landing from "@/pages/landing";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/navbar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {isAuthenticated && <Navbar />}
      
      <Switch>
        {!isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/trainers" component={Trainers} />
            <Route path="/trainers/:id" component={TrainerProfile} />
            <Route path="/bookings" component={Bookings} />
            <Route path="/trainer-subscription" component={TrainerSubscription} />
            <Route path="/subscription" component={UserSubscription} />
            <Route path="/food-scanner" component={FoodScanner} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/mile-tracker" component={MileTracker} />
            <Route path="/community" component={Community} />
            <Route path="/meal-plans" component={MealPlans} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/subscribe" component={Subscribe} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
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
