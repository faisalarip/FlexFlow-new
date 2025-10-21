import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle, XCircle, AlertCircle, Gift, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StripeCheckout from "@/components/stripe-checkout";
import { useState } from "react";

interface UserSubscriptionStatus {
  subscriptionStatus: string;
  subscriptionStartDate?: string;
  lastPaymentDate?: string;
  subscriptionExpiresAt?: string;
  isActive: boolean;
  isFreeTrialActive: boolean;
  daysRemaining: number;
  monthlyFee: number;
}

export default function UserSubscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCheckout, setShowCheckout] = useState(false);

  const { data: subscriptionData, isLoading } = useQuery<UserSubscriptionStatus>({
    queryKey: ["/api/user/subscription"],
    retry: false,
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/subscription/cancel", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string, isActive: boolean, isFreeTrialActive: boolean) => {
    if (isFreeTrialActive) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
    if (isActive) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    }
    switch (status) {
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  const getStatusIcon = (status: string, isActive: boolean, isFreeTrialActive: boolean) => {
    if (isFreeTrialActive) return <Gift size={20} className="text-blue-600" />;
    if (isActive) return <CheckCircle size={20} className="text-green-600" />;
    if (status === "expired") return <XCircle size={20} className="text-red-600" />;
    return <AlertCircle size={20} className="text-gray-600" />;
  };

  const getStatusText = (status: string, isFreeTrialActive: boolean) => {
    if (isFreeTrialActive) return "Free Trial";
    switch (status) {
      case "active": return "Premium";
      case "expired": return "Expired";
      case "inactive": return "Inactive";
      default: return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">Unable to load subscription information</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Subscription</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your FlexFlow Premium subscription</p>
          </div>
        </div>

        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(subscriptionData.subscriptionStatus, subscriptionData.isActive, subscriptionData.isFreeTrialActive)}
              <span>Subscription Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(subscriptionData.subscriptionStatus, subscriptionData.isActive, subscriptionData.isFreeTrialActive)}>
                    {getStatusText(subscriptionData.subscriptionStatus, subscriptionData.isFreeTrialActive)}
                  </Badge>
                  {subscriptionData.isFreeTrialActive && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {subscriptionData.daysRemaining} days remaining in trial
                    </span>
                  )}
                </div>

                {subscriptionData.isActive && (
                  <div className="space-y-2">
                    {subscriptionData.subscriptionStartDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Started: {format(new Date(subscriptionData.subscriptionStartDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                    {subscriptionData.subscriptionExpiresAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Expires: {format(new Date(subscriptionData.subscriptionExpiresAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {subscriptionData.isActive && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${subscriptionData.monthlyFee}/mo
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Premium Plan</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Section */}
        {!subscriptionData.isActive && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Upgrade to Premium</CardTitle>
              <CardDescription>Contact us to upgrade your account and unlock all premium features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  <p className="font-medium mb-3">Get Premium features for just $15.99/month:</p>
                  <ul className="space-y-2 ml-4">
                    <li>✓ AI-Powered Workout Planner</li>
                    <li>✓ Personalized Meal Plans</li>
                    <li>✓ Professional Barcode Scanner</li>
                    <li>✓ Advanced Progress Tracking</li>
                    <li>✓ Priority Support</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg" data-testid="button-upgrade-premium">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Upgrade to Premium - $15.99/month
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upgrade to Premium</DialogTitle>
                    <DialogDescription>
                      Complete your payment to unlock all premium features. Apple Pay, Google Pay, and credit cards accepted.
                    </DialogDescription>
                  </DialogHeader>
                  <StripeCheckout
                    onSuccess={() => {
                      setShowCheckout(false);
                      queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
                    }}
                    onCancel={() => setShowCheckout(false)}
                  />
                </DialogContent>
              </Dialog>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                Secure payment powered by Stripe. Cancel anytime.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Cancel Section */}
        {subscriptionData.isActive && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Cancel Subscription</CardTitle>
              <CardDescription>Cancel your premium subscription at any time</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => cancelSubscriptionMutation.mutate()}
                disabled={cancelSubscriptionMutation.isPending}
                data-testid="cancel-subscription-button"
              >
                {cancelSubscriptionMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
