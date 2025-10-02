import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Dumbbell, Target, TrendingUp, MapPin, Users, Sparkles, ChevronRight } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import MobileNavigation from "@/components/mobile-navigation";
import QuickStats from "@/components/quick-stats";
import ProfileEditor from "@/components/profile-editor";
import { useNewAuth } from "@/hooks/useNewAuth";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@assets/stock_images/men_and_women_workin_dbbf742b.jpg";
import womanWeights1 from "@assets/stock_images/woman_strength_train_10dee1d1.jpg";
import womanWeights2 from "@assets/stock_images/woman_strength_train_eff6079d.jpg";
import manCardio1 from "@assets/stock_images/man_doing_cardio_run_26f92c48.jpg";
import manCardio2 from "@assets/stock_images/man_doing_cardio_run_1b64af4d.jpg";
import groupFitness1 from "@assets/stock_images/people_group_fitness_14845970.jpg";
import groupFitness2 from "@assets/stock_images/people_group_fitness_0fe8a6fd.jpg";

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
      color: "red-dark",
      testId: "link-workouts"
    },
    {
      icon: MapPin,
      title: "Mile Tracker",
      description: "GPS-powered automatic mile counting for runs",
      link: "/mile-tracker",
      color: "red",
      testId: "link-mile-tracker"
    },
    {
      icon: Target,
      title: "Set Goals",
      description: "Create fitness goals and track your progress",
      link: "/progress",
      color: "red-light",
      testId: "link-goals"
    },
    {
      icon: TrendingUp,
      title: "View Progress",
      description: "See charts and analytics of your fitness journey",
      link: "/progress",
      color: "red-dark",
      testId: "link-progress"
    },
    {
      icon: Users,
      title: "Leaderboard",
      description: "Compete with others and climb the rankings",
      link: "/leaderboard",
      color: "red",
      testId: "link-leaderboard"
    },
    {
      icon: Sparkles,
      title: "AI Features",
      description: "Get personalized workout & meal recommendations",
      link: "/subscription",
      color: "red-light",
      badge: "Premium",
      testId: "link-premium"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      "red": "from-red-500 to-red-700 hover:from-red-600 hover:to-red-800",
      "red-dark": "from-red-700 to-red-900 hover:from-red-800 hover:to-black",
      "red-light": "from-red-400 to-red-600 hover:from-red-500 hover:to-red-700"
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  return (
    <div className="font-inter bg-black text-gray-200 min-h-screen">
      <NavigationHeader />
      <MobileNavigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Welcome Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent" data-testid="text-welcome">
            Welcome to FlexFlow
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-6" data-testid="text-tagline">
            Your complete fitness tracking companion
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8" data-testid="text-description">
            Track workouts, monitor progress, compete on leaderboards, and use GPS to automatically count your miles. 
            Upgrade to Premium for AI-powered workout and meal recommendations.
          </p>
          
          {/* Image Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <img 
              src={heroImage} 
              alt="Men and women working out together" 
              className="w-full h-48 object-cover rounded-xl shadow-lg shadow-red-900/50 border border-red-500/30 hover:scale-105 transition-transform"
              data-testid="img-hero-1"
            />
            <img 
              src={womanWeights1} 
              alt="Woman strength training with weights" 
              className="w-full h-48 object-cover rounded-xl shadow-lg shadow-red-900/50 border border-red-500/30 hover:scale-105 transition-transform"
              data-testid="img-hero-2"
            />
            <img 
              src={manCardio1} 
              alt="Man doing cardio running" 
              className="w-full h-48 object-cover rounded-xl shadow-lg shadow-red-900/50 border border-red-500/30 hover:scale-105 transition-transform"
              data-testid="img-hero-3"
            />
            <img 
              src={groupFitness1} 
              alt="Group fitness class" 
              className="w-full h-48 object-cover rounded-xl shadow-lg shadow-red-900/50 border border-red-500/30 hover:scale-105 transition-transform"
              data-testid="img-hero-4"
            />
            <img 
              src={womanWeights2} 
              alt="Woman weightlifting in gym" 
              className="w-full h-48 object-cover rounded-xl shadow-lg shadow-red-900/50 border border-red-500/30 hover:scale-105 transition-transform"
              data-testid="img-hero-5"
            />
            <img 
              src={manCardio2} 
              alt="Man fitness exercise" 
              className="w-full h-48 object-cover rounded-xl shadow-lg shadow-red-900/50 border border-red-500/30 hover:scale-105 transition-transform"
              data-testid="img-hero-6"
            />
            <img 
              src={groupFitness2} 
              alt="People group workout" 
              className="w-full h-48 object-cover rounded-xl shadow-lg shadow-red-900/50 border border-red-500/30 hover:scale-105 transition-transform"
              data-testid="img-hero-7"
            />
            <div className="w-full h-48 bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg shadow-red-900/50 border border-red-500/30 flex items-center justify-center hover:scale-105 transition-transform">
              <div className="text-center text-white px-4">
                <Dumbbell size={48} className="mx-auto mb-3" />
                <p className="font-bold text-lg">Start Your Journey</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <QuickStats />

        {/* Features Grid */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-400" data-testid="text-features-heading">
            What You Can Do
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isLogWorkouts = feature.title === "Log Workouts";
              const isMileTracker = feature.title === "Mile Tracker";
              
              return (
                <Link key={feature.title} href={feature.link}>
                  <Card 
                    className={`relative overflow-hidden bg-gradient-to-br ${getColorClasses(feature.color)} border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group h-full`}
                    data-testid={feature.testId}
                  >
                    {isLogWorkouts && (
                      <>
                        <div className="absolute inset-0">
                          <img 
                            src={heroImage} 
                            alt="Workout background" 
                            className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 to-black/90"></div>
                        </div>
                      </>
                    )}
                    {isMileTracker && (
                      <>
                        <div className="absolute inset-0">
                          <img 
                            src={manCardio1} 
                            alt="Running background" 
                            className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-red-600/80 to-red-900/90"></div>
                        </div>
                      </>
                    )}
                    <CardContent className="relative p-6 text-white h-full flex flex-col">
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
        <Card className="mt-12 bg-gradient-to-br from-red-950/30 to-black border border-red-500/50 shadow-lg shadow-red-500/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-red-400" data-testid="text-tips-heading">
              🚀 Quick Start Guide
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-red-300 mb-3">For Beginners:</h3>
                <ol className="space-y-2 text-gray-300">
                  <li className="flex items-start" data-testid="text-tip-1">
                    <span className="text-red-500 font-bold mr-2">1.</span>
                    <span>Click <strong className="text-red-400">Log Workouts</strong> to record your first exercise</span>
                  </li>
                  <li className="flex items-start" data-testid="text-tip-2">
                    <span className="text-red-500 font-bold mr-2">2.</span>
                    <span>Visit <strong className="text-red-400">Set Goals</strong> to define your fitness targets</span>
                  </li>
                  <li className="flex items-start" data-testid="text-tip-3">
                    <span className="text-red-500 font-bold mr-2">3.</span>
                    <span>Check <strong className="text-red-400">View Progress</strong> to see your stats and charts</span>
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-300 mb-3">Popular Features:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start" data-testid="text-feature-1">
                    <span className="text-red-400 mr-2">📍</span>
                    <span><strong className="text-red-400">Mile Tracker</strong> uses GPS to auto-count miles while running</span>
                  </li>
                  <li className="flex items-start" data-testid="text-feature-2">
                    <span className="text-red-400 mr-2">🏆</span>
                    <span><strong className="text-red-400">Leaderboard</strong> shows real user rankings - compete to be #1!</span>
                  </li>
                  <li className="flex items-start" data-testid="text-feature-3">
                    <span className="text-red-400 mr-2">✨</span>
                    <span><strong className="text-red-400">Premium AI</strong> provides personalized workout & meal plans</span>
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
