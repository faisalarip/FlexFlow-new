import { useEffect, useState } from "react";
import NavigationHeader from "@/components/navigation-header";
import MobileNavigation from "@/components/mobile-navigation";
import WelcomeSection from "@/components/welcome-section";
import QuickStats from "@/components/quick-stats";
import WorkoutLogger from "@/components/workout-logger";
import RecentWorkouts from "@/components/recent-workouts";
import ProgressCharts from "@/components/progress-charts";
import CalendarView from "@/components/calendar-view";
import GoalsWidget from "@/components/goals-widget";
import WorkoutRecommendations from "@/components/workout-recommendations";
import FloatingActionButton from "@/components/floating-action-button";
import ProgressOverview from "@/components/progress-overview";
import PerformanceAnalytics from "@/components/performance-analytics";
import ProfileEditor from "@/components/profile-editor";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const { user } = useAuth();

  // Auto-open profile editor when user first logs in
  useEffect(() => {
    const hasShownProfileEditor = localStorage.getItem('hasShownProfileEditor');
    
    if (user && !hasShownProfileEditor) {
      // Small delay to ensure the page has fully loaded
      const timer = setTimeout(() => {
        setShowProfileEditor(true);
        localStorage.setItem('hasShownProfileEditor', 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <div className="font-inter bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <NavigationHeader />
      <MobileNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        <WelcomeSection />
        <QuickStats />
        <ProgressOverview />
        <PerformanceAnalytics />
        
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <WorkoutLogger />
            <RecentWorkouts />
            <ProgressCharts />
          </div>
          
          <div className="space-y-8">
            <CalendarView />
            <GoalsWidget />
            <WorkoutRecommendations />
          </div>
        </div>
      </main>

      <FloatingActionButton />
      
      {/* Auto-open Profile Editor for new users */}
      <ProfileEditor 
        isOpen={showProfileEditor} 
        setIsOpen={setShowProfileEditor}
      />
    </div>
  );
}
