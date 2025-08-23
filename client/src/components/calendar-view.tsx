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
              <span className={`${isToday ? 'text-primary font-bold' : dayWorkouts.length > 0 ? 'text-gray-800 font-medium' : 'text-muted'}`}>
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
    </section>
  );
}
