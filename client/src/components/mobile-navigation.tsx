import { Home, Dumbbell, TrendingUp, Calendar } from "lucide-react";

export default function MobileNavigation() {
  return (
    <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40">
      <div className="flex justify-around py-2">
        <button className="flex flex-col items-center p-2 text-primary">
          <Home className="text-lg" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center p-2 text-muted">
          <Dumbbell className="text-lg" />
          <span className="text-xs mt-1">Workouts</span>
        </button>
        <button className="flex flex-col items-center p-2 text-muted">
          <TrendingUp className="text-lg" />
          <span className="text-xs mt-1">Progress</span>
        </button>
        <button className="flex flex-col items-center p-2 text-muted">
          <Calendar className="text-lg" />
          <span className="text-xs mt-1">Calendar</span>
        </button>
      </div>
    </div>
  );
}
