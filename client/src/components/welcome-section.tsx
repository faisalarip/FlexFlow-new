import { Plus, Flame, User as UserIcon } from "lucide-react";
import { useNewAuth } from "@/hooks/useNewAuth";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export default function WelcomeSection() {
  const { isLoading } = useNewAuth();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
  
  // Get full user data with streak
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });
  
  // Get user's name for greeting
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : null;
  
  // Get user's current streak
  const userStreak = user?.streak || 0;
  const streakText = userStreak === 0 ? "Start today!" : userStreak === 1 ? "1 day" : `${userStreak} days`;

  return (
    <section className="mb-8">
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=400" 
            alt="Person doing workout" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  data-testid="welcome-profile-image"
                />
              ) : (
                <UserIcon className="text-white text-xl" />
              )}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {greeting}{userName ? `, ${userName}` : ''}!
              </h2>
              <p className="text-lg font-semibold text-red-400 mb-2">Eat Clean, Think Smart, Train HARD!</p>
              <p className="text-lg opacity-90">Ready to crush your fitness goals today?</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => {
                const workoutLogger = document.getElementById('workout-logger');
                if (workoutLogger) {
                  workoutLogger.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start' 
                  });
                }
              }}
              className="bg-accent hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Plus />
              <span>Start Workout</span>
            </button>
            <div className="bg-white bg-opacity-20 rounded-xl p-3 flex items-center space-x-3">
              <Flame className="text-accent text-xl" />
              <div>
                <p className="text-sm opacity-80">Current Streak</p>
                <p className="font-bold text-lg">{streakText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
