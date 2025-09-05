import { Activity, Play, Users, Star, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-black hexagon-bg hexagon-pattern overflow-hidden">
      {/* Hexagonal background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-28 opacity-20 animate-pulse" style={{animationDuration: '6s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#dc2626" strokeWidth="2" opacity="0.3"/>
          </svg>
        </div>
        <div className="absolute top-40 right-16 w-24 h-21 opacity-15 animate-bounce" style={{animationDuration: '8s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="1" opacity="0.4"/>
          </svg>
        </div>
        <div className="absolute top-96 left-1/4 w-28 h-24 opacity-25 animate-ping" style={{animationDuration: '10s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#000000" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
          </svg>
        </div>
        <div className="absolute bottom-80 right-1/3 w-20 h-17 opacity-30 animate-bounce" style={{animationDuration: '7s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#000000" strokeWidth="1" opacity="0.5"/>
          </svg>
        </div>
        <div className="absolute bottom-40 left-20 w-36 h-31 opacity-20 animate-pulse" style={{animationDuration: '9s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.3"/>
          </svg>
        </div>
        <div className="absolute top-1/3 right-1/4 w-26 h-22 opacity-15 animate-ping" style={{animationDuration: '12s'}}>
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#000000" stroke="#dc2626" strokeWidth="1" opacity="0.4"/>
          </svg>
        </div>
      </div>
      {/* Header */}
      <header className="relative z-10 px-4 lg:px-6 h-14 flex items-center border-b bg-black/90 border-red-600/30 backdrop-blur">
        <div className="flex items-center space-x-2">
          <Activity className="text-red-600" size={32} />
          <h1 className="text-xl font-bold text-white">FlexFlow</h1>
        </div>
        <div className="ml-auto">
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Your Complete
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 block">
              Fitness Journey
            </span>
            Starts Here
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track workouts, compete with friends, and achieve your fitness goals with FlexFlow.
          </p>

          <div className="space-y-4">
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <a href="/onboarding">
                <Play className="mr-2" size={20} />
                Get Started Free
              </a>
            </Button>
            <p className="text-sm text-gray-400">7-day free trial</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="relative z-10 grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6 rounded-2xl bg-black border border-red-600/30 shadow-lg shadow-red-600/20">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="text-red-600" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-white">Workout Tracking</h3>
            <p className="text-gray-300">
              Log exercises, track progress, and hit your fitness goals with detailed analytics.
            </p>
          </div>



          <div className="text-center p-6 rounded-2xl bg-black border border-red-600/30 shadow-lg shadow-red-600/20">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-red-600" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-white">Mile Tracker</h3>
            <p className="text-gray-300">
              Track running and walking with timer functionality and detailed pace analytics.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-black border border-red-600/30 shadow-lg shadow-red-600/20">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-red-600" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-white">Community</h3>
            <p className="text-gray-300">
              Share progress, compete on leaderboards, and stay motivated with friends.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-black border border-red-600/30 shadow-lg shadow-red-600/20">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-red-600" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-white">Premium Features</h3>
            <p className="text-gray-300">
              Unlock meal plans, advanced analytics, and priority features.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative z-10 text-center mt-20 p-8 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Fitness?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of users already achieving their goals with FlexFlow
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
            <a href="/api/login">
              <Play className="mr-2" size={20} />
              Start Your Journey
            </a>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-white/80 dark:bg-gray-800/80 backdrop-blur py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            CEO Steven Bates Jr
          </p>
        </div>
      </footer>
    </div>
  );
}