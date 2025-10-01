import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";

export default function Subscribe() {

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscribe to FlexFlow Premium</h1>
          <p className="text-gray-600">Upgrade to premium and unlock all features</p>
        </div>

        <div className="space-y-8">
          {/* Subscription Plans */}
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-600">
              Premium subscription features are managed through your account settings.
            </p>
            <Link href="/user-subscription">
              <Button className="mt-4">
                View Subscription Options
              </Button>
            </Link>
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