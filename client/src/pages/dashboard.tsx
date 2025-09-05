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

export default function Dashboard() {
  return (
    <div className="font-inter bg-black text-white min-h-screen relative overflow-hidden hexagon-bg hexagon-pattern">
      {/* Animated red and black background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Large floating red hexagons */}
        <div className="absolute top-10 left-10 w-40 h-35 opacity-20 animate-pulse" style={{animationDuration: '8s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#dc2626" strokeWidth="2" opacity="0.4"/>
          </svg>
        </div>
        <div className="absolute top-1/3 right-20 w-32 h-28 opacity-15 animate-bounce" style={{animationDuration: '10s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
          </svg>
        </div>
        <div className="absolute bottom-20 left-1/4 w-36 h-31 opacity-25 animate-ping" style={{animationDuration: '12s', animationDelay: '2s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#000000" stroke="#dc2626" strokeWidth="1" opacity="0.8"/>
          </svg>
        </div>
        <div className="absolute bottom-1/3 right-1/3 w-28 h-24 opacity-20 animate-pulse" style={{animationDuration: '6s', animationDelay: '1s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#000000" strokeWidth="1" opacity="0.5"/>
          </svg>
        </div>
        <div className="absolute top-2/3 left-16 w-24 h-21 opacity-18 animate-bounce" style={{animationDuration: '9s', animationDelay: '3s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.3"/>
          </svg>
        </div>
        <div className="absolute top-1/2 right-10 w-30 h-26 opacity-22 animate-ping" style={{animationDuration: '14s', animationDelay: '1.5s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#dc2626" strokeWidth="1" opacity="0.6"/>
          </svg>
        </div>
        
        {/* Medium hexagons for middle layer */}
        <div className="absolute top-1/4 left-1/3 w-22 h-19 opacity-15 animate-pulse" style={{animationDuration: '7s', animationDelay: '0.5s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="1" opacity="0.4"/>
          </svg>
        </div>
        <div className="absolute bottom-1/4 left-1/2 w-26 h-22 opacity-17 animate-bounce" style={{animationDuration: '11s', animationDelay: '2.5s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#000000" stroke="#dc2626" strokeWidth="2" opacity="0.5"/>
          </svg>
        </div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/5 right-1/4 w-60 h-60 bg-gradient-to-br from-red-600/15 to-black/40 rounded-full blur-3xl opacity-25 animate-pulse" style={{animationDuration: '10s'}}></div>
        <div className="absolute bottom-1/5 left-1/5 w-48 h-48 bg-gradient-to-br from-black/50 to-red-600/20 rounded-full blur-2xl opacity-20 animate-ping" style={{animationDuration: '15s'}}></div>
        <div className="absolute top-3/4 right-1/5 w-52 h-52 bg-gradient-to-br from-red-600/10 to-black/30 rounded-full blur-3xl opacity-15 animate-pulse" style={{animationDuration: '8s', animationDelay: '4s'}}></div>
        
        {/* Dynamic radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-red-900/8 to-black/40 animate-pulse" style={{animationDuration: '12s'}}></div>
      </div>
      
      <div className="relative z-10">
        <NavigationHeader />
        <MobileNavigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
          <WelcomeSection />
          <QuickStats />
          <ProgressOverview />
          
          <div className="grid lg:grid-cols-3 gap-8">
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
      </div>
    </div>
  );
}
