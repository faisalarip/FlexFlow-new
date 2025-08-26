import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";

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

// Stripe Buy Button Component
const StripeBuyButton = () => {
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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>💳 Secure Checkout</CardTitle>
              <CardDescription>
                Click below to subscribe with Stripe's secure payment system
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <StripeBuyButton />
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
                  <span className="font-semibold text-2xl">$10.00</span>
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
                  Secure payment processed by Stripe.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}