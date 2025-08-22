import { Dumbbell, Menu, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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

export default function NavigationHeader() {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
  const displayName = fullName || user?.email || "User";
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Dumbbell className="text-primary text-2xl" />
              <h1 className="text-xl font-bold text-primary">FlexFlow</h1>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a
              href="#dashboard"
              className="text-primary font-medium border-b-2 border-primary pb-4"
            >
              Dashboard
            </a>
            <a
              href="#workouts"
              className="text-muted hover:text-primary transition-colors"
            >
              Workouts
            </a>
            <a
              href="#progress"
              className="text-muted hover:text-primary transition-colors"
            >
              Progress
            </a>
            <a
              href="#calendar"
              className="text-muted hover:text-primary transition-colors"
            >
              Calendar
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="md:hidden text-muted">
              <Menu className="text-xl" />
            </button>
            <PremiumBadge />
            <div className="hidden md:flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50" data-testid="user-menu-trigger">
                    <span className="text-sm text-gray-700">{displayName}</span>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="text-white text-sm" />
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
                        Edit Name
                      </div>
                    } />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
