import { Link, useLocation } from "wouter";
import { Home, Users, Calendar, Trophy, Activity, Camera, Award, MapPin, MessageSquare, ChefHat, CreditCard, Star, ChevronDown, Menu, LogOut, Settings } from "lucide-react";
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
      label: "Dashboard", 
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
      path: "/settings", 
      label: "Settings", 
      icon: Settings 
    }
  ];

  const isDropdownActive = dropdownItems.some(item => location === item.path);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
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
                  
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link 
                        href={item.path}
                        className={`flex items-center space-x-3 px-2 py-2 w-full cursor-pointer ${
                          isActive ? "bg-primary/10 text-primary" : ""
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
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