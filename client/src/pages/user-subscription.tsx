import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, CreditCard, CheckCircle, XCircle, AlertCircle, Gift, Star, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

  const { data: subscriptionData, isLoading } = useQuery<UserSubscriptionStatus>({
    queryKey: ["/api/user/subscription"],
    retry: false,
  });

  const activateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/subscription/activate", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
      toast({
        title: "Subscription Activated",
        description: "Your FlexFlow Premium subscription is now active!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate subscription",
        variant: "destructive",
      });
    },
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
        description: "Your subscription has been cancelled. You can continue using FlexFlow until your current period ends.",
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Unable to load subscription
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  There was an error loading your subscription information.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">FlexFlow Premium</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your subscription and unlock premium features</p>
          </div>
          <Badge className={getStatusColor(subscriptionData.subscriptionStatus, subscriptionData.isActive, subscriptionData.isFreeTrialActive)}>
            {getStatusIcon(subscriptionData.subscriptionStatus, subscriptionData.isActive, subscriptionData.isFreeTrialActive)}
            <span className="ml-1">{getStatusText(subscriptionData.subscriptionStatus, subscriptionData.isFreeTrialActive)}</span>
          </Badge>
        </div>

        {/* Free Trial Banner */}
        {subscriptionData.isFreeTrialActive && (
          <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Gift className="text-blue-600 mr-3" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Free Trial Active! 🎉
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300">
                      You have {subscriptionData.daysRemaining} days remaining in your free trial
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {subscriptionData.daysRemaining}
                  </div>
                  <div className="text-sm text-blue-600">Days Left</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              {getStatusIcon(subscriptionData.subscriptionStatus, subscriptionData.isActive, subscriptionData.isFreeTrialActive)}
              <span className="ml-2">Subscription Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Plan</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscriptionData.isFreeTrialActive ? "Free Trial" : subscriptionData.subscriptionStatus === "active" ? "Premium" : "Free"}
                </p>
                {subscriptionData.isActive && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subscriptionData.daysRemaining > 0 ? `${subscriptionData.daysRemaining} days remaining` : "Expired"}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Monthly Price</h3>
                <p className="text-2xl font-bold text-green-600">
                  {subscriptionData.isFreeTrialActive ? "$0.00" : "$15.00"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subscriptionData.isFreeTrialActive ? "Free trial period" : "Per month"}
                </p>
              </div>

              {subscriptionData.subscriptionStartDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Started</h3>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {format(new Date(subscriptionData.subscriptionStartDate), "MMM d, yyyy")}
                  </p>
                </div>
              )}

              {subscriptionData.lastPaymentDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Payment</h3>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {format(new Date(subscriptionData.lastPaymentDate), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">$15.00</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="text-yellow-500 mr-2" size={20} />
              Premium Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Unlimited workout tracking</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Advanced progress analytics</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">AI-powered food scanning</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Personal trainer bookings</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Custom meal plans</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Mile tracking with GPS</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Community features</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Priority customer support</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {subscriptionData.isFreeTrialActive && (
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Upgrade to Premium
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Continue enjoying all features after your free trial for just $15/month
                    </p>
                  </div>
                  <Button 
                    size="lg"
                    asChild
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Link href="/subscribe">
                      <CreditCard size={16} className="mr-2" />
                      Subscribe for $15/mo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!subscriptionData.isActive && !subscriptionData.isFreeTrialActive && (
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Reactivate Premium
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Get back access to all premium features for $15/month
                    </p>
                  </div>
                  <Button 
                    size="lg"
                    asChild
                  >
                    <Link href="/subscribe">
                      <DollarSign size={16} className="mr-2" />
                      Reactivate Premium
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {subscriptionData.subscriptionStatus === "active" && (
            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Manage Subscription
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your subscription will auto-renew monthly. Cancel anytime.
                    </p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => cancelSubscriptionMutation.mutate()}
                    disabled={cancelSubscriptionMutation.isPending}
                  >
                    {cancelSubscriptionMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Warning for expired subscription */}
        {subscriptionData.subscriptionStatus === "expired" && (
          <Card className="mt-6 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertCircle className="text-red-600 mr-3" size={20} />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
                    Subscription Expired
                  </h3>
                  <p className="text-red-700 dark:text-red-400">
                    Your subscription has expired. Some features may be limited until you reactivate.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}