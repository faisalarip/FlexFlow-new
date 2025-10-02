import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Dumbbell, Target, TrendingUp, MapPin, Users, Sparkles, ChevronRight } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import MobileNavigation from "@/components/mobile-navigation";
import QuickStats from "@/components/quick-stats";
import ProfileEditor from "@/components/profile-editor";
import { useNewAuth } from "@/hooks/useNewAuth";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const { user } = useNewAuth();

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

  const features = [
    {
      icon: Dumbbell,
      title: "Log Workouts",
      description: "Track your exercises, sets, reps, and weight",
      link: "/workouts",
      color: "red",
      testId: "link-workouts"
    },
    {
      icon: MapPin,
      title: "Mile Tracker",
      description: "GPS-powered automatic mile counting for runs",
      link: "/mile-tracker",
      color: "blue",
      testId: "link-mile-tracker"
    },
    {
      icon: Target,
      title: "Set Goals",
      description: "Create fitness goals and track your progress",
      link: "/goals",
      color: "green",
      testId: "link-goals"
    },
    {
      icon: TrendingUp,
      title: "View Progress",
      description: "See charts and analytics of your fitness journey",
      link: "/progress",
      color: "purple",
      testId: "link-progress"
    },
    {
      icon: Users,
      title: "Leaderboard",
      description: "Compete with others and climb the rankings",
      link: "/leaderboard",
      color: "yellow",
      testId: "link-leaderboard"
    },
    {
      icon: Sparkles,
      title: "AI Features",
      description: "Get personalized workout & meal recommendations",
      link: "/subscription",
      color: "pink",
      badge: "Premium",
      testId: "link-premium"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: "from-red-500 to-red-700 hover:from-red-600 hover:to-red-800",
      blue: "from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800",
      green: "from-green-500 to-green-700 hover:from-green-600 hover:to-green-800",
      purple: "from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800",
      yellow: "from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800",
      pink: "from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800"
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  return (
    <div className="font-inter bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <NavigationHeader />
      <MobileNavigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Welcome Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent" data-testid="text-welcome">
            Welcome to FlexFlow
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-6" data-testid="text-tagline">
            Your complete fitness tracking companion
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-500 max-w-2xl mx-auto" data-testid="text-description">
            Track workouts, monitor progress, compete on leaderboards, and use GPS to automatically count your miles. 
            Upgrade to Premium for AI-powered workout and meal recommendations.
          </p>
        </div>

        {/* Quick Stats Overview */}
        <QuickStats />

        {/* Features Grid */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center" data-testid="text-features-heading">
            What You Can Do
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} href={feature.link}>
                  <Card 
                    className={`bg-gradient-to-br ${getColorClasses(feature.color)} border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group h-full`}
                    data-testid={feature.testId}
                  >
                    <CardContent className="p-6 text-white h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                          <Icon size={28} />
                        </div>
                        {feature.badge && (
                          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-white/90 text-sm mb-4 flex-grow">{feature.description}</p>
                      <div className="flex items-center text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Get Started <ChevronRight size={16} className="ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Getting Started Tips */}
        <Card className="mt-12 bg-gradient-to-br from-gray-800 to-black border border-red-500/30">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-red-400" data-testid="text-tips-heading">
              🚀 Quick Start Guide
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-red-300 mb-3">For Beginners:</h3>
                <ol className="space-y-2 text-gray-300">
                  <li className="flex items-start" data-testid="text-tip-1">
                    <span className="text-red-400 font-bold mr-2">1.</span>
                    <span>Click <strong>Log Workouts</strong> to record your first exercise</span>
                  </li>
                  <li className="flex items-start" data-testid="text-tip-2">
                    <span className="text-red-400 font-bold mr-2">2.</span>
                    <span>Visit <strong>Set Goals</strong> to define your fitness targets</span>
                  </li>
                  <li className="flex items-start" data-testid="text-tip-3">
                    <span className="text-red-400 font-bold mr-2">3.</span>
                    <span>Check <strong>View Progress</strong> to see your stats and charts</span>
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-300 mb-3">Popular Features:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start" data-testid="text-feature-1">
                    <span className="text-blue-400 mr-2">📍</span>
                    <span><strong>Mile Tracker</strong> uses GPS to auto-count miles while running</span>
                  </li>
                  <li className="flex items-start" data-testid="text-feature-2">
                    <span className="text-yellow-400 mr-2">🏆</span>
                    <span><strong>Leaderboard</strong> shows real user rankings - compete to be #1!</span>
                  </li>
                  <li className="flex items-start" data-testid="text-feature-3">
                    <span className="text-pink-400 mr-2">✨</span>
                    <span><strong>Premium AI</strong> provides personalized workout & meal plans</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Auto-open Profile Editor for new users */}
      <ProfileEditor 
        isOpen={showProfileEditor} 
        setIsOpen={setShowProfileEditor}
      />
    </div>
  );
}
