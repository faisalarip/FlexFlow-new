import { Link, useLocation } from "wouter";
import { Home, Users, Calendar, Trophy, Activity, Camera, Award, MapPin, MessageSquare, ChefHat, CreditCard, Star, ChevronDown, Menu, LogOut, Settings, Target, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNewAuth } from "@/hooks/useNewAuth";

export default function Navbar() {
  const [location] = useLocation();
  const { signOut } = useNewAuth();

  const mainNavItems = [
    { 
      path: "/", 
      label: "Home", 
      icon: Home 
    }
  ];

  const dropdownItems = [
    { 
      path: "/subscription", 
      label: "Premium", 
      icon: Star 
    },
    { 
      path: "/workout-planner", 
      label: "Workout Planner", 
      icon: Target 
    },
    { 
      path: "/leaderboard", 
      label: "Leaderboard", 
      icon: Award 
    },
    { 
      path: "/mile-tracker", 
      label: "Mile Tracker", 
      icon: MapPin 
    },
    { 
      path: "/community", 
      label: "Community", 
      icon: MessageSquare 
    },
    { 
      path: "/meal-plans", 
      label: "Meal Plans", 
      icon: ChefHat 
    },
    { 
      path: "/meal-tracker", 
      label: "Meal Tracker", 
      icon: Apple 
    },
    { 
      path: "/progress-photos", 
      label: "Progress Photos", 
      icon: Camera 
    },
    { 
      path: "/settings", 
      label: "Settings", 
      icon: Settings 
    }
  ];

  const isDropdownActive = dropdownItems.some(item => location === item.path);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Activity className="text-primary" size={32} />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">FlexFlow</h1>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            {/* Main navigation items */}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || 
                (item.path === "/trainers" && location.startsWith("/trainers"));
              
              return (
                <Link 
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Trainers dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                    location === "/trainers" || location.startsWith("/trainers") || isDropdownActive
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Users size={18} />
                  <span>More</span>
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {dropdownItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  // Special styling for Leaderboard
                  if (item.label === "Leaderboard") {
                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link 
                          href={item.path}
                          className={`relative flex items-center space-x-3 px-2 py-2 w-full cursor-pointer overflow-hidden group ${
                            isActive ? "bg-gradient-to-r from-red-600 to-red-500 text-white" : "bg-gradient-to-r from-red-950/50 to-black hover:from-red-900/60 hover:to-red-950/50"
                          }`}
                        >
                          {/* Animated background effects */}
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-red-500/20 animate-pulse opacity-50"></div>
                          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
                          
                          {/* Trophy animation on hover */}
                          <div className="absolute right-2 opacity-0 group-hover:opacity-30 transition-opacity">
                            <span className="text-xl animate-bounce">🏆</span>
                          </div>
                          
                          <Icon size={16} className={`relative z-10 ${isActive ? "text-white" : "text-red-400"}`} />
                          <span className={`relative z-10 font-semibold ${isActive ? "text-white" : "text-red-300"}`}>
                            {item.label} ⭐
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  }
                  
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link 
                        href={item.path}
                        className={`flex items-center space-x-3 px-2 py-2 w-full cursor-pointer ${
                          isActive ? "bg-primary/10 text-primary" : ""
                        }`}
                      >
                        <Icon size={16} />
                        <span className={item.label === "Workout Planner" ? "text-white" : ""}>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <hr className="my-2" />
                <DropdownMenuItem>
                  <button 
                    onClick={signOut}
                    className="flex items-center space-x-3 px-2 py-2 w-full cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent border-none"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2">
            
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}