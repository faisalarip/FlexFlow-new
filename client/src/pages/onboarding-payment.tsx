import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Shield, CheckCircle, CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Welcome to FlexFlow!",
        description: "Your free trial has started successfully!",
      });
      setLocation('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <PaymentElement />
      </div>
      
      <div className="space-y-4">
        <Button 
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full text-lg py-4"
          data-testid="submit-payment-button"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2" size={20} />
              Start Free Trial
            </>
          )}
        </Button>
        
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Shield className="w-4 h-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>
    </form>
  );
};

export default function OnboardingPayment() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create subscription intent for trial
    apiRequest("POST", "/api/create-trial-subscription")
      .then((res) => res.json())
      .then((data) => {
        // For trials, we might not have a client secret
        setClientSecret(data.clientSecret || "trial_mode");
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error creating subscription:', error);
        setLoading(false);
      });
  }, []);

  const handleBack = () => {
    setLocation('/onboarding/plan');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-16 w-56 h-56 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-full blur-2xl opacity-25 animate-bounce" style={{animationDuration: '4s'}}></div>
        </div>

        <header className="relative z-10 px-4 lg:px-6 h-14 flex items-center border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <div className="flex items-center space-x-2">
            <Activity className="text-primary" size={32} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">FlexFlow</h1>
          </div>
        </header>

        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Setting Up Your Trial</h2>
            <p className="text-gray-600 dark:text-gray-300">Please wait while we prepare your subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle trial mode (no payment required)
  if (clientSecret === "trial_mode") {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-16 w-56 h-56 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-full blur-2xl opacity-25 animate-bounce" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl opacity-15 animate-ping" style={{animationDuration: '6s'}}></div>
        </div>

        <header className="relative z-10 px-4 lg:px-6 h-14 flex items-center border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <div className="flex items-center space-x-2">
            <Activity className="text-primary" size={32} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">FlexFlow</h1>
          </div>
        </header>

        <div className="relative z-10 container mx-auto px-4 py-16 max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="text-green-500 w-16 h-16" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Your Trial is Ready!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Start your 10-day free trial now - no payment required upfront
            </p>
          </div>

          <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-xl">
            <CardHeader className="text-center">
              <Badge className="mx-auto mb-2 bg-green-100 text-green-800 border-green-200">
                10-Day Free Trial
              </Badge>
              <CardTitle className="text-2xl">FlexFlow Premium</CardTitle>
              <CardDescription>
                Full access to all features during your trial period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Unlimited personalized workouts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Personal trainer consultations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>AI-powered meal planning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Advanced progress analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Community challenges & leaderboards</span>
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $0.00 <span className="text-lg font-normal text-gray-500">for 10 days</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Then $19.99/month • Cancel anytime
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full text-lg py-4 mb-4" 
                onClick={() => setLocation('/dashboard')}
                data-testid="start-trial-button"
              >
                <CheckCircle className="mr-2" size={20} />
                Start My Free Trial
              </Button>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>No credit card required • Cancel anytime</span>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center space-x-2"
              data-testid="back-button"
            >
              <ArrowLeft size={16} />
              <span>Back to Plan</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <header className="relative z-10 px-4 lg:px-6 h-14 flex items-center border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <div className="flex items-center space-x-2">
            <Activity className="text-primary" size={32} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">FlexFlow</h1>
          </div>
        </header>

        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unable to Process</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">We're having trouble setting up your subscription. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-16 w-56 h-56 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-full blur-2xl opacity-25 animate-bounce" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl opacity-15 animate-ping" style={{animationDuration: '6s'}}></div>
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Start Your Free Trial
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            No commitment • Cancel anytime during your 10-day free trial
          </p>
        </div>

        {/* Plan Summary */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-xl">
          <CardHeader className="text-center">
            <Badge className="mx-auto mb-2 bg-green-100 text-green-800 border-green-200">
              10-Day Free Trial
            </Badge>
            <CardTitle className="text-2xl">FlexFlow Premium</CardTitle>
            <CardDescription>
              Full access to all features during your trial period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Unlimited personalized workouts</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Personal trainer consultations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>AI-powered meal planning</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Advanced progress analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Community challenges & leaderboards</span>
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                $0.00 <span className="text-lg font-normal text-gray-500">for 10 days</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Then $19.99/month • Cancel anytime
              </div>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center space-x-2"
            data-testid="back-button"
          >
            <ArrowLeft size={16} />
            <span>Back to Plan</span>
          </Button>
        </div>
      </div>
    </div>
  );
}