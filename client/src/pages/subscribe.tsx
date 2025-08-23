import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    // Ensure payment method is complete before submission
    const { error: submitError } = await elements.submit();
    if (submitError) {
      toast({
        title: "Payment Information Required",
        description: "Please complete all required payment fields.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?subscription=success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subscription Successful",
        description: "Welcome to FlexFlow Premium! Your subscription is now active.",
      });
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="text-sm text-gray-700 font-medium">
          Enter your payment information:
        </div>
        <PaymentElement 
          options={{
            fields: {
              billingDetails: {
                email: 'never',
                phone: 'never',
                address: 'never'
              }
            }
          }}
        />
        <div className="text-xs text-gray-500">
          ✓ Your card will be charged $15.00 monthly
          <br />
          ✓ Secure encryption protects your payment data
          <br />
          ✓ Cancel anytime from your account settings
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || !elements || isProcessing}
        data-testid="subscribe-button"
      >
        {isProcessing ? "Processing Payment..." : "Pay $15/month & Subscribe"}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Create subscription as soon as the page loads
    apiRequest("POST", "/api/get-or-create-subscription")
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to create subscription');
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Subscription error:', error);
        toast({
          title: "Error",
          description: "Failed to initialize subscription. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      });
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Subscription initialization failed. Please try again.</p>
            <Button asChild className="w-full mt-4">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscribe to FlexFlow Premium</h1>
          <p className="text-gray-600">Start your 10-day free trial with unlimited access to all premium features</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 text-sm font-medium">
              🎉 10-Day Free Trial: Enter your payment info to start your 10-day trial. You'll be charged $15/month automatically after the trial ends.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>💳 Payment Required</CardTitle>
              <CardDescription>
                Enter your credit or debit card information to activate your $15/month subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm />
              </Elements>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle>Premium Subscription</CardTitle>
              <CardDescription>Monthly billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">FlexFlow Premium</h3>
                  <p className="text-sm text-gray-500">
                    Billed monthly, cancel anytime
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-2xl">$9.99</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">Premium Features:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-green-700">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    Unlimited workout logging & tracking
                  </li>
                  <li className="flex items-center text-sm text-green-700">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    Advanced analytics & progress reports
                  </li>
                  <li className="flex items-center text-sm text-green-700">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    Personal trainer booking & sessions
                  </li>
                  <li className="flex items-center text-sm text-green-700">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    Custom meal plans & nutrition tracking
                  </li>
                  <li className="flex items-center text-sm text-green-700">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    AI-powered food scanning
                  </li>
                  <li className="flex items-center text-sm text-green-700">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    Priority customer support
                  </li>
                  <li className="flex items-center text-sm text-green-700">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    Access to community features
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-xs text-gray-500">
                  Cancel anytime. No long-term commitments.
                  <br />
                  Billing starts immediately upon subscription.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}