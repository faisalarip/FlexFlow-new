import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Calendar, CheckCircle, XCircle, AlertCircle, Gift, Sparkles, Zap, Crown, Star, TrendingUp, Heart, Award, Target } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerPlugin, Capacitor } from "@capacitor/core";

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
  const SubscriptionPlugin = Capacitor.isNativePlatform() ? registerPlugin<any>('SubscriptionPlugin') : null;
  const [nativeProducts, setNativeProducts] = useState<any[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      if (!Capacitor.isNativePlatform() || !SubscriptionPlugin) return;
      try {
        const productIdsEnv = import.meta.env.VITE_IAP_PRODUCT_IDS as string | undefined;
        const productIds = productIdsEnv
          ? productIdsEnv.split(',').map(s => s.trim()).filter(Boolean)
          : ['FlexFlow_Fitness_Premium_monthly_15.99'];
        const res = await SubscriptionPlugin.getProducts({ ids: productIds });
        setNativeProducts(res.products || []);
      } catch (e) {
        console.error('Failed to load IAP products', e);
      }
    };
    loadProducts();
  }, []);

  const handlePurchase = async () => {
    if (!SubscriptionPlugin) return;
    try {
      setIsPurchasing(true);
      const envIds = import.meta.env.VITE_IAP_PRODUCT_IDS as string | undefined;
      const firstId = envIds ? envIds.split(',').map(s => s.trim()).filter(Boolean)[0] : 'FlexFlow_Fitness_Premium_monthly_15.99';
      const productId = nativeProducts[0]?.id || firstId;
      const res = await SubscriptionPlugin.purchase({ productId });
      if (res.status === 'success' && res.originalTransactionId) {
        const verify = await apiRequest('POST', '/api/user/subscription/verify-receipt', {
          originalTransactionId: res.originalTransactionId,
        });
        await verify.json();
        queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
        toast({ title: 'Premium Activated', description: 'Your subscription is now active.' });
      } else if (res.status === 'cancelled') {
        toast({ title: 'Purchase Cancelled', description: 'No changes to your subscription.' });
      } else if (res.status === 'pending') {
        toast({ title: 'Pending', description: 'Your purchase is pending approval.' });
      }
    } catch (e: any) {
      toast({ title: 'Purchase Failed', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!SubscriptionPlugin) return;
    try {
      setIsPurchasing(true);
      const res = await SubscriptionPlugin.restore();
      const entitlements = res.entitlements || [];
      if (entitlements.length > 0 && entitlements[0].originalTransactionId) {
        const verify = await apiRequest('POST', '/api/user/subscription/verify-receipt', {
          originalTransactionId: entitlements[0].originalTransactionId,
        });
        await verify.json();
        queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
        toast({ title: 'Restored', description: 'Your subscription has been restored.' });
      } else {
        toast({ title: 'No Purchases', description: 'No active purchases were found.' });
      }
    } catch (e: any) {
      toast({ title: 'Restore Failed', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsPurchasing(false);
    }
  };
  
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

  const premiumFeatures = [
    {
      icon: Sparkles,
      title: "AI Workout Planner",
      description: "Get personalized workout plans tailored to your goals",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "AI Meal Plans",
      description: "Custom nutrition plans based on your preferences",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Barcode Scanner",
      description: "Instantly log food with professional scanning",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Deep insights into your progress and trends",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Award,
      title: "Priority Support",
      description: "Get help faster with premium support",
      color: "from-red-500 to-rose-500"
    },
    {
      icon: Heart,
      title: "Unlimited Everything",
      description: "No limits on tracking, plans, or features",
      color: "from-pink-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-red-950 p-4 md:p-6 pb-24 md:pb-8 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl lg:desktop-fade-in mobile-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl lg:desktop-fade-in mobile-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl lg:desktop-fade-in mobile-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 relative z-10">
        {/* Hero Header - mobile-native */}
        <div className="text-center lg:desktop-scale-in mobile-bounce-in">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Crown className="w-10 h-10 md:w-12 md:h-12 text-yellow-500 lg:desktop-glow mobile-pulse" />
            <h1 className="mobile-large-title md:text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Premium
            </h1>
            <Crown className="w-10 h-10 md:w-12 md:h-12 text-yellow-500 lg:desktop-glow mobile-pulse" />
          </div>
          <p className="mobile-subtitle md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Unlock AI-powered fitness and nutrition
          </p>
        </div>

        {/* Current Status Card - Redesigned */}
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black border-2 border-primary/20 shadow-2xl lg:desktop-scale-in mobile-bounce-in overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-3 bg-gradient-to-br from-primary to-orange-600 rounded-xl shadow-lg mobile-pulse">
                {getStatusIcon(subscriptionData.subscriptionStatus, subscriptionData.isActive, subscriptionData.isFreeTrialActive)}
              </div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Your Status
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={`${getStatusColor(subscriptionData.subscriptionStatus, subscriptionData.isActive, subscriptionData.isFreeTrialActive)} text-base px-4 py-2 lg:desktop-slide-from-left mobile-pop`}>
                    {getStatusText(subscriptionData.subscriptionStatus, subscriptionData.isFreeTrialActive)}
                  </Badge>
                  {subscriptionData.isFreeTrialActive && (
                    <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                      <Gift size={16} className="text-blue-600 mobile-pulse" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {subscriptionData.daysRemaining} days remaining
                      </span>
                    </div>
                  )}
                </div>

                {subscriptionData.isActive && (
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    {subscriptionData.subscriptionStartDate && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar size={18} className="text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Started</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {format(new Date(subscriptionData.subscriptionStartDate), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                    )}
                    {subscriptionData.subscriptionExpiresAt && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                          <Calendar size={18} className="text-orange-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Expires</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {format(new Date(subscriptionData.subscriptionExpiresAt), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {subscriptionData.isActive && (
                <div className="text-center lg:text-right bg-gradient-to-br from-primary to-orange-600 p-6 rounded-2xl shadow-xl lg:desktop-glow mobile-bounce-in">
                  <div className="text-4xl font-bold text-white mb-1">
                    ${subscriptionData.monthlyFee}
                  </div>
                  <div className="text-sm text-white/90 font-medium">per month</div>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <Star size={14} className="text-yellow-300 fill-yellow-300" />
                    <Star size={14} className="text-yellow-300 fill-yellow-300" />
                    <Star size={14} className="text-yellow-300 fill-yellow-300" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium Features Grid */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent lg:desktop-scale-in mobile-bounce-in">
            Premium Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className={`bg-gradient-to-br ${feature.color} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden lg:desktop-scale-in mobile-bounce-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-6 text-white relative">
                    <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mobile-pulse">
                      <Icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-white/90 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Upgrade Section - Web only */}
        {!subscriptionData.isActive && !Capacitor.isNativePlatform() && (
          <Card className="border-0 bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 shadow-2xl overflow-hidden relative lg:desktop-scale-in mobile-bounce-in">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-50"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-8 h-8 text-white mobile-pulse" />
                <CardTitle className="text-3xl md:text-4xl text-white text-center">Upgrade to Premium</CardTitle>
                <Sparkles className="w-8 h-8 text-white mobile-pulse" />
              </div>
              <CardDescription className="text-white/90 text-center text-lg">
                Subscribe through the App Store to unlock all premium features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="text-5xl font-bold text-white">$15.99</div>
                  <div className="text-white/90">
                    <div className="font-semibold">per month</div>
                    <div className="text-sm">Cancel anytime</div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-white">
                  {premiumFeatures.map((feature, index) => (
                    <div 
                      key={feature.title} 
                      className="flex items-center gap-2 lg:desktop-fade-in mobile-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CheckCircle size={18} className="flex-shrink-0 text-green-300" />
                      <span className="text-sm font-medium">{feature.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2">Native iOS App Required</h3>
                      <p className="text-sm text-white/90 mb-3">
                        App Store subscriptions are only available through the native iOS app. Download FlexFlow from the App Store to subscribe with your Apple ID.
                      </p>
                      <p className="text-xs text-white/80">
                        💡 Once you subscribe in the iOS app, your premium features will automatically sync across all your devices including this web app.
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-white/20 backdrop-blur-md text-white border-2 border-white hover:bg-white/30 shadow-lg text-base py-6"
                    data-testid="button-download-ios-app"
                    asChild
                  >
                    <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer">
                      <Crown className="w-5 h-5 mr-2" />
                      Download iOS App
                    </a>
                  </Button>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <p className="text-sm text-white/90 text-center">
                    🔒 Secure payment through Apple. Manage subscription anytime in your App Store settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Native IAP Purchase */}
        {!subscriptionData.isActive && Capacitor.isNativePlatform() && (
          <Card className="border-0 bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 shadow-2xl overflow-hidden relative lg:desktop-scale-in mobile-bounce-in">
            <CardHeader>
              <CardTitle className="text-white text-center">Subscribe to Premium</CardTitle>
              <CardDescription className="text-white/90 text-center">
                Purchase securely with Apple In‑App Purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="text-3xl font-bold text-white">{nativeProducts[0]?.displayName || 'Premium'}</div>
                <div className="text-white/90">
                  <div className="font-semibold">{nativeProducts[0]?.price || '$15.99'}</div>
                  <div className="text-sm">Auto‑renewable subscription</div>
                </div>
              </div>
              <Button 
                className="w-full bg-white/20 backdrop-blur-md text-white border-2 border-white hover:bg-white/30 shadow-lg text-base py-6"
                onClick={handlePurchase}
                disabled={isPurchasing}
                data-testid="button-purchase-iap"
              >
                {isPurchasing ? 'Purchasing...' : 'Subscribe'}
              </Button>
              <Button 
                variant="outline"
                className="w-full bg-white/10 backdrop-blur-md text-white border-2 border-white/60 hover:bg-white/20 shadow text-base py-6"
                onClick={handleRestore}
                disabled={isPurchasing}
                data-testid="button-restore-iap"
              >
                Restore Purchases
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cancel Section - Redesigned */}
        {subscriptionData.isActive && (
          <Card className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-300 dark:border-gray-700 lg:desktop-fade-in mobile-slide-up">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={24} />
                Cancel Subscription
              </CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300">
                We'd hate to see you go! You can cancel your premium subscription at any time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  Cancelling will remove access to all premium features at the end of your billing period.
                </AlertDescription>
              </Alert>
              <Button
                variant="destructive"
                onClick={() => cancelSubscriptionMutation.mutate()}
                disabled={cancelSubscriptionMutation.isPending}
                data-testid="cancel-subscription-button"
                className="w-full sm:w-auto"
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
