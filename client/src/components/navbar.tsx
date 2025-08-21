import { Link, useLocation } from "wouter";
import { Home, Users, Calendar, Trophy, Activity, Camera } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { 
      path: "/", 
      label: "Dashboard", 
      icon: Home 
    },
    { 
      path: "/trainers", 
      label: "Trainers", 
      icon: Users 
    },
    { 
      path: "/bookings", 
      label: "Bookings", 
      icon: Calendar 
    },
    { 
      path: "/food-scanner", 
      label: "Food Scanner", 
      icon: Camera 
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Activity className="text-primary" size={32} />
              <h1 className="text-xl font-bold text-gray-900">FlexFlow</h1>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
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
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">U</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}