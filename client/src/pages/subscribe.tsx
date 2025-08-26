import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";

// Extend JSX types to include Stripe buy button
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

// Stripe Buy Button Script Loader
const loadStripeScript = () => {
  if (document.getElementById('stripe-buy-button-script')) {
    return; // Script already loaded
  }
  
  const script = document.createElement('script');
  script.id = 'stripe-buy-button-script';
  script.async = true;
  script.src = 'https://js.stripe.com/v3/buy-button.js';
  document.head.appendChild(script);
};

// Stripe Buy Button Component for Premium Monthly
const StripeBuyButtonPremium = () => {
  useEffect(() => {
    loadStripeScript();
  }, []);

  return (
    <div className="stripe-buy-button-container">
      <stripe-buy-button
        buy-button-id="buy_btn_1S0D80D5Ue5ytgHWLCHlU78G"
        publishable-key="pk_live_51RydqBD5Ue5ytgHWpjOJg39P8VJu0EJMTBHZfdtZCSfRkf7EelPmERe5jat5DVUiIhfE1yDnyGVeBs9arKDQn8nZ00sMOvjEja"
      >
      </stripe-buy-button>
    </div>
  );
};

// Stripe Buy Button Component for Premium Annual
const StripeBuyButtonAnnual = () => {
  useEffect(() => {
    loadStripeScript();
  }, []);

  return (
    <div className="stripe-buy-button-container">
      <stripe-buy-button
        buy-button-id="buy_btn_1S0D64D5Ue5ytgHWvbMKX18b"
        publishable-key="pk_live_51RydqBD5Ue5ytgHWpjOJg39P8VJu0EJMTBHZfdtZCSfRkf7EelPmERe5jat5DVUiIhfE1yDnyGVeBs9arKDQn8nZ00sMOvjEja"
      >
      </stripe-buy-button>
    </div>
  );
};

export default function Subscribe() {
  useEffect(() => {
    loadStripeScript();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscribe to FlexFlow Premium</h1>
          <p className="text-gray-600">Upgrade to premium and unlock all features</p>
        </div>

        <div className="space-y-8">
          {/* Subscription Plans */}
          <div className="max-w-2xl mx-auto">
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-full grid-cols-2" data-testid="subscription-tabs">
                <TabsTrigger value="monthly" data-testid="tab-monthly-25">Monthly $25</TabsTrigger>
                <TabsTrigger value="annual" data-testid="tab-monthly-special">Monthly Special</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monthly" className="mt-6">
                <Card className="relative">
                  <CardHeader>
                    <CardTitle>Monthly Premium - $25</CardTitle>
                    <CardDescription>Perfect for getting started</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <StripeBuyButtonPremium />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="annual" className="mt-6">
                <Card className="relative">
                  <CardHeader>
                    <CardTitle>Monthly Premium - Special Offer</CardTitle>
                    <CardDescription>Best value for committed users</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <StripeBuyButtonAnnual />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Premium Features</CardTitle>
              <CardDescription>Everything you need to reach your fitness goals</CardDescription>
            </CardHeader>
            <CardContent>

              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                    Unlimited workout logging & tracking
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                    Advanced analytics & progress reports
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                    Personal trainer booking & sessions
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                    Custom meal plans & nutrition tracking
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                    AI-powered food scanning
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                    Priority customer support
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                    Access to community features
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                    Cancel anytime, no commitments
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-center mt-6">
                <p className="text-sm text-blue-800">
                  🔒 Secure payment processed by Stripe
                  <br />
                  💳 All major credit cards accepted
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}