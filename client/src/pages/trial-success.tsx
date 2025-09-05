import { useEffect } from "react";
import { Activity, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Declare the stripe-buy-button element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': {
        'buy-button-id': string;
        'publishable-key': string;
      };
    }
  }
}

export default function TrialSuccess() {
  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
    
    if (!existingScript) {
      // Load Stripe buy button script
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/buy-button.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      // Add error handling
      script.onerror = (error) => {
        console.error('Failed to load Stripe script:', error);
      };
      
      script.onload = () => {
        console.log('Stripe script loaded successfully');
      };
      
      document.head.appendChild(script);
    }

    // Check if user came from successful subscription
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // Redirect to create account after successful trial activation
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
    }
  }, []);


  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-16 w-56 h-56 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-full blur-2xl opacity-25 animate-bounce" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl opacity-15 animate-ping" style={{animationDuration: '6s'}}></div>
        <div className="absolute top-60 left-1/2 w-48 h-48 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-20 animate-pulse" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-80 right-1/3 w-40 h-40 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full blur-3xl opacity-30 animate-bounce" style={{animationDuration: '5s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 lg:px-6 h-14 flex items-center border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur">
        <div className="flex items-center space-x-2">
          <Activity className="text-primary" size={32} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">FlexFlow</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <CheckCircle className="text-green-500 w-24 h-24 animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Welcome to FlexFlow!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your 7-day free trial has started successfully!
          </p>
        </div>

        {/* Success Card */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-700 dark:text-green-400">
              Trial Activated
            </CardTitle>
            <CardDescription>
              You now have full access to all FlexFlow premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-green-800 dark:text-green-300">
                    Full Premium Access
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Unlimited workouts, meal plans, and trainer consultations
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-blue-800 dark:text-blue-300">
                    7 Days Free
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    No charges until your trial expires
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-purple-800 dark:text-purple-300">
                    Cancel Anytime
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">
                    No commitment - cancel before trial ends if not satisfied
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
              <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                What's Next?
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Create your account to access your personalized dashboard and start your fitness journey
              </div>
            </div>

            <div className="w-full" data-testid="stripe-buy-button-container">
              <stripe-buy-button
                buy-button-id="buy_btn_1S0D64D5Ue5ytgHWvbMKX18b"
                publishable-key="pk_live_51RydqBD5Ue5ytgHWpjOJg39P8VJu0EJMTBHZfdtZCSfRkf7EelPmERe5jat5DVUiIhfE1yDnyGVeBs9arKDQn8nZ00sMOvjEja"
              >
              </stripe-buy-button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Need help? Contact our support team anytime during your trial.</p>
        </div>
      </div>
    </div>
  );
}