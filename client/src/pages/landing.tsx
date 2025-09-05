import { Activity, Play, Users, Star, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Full page animated background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-16 w-56 h-56 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-full blur-2xl opacity-25 animate-bounce" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-96 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl opacity-15 animate-ping" style={{animationDuration: '6s'}}></div>
        <div className="absolute top-60 left-1/2 w-48 h-48 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-20 animate-pulse" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-80 right-1/3 w-40 h-40 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full blur-3xl opacity-30 animate-bounce" style={{animationDuration: '5s'}}></div>
        <div className="absolute bottom-40 left-20 w-60 h-60 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full blur-3xl opacity-25 animate-pulse" style={{animationDuration: '7s'}}></div>
        <div className="absolute bottom-20 right-10 w-44 h-44 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full blur-2xl opacity-20 animate-bounce" style={{animationDuration: '4.5s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-52 h-52 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full blur-3xl opacity-15 animate-ping" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-36 h-36 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-2xl opacity-25 animate-pulse" style={{animationDuration: '3.5s'}}></div>
      </div>
      {/* Header */}
      <header className="relative z-10 px-4 lg:px-6 h-14 flex items-center border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur">
        <div className="flex items-center space-x-2">
          <Activity className="text-primary" size={32} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">FlexFlow</h1>
        </div>
        <div className="ml-auto">
          <Button asChild>
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
            Your Complete
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary block">
              Fitness Journey
            </span>
            Starts Here
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track workouts, compete with friends, and achieve your fitness goals with FlexFlow.
          </p>

          <div className="space-y-4">
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <a href="/onboarding">
                <Play className="mr-2" size={20} />
                Get Started Free
              </a>
            </Button>
            <p className="text-sm text-gray-500">10-day free trial</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="relative z-10 grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="text-primary" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Workout Tracking</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Log exercises, track progress, and hit your fitness goals with detailed analytics.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-secondary" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Personal Trainers</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with certified trainers for personalized coaching and guidance.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-accent" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI Food Scanner</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Scan food with your camera for instant nutrition tracking and calorie counting.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-primary" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Mile Tracker</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track running and walking with timer functionality and detailed pace analytics.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-secondary" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Community</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share progress, compete on leaderboards, and stay motivated with friends.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-accent" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Premium Features</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Unlock meal plans, advanced analytics, and priority trainer bookings.
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