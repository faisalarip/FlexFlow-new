import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Edit3, Check, X, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import type { Workout, CalendarNote } from "@shared/schema";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingNote, setEditingNote] = useState<CalendarNote | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const queryClient = useQueryClient();

  const { data: workouts } = useQuery<Workout[]>({
    queryKey: ["/api/workouts/range", format(startOfMonth(currentMonth), 'yyyy-MM-dd'), format(endOfMonth(currentMonth), 'yyyy-MM-dd')],
  });

  const { data: calendarNotes } = useQuery<CalendarNote[]>({
    queryKey: ["/api/calendar-notes"],
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

  const getNotesForDay = (date: Date) => {
    if (!calendarNotes) return [];
    return calendarNotes.filter(note => 
      isSameDay(new Date(note.date), date)
    );
  };

  const createNoteMutation = useMutation({
    mutationFn: async (data: { date: string; note: string }) => {
      return apiRequest("POST", "/api/calendar-notes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-notes"] });
      setIsDialogOpen(false);
      setNoteText("");
      setSelectedDate(null);
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      return apiRequest("PUT", `/api/calendar-notes/${id}`, { note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-notes"] });
      setEditingNote(null);
      setIsDialogOpen(false);
      setNoteText("");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/calendar-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-notes"] });
    },
  });

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const dayNotes = getNotesForDay(date);
    if (dayNotes.length > 0) {
      setEditingNote(dayNotes[0]);
      setNoteText(dayNotes[0].note);
    } else {
      setEditingNote(null);
      setNoteText("");
    }
    setIsDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (!selectedDate || !noteText.trim()) return;

    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, note: noteText });
    } else {
      createNoteMutation.mutate({
        date: format(selectedDate, 'yyyy-MM-dd'),
        note: noteText
      });
    }
  };

  const handleDeleteNote = () => {
    if (editingNote) {
      deleteNoteMutation.mutate(editingNote.id);
      setIsDialogOpen(false);
      setEditingNote(null);
      setNoteText("");
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-black via-red-900/30 to-black rounded-3xl shadow-2xl border border-red-600/50 p-8 overflow-hidden hexagon-bg hexagon-pattern">
      {/* Animated red and black background elements */}
      <div className="absolute inset-0">
        {/* Floating red hexagons */}
        <div className="absolute top-0 left-0 w-32 h-28 opacity-30 animate-pulse" style={{animationDuration: '4s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
          </svg>
        </div>
        <div className="absolute top-1/4 right-0 w-24 h-21 opacity-20 animate-bounce" style={{animationDuration: '6s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.8"/>
          </svg>
        </div>
        <div className="absolute bottom-0 left-1/3 w-28 h-24 opacity-25 animate-ping" style={{animationDuration: '8s', animationDelay: '1s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#000000" stroke="#dc2626" strokeWidth="1" opacity="0.7"/>
          </svg>
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-20 h-17 opacity-15 animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#000000" strokeWidth="1" opacity="0.5"/>
          </svg>
        </div>
        <div className="absolute top-1/2 left-10 w-22 h-19 opacity-20 animate-bounce" style={{animationDuration: '7s', animationDelay: '0.5s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.4"/>
          </svg>
        </div>
        
        {/* Animated red gradient orbs */}
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-gradient-to-br from-red-600/20 to-black/40 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-gradient-to-br from-black/60 to-red-600/20 rounded-full blur-2xl opacity-20 animate-ping" style={{animationDuration: '10s'}}></div>
        
        {/* Dynamic radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-red-900/10 to-black/60 animate-pulse" style={{animationDuration: '8s'}}></div>
      </div>
      {/* Content wrapper */}
      <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">Workout Calendar</h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigateMonth('prev')}
            className="text-gray-300 hover:text-cyan-300 transition-colors"
          >
            <ChevronLeft />
          </button>
          <span className="font-medium text-white drop-shadow-lg">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button 
            onClick={() => navigateMonth('next')}
            className="text-gray-300 hover:text-cyan-300 transition-colors"
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
          const dayNotes = getNotesForDay(day);
          const isToday = isSameDay(day, new Date());
          const hasNote = dayNotes.length > 0;

          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={`aspect-square flex flex-col items-center justify-center text-sm border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer relative ${
                isToday ? 'border-primary bg-primary bg-opacity-10' : ''
              }`}
              data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
            >
              <span className={`${isToday ? 'text-red-400 font-bold' : dayWorkouts.length > 0 ? 'text-white font-medium' : 'text-white'}`}>
                {format(day, 'd')}
              </span>
              
              {/* Workout indicators */}
              {indicators.length > 0 && (
                <div className="absolute bottom-1 left-1 flex space-x-1">
                  {indicators.slice(0, 3).map((colorClass, i) => (
                    <div key={i} className={`w-1 h-1 ${colorClass} rounded-full`}></div>
                  ))}
                </div>
              )}
              
              {/* Note indicator */}
              {hasNote && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Has note"></div>
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
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-muted">Notes</span>
        </div>
      </div>

      {/* Note Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              {selectedDate ? `Note for ${format(selectedDate, 'MMMM d, yyyy')}` : 'Calendar Note'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add a note for this day..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[100px]"
              data-testid="note-textarea"
            />
            <div className="flex justify-between">
              <div>
                {editingNote && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteNote}
                    data-testid="delete-note-button"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="cancel-note-button"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={!noteText.trim() || createNoteMutation.isPending || updateNoteMutation.isPending}
                  data-testid="save-note-button"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {editingNote ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </section>
  );
}
