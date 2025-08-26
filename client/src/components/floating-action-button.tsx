import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function FloatingActionButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  const quickActions = [
    {
      title: "Log Quick Workout",
      description: "Start tracking your workout now",
      action: () => {
        setIsDialogOpen(false);
        // Scroll to workout logger on dashboard
        const element = document.getElementById('workout-logger');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      title: "Browse Workouts",
      description: "Explore workout routines and exercises",
      action: () => {
        setIsDialogOpen(false);
        setLocation('/workouts');
      }
    },
    {
      title: "View Progress",
      description: "Check your fitness progress and stats",
      action: () => {
        setIsDialogOpen(false);
        setLocation('/progress');
      }
    },
    {
      title: "Check Calendar",
      description: "View your workout schedule",
      action: () => {
        setIsDialogOpen(false);
        setLocation('/calendar');
      }
    }
  ];

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-20 md:bottom-6 right-6 bg-accent hover:bg-orange-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-30"
          data-testid="floating-action-button"
        >
          <Plus className="text-xl" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Actions</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto p-4"
              onClick={action.action}
              data-testid={`quick-action-${index}`}
            >
              <div>
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
