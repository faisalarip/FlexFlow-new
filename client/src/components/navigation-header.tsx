import { Dumbbell, Menu, User, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useNewAuth } from "@/hooks/useNewAuth";
import PremiumBadge from "@/components/premium-badge";
import ProfileEditor from "@/components/profile-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { User as UserType } from "@shared/schema";

export default function NavigationHeader() {
  const { user } = useNewAuth() as { user: UserType | null };
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
  const displayName = fullName || user?.email || "User";

  const isActive = (path: string) => location === path;
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[70]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Dumbbell className="text-primary text-2xl" />
            </div>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`transition-colors py-4 ${
                isActive("/")
                  ? "text-primary font-medium border-b-2 border-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
              data-testid="nav-home"
            >
              Home
            </Link>
            <Link
              href="/workouts"
              className={`transition-colors py-4 ${
                isActive("/workouts")
                  ? "text-primary font-medium border-b-2 border-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
              data-testid="nav-workouts"
            >
              Workouts
            </Link>
            <Link
              href="/progress"
              className={`transition-colors py-4 ${
                isActive("/progress")
                  ? "text-primary font-medium border-b-2 border-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
              data-testid="nav-progress"
            >
              Progress
            </Link>
            <Link
              href="/calendar"
              className={`transition-colors py-4 ${
                isActive("/calendar")
                  ? "text-primary font-medium border-b-2 border-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
              data-testid="nav-calendar"
            >
              Calendar
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden text-muted hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="text-xl" /> : <Menu className="text-xl" />}
            </button>
            <PremiumBadge />
            <div className="hidden md:flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50" data-testid="user-menu-trigger">
                    <span className="text-sm text-gray-700">{displayName}</span>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
                      {user?.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          data-testid="nav-profile-image"
                        />
                      ) : (
                        <User className="text-white text-sm" />
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {fullName || "Welcome!"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <ProfileEditor trigger={
                      <div className="flex items-center w-full cursor-pointer" data-testid="profile-menu-item">
                        <User className="w-4 h-4 mr-2" />
                        Edit Profile
                      </div>
                    } />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg relative z-[60]">
          <nav className="px-4 py-2 space-y-1">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md transition-colors ${
                isActive("/")
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="mobile-nav-home"
            >
              Home
            </Link>
            <Link
              href="/workouts"
              className={`block px-3 py-2 rounded-md transition-colors ${
                isActive("/workouts")
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="mobile-nav-workouts"
            >
              Workouts
            </Link>
            <Link
              href="/progress"
              className={`block px-3 py-2 rounded-md transition-colors ${
                isActive("/progress")
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="mobile-nav-progress"
            >
              Progress
            </Link>
            <Link
              href="/calendar"
              className={`block px-3 py-2 rounded-md transition-colors ${
                isActive("/calendar")
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="mobile-nav-calendar"
            >
              Calendar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
