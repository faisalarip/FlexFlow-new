import { Link, useLocation } from "wouter";
import { Home, Dumbbell, TrendingUp, Users, MoreHorizontal, ChefHat, MapPin, Settings, Star, Target, Apple, Camera, Newspaper } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNewAuth } from "@/hooks/useNewAuth";

export default function BottomNav() {
  const [location] = useLocation();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const { signOut } = useNewAuth();

  const mainNavItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/workouts", label: "Workouts", icon: Dumbbell },
    { path: "/progress", label: "Progress", icon: TrendingUp },
    { path: "/community", label: "Community", icon: Users },
  ];

  const moreItems = [
    { path: "/subscription", label: "Premium", icon: Star },
    { path: "/news", label: "What's New", icon: Newspaper },
    { path: "/meal-plans", label: "Meal Plans", icon: ChefHat },
    { path: "/workout-planner", label: "Workout Planner", icon: Target },
    { path: "/meal-tracker", label: "Barcode Scanner", icon: Apple },
    { path: "/mile-tracker", label: "Mile Tracker", icon: MapPin },
    { path: "/progress-photos", label: "Progress Photos", icon: Camera },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location === "/" || location === "/home";
    return location.startsWith(path);
  };

  const isMoreActive = moreItems.some(item => isActive(item.path));

  return (
    <>
      {/* Bottom Navigation - Mobile and Tablet with bounce animation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-inset-bottom mobile-slide-up">
        <nav className="grid grid-cols-5 h-16" aria-label="Main navigation">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link 
                key={item.path}
                href={item.path}
                className="flex flex-col items-center justify-center space-y-1 active:mobile-pop"
                data-testid={`bottom-nav-${item.label.toLowerCase()}`}
                aria-label={`Navigate to ${item.label}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon 
                  size={22} 
                  className={`transition-all duration-300 ${
                    active 
                      ? "text-primary mobile-pulse" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span 
                  className={`text-xs font-medium transition-colors ${
                    active 
                      ? "text-primary" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Sheet Trigger */}
          <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
            <SheetTrigger asChild>
              <button 
                className="flex flex-col items-center justify-center space-y-1"
                data-testid="bottom-nav-more"
                aria-label="Open more options menu"
              >
                <MoreHorizontal 
                  size={22} 
                  className={`transition-colors ${
                    isMoreActive 
                      ? "text-primary" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  strokeWidth={isMoreActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span 
                  className={`text-xs font-medium ${
                    isMoreActive 
                      ? "text-primary" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  More
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl z-[80]">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-center text-xl">More Options</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-4 px-2">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link 
                      key={item.path}
                      href={item.path}
                      onClick={() => setMoreSheetOpen(false)}
                      data-testid={`more-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      aria-label={`Navigate to ${item.label}`}
                    >
                      <div 
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
                          active 
                            ? "bg-primary/10 text-primary" 
                            : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon size={28} className="mb-2" aria-hidden="true" />
                        <span className="text-xs font-medium text-center leading-tight">
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              <div className="mt-8 px-4">
                <Button
                  variant="outline"
                  className="w-full justify-center text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => {
                    setMoreSheetOpen(false);
                    signOut();
                  }}
                  data-testid="more-menu-signout"
                  aria-label="Sign out of your account"
                >
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>

      {/* Spacer for bottom nav on mobile and tablet */}
      <div className="lg:hidden h-16" />
    </>
  );
}
