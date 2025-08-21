import { Dumbbell, Menu, User } from "lucide-react";

export default function NavigationHeader() {
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
            <a href="#dashboard" className="text-primary font-medium border-b-2 border-primary pb-4">
              Dashboard
            </a>
            <a href="#workouts" className="text-muted hover:text-primary transition-colors">
              Workouts
            </a>
            <a href="#progress" className="text-muted hover:text-primary transition-colors">
              Progress
            </a>
            <a href="#calendar" className="text-muted hover:text-primary transition-colors">
              Calendar
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="md:hidden text-muted">
              <Menu className="text-xl" />
            </button>
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-sm text-muted">John Doe</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="text-white text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
