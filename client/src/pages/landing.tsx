import { Activity, Play, Users, Star, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur">
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
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
            Your Complete
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary block">
              Fitness Journey
            </span>
            Starts Here
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track workouts, connect with personal trainers, scan food for nutrition, 
            compete with friends, and achieve your fitness goals with FlexFlow.
          </p>

          <div className="space-y-4">
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <a href="/api/login">
                <Play className="mr-2" size={20} />
                Get Started Free
              </a>
            </Button>
            <p className="text-sm text-gray-500">30-day free trial</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
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
        <div className="text-center mt-20 p-8 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white">
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
      <footer className="border-t bg-white/80 dark:bg-gray-800/80 backdrop-blur py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            CEO Steven Bates Jr
          </p>
        </div>
      </footer>
    </div>
  );
}