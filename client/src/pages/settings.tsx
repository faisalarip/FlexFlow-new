import { useQuery } from "@tanstack/react-query";
import { Settings, CreditCard, Calendar, Crown, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNewAuth } from "@/hooks/useNewAuth";
import ProfileEditor from "@/components/profile-editor";
import type { User } from "@shared/schema";

export default function SettingsPage() {
  const { user } = useNewAuth() as { user: User | null };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><Check className="w-3 h-3 mr-1" />Active</Badge>;
      case "free_trial":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Crown className="w-3 h-3 mr-1" />Free Trial</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 border-red-200"><X className="w-3 h-3 mr-1" />Expired</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSubscriptionDescription = (status: string) => {
    switch (status) {
      case "active":
        return "You have full access to all premium features including advanced analytics, unlimited workout logging, and priority support.";
      case "free_trial":
        return "You're currently enjoying your free trial with access to all premium features. Upgrade to continue after your trial ends.";
      case "expired":
        return "Your subscription has expired. Upgrade to regain access to premium features and continue your fitness journey.";
      case "inactive":
        return "Your subscription is currently inactive. Reactivate to access premium features.";
      default:
        return "Manage your subscription to access premium features.";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="settings-title">Settings</h1>
          <p className="text-gray-600">Manage your account and subscription preferences</p>
        </div>
      </div>

      {/* Profile Section */}
      <Card data-testid="profile-settings-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Personal Information</h3>
              <p className="text-sm text-gray-600">
                Name: {user?.firstName || user?.lastName 
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : "Not set"}
              </p>
              <p className="text-sm text-gray-600">Email: {user?.email || "Not available"}</p>
            </div>
            <ProfileEditor trigger={
              <Button variant="outline" data-testid="edit-profile-settings">
                Edit Profile
              </Button>
            } />
          </div>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card data-testid="subscription-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Subscription Details
          </CardTitle>
          <CardDescription>
            View and manage your FlexFlow subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                Current Plan
                {getStatusBadge(user?.subscriptionStatus || "inactive")}
              </h3>
              <p className="text-sm text-gray-600 mt-1 max-w-md">
                {getSubscriptionDescription(user?.subscriptionStatus || "inactive")}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Subscription Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{user?.subscriptionStatus || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-medium">{formatDate(user?.subscriptionStartDate || null)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {user?.subscriptionStatus === "free_trial" ? "Trial Ends:" : "Next Billing:"}
                  </span>
                  <span className="font-medium">{formatDate(user?.subscriptionExpiresAt || null)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Account Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">{formatDate(user?.createdAt || null)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{formatDate(user?.updatedAt || null)}</span>
                </div>
                {user?.lastPaymentDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Payment:</span>
                    <span className="font-medium">{formatDate(user.lastPaymentDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {user?.subscriptionStatus === "free_trial" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Free Trial Active</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    You're currently enjoying full access to all premium features. 
                    Your trial expires on {formatDate(user?.subscriptionExpiresAt)}. 
                    Upgrade now to continue your fitness journey without interruption.
                  </p>
                  <Button 
                    className="mt-3" 
                    size="sm"
                    onClick={() => window.location.href = '#subscription'}
                    data-testid="upgrade-trial-button"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {user?.subscriptionStatus === "expired" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Subscription Expired</h4>
                  <p className="text-sm text-red-800 mt-1">
                    Your subscription expired on {formatDate(user?.subscriptionExpiresAt)}. 
                    Renew your subscription to regain access to premium features and continue tracking your progress.
                  </p>
                  <Button 
                    className="mt-3" 
                    size="sm"
                    onClick={() => window.location.href = '#subscription'}
                    data-testid="renew-subscription-button"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Renew Subscription
                  </Button>
                </div>
              </div>
            </div>
          )}

          {user?.subscriptionStatus === "active" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Premium Active</h4>
                  <p className="text-sm text-green-800 mt-1">
                    You have full access to all premium features. Your subscription will renew on {formatDate(user?.subscriptionExpiresAt)}.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '#subscription'}
                      data-testid="manage-subscription-button"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card data-testid="features-card">
        <CardHeader>
          <CardTitle>Premium Features</CardTitle>
          <CardDescription>
            See what's included with your FlexFlow subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Unlimited workout logging</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Advanced progress analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Personal trainer connections</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">AI-powered workout recommendations</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Custom goal setting & tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Detailed nutrition insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Export workout data</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Priority customer support</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}