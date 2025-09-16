import { Activity, Play, Users, Star, Clock, Shield, Target, BarChart3, Utensils, Brain, Dumbbell } from "lucide-react";
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
          
          <p className="text-2xl font-bold text-black mb-4">
            Eat Clean, Think Smart, Train HARD!
          </p>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            FlexFlow is your all-in-one fitness companion featuring AI-powered workout recommendations, 
            personalized meal planning, progress tracking, and a supportive community to help you reach 
            your health and fitness goals faster than ever before.
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

        {/* App Features Section */}
        <div className="relative z-10 mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Complete Fitness Ecosystem</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to transform your health and fitness journey in one powerful application
            </p>
          </div>

          {/* Core Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 rounded-2xl bg-black border border-red-600/30 shadow-lg shadow-red-600/20">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="text-red-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Smart Workout Tracking</h3>
              <p className="text-gray-300 text-sm">
                Log exercises with sets, reps, and weights. AI automatically adjusts workout difficulty 
                based on your performance and progress patterns.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-black border border-red-600/30 shadow-lg shadow-red-600/20">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="text-red-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">AI-Powered Plans</h3>
              <p className="text-gray-300 text-sm">
                Get personalized workout and nutrition plans based on your age, goals, fitness level, 
                and preferences. Plans adapt as you progress.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-black border border-red-600/30 shadow-lg shadow-red-600/20">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-red-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Advanced Analytics</h3>
              <p className="text-gray-300 text-sm">
                Track strength gains, endurance improvements, and body composition changes with 
                detailed charts and performance insights.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-black border border-red-600/30 shadow-lg shadow-red-600/20">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="text-red-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Personalized Nutrition</h3>
              <p className="text-gray-300 text-sm">
                Custom meal plans with calorie and macro tracking. Barcode scanner for easy food logging 
                and recipe recommendations based on your dietary goals.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-black border border-red-600/30 shadow-lg shadow-red-600/20">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-red-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Activity Tracking</h3>
              <p className="text-gray-300 text-sm">
                Built-in mile tracker with GPS integration, workout timers, and comprehensive 
                activity monitoring for running, walking, and cardio sessions.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-black border border-red-600/30 shadow-lg shadow-red-600/20">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-red-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Social Community</h3>
              <p className="text-gray-300 text-sm">
                Connect with fitness enthusiasts, compete on leaderboards, share achievements, 
                and get motivated by a supportive community.
              </p>
            </div>
          </div>

          {/* Premium Features Section */}
          <div className="bg-gradient-to-r from-red-600/10 to-red-800/10 rounded-2xl p-8 border border-red-600/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-red-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium Features</h3>
              <p className="text-gray-300">Unlock the full potential of your fitness journey</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Star className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-white">Advanced Meal Planning</h4>
                  <p className="text-gray-300 text-sm">Custom recipes, shopping lists, and nutrition coaching</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Target className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-white">Personal Training</h4>
                  <p className="text-gray-300 text-sm">Connect with certified trainers and book sessions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <BarChart3 className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-white">Deep Analytics</h4>
                  <p className="text-gray-300 text-sm">Detailed body composition tracking and trend analysis</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="text-purple-500 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-white">Priority Support</h4>
                  <p className="text-gray-300 text-sm">24/7 customer support and exclusive features access</p>
                </div>
              </div>
            </div>
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
      <footer className="relative z-10 border-t bg-black/90 backdrop-blur py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Activity className="text-red-600" size={24} />
              <span className="text-white font-semibold">FlexFlow</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <a 
                href="/terms-of-service" 
                className="text-gray-300 hover:text-white transition-colors text-sm"
                data-testid="terms-link"
              >
                Terms of Service
              </a>
              <a 
                href="/privacy-policy" 
                className="text-gray-300 hover:text-white transition-colors text-sm"
                data-testid="privacy-link"
              >
                Privacy Policy
              </a>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © 2024 FlexFlow. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                CEO Steven Bates Jr
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}