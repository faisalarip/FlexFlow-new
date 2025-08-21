import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Trainers from "@/pages/trainers";
import TrainerProfile from "@/pages/trainer-profile";
import Bookings from "@/pages/bookings";
import FoodScanner from "@/pages/food-scanner";
import Leaderboard from "@/pages/leaderboard";
import MileTracker from "@/pages/mile-tracker";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/navbar";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/trainers" component={Trainers} />
        <Route path="/trainers/:id" component={TrainerProfile} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/food-scanner" component={FoodScanner} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/mile-tracker" component={MileTracker} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
