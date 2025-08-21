import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, CreditCard, CheckCircle, XCircle, AlertCircle, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SubscriptionStatus {
  subscriptionStatus: string;
  lastPaymentDate?: string;
  subscriptionExpiresAt?: string;
  isActive: boolean;
  monthlyFee?: number;
}

export default function TrainerSubscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptionData, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/trainer/subscription"],
    retry: false,
  });

  const activateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/trainer/subscription/activate", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainer/subscription"] });
      toast({
        title: "Subscription Activated",
        description: "Your trainer subscription is now active for 30 days!",
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
      const response = await apiRequest("POST", "/api/trainer/subscription/cancel", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainer/subscription"] });
      toast({
        title: "Subscription Cancelled",
        description: "Your trainer subscription has been cancelled.",
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

  const getStatusColor = (status: string, isActive: boolean) => {
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

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (isActive) return <CheckCircle size={20} className="text-green-600" />;
    if (status === "expired") return <XCircle size={20} className="text-red-600" />;
    return <AlertCircle size={20} className="text-gray-600" />;
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
                  Trainer Profile Required
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  You need to create a trainer profile first to manage your subscription.
                </p>
                <Button>
                  Create Trainer Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const daysUntilExpiry = subscriptionData.subscriptionExpiresAt 
    ? Math.ceil((new Date(subscriptionData.subscriptionExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trainer Subscription</h1>
          <Badge className={getStatusColor(subscriptionData.subscriptionStatus, subscriptionData.isActive)}>
            {subscriptionData.isActive ? "Active" : subscriptionData.subscriptionStatus}
          </Badge>
        </div>

        {/* Current Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              {getStatusIcon(subscriptionData.subscriptionStatus, subscriptionData.isActive)}
              <span className="ml-2">Subscription Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscriptionData.isActive ? "Active" : "Inactive"}
                </p>
                {subscriptionData.isActive && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : "Expired"}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Monthly Fee</h3>
                <p className="text-2xl font-bold text-green-600">$25.00</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Per month</p>
              </div>

              {subscriptionData.subscriptionExpiresAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Next Payment</h3>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {format(new Date(subscriptionData.subscriptionExpiresAt), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(subscriptionData.subscriptionExpiresAt), "h:mm a")}
                  </p>
                </div>
              )}

              {subscriptionData.lastPaymentDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Payment</h3>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {format(new Date(subscriptionData.lastPaymentDate), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">$25.00</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Benefits */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Trainer Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">Accept and manage client bookings</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">Receive 65% of booking payments (35% platform fee)</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">Create and manage multiple service offerings</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">Profile visibility in trainer marketplace</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">Access to review and rating system</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!subscriptionData.isActive && (
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Activate Your Subscription
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Start accepting bookings and earning with a $25/month subscription
                    </p>
                  </div>
                  <Button 
                    size="lg"
                    onClick={() => activateSubscriptionMutation.mutate()}
                    disabled={activateSubscriptionMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard size={16} className="mr-2" />
                    {activateSubscriptionMutation.isPending ? "Processing..." : "Pay $25 & Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {subscriptionData.isActive && (
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
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => activateSubscriptionMutation.mutate()}
                      disabled={activateSubscriptionMutation.isPending}
                    >
                      <DollarSign size={16} className="mr-2" />
                      {activateSubscriptionMutation.isPending ? "Processing..." : "Renew Now"}
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => cancelSubscriptionMutation.mutate()}
                      disabled={cancelSubscriptionMutation.isPending}
                    >
                      {cancelSubscriptionMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
                    </Button>
                  </div>
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
                    Your subscription has expired. Clients cannot book new sessions until you renew.
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