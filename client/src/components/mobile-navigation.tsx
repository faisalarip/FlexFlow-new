import { Home, Dumbbell, TrendingUp, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function MobileNavigation() {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40">
      <div className="flex justify-around py-2">
        <Link
          href="/"
          className={`flex flex-col items-center p-2 transition-colors ${
            isActive("/") ? "text-primary" : "text-muted hover:text-primary"
          }`}
          data-testid="mobile-nav-home"
        >
          <Home className="text-lg" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          href="/workouts"
          className={`flex flex-col items-center p-2 transition-colors ${
            isActive("/workouts") ? "text-primary" : "text-muted hover:text-primary"
          }`}
          data-testid="mobile-nav-workouts"
        >
          <Dumbbell className="text-lg" />
          <span className="text-xs mt-1">Workouts</span>
        </Link>
        <Link
          href="/progress"
          className={`flex flex-col items-center p-2 transition-colors ${
            isActive("/progress") ? "text-primary" : "text-muted hover:text-primary"
          }`}
          data-testid="mobile-nav-progress"
        >
          <TrendingUp className="text-lg" />
          <span className="text-xs mt-1">Progress</span>
        </Link>
        <Link
          href="/calendar"
          className={`flex flex-col items-center p-2 transition-colors ${
            isActive("/calendar") ? "text-primary" : "text-muted hover:text-primary"
          }`}
          data-testid="mobile-nav-calendar"
        >
          <Calendar className="text-lg" />
          <span className="text-xs mt-1">Calendar</span>
        </Link>
      </div>
    </div>
  );
}
