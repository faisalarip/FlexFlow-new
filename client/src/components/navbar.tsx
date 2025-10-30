import { Link, useLocation } from "wouter";
import { Activity, LogOut, Menu, Home, Dumbbell, TrendingUp, Users, ChefHat, Target, Apple, MapPin, Camera, Star, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNewAuth } from "@/hooks/useNewAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export default function Navbar() {
  const [location] = useLocation();
  const { signOut } = useNewAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const allNavItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/workouts", label: "Workouts", icon: Dumbbell },
    { path: "/progress", label: "Progress", icon: TrendingUp },
    { path: "/community", label: "Community", icon: Users },
    { path: "/subscription", label: "Premium", icon: Star },
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

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Logo - Centered on Mobile, Left on Desktop */}
          <Link href="/" className="flex items-center space-x-2">
            <Activity className="text-primary" size={28} />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">FlexFlow</h1>
          </Link>

          {/* Desktop Sign Out */}
          <div className="hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                  >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Horizontal Tabs - Only visible on large screens */}
        <div className="hidden lg:block border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-1 overflow-x-auto py-2">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link 
                  key={item.path}
                  href={item.path}
                  data-testid={`desktop-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      active 
                        ? "bg-primary text-white shadow-sm" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
