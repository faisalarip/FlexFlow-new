import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from "date-fns";
import type { Workout } from "@shared/schema";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: workouts } = useQuery<Workout[]>({
    queryKey: ["/api/workouts/range", format(startOfMonth(currentMonth), 'yyyy-MM-dd'), format(endOfMonth(currentMonth), 'yyyy-MM-dd')],
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate calendar grid with proper week alignment
  const firstDayOfMonth = getDay(monthStart);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayIndex = i - firstDayOfMonth;
    if (dayIndex < 0) return null;
    if (dayIndex >= monthDays.length) return null;
    return monthDays[dayIndex];
  });

  const getWorkoutsForDay = (date: Date) => {
    if (!workouts) return [];
    return workouts.filter(workout => 
      isSameDay(new Date(workout.date), date)
    );
  };

  const getWorkoutIndicators = (dayWorkouts: Workout[]) => {
    const categories = Array.from(new Set(dayWorkouts.map(w => w.category)));
    const colorMap = {
      strength: "bg-primary",
      cardio: "bg-secondary", 
      yoga: "bg-accent",
      swimming: "bg-blue-500"
    };
    
    return categories.map(category => colorMap[category as keyof typeof colorMap] || "bg-gray-500");
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Workout Calendar</h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigateMonth('prev')}
            className="text-muted hover:text-primary transition-colors"
          >
            <ChevronLeft />
          </button>
          <span className="font-medium text-gray-800">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button 
            onClick={() => navigateMonth('next')}
            className="text-muted hover:text-primary transition-colors"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="aspect-square"></div>;
          }

          const dayWorkouts = getWorkoutsForDay(day);
          const indicators = getWorkoutIndicators(dayWorkouts);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square flex flex-col items-center justify-center text-sm border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer relative ${
                isToday ? 'border-primary bg-primary bg-opacity-10' : ''
              }`}
            >
              <span className={`${isToday ? 'text-primary font-bold' : dayWorkouts.length > 0 ? 'text-gray-800 font-medium' : 'text-muted'}`}>
                {format(day, 'd')}
              </span>
              {indicators.length > 0 && (
                <div className="absolute bottom-1 flex space-x-1">
                  {indicators.slice(0, 3).map((colorClass, i) => (
                    <div key={i} className={`w-1 h-1 ${colorClass} rounded-full`}></div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span className="text-muted">Strength</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-secondary rounded-full"></div>
          <span className="text-muted">Cardio</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-accent rounded-full"></div>
          <span className="text-muted">Yoga</span>
        </div>
      </div>
    </section>
  );
}
